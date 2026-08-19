import { supabase } from './supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY_MY_SECRET_AGENT as string | undefined;
const SW_PATH = '/sw.js';

export type PushPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';
export type PushBlockReason =
  | null
  | 'missing-key'
  | 'ios-chrome'
  | 'ios-needs-home-screen'
  | 'no-push-api';
export type PushEnableResult = { ok: true } | { ok: false; error: string };

function isIOS(): boolean {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isIOSChrome(): boolean {
  return isIOS() && /CriOS/i.test(navigator.userAgent);
}

function isStandalonePWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function pushBlockReason(): PushBlockReason {
  if (!VAPID_PUBLIC_KEY) return 'missing-key';
  if (isIOSChrome()) return 'ios-chrome';
  if (isIOS() && !isStandalonePWA()) return 'ios-needs-home-screen';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return 'no-push-api';
  }
  return null;
}

export function pushSupported(): boolean {
  return pushBlockReason() === null;
}

export function pushBlockMessage(reason: PushBlockReason = pushBlockReason()): string {
  switch (reason) {
    case 'ios-chrome':
      return 'Chrome on iPhone cannot receive Pings — Apple only allows them from a Home Screen app. Open this page in Safari, tap Share → Add to Home Screen, then open that icon and turn Pings on.';
    case 'ios-needs-home-screen':
      return 'On iPhone, Pings only work from the Home Screen. Tap Share → Add to Home Screen, open that icon, then turn Pings on here.';
    case 'missing-key':
      return 'Pings are not configured on this site yet.';
    case 'no-push-api':
      return 'This browser cannot receive web Pings. Use Chrome or Edge on Android or a computer.';
    default:
      return '';
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function subscriptionKeys(subscription: PushSubscription): { p256dh: string; auth: string } | null {
  const json = subscription.toJSON();
  if (json.keys?.p256dh && json.keys?.auth) return json.keys;

  const p256dh = subscription.getKey('p256dh');
  const auth = subscription.getKey('auth');
  if (!p256dh || !auth) return null;
  return { p256dh: bufferToBase64Url(p256dh), auth: bufferToBase64Url(auth) };
}

export function registerPushWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  void navigator.serviceWorker.register(SW_PATH);
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  await navigator.serviceWorker.register(SW_PATH);
  return navigator.serviceWorker.ready;
}

export async function getPushPermission(): Promise<PushPermissionState> {
  if (!('Notification' in window)) return 'unsupported';
  if (!pushSupported()) return 'unsupported';
  return Notification.permission as PushPermissionState;
}

async function saveSubscription(userId: string, subscription: PushSubscription): Promise<PushEnableResult> {
  const keys = subscriptionKeys(subscription);
  if (!keys) {
    return { ok: false, error: 'This browser did not return push keys. Try Chrome or Edge.' };
  }

  const { error } = await supabase.from('user_push_subscriptions').upsert(
    {
      user_id: userId,
      app_id: 'secret-agent',
      endpoint: subscription.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      is_active: true,
      last_seen_at: new Date().toISOString(),
      user_agent: navigator.userAgent,
    },
    { onConflict: 'endpoint' }
  );

  if (error) {
    console.error('Failed to save push subscription:', error.message);
    return { ok: false, error: `Could not save Pings: ${error.message}` };
  }

  return { ok: true };
}

/** If this device already has a push subscription, restore the switch and re-save it. */
export async function restoreAndSyncPush(
  userId: string
): Promise<{ enabled: boolean; error: string | null }> {
  if (!pushSupported()) return { enabled: false, error: null };
  try {
    const registration = await getRegistration();
    if (!registration) return { enabled: false, error: null };
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return { enabled: false, error: null };
    const saved = await saveSubscription(userId, subscription);
    return saved.ok ? { enabled: true, error: null } : { enabled: false, error: saved.error };
  } catch (err) {
    console.error('Push restore failed:', err);
    return { enabled: false, error: err instanceof Error ? err.message : 'Push restore failed' };
  }
}

/**
 * Register the service worker, request push permission, and save the
 * subscription to Supabase user_push_subscriptions for the given user.
 */
export async function enablePushNotifications(userId: string): Promise<PushEnableResult> {
  const blocked = pushBlockReason();
  if (blocked) {
    return { ok: false, error: pushBlockMessage(blocked) };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        ok: false,
        error: 'The browser blocked Pings. Allow notifications for this site, then try again.',
      };
    }

    const registration = await getRegistration();
    if (!registration) {
      return { ok: false, error: 'Could not register the Ping service worker.' };
    }

    const existing = await registration.pushManager.getSubscription();
    const subscription = existing ?? await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
    });

    const saved = await saveSubscription(userId, subscription);
    if (!saved.ok) return saved;

    try {
      await registration.showNotification('My Secret Agent', {
        body: 'Pings are on for this device.',
        icon: '/icon-192.png',
        tag: 'secret-agent-ping-test',
      });
    } catch {
      // Subscription saved; a local confirmation is optional.
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Push notification setup failed';
    console.error('Push notification setup failed:', err);
    return { ok: false, error: message };
  }
}

/**
 * Unsubscribe this device and remove from Supabase.
 */
export async function disablePushNotifications(userId: string): Promise<void> {
  try {
    const registration = await getRegistration();
    if (!registration) return;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();

    await supabase
      .from('user_push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', endpoint);
  } catch (err) {
    console.error('Failed to disable push notifications:', err);
  }
}

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
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'no-push-api';
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
      return 'This browser cannot receive web Pings. On a computer, use Chrome, Edge, or Firefox. On iPhone, use Safari and Add to Home Screen.';
    default:
      return '';
  }
}

/** Convert a VAPID public key (base64url) to a Uint8Array for the Push API */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function registerPushWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  void navigator.serviceWorker.register(SW_PATH);
}

export async function getPushPermission(): Promise<PushPermissionState> {
  if (!pushSupported()) return 'unsupported';
  return Notification.permission as PushPermissionState;
}

/**
 * Register the service worker, request push permission, and save the
 * subscription to Supabase user_push_subscriptions for the given user.
 */
export async function enablePushNotifications(userId: string): Promise<boolean> {
  if (!pushSupported()) {
    console.warn('Push notifications are not supported in this browser');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const registration = await navigator.serviceWorker.register(SW_PATH);
    await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();
    const subscription = existing ?? await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
    });

    const { endpoint, keys } = subscription.toJSON() as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    const { error } = await supabase.from('user_push_subscriptions').upsert(
      {
        user_id: userId,
        app_id: 'secret-agent',
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      { onConflict: 'endpoint' }
    );

    if (error) {
      console.error('Failed to save push subscription:', error.message);
      return false;
    }

    try {
      await registration.showNotification('My Secret Agent', {
        body: 'Pings are on for this device.',
        icon: '/icon-192.png',
        tag: 'secret-agent-ping-test',
      });
    } catch {
      // Subscription saved; a local confirmation is optional.
    }

    return true;
  } catch (err) {
    console.error('Push notification setup failed:', err);
    return false;
  }
}

/**
 * Unsubscribe this device and remove from Supabase.
 */
export async function disablePushNotifications(userId: string): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.getRegistration(SW_PATH);
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

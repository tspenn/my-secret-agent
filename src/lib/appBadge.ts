export function setAppBadge(count: number): void {
  if (!('setAppBadge' in navigator)) return;
  if (count > 0) {
    void navigator.setAppBadge(count);
  } else if ('clearAppBadge' in navigator) {
    void navigator.clearAppBadge();
  }
}

export function alertBadgeCount(
  missions: { active?: boolean; status_message: string }[]
): number {
  return missions.filter(
    (m) =>
      m.active !== false &&
      (m.status_message.startsWith('⚠') || m.status_message.startsWith('✓'))
  ).length;
}

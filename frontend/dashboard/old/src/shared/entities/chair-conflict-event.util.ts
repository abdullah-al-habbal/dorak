export const chairConflictEvent = 'dorak:chair-conflict';

export function publishChairConflict(): void {
  window.dispatchEvent(new Event(chairConflictEvent));
}

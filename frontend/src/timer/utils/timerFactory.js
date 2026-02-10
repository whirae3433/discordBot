export function makeSlotsForSet(set) {
  return Array.from({ length: set.count }, (_, i) => {
    if (set.timeMode === 'minute-input') {
      return { id: i, name: '', minute: String(set.defaultMinute ?? 20) };
    }
    return { id: i, name: '' };
  });
}

export function buildRunItems(set, slots) {
  return slots.map((s) => {
    const durationSec =
      set.timeMode === 'minute-input'
        ? (Number(s.minute) || 0) * 60
        : Number(set.fixedSec) || 0;

    const dur = Math.max(0, durationSec);

    return {
      id: s.id,
      name: String(s.name || '').trim() || `Slot ${s.id + 1}`,
      durationSec: dur,
      remainingSec: dur,
      running: false,
      endsAt: null,
    };
  });
}

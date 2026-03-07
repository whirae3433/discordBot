export function makeSlotsForSet(set) {
  return Array.from({ length: set.count }, (_, i) => {
    if (set.timeMode === 'minute-input') {
      return { id: i, name: '', minute: String(set.defaultMinute ?? 20) };
    }
    if (set.timeMode === 'sec-input') {
      return { id: i, name: '', sec: String(set.defaultSec ?? 60) }; // 👈 기본 60초
    }
    return { id: i, name: '' };
  });
}

export function buildRunItems(set, slots) {
  return slots.map((s) => {
    const durationSec =
      set.timeMode === 'minute-input'
        ? (Number(s.minute) || 0) * 60
        : set.timeMode === 'sec-input'
          ? Number(s.sec ?? 60) || 60  
          : 0;

    const dur = Math.max(0, durationSec);

    return {
      id: `${set.key}-${s.id}`,
      name: String(s.name || '').trim() || `${set.label}`,
      durationSec: dur,
      remainingSec: dur,
      running: false,
      endsAt: null,
      alerted: false,
    };
  });
}

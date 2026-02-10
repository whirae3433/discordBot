export const TIMER_SETS = [
  { key: 't1', label: '리프', count: 12, timeMode: 'minute-input', defaultMinute: 20 },
  { key: 't2', label: '연막', count: 1, timeMode: 'fixed-sec', fixedSec: 58 },
  { key: 't3', label: '공반', count: 1, timeMode: 'fixed-sec', fixedSec: 40 },
];

export const APP_SHELL = 'min-h-screen bg-zinc-950 text-zinc-100 pt-10 px-6';

export const SLOT_GRID_COLS = (count) => (count >= 16 ? 'grid-cols-5' : 'grid-cols-4');
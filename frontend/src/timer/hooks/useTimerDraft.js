import { buildRunItems } from '../utils/timerFactory';

export function buildDraftItems(timerSet, slots) {
  let built = [];
  try {
    built = buildRunItems(timerSet, slots) || [];
  } catch (e) {
    built = [];
  }

  const draft = built
    .map((x) => ({
      title: String(x.title || '').trim(),
      durationSec: Number(x.durationSec || 0),
    }))
    .filter((x) => x.title && x.durationSec > 0);

  return { draft, built };
}
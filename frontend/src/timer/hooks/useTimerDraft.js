import { buildRunItems } from '../utils/timerFactory';

export function buildDraftItems(timerSet, slots) {
  // 1) 기존 buildRunItems 우선
  let built = [];
  try {
    built = buildRunItems(timerSet, slots) || [];
  } catch (e) {
    built = [];
  }

  let draft = built
    .map((x) => ({ title: x.title, durationSec: Number(x.durationSec) }))
    .filter((x) => x.durationSec > 0 && String(x.title || '').trim())
    .map((x) => ({ title: x.title.trim(), durationSec: x.durationSec }));

  // 2) fallback: slots 직접 파싱 (분/초 모두 대응)
  if (!draft.length) {
    draft = (slots || [])
      .map((s) => {
        const title =
          s.title ?? s.nickname ?? s.name ?? s.label ?? s.nick ?? s.text ?? '';

        const secRaw =
          s.durationSec ?? s.seconds ?? s.sec ?? s.time ?? s.duration ?? null;

        const minRaw =
          s.minutes ??
          s.minute ??
          s.min ??
          s.durationMin ??
          s.durationMinutes ??
          null;

        let durationSec = 0;
        if (secRaw != null) durationSec = Number(secRaw);
        else if (minRaw != null) durationSec = Number(minRaw) * 60;

        return { title: String(title || '').trim(), durationSec };
      })
      .filter(
        (x) => x.title && Number.isFinite(x.durationSec) && x.durationSec > 0,
      );
  }

  return { draft, built };
}

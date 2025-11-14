function parseIntSafe(v, def = 0) {
  if (!v) return def;
  const n = parseInt(String(v).replace(/[,]/g, '').trim(), 10);
  return Number.isFinite(n) && n >= 0 ? n : def;
}

module.exports = { parseIntSafe };

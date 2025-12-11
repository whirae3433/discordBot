const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '..', 'cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);

// JSON 캐시 읽기
function loadCache(name, maxAgeMs) {
  const file = path.join(CACHE_DIR, name);
  if (!fs.existsSync(file)) return null;

  const age = Date.now() - fs.statSync(file).mtimeMs;
  if (age > maxAgeMs) return null;

  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

// JSON 캐시 저장
function saveCache(name, data) {
  const file = path.join(CACHE_DIR, name);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// 바이너리 (png) 캐시 읽기
function loadBinaryCache(name, maxAgeMs) {
  const file = path.join(CACHE_DIR, name);
  if (!fs.existsSync(file)) return null;

  const age = Date.now() - fs.statSync(file).mtimeMs;
  if (age > maxAgeMs) return null;

  return fs.readFileSync(file);
}

// 바이너리 저장
function saveBinaryCache(name, buffer) {
  const file = path.join(CACHE_DIR, name);
  fs.writeFileSync(file, buffer);
}

module.exports = { loadCache, saveCache, loadBinaryCache, saveBinaryCache };

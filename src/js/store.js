// 本地存储：所有数据只保存在用户浏览器中，不上传任何服务器
const NS = 'psy.';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(NS + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value));
  } catch {
    /* 隐私模式或存储已满：静默失败 */
  }
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const settings = {
  get: () => ({ theme: 'auto', sky: 'time', glass: 55, reduceMotion: false, sound: true, ...read('settings', {}) }),
  set(patch) { write('settings', { ...this.get(), ...patch }); },
};

export const history = {
  all: () => read('history', []),
  get: (id) => read('history', []).find((h) => h.id === id),
  add(testId, answers, line) {
    const rec = { id: uid(), testId, answers, line, ts: Date.now() };
    write('history', [rec, ...this.all()].slice(0, 200));
    return rec;
  },
  remove(id) { write('history', this.all().filter((h) => h.id !== id)); },
  latest: (testId) => read('history', []).find((h) => h.testId === testId),
};

export const progress = {
  get: (testId) => read('progress', {})[testId],
  set(testId, data) { const p = read('progress', {}); p[testId] = data; write('progress', p); },
  clear(testId) { const p = read('progress', {}); delete p[testId]; write('progress', p); },
  all: () => read('progress', {}),
};

export const moods = {
  all: () => read('moods', []),
  add(entry) {
    const list = [{ id: uid(), ts: Date.now(), date: todayKey(), ...entry }, ...this.all()];
    write('moods', list.slice(0, 2000));
  },
  remove(id) { write('moods', this.all().filter((m) => m.id !== id)); },
};

export const stats = {
  get: () => read('stats', {}),
  bump(key, n = 1) { const s = this.get(); s[key] = (s[key] || 0) + n; write('stats', s); },
  /** 记录最佳成绩：better(新, 旧) 为真时覆盖 */
  best(key, value, better = (a, b) => a > b) {
    const s = this.get();
    if (s[key] == null || better(value, s[key])) { s[key] = value; write('stats', s); return true; }
    return false;
  },
};

export const reads = {
  all: () => read('reads', []),
  add(id) { const r = new Set(this.all()); r.add(id); write('reads', [...r]); },
};

export const badgesSeen = {
  all: () => read('badges', null),
  set: (ids) => write('badges', ids),
};

export function exportAll() {
  const out = {};
  for (const k of ['settings', 'history', 'progress', 'moods', 'stats', 'reads', 'badges']) out[k] = read(k, null);
  return { app: 'psy-lab', version: 1, exportedAt: new Date().toISOString(), data: out };
}
export function importAll(obj) {
  if (!obj || obj.app !== 'psy-lab' || !obj.data) throw new Error('文件格式不正确');
  for (const [k, v] of Object.entries(obj.data)) if (v != null) write(k, v);
}
export function clearAll() {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith(NS)).forEach((k) => localStorage.removeItem(k));
  } catch { /* ignore */ }
}

import { appIcon } from './icons.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function fmtDate(ts, withTime = true) {
  const d = new Date(ts);
  const s = `${d.getMonth() + 1}月${d.getDate()}日`;
  if (!withTime) return s;
  return `${s} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function relDate(ts) {
  const diff = Date.now() - ts;
  if (diff < 60e3) return '刚刚';
  if (diff < 3600e3) return `${Math.floor(diff / 60e3)} 分钟前`;
  if (diff < 86400e3) return `${Math.floor(diff / 3600e3)} 小时前`;
  if (diff < 7 * 86400e3) return `${Math.floor(diff / 86400e3)} 天前`;
  return fmtDate(ts, false);
}

const toastQueue = [];
let toastBusy = false;
/** 顶部提示。可带一个图标：toast('已记录', { icon: 'check', tint: '#34c759' }) */
export function toast(msg, opt = {}) {
  toastQueue.push([msg, opt]);
  if (!toastBusy) nextToast();
}
function nextToast() {
  const item = toastQueue.shift();
  if (!item) { toastBusy = false; return; }
  toastBusy = true;
  const [msg, { icon, tint = '#007aff' }] = item;
  const el = $('#toast');
  el.innerHTML = `${icon ? appIcon(icon, tint, 'sm round') : ''}<span>${esc(msg)}</span>`;
  el.classList.add('show');
  setTimeout(() => { el.classList.remove('show'); setTimeout(nextToast, 450); }, 2200);
}

/** 底部弹出面板 */
export function sheet(html, onMount) {
  const wrap = document.createElement('div');
  wrap.className = 'sheet-wrap';
  wrap.innerHTML = `<div class="sheet glass" role="dialog" aria-modal="true"><div class="grabber"></div>${html}</div>`;
  document.body.append(wrap);
  requestAnimationFrame(() => wrap.classList.add('show'));
  let onClose;
  const close = () => {
    wrap.classList.remove('show');
    setTimeout(() => wrap.remove(), 400);
    document.removeEventListener('keydown', onKey);
    onClose?.();
  };
  const onKey = (e) => e.key === 'Escape' && close();
  document.addEventListener('keydown', onKey);
  wrap.addEventListener('click', (e) => { if (e.target === wrap || e.target.closest('[data-close]')) close(); });
  onMount?.(wrap, close, (fn) => (onClose = fn));
  return close;
}

export function confirmSheet(title, text, okLabel = '确定', danger = false) {
  return new Promise((resolve) => {
    let ok = false;
    sheet(`<h3>${esc(title)}</h3><p class="muted center" style="margin-bottom:18px">${esc(text)}</p>
      <div class="row-btns"><button class="btn glass" data-close>取消</button><button class="btn ${danger ? 'danger' : ''}" data-ok>${esc(okLabel)}</button></div>`,
    (wrap, close, onClose) => {
      onClose(() => resolve(ok));
      wrap.querySelector('[data-ok]').onclick = () => { ok = true; close(); };
    });
  });
}

export function download(filename, blobOrUrl) {
  const a = document.createElement('a');
  a.href = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
}

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

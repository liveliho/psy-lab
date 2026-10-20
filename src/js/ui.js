// 可复用的界面片段
import { getTest } from './tests/index.js';
import { history as records, progress } from './store.js';
import { icon, appIcon } from './icons.js';
import { esc, relDate } from './util.js';

export const testCard = (t) => {
  const last = records.latest(t.id);
  const prog = progress.get(t.id);
  const meta = last
    ? `<span class="done">${icon('check', { size: 14, sw: 3 })}${esc(last.line.split(' · ')[0])}</span>`
    : prog ? `<span class="done">进行中 ${prog.answers.filter((a) => a != null).length}/${t.items.length}</span>`
      : `<span>${t.items.length} 题</span><span>·</span><span>约 ${t.minutes} 分钟</span>`;
  return `<a class="card glass test-card pressable" href="#/test/${t.id}" style="--tint:${t.tint}">
    ${appIcon(t.icon, t.tint)}<h3>${esc(t.name)}</h3><div class="meta">${meta}</div></a>`;
};

export const toolCard = (href, ic, tint, title, sub) =>
  `<a class="card glass tool-card pressable" href="${href}">${appIcon(ic, tint)}<div><h3>${esc(title)}</h3><p>${esc(sub)}</p></div></a>`;

/** iOS 分组列表项。lead 可以是任意 HTML（图标 / 表情脸） */
export const listItem = ({ href, ic, tint, lead, title, sub, right = '', tag = 'a', attrs = '' }) =>
  `<${tag} class="list-item" ${href ? `href="${href}"` : ''} ${attrs}>
    ${lead || (ic ? appIcon(ic, tint || 'var(--blue)', 'sm') : '')}
    <span class="li-main"><div class="li-title">${title}</div>${sub ? `<div class="li-sub">${sub}</div>` : ''}</span>
    ${right ? `<span class="li-right">${right}</span>` : ''}${href ? `<span class="chev">${icon('chevron-right', { size: 16 })}</span>` : ''}
  </${tag}>`;

export const historyItem = (h) => {
  const t = getTest(h.testId);
  if (!t) return '';
  return listItem({ href: `#/result/${h.id}`, ic: t.icon, tint: t.tint, title: esc(h.line), sub: `${esc(t.short)} · ${relDate(h.ts)}` });
};

export const sectionH = (title, ic, link) =>
  `<div class="section-h"><h2>${ic ? icon(ic) : ''}${esc(title)}</h2>${link ? `<a href="${link[1]}">${esc(link[0])}</a>` : ''}</div>`;

export const alertBox = (level, ic, title, text, extra = '') =>
  `<div class="alert ${level} glass">${icon(ic)}<div><b>${esc(title)}</b><p>${esc(text)}</p>${extra}</div></div>`;

export const emptyBox = (ic, html) => `<div class="empty">${icon(ic)}<div>${html}</div></div>`;

export const refLine = (ic, text) => `<p class="ref">${icon(ic)}<span>${esc(text)}</span></p>`;

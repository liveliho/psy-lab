// 纯 SVG / HTML 图表，无第三方依赖
import { esc } from './util.js';

export function renderViz(v) {
  switch (v.type) {
    case 'bipolar': return bipolar(v.rows);
    case 'bars': return bars(v.rows);
    case 'radar': return radar(v.axes);
    case 'gauge': return gauge(v);
    case 'quadrant': return quadrant(v);
    case 'battery': return battery(v);
    default: return '';
  }
}

function bipolar(rows) {
  return rows.map((r) => {
    const leftOn = r.value >= 50;
    const lean = leftOn ? r.value : 100 - r.value;
    const width = Math.abs(r.value - 50);
    const style = leftOn ? `right:50%;width:${width}%` : `left:50%;width:${width}%`;
    return `<div class="bp">
      <div class="bp-labels"><span class="${leftOn ? 'on' : ''}">${esc(r.left)}${leftOn ? ` ${lean}%` : ''}</span><span class="${leftOn ? '' : 'on'}">${leftOn ? '' : `${lean}% `}${esc(r.right)}</span></div>
      <div class="bp-track"><div class="bp-fill" style="${style}"></div><div class="bp-mid"></div></div>
    </div>`;
  }).join('');
}

function bars(rows) {
  return rows.map((r) => `<div class="bar">
    <div class="bar-top"><span>${esc(r.label)}</span><b>${r.value}${r.unit ?? (r.max === 100 ? '%' : `/${r.max}`)}${r.note ? ` <span class="muted small">${esc(r.note)}</span>` : ''}</b></div>
    <div class="bar-track"><i style="width:${(r.value / r.max) * 100}%"></i></div>
  </div>`).join('');
}

function radarSvg(axes, series) {
  const W = 340, H = 300, cx = W / 2, cy = H / 2 + 4, R = 100, n = axes.length;
  const pt = (i, r) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const fmt = (p) => p.map((x) => x.toFixed(1)).join(',');
  const poly = (r) => axes.map((_, i) => fmt(pt(i, r))).join(' ');
  const grid = [0.25, 0.5, 0.75, 1].map((f) => `<polygon class="grid" points="${poly(R * f)}"/>`).join('');
  const spokes = axes.map((_, i) => { const [x, y] = pt(i, R); return `<line class="grid" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`; }).join('');
  const shapes = series.map((vals, si) => {
    const pts = vals.map((v, i) => pt(i, (R * Math.max(4, v)) / 100));
    return `<polygon class="shape ${si ? 'them' : ''}" points="${pts.map(fmt).join(' ')}"/>` +
      (si ? '' : pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5"/>`).join(''));
  }).reverse().join('');
  const labels = axes.map((a, i) => {
    const [x, y] = pt(i, R + 26);
    const anchor = Math.abs(x - cx) < 8 ? 'middle' : x > cx ? 'start' : 'end';
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle">${esc(a)}${series.length === 1 ? ` ${series[0][i]}` : ''}</text>`;
  }).join('');
  return `<svg class="radar" viewBox="0 0 ${W} ${H}" role="img" aria-label="雷达图">${grid}${spokes}${shapes}${labels}</svg>`;
}
const radar = (axes) => radarSvg(axes.map((a) => a.label), [axes.map((a) => a.value)]);

function gauge({ value, max, color, label }) {
  const p = Math.min(100, (value / max) * 100);
  const arc = 'M 20 130 A 100 100 0 0 1 220 130';
  return `<svg class="gauge" viewBox="0 0 240 150" role="img" aria-label="${esc(label)} ${value}/${max}">
    <path d="${arc}" fill="none" stroke="var(--fill2)" stroke-width="18" stroke-linecap="round"/>
    <path class="g-arc" d="${arc}" fill="none" stroke="${color}" stroke-width="18" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" data-to="${100 - p}"/>
    <text class="g-val" x="120" y="112" text-anchor="middle">${value}</text>
    <text class="g-lbl" x="120" y="138" text-anchor="middle">满分 ${max} · ${esc(label)}</text>
  </svg>`;
}

function quadrant({ x, y, xLabel, yLabel, labels }) {
  const L = 34, T = 10, S = 256;
  const px = L + (x / 100) * S, py = T + S - (y / 100) * S;
  const m = S / 2;
  const q = (cx, cy, t) => `<text x="${cx}" y="${cy}" text-anchor="middle">${esc(t)}</text>`;
  return `<svg class="quad" viewBox="0 0 300 300" role="img" aria-label="象限图">
    <rect x="${L}" y="${T}" width="${S}" height="${S}" rx="18" fill="var(--fill)"/>
    <line x1="${L + m}" y1="${T}" x2="${L + m}" y2="${T + S}" stroke="var(--sep)" stroke-dasharray="4 4"/>
    <line x1="${L}" y1="${T + m}" x2="${L + S}" y2="${T + m}" stroke="var(--sep)" stroke-dasharray="4 4"/>
    ${q(L + m / 2, T + 24, labels[0])}${q(L + m * 1.5, T + 24, labels[1])}
    ${q(L + m / 2, T + S - 14, labels[2])}${q(L + m * 1.5, T + S - 14, labels[3])}
    <text x="${L + S / 2}" y="${T + S + 24}" text-anchor="middle">${esc(xLabel)}</text>
    <text x="12" y="${T + S / 2}" text-anchor="middle" transform="rotate(-90 12 ${T + S / 2})">${esc(yLabel)}</text>
    <circle class="q-dot" cx="${px}" cy="${py}" r="11"/>
  </svg>`;
}

function battery({ value, label }) {
  return `<div class="battery" role="img" aria-label="${esc(label)} ${value}%">
    <div class="battery-body"><i style="width:${Math.max(6, value)}%"></i><span>${value}%</span></div><div class="battery-cap"></div>
  </div><p class="center muted small">${esc(label)}：越高越"E"，越低越"I"</p>`;
}

/* ---------- 双人对比 ---------- */
/** 从结果中提取可比较的数值向量 */
export function vectorOf(result) {
  for (const type of ['bipolar', 'radar', 'bars']) {
    const v = result.viz.find((x) => x.type === type);
    if (!v) continue;
    if (type === 'bipolar') return { type, labels: v.rows.map((r) => [r.left, r.right]), values: v.rows.map((r) => r.value) };
    if (type === 'radar') return { type, labels: v.axes.map((a) => a.label), values: v.axes.map((a) => a.value) };
    return { type, labels: v.rows.map((r) => r.label), values: v.rows.map((r) => Math.round((r.value / r.max) * 100)) };
  }
  return null;
}

/** 把 b 的数值按 a 的标签顺序对齐（有些结果的条形图按分数排序，顺序因人而异） */
export function alignVectors(a, b) {
  if (!a || !b || a.type !== b.type) return null;
  const key = (l) => (Array.isArray(l) ? l.join('|') : l);
  const idx = new Map(b.labels.map((l, i) => [key(l), i]));
  if (a.labels.some((l) => !idx.has(key(l)))) return null;
  return { ...b, labels: a.labels, values: a.labels.map((l) => b.values[idx.get(key(l))]) };
}

export function similarity(a, b) {
  if (!a || !b || a.values.length !== b.values.length) return null;
  const diff = a.values.reduce((s, v, i) => s + Math.abs(v - b.values[i]), 0) / a.values.length;
  return Math.max(0, Math.round(100 - diff * 1.4));
}

export function compareChart(me, them) {
  const legend = '<div class="legend"><span><i style="background:var(--tint)"></i>我</span><span><i style="background:var(--orange)"></i>TA</span></div>';
  if (me.type === 'bipolar') {
    return legend + '<div style="margin-top:16px">' + me.labels.map(([l, r], i) => `<div class="bp">
      <div class="bp-labels"><span>${esc(l)}</span><span>${esc(r)}</span></div>
      <div class="bp-track"><div class="bp-mid"></div>
        <i class="bp-pin them" style="left:${100 - them.values[i]}%"></i><i class="bp-pin me" style="left:${100 - me.values[i]}%"></i></div>
    </div>`).join('') + '</div>';
  }
  if (me.labels.length >= 3) return legend + radarSvg(me.labels, [me.values, them.values]);
  return legend + bars(me.labels.map((l, i) => ({ label: `${l}（TA ${them.values[i]}%）`, value: me.values[i], max: 100 })));
}

/** 最近 N 天心情折线图 */
export function moodChart(entries, days = 14) {
  const W = 340, H = 150, L = 8, R = 8, T = 14, B = 26;
  const now = new Date();
  const pts = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const day = entries.filter((e) => e.date === key);
    const avg = day.length ? day.reduce((s, e) => s + e.level, 0) / day.length : null;
    pts.push({ d, avg });
  }
  const step = (W - L - R) / (days - 1);
  const yOf = (v) => T + (H - T - B) * (1 - (v - 1) / 4);
  const xy = pts.map((p, i) => (p.avg == null ? null : [L + i * step, yOf(p.avg)]));
  const segs = [];
  let cur = [];
  xy.forEach((p) => { if (p) cur.push(p); else if (cur.length) { segs.push(cur); cur = []; } });
  if (cur.length) segs.push(cur);
  const line = segs.map((s) => 'M' + s.map((p) => p.map((n) => n.toFixed(1)).join(' ')).join(' L')).join(' ');
  const area = segs.filter((s) => s.length > 1).map((s) => `M${s[0][0]} ${H - B} L` + s.map((p) => p.join(' ')).join(' L') + ` L${s[s.length - 1][0]} ${H - B} Z`).join(' ');
  const grid = [1, 3, 5].map((v) => `<line class="gl" x1="${L}" x2="${W - R}" y1="${yOf(v)}" y2="${yOf(v)}"/>`).join('');
  const colors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#8ce99a', '#66d9e8'];
  const dots = xy.map((p, i) => p ? `<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="${colors[Math.round(pts[i].avg) - 1]}" stroke="#fff" stroke-width="1.5"/>` : '').join('');
  const anchor = (i) => (i === 0 ? 'start' : i === days - 1 ? 'end' : 'middle');
  const labels = pts.map((p, i) => (i % 2 === (days - 1) % 2 ? `<text x="${L + i * step}" y="${H - 8}" text-anchor="${anchor(i)}">${i === days - 1 ? '今天' : `${p.d.getMonth() + 1}/${p.d.getDate()}`}</text>` : '')).join('');
  return `<svg class="chart-mood" viewBox="0 0 ${W} ${H}" role="img" aria-label="近 ${days} 天心情趋势">
    <defs><linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--blue)" stop-opacity=".3"/><stop offset="1" stop-color="var(--blue)" stop-opacity="0"/></linearGradient></defs>
    ${grid}<path class="area" d="${area}"/><path class="ln" d="${line}"/>${dots}${labels}
  </svg>`;
}

/** Plutchik 情绪轮（三层 × 八瓣） */
export function emotionWheel(emotions, selected) {
  const C = 150, rings = [[34, 70], [70, 108], [108, 146]];
  const pol = (r, a) => [C + r * Math.cos(a), C + r * Math.sin(a)];
  let out = '';
  emotions.forEach((e, i) => {
    const a0 = (-90 - 22.5 + i * 45) * (Math.PI / 180), a1 = a0 + 45 * (Math.PI / 180), am = (a0 + a1) / 2;
    rings.forEach(([r0, r1], ri) => {
      const [x0, y0] = pol(r0, a0), [x1, y1] = pol(r1, a0), [x2, y2] = pol(r1, a1), [x3, y3] = pol(r0, a1);
      const word = e.words[ri];
      const mix = [100, 68, 42][ri];
      const on = selected === word ? 'on' : '';
      out += `<path class="${on}" data-word="${word}" data-base="${e.name}" style="fill:color-mix(in srgb, ${e.color} ${mix}%, #fff)" d="M${x0} ${y0} L${x1} ${y1} A${r1} ${r1} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${r0} ${r0} 0 0 0 ${x0} ${y0} Z"/>`;
      const [tx, ty] = pol((r0 + r1) / 2, am);
      out += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle" dominant-baseline="middle">${word}</text>`;
    });
  });
  return `<svg class="wheel" viewBox="0 0 300 300" role="group" aria-label="情绪轮">${out}<circle cx="${C}" cy="${C}" r="30" fill="rgba(var(--glass-rgb),.85)"/><text x="${C}" y="${C}" text-anchor="middle" dominant-baseline="middle" style="fill:var(--label2)">情绪轮</text></svg>`;
}

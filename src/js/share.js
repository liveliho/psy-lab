// 结果分享：生成分享图片（Canvas）与可还原结果的分享链接（答案编码在 URL hash 中，无需后端）
import { optionsOf } from './tests/common.js';
import { iconSvgString } from './icons.js';

export function encodeAnswers(test, answers) {
  return answers.map((v, i) => optionsOf(test, test.items[i]).findIndex((o) => o.v === v)).join('');
}
export function decodeAnswers(test, code) {
  if (!/^\d+$/.test(code) || code.length !== test.items.length) return null;
  const out = [];
  for (let i = 0; i < code.length; i++) {
    const opt = optionsOf(test, test.items[i])[+code[i]];
    if (!opt) return null;
    out.push(opt.v);
  }
  return out;
}
export const shareUrl = (test, answers) =>
  `${location.origin}${location.pathname}#/s/${test.id}/${encodeAnswers(test, answers)}`;

function wrap(ctx, text, maxW) {
  const noLead = '，。！？、；：）」』”’…%';
  const lines = [];
  let line = '';
  for (const ch of text) {
    // 避头点：标点不出现在行首
    if (ctx.measureText(line + ch).width > maxW && !noLead.includes(ch)) { lines.push(line); line = ch; } else line += ch;
  }
  if (line) lines.push(line);
  return lines;
}

const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

/** 生成 1080x1440 的分享卡片 PNG blob */
export async function makeShareImage(test, result) {
  const W = 1080, H = 1440;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const font = getComputedStyle(document.body).fontFamily;

  // 天空背景
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#3a88db'); g.addColorStop(.45, '#7fb6ee'); g.addColorStop(1, '#f6c8c0');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const cloud = (x, y, w, a) => {
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#fff'; ctx.filter = 'blur(6px)';
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, w * 0.15, 0, 0, Math.PI * 2);
    ctx.ellipse(x - w * 0.12, y - w * 0.12, w * 0.22, w * 0.2, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.14, y - w * 0.08, w * 0.17, w * 0.15, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.restore();
  };
  cloud(220, 170, 360, .85); cloud(880, 300, 300, .7); cloud(160, 1290, 420, .75); cloud(900, 1230, 340, .65);
  const sun = ctx.createRadialGradient(900, 120, 0, 900, 120, 260);
  sun.addColorStop(0, 'rgba(255,255,240,.95)'); sun.addColorStop(.25, 'rgba(255,250,220,.55)'); sun.addColorStop(1, 'rgba(255,250,220,0)');
  ctx.fillStyle = sun; ctx.fillRect(0, 0, W, H);

  // 玻璃卡片
  const cx = 80, cy = 200, cw = W - 160, ch = 1000;
  ctx.save();
  ctx.shadowColor = 'rgba(20,50,100,.18)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 20;
  ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 64);
  ctx.fillStyle = 'rgba(255,255,255,.62)'; ctx.fill();
  ctx.restore();
  ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 64);
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 3; ctx.stroke();

  // 应用图标
  const s = 200, ix = W / 2 - s / 2, iy = cy + 70;
  ctx.save();
  ctx.shadowColor = test.tint + '66'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
  const ig = ctx.createLinearGradient(ix, iy, ix + s * .6, iy + s);
  ig.addColorStop(0, '#ffffff'); ig.addColorStop(.12, test.tint); ig.addColorStop(1, test.tint);
  ctx.beginPath(); ctx.roundRect(ix, iy, s, s, 60); ctx.fillStyle = ig; ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.beginPath(); ctx.roundRect(ix, iy, s, s, 60); ctx.clip();
  const hl = ctx.createRadialGradient(ix + s * .3, iy, 0, ix + s * .3, iy, s * .9);
  hl.addColorStop(0, 'rgba(255,255,255,.55)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hl; ctx.fillRect(ix, iy, s, s);
  ctx.restore();
  try {
    const svg = iconSvgString(result.icon, '#fff', 256, 1.7);
    const img = await loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    ctx.drawImage(img, ix + s * .22, iy + s * .22, s * .56, s * .56);
  } catch { /* 图标加载失败时忽略 */ }

  ctx.fillStyle = '#0b1b2e'; ctx.textAlign = 'center';
  ctx.font = `600 38px ${font}`; ctx.globalAlpha = .7;
  ctx.fillText(test.name, W / 2, 140);
  ctx.globalAlpha = 1;

  ctx.fillStyle = test.tint;
  ctx.font = `800 ${result.headline.length > 6 ? 100 : 136}px ${font}`;
  ctx.fillText(result.headline, W / 2, cy + 470);

  ctx.fillStyle = '#0b1b2e';
  ctx.font = `700 54px ${font}`;
  ctx.fillText(result.title, W / 2, cy + 560);

  ctx.font = `400 38px ${font}`; ctx.globalAlpha = .75;
  wrap(ctx, result.summary, cw - 140).slice(0, 5).forEach((l, i) => ctx.fillText(l, W / 2, cy + 650 + i * 60));
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#fff';
  ctx.font = `700 36px ${font}`;
  ctx.fillText('心理实验室 · 纯前端心理测评', W / 2, H - 140);
  ctx.font = `400 28px ${font}`; ctx.globalAlpha = .85;
  ctx.fillText(location.host + location.pathname.replace(/index\.html$/, ''), W / 2, H - 92);
  ctx.globalAlpha = 1;

  return new Promise((res) => c.toBlob(res, 'image/png'));
}

// 解压玩具：电子木鱼、指尖陀螺、禅意沙盘、果冻史莱姆、曼陀罗画板、音乐涟漪、白噪音、烦恼粉碎机
// 全部用 Canvas / SVG 与 Web Audio 实时绘制和合成，没有任何图片或音频文件。
import { stats, settings } from '../store.js';
import { audio, noiseBuffer, tone, noiseBurst } from '../audio.js';
import { icon, appIcon } from '../icons.js';
import { $, $$, esc, toast, download } from '../util.js';

const TAU = Math.PI * 2;
const played = (kind) => stats.bump(`toy_${kind}`);

function soundToggle(btn) {
  const show = () => (btn.innerHTML = `${icon(settings.get().sound ? 'music' : 'x')}${settings.get().sound ? '声音：开' : '声音：关'}`);
  btn.onclick = () => { settings.set({ sound: !settings.get().sound }); show(); };
  show();
}

/** 按设备像素比设置画布，之后用 CSS 像素坐标绘制 */
function setupCanvas(cv, w, h) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  cv.style.height = `${h}px`;
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, dpr };
}

/** requestAnimationFrame 循环，返回停止函数 */
function loop(fn) {
  let id, last = performance.now(), alive = true;
  const tick = (now) => {
    if (!alive) return;
    fn(Math.min(0.05, (now - last) / 1000), now);
    last = now;
    id = requestAnimationFrame(tick);
  };
  id = requestAnimationFrame(tick);
  return () => { alive = false; cancelAnimationFrame(id); };
}

const localPt = (cv, e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

/* ============================== 电子木鱼 ============================== */
const MUYU_SVG = `<svg viewBox="0 0 240 200" aria-hidden="true">
  <defs>
    <radialGradient id="mwood" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#eaa462"/><stop offset=".45" stop-color="#b8692c"/><stop offset="1" stop-color="#6b3410"/></radialGradient>
    <linearGradient id="mstick" x1="0" x2="1"><stop offset="0" stop-color="#8a5326"/><stop offset="1" stop-color="#d9a066"/></linearGradient>
  </defs>
  <ellipse cx="112" cy="188" rx="82" ry="9" fill="rgba(0,0,0,.18)"/>
  <g class="muyu-body">
    <path d="M22 118C22 64 64 34 112 34s90 30 90 84c0 40-40 64-90 64S22 158 22 118z" fill="url(#mwood)"/>
    <path d="M38 128q74 26 148 0" stroke="#3d1b06" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M58 92q54-34 108 0M72 108q40-20 80 0" stroke="rgba(255,220,170,.3)" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="112" cy="68" r="7" fill="#5a2a0c" opacity=".5"/>
    <ellipse cx="78" cy="64" rx="26" ry="11" fill="#fff" opacity=".22" transform="rotate(-24 78 64)"/>
  </g>
  <g class="muyu-stick">
    <path d="M232 8 176 44" stroke="url(#mstick)" stroke-width="9" stroke-linecap="round"/>
    <circle cx="170" cy="48" r="13" fill="#a8622d"/><circle cx="166" cy="44" r="4.5" fill="#fff" opacity=".28"/>
  </g>
</svg>`;

function woodSound(ac) {
  tone(ac, { freq: 840, to: 780, dur: 0.16, vol: 0.45 });
  tone(ac, { freq: 1960, dur: 0.05, vol: 0.1 });
  tone(ac, { freq: 420, dur: 0.24, vol: 0.2 });
  noiseBurst(ac, { dur: 0.015, freq: 3000, q: 0.8, vol: 0.35 });
}

export function muyuView() {
  const WORDS = [['功德', '功德 +1'], ['好运', '好运 +1'], ['平静', '平静 +1'], ['烦恼', '烦恼 -1']];
  let word = 0, count = 0, pending = 0, auto = null;
  return {
    title: '电子木鱼', tab: 3, back: '#/tools',
    html: `<h1 class="large-title">电子木鱼</h1><p class="large-sub">敲一下，心就静一分。</p>
      <div class="segmented" id="words">${WORDS.map(([w], i) => `<button data-i="${i}" class="${i ? '' : 'on'}">${w}</button>`).join('')}</div>
      <div class="card glass muyu-stage">
        <div class="muyu-count"><b id="mc">0</b><span>本次</span></div>
        <button class="muyu" id="fish" aria-label="敲木鱼">${MUYU_SVG}</button>
        <div id="floats"></div>
      </div>
      <div class="row-btns" style="margin-top:14px"><button class="btn glass" id="auto"></button><button class="btn glass" id="sound"></button></div>
      <p class="center muted small" style="margin-top:12px" id="mtotal"></p>`,
    mount(root) {
      played('muyu');
      const fish = $('#fish', root), floats = $('#floats', root), autoBtn = $('#auto', root);
      const flush = () => { if (pending) { stats.bump('muyu', pending); pending = 0; } };
      const showTotal = () => ($('#mtotal', root).textContent = `累计敲了 ${(stats.get().muyu || 0) + pending} 下 · 键盘空格也能敲`);
      const knock = () => {
        const ac = audio();
        if (ac) woodSound(ac);
        navigator.vibrate?.(12);
        fish.classList.remove('hit');
        void fish.offsetWidth; // 重新触发动画
        fish.classList.add('hit');
        count++; pending++;
        if (pending >= 20) flush();
        $('#mc', root).textContent = count;
        const f = document.createElement('span');
        f.className = 'muyu-float';
        f.textContent = WORDS[word][1];
        f.style.left = `${42 + Math.random() * 16}%`;
        floats.append(f);
        setTimeout(() => f.remove(), 1100);
        showTotal();
      };
      const showAuto = () => (autoBtn.innerHTML = auto ? `${icon('x')}停止自动` : `${icon('refresh')}自动敲`);
      fish.addEventListener('pointerdown', (e) => { e.preventDefault(); knock(); });
      const onKey = (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); knock(); } };
      document.addEventListener('keydown', onKey);
      $$('#words button', root).forEach((b) => b.addEventListener('click', () => {
        word = +b.dataset.i;
        $$('#words button', root).forEach((x) => x.classList.toggle('on', x === b));
      }));
      autoBtn.onclick = () => { if (auto) { clearInterval(auto); auto = null; } else auto = setInterval(knock, 900); showAuto(); };
      soundToggle($('#sound', root));
      showAuto();
      showTotal();
      return () => { clearInterval(auto); document.removeEventListener('keydown', onKey); flush(); };
    },
  };
}

/* ============================== 指尖陀螺 ============================== */
const SPIN_TINTS = ['#ff9500', '#0a84ff', '#ff2d55', '#34c759', '#af52de', '#3a3a3c'];

function spinnerSvg() {
  const lobes = [0, 1, 2].map((k) => {
    const a = (-90 + k * 120) * (Math.PI / 180), x = Math.cos(a) * 74, y = Math.sin(a) * 74;
    return { x: x.toFixed(1), y: y.toFixed(1) };
  });
  const arms = lobes.map((p) => `<line x1="0" y1="0" x2="${p.x}" y2="${p.y}" stroke-width="56" stroke-linecap="round" style="stroke:var(--sp)"/>`).join('');
  const caps = lobes.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="47" style="fill:var(--sp)"/>`).join('');
  const bearings = lobes.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="28" fill="url(#steel)"/><circle cx="${p.x}" cy="${p.y}" r="28" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="2"/>`).join('');
  return `<svg viewBox="-135 -135 270 270" class="spinner-svg" aria-hidden="true">
    <defs>
      <radialGradient id="steel" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#b9c0cc"/><stop offset="1" stop-color="#6b7280"/></radialGradient>
      <radialGradient id="sphl" cx="30%" cy="25%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <g id="rotor">${arms}${caps}<g opacity=".9">${arms.replaceAll('style="stroke:var(--sp)"', 'stroke="url(#sphl)"')}</g>${bearings}
      <circle r="30" style="fill:var(--sp)"/><circle r="22" fill="url(#steel)"/><circle r="8" fill="rgba(0,0,0,.25)"/>
    </g>
  </svg>`;
}

export function spinnerView() {
  let tint = 0;
  return {
    title: '指尖陀螺', tab: 3, back: '#/tools',
    html: `<h1 class="large-title">指尖陀螺</h1><p class="large-sub">用手指拨动它，看看能转多久。</p>
      <div class="card glass spinner-stage" id="wrap" style="--sp:${SPIN_TINTS[0]}">${spinnerSvg()}
        <div class="spinner-rpm"><b id="rpm">0</b><span>转/分</span></div></div>
      <div class="row-btns" style="margin-top:14px"><button class="btn glass" id="flick">${icon('zap')}弹一下</button><button class="btn glass" id="color">${icon('palette')}换颜色</button></div>
      <p class="center muted small" style="margin-top:12px" id="sinfo"></p>`,
    mount(root) {
      played('spinner');
      const wrap = $('#wrap', root), rotor = $('#rotor', root), rpm = $('#rpm', root), info = $('#sinfo', root);
      let angle = 0, v = 0, dragging = false, lastA = 0, lastT = 0, spinStart = 0, lastShow = 0;
      const best = () => stats.get().spinBest || 0;
      const showInfo = (extra = '') => (info.textContent = `${extra}最长纪录 ${best().toFixed(1)} 秒`);
      const angOf = (e) => { const r = wrap.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); };
      wrap.addEventListener('pointerdown', (e) => {
        dragging = true; v = 0; spinStart = 0;
        lastA = angOf(e); lastT = performance.now();
        wrap.setPointerCapture(e.pointerId);
      });
      wrap.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const a = angOf(e), now = performance.now();
        let d = a - lastA;
        if (d > Math.PI) d -= TAU; else if (d < -Math.PI) d += TAU;
        angle += d;
        v = 0.5 * v + 0.5 * (d / Math.max(0.001, (now - lastT) / 1000));
        lastA = a; lastT = now;
      });
      const release = () => {
        if (!dragging) return;
        dragging = false;
        if (performance.now() - lastT > 90) v = 0; // 松手前已经停住
        v = Math.max(-80, Math.min(80, v));
        if (Math.abs(v) > 2) { spinStart = performance.now(); navigator.vibrate?.(8); }
      };
      wrap.addEventListener('pointerup', release);
      wrap.addEventListener('pointercancel', release);
      $('#flick', root).onclick = () => {
        v += (v < 0 ? -1 : 1) * 28;
        spinStart ||= performance.now();
      };
      $('#color', root).onclick = () => { tint = (tint + 1) % SPIN_TINTS.length; wrap.style.setProperty('--sp', SPIN_TINTS[tint]); };
      const stop = loop((dt, now) => {
        if (!dragging && v) {
          angle += v * dt;
          // 轴承摩擦：恒定摩擦 + 与速度成正比的空气阻力
          const dec = (0.5 + 0.05 * Math.abs(v)) * dt;
          v = Math.abs(v) <= dec + 0.25 ? 0 : v - Math.sign(v) * dec;
          if (!v && spinStart) {
            const sec = (now - spinStart) / 1000;
            spinStart = 0;
            const rec = stats.best('spinBest', Math.round(sec * 10) / 10);
            showInfo(`这次转了 ${sec.toFixed(1)} 秒${rec ? '，新纪录！' : ''} · `);
          }
        }
        rotor.setAttribute('transform', `rotate(${((angle * 180) / Math.PI) % 360})`);
        rotor.style.filter = Math.abs(v) > 18 ? `blur(${Math.min(2.5, (Math.abs(v) - 18) / 14).toFixed(2)}px)` : '';
        if (now - lastShow > 120) { rpm.textContent = Math.round((Math.abs(v) * 60) / TAU); lastShow = now; }
      });
      showInfo();
      return stop;
    },
  };
}

/* ============================== 禅意沙盘 ============================== */
export function sandView() {
  let tool = 'rake';
  return {
    title: '禅意沙盘', tab: 3, back: '#/tools',
    html: `<h1 class="large-title">禅意沙盘</h1><p class="large-sub">日本枯山水的数字版。慢慢划出纹路，放几块石头，让心静下来。</p>
      <div class="segmented" id="tools">${[['rake', '耙子'], ['finger', '手指'], ['stone', '石头']].map(([k, l]) => `<button data-t="${k}" class="${k === 'rake' ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div class="toy-canvas sand-box" id="box"><canvas id="cv" aria-label="沙盘画布"></canvas></div>
      <div class="row-btns" style="margin-top:14px"><button class="btn glass" id="clear">${icon('refresh')}抹平</button><button class="btn glass" id="sound"></button></div>`,
    mount(root) {
      played('sand');
      const box = $('#box', root), cv = $('#cv', root);
      const W = box.clientWidth, H = Math.round(Math.min(W * 1.1, window.innerHeight * 0.6));
      const { ctx, dpr } = setupCanvas(cv, W, H);

      // 干净的沙面：带细微颗粒噪点和暗角，耙过的地方用它"抹平"
      const base = document.createElement('canvas');
      base.width = cv.width; base.height = cv.height;
      const b = base.getContext('2d');
      const img = b.createImageData(base.width, base.height);
      for (let i = 0; i < img.data.length; i += 4) {
        const n = (Math.random() - 0.5) * 22;
        img.data[i] = 233 + n; img.data[i + 1] = 217 + n; img.data[i + 2] = 184 + n * 0.8; img.data[i + 3] = 255;
      }
      b.putImageData(img, 0, 0);
      const vg = b.createRadialGradient(base.width / 2, base.height / 2, base.width * 0.3, base.width / 2, base.height / 2, base.width * 0.9);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(90,60,20,.16)');
      b.fillStyle = vg; b.fillRect(0, 0, base.width, base.height);
      const pat = ctx.createPattern(base, 'no-repeat');
      pat.setTransform?.(new DOMMatrix().scale(1 / dpr));

      let stones = [];
      const DARK = '#c7b088', LIGHT = '#f8f0de';
      const line = (x0, y0, x1, y1) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
      const groove = (x0, y0, x1, y1, w) => {
        ctx.lineCap = 'round';
        ctx.strokeStyle = DARK; ctx.lineWidth = w; line(x0 + 0.8, y0 + 1, x1 + 0.8, y1 + 1);
        ctx.strokeStyle = LIGHT; ctx.lineWidth = w * 0.45; line(x0 - 0.7, y0 - 0.8, x1 - 0.7, y1 - 0.8);
      };
      const ring = (x, y, r) => {
        ctx.lineWidth = 3; ctx.strokeStyle = DARK; ctx.beginPath(); ctx.arc(x + 0.8, y + 1, r, 0, TAU); ctx.stroke();
        ctx.lineWidth = 1.3; ctx.strokeStyle = LIGHT; ctx.beginPath(); ctx.arc(x - 0.7, y - 0.8, r, 0, TAU); ctx.stroke();
      };
      const drawStone = (s, full) => {
        if (full) {
          ctx.fillStyle = pat; ctx.beginPath(); ctx.arc(s.x, s.y, s.r + 46, 0, TAU); ctx.fill();
          for (let r = s.r + 12; r <= s.r + 42; r += 8) ring(s.x, s.y, r);
          ctx.fillStyle = 'rgba(80,55,20,.22)'; ctx.beginPath(); ctx.ellipse(s.x + 4, s.y + 6, s.r * 1.05, s.r * 0.82, s.rot, 0, TAU); ctx.fill();
        }
        const g = ctx.createRadialGradient(s.x - s.r * 0.35, s.y - s.r * 0.4, s.r * 0.1, s.x, s.y, s.r * 1.1);
        g.addColorStop(0, '#a3a19c'); g.addColorStop(0.6, '#6d6b66'); g.addColorStop(1, '#45433f');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r, s.r * 0.78, s.rot, 0, TAU); ctx.fill();
      };
      const segDist = (p, x0, y0, x1, y1) => {
        const dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((p.x - x0) * dx + (p.y - y0) * dy) / (dx * dx + dy * dy || 1)));
        return Math.hypot(p.x - x0 - t * dx, p.y - y0 - t * dy);
      };
      const rake = (x0, y0, x1, y1) => {
        const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
        const teeth = tool === 'rake' ? [-16, -8, 0, 8, 16] : [0];
        const span = tool === 'rake' ? 42 : 14;
        ctx.lineCap = 'butt'; ctx.strokeStyle = pat; ctx.lineWidth = span; line(x0, y0, x1, y1);
        for (const o of teeth) groove(x0 + nx * o, y0 + ny * o, x1 + nx * o, y1 + ny * o, tool === 'rake' ? 3 : 6);
        for (const s of stones) if (segDist(s, x0, y0, x1, y1) < span / 2 + s.r + 4) drawStone(s, false);
      };
      const smooth = () => { ctx.drawImage(base, 0, 0, W, H); stones = []; };

      // 耙沙的"沙沙"声：音量跟随手指速度
      let snd = null, idle = null;
      const scrapeStart = () => {
        const ac = audio();
        if (!ac) return;
        const src = ac.createBufferSource();
        src.buffer = noiseBuffer(ac, 2, 'pink'); src.loop = true;
        const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.6;
        const g = ac.createGain(); g.gain.value = 0;
        src.connect(bp).connect(g).connect(ac.destination);
        src.start();
        snd = { ac, src, g };
      };
      const scrape = (vol) => snd?.g.gain.setTargetAtTime(vol, snd.ac.currentTime, 0.05);
      const scrapeStop = () => {
        if (!snd) return;
        const s = snd; snd = null;
        s.g.gain.setTargetAtTime(0, s.ac.currentTime, 0.05);
        setTimeout(() => s.src.stop(), 300);
      };

      let last = null, lastT = 0;
      cv.addEventListener('pointerdown', (e) => {
        const p = localPt(cv, e);
        if (tool === 'stone') {
          const s = { x: p.x, y: p.y, r: 14 + Math.random() * 12, rot: Math.random() * Math.PI };
          stones.push(s); drawStone(s, true);
          const ac = audio();
          if (ac) tone(ac, { freq: 180, to: 120, dur: 0.12, vol: 0.3 });
          navigator.vibrate?.(15);
          return;
        }
        last = p; lastT = performance.now();
        cv.setPointerCapture(e.pointerId);
        scrapeStart();
      });
      cv.addEventListener('pointermove', (e) => {
        if (!last) return;
        const p = localPt(cv, e), d = Math.hypot(p.x - last.x, p.y - last.y);
        if (d < 5) return;
        const now = performance.now();
        rake(last.x, last.y, p.x, p.y);
        scrape(Math.min(0.16, (d / Math.max(1, now - lastT)) * 0.12));
        clearTimeout(idle);
        idle = setTimeout(() => scrape(0), 90);
        last = p; lastT = now;
      });
      const up = () => { last = null; scrapeStop(); };
      cv.addEventListener('pointerup', up);
      cv.addEventListener('pointercancel', up);
      $$('#tools button', root).forEach((btn) => btn.addEventListener('click', () => {
        tool = btn.dataset.t;
        $$('#tools button', root).forEach((x) => x.classList.toggle('on', x === btn));
      }));
      $('#clear', root).onclick = smooth;
      soundToggle($('#sound', root));
      smooth();
      // 初始给一圈示范纹路
      const cx = W / 2, cy = H / 2;
      for (let a = 0; a < TAU; a += 0.08) rake(cx + Math.cos(a) * W * 0.3, cy + Math.sin(a) * W * 0.3, cx + Math.cos(a + 0.08) * W * 0.3, cy + Math.sin(a + 0.08) * W * 0.3);
      const s0 = { x: cx, y: cy, r: 22, rot: 0.4 };
      stones.push(s0); drawStone(s0, true);
      return () => { clearTimeout(idle); scrapeStop(); };
    },
  };
}

/* ============================== 果冻史莱姆 ============================== */
const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16), t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (t - v) * p));
  return `rgb(${c.join(',')})`;
};

export function slimeView() {
  const COLORS = [['薄荷', '#45d6b8'], ['蜜桃', '#ff8fa3'], ['葡萄', '#a98bff'], ['柠檬', '#ffd23f'], ['天空', '#5cb8ff']];
  let color = COLORS[0][1];
  return {
    title: '果冻史莱姆', tab: 3, back: '#/tools',
    html: `<h1 class="large-title">果冻史莱姆</h1><p class="large-sub">拉扯它、戳戳它，它会Q弹地回到原样。</p>
      <div class="chips" id="colors">${COLORS.map(([n, c], i) => `<button class="chip ${i ? '' : 'on'}" data-c="${c}"><i class="dot-sw" style="background:${c}"></i>${n}</button>`).join('')}</div>
      <div class="card glass toy-canvas" id="box" style="padding:0;margin-top:12px"><canvas id="cv" aria-label="史莱姆"></canvas></div>
      <div class="row-btns" style="margin-top:14px"><button class="btn glass" id="sound"></button></div>`,
    mount(root) {
      played('slime');
      const box = $('#box', root), cv = $('#cv', root);
      const W = box.clientWidth, H = Math.round(Math.min(W * 0.95, 420));
      const { ctx } = setupCanvas(cv, W, H);
      const N = 40, R = Math.min(W, H) * 0.3, C = { x: W / 2, y: H / 2 + 6 };
      const P = Array.from({ length: N }, (_, i) => {
        const a = (i / N) * TAU, rx = Math.cos(a) * R, ry = Math.sin(a) * R * 0.86;
        return { rx, ry, x: C.x + rx, y: C.y + ry, vx: 0, vy: 0, w: 0 };
      });
      let drag = null, squish = 0;
      const centroid = () => P.reduce((o, p) => ({ x: o.x + p.x / N, y: o.y + p.y / N }), { x: 0, y: 0 });

      const step = (dt) => {
        const K = 70, KN = 140, DAMP = 4.2;
        let dx = 0, dy = 0;
        if (drag) {
          dx = drag.dx; dy = drag.dy;
          const L = Math.hypot(dx, dy), max = R * 1.2;
          if (L > max) { dx *= max / L; dy *= max / L; }
        }
        for (let i = 0; i < N; i++) {
          const p = P[i], a = P[(i + N - 1) % N], c = P[(i + 1) % N];
          const tx = C.x + p.rx + (drag ? p.w * dx + 0.12 * dx : 0);
          const ty = C.y + p.ry + (drag ? p.w * dy + 0.12 * dy : 0);
          // 以"偏离静止形状的位移"做平滑，避免整体收缩
          const lx = ((a.x - C.x - a.rx) + (c.x - C.x - c.rx)) / 2 - (p.x - C.x - p.rx);
          const ly = ((a.y - C.y - a.ry) + (c.y - C.y - c.ry)) / 2 - (p.y - C.y - p.ry);
          p.vx += (K * (tx - p.x) + KN * lx - DAMP * p.vx) * dt;
          p.vy += (K * (ty - p.y) + KN * ly - DAMP * p.vy) * dt;
        }
        for (const p of P) { p.x += p.vx * dt; p.y += p.vy * dt; }
      };

      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        const c = centroid();
        ctx.fillStyle = 'rgba(0,0,0,.13)';
        ctx.beginPath(); ctx.ellipse(C.x, C.y + R * 0.9, R * 1.02, R * 0.15, 0, 0, TAU); ctx.fill();
        ctx.beginPath();
        const mid = (a, b) => [(a.x + b.x) / 2, (a.y + b.y) / 2];
        ctx.moveTo(...mid(P[N - 1], P[0]));
        for (let i = 0; i < N; i++) ctx.quadraticCurveTo(P[i].x, P[i].y, ...mid(P[i], P[(i + 1) % N]));
        ctx.closePath();
        const g = ctx.createRadialGradient(c.x - R * 0.35, c.y - R * 0.45, R * 0.1, c.x, c.y, R * 1.3);
        g.addColorStop(0, shade(color, 0.55)); g.addColorStop(0.5, color); g.addColorStop(1, shade(color, -0.35));
        ctx.fillStyle = g; ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.5)';
        ctx.beginPath(); ctx.ellipse(c.x - R * 0.36, c.y - R * 0.44, R * 0.22, R * 0.11, -0.55, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.arc(c.x - R * 0.08, c.y - R * 0.6, R * 0.04, 0, TAU); ctx.fill();
        // 表情
        const ex = R * 0.26, ey = c.y - R * 0.02, ink = 'rgba(30,20,40,.85)';
        ctx.fillStyle = 'rgba(255,90,120,.28)';
        for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(c.x + s * R * 0.42, ey + R * 0.16, R * 0.1, R * 0.06, 0, 0, TAU); ctx.fill(); }
        if (squish > 0) {
          ctx.strokeStyle = ink; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
          for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(c.x + s * ex - 7 * s, ey - 7); ctx.lineTo(c.x + s * ex + 4 * s, ey); ctx.lineTo(c.x + s * ex - 7 * s, ey + 7); ctx.stroke(); }
          ctx.fillStyle = ink; ctx.beginPath(); ctx.ellipse(c.x, ey + R * 0.2, 7, 9, 0, 0, TAU); ctx.fill();
        } else {
          for (const s of [-1, 1]) {
            ctx.fillStyle = ink; ctx.beginPath(); ctx.ellipse(c.x + s * ex, ey, 7, 10, 0, 0, TAU); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(c.x + s * ex - 2, ey - 4, 2.6, 0, TAU); ctx.fill();
          }
          ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.arc(c.x - 6, ey + R * 0.15, 6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.arc(c.x + 6, ey + R * 0.15, 6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
        }
      };

      cv.addEventListener('pointerdown', (e) => {
        const p = localPt(cv, e), c = centroid();
        if (Math.hypot(p.x - c.x, p.y - c.y) > R * 1.25) return;
        const sig = R * 0.6;
        for (const q of P) q.w = Math.exp(-((q.x - p.x) ** 2 + (q.y - p.y) ** 2) / (2 * sig * sig));
        drag = { sx: p.x, sy: p.y, dx: 0, dy: 0, t0: performance.now(), moved: 0 };
        cv.setPointerCapture(e.pointerId);
      });
      cv.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const p = localPt(cv, e);
        drag.dx = p.x - drag.sx; drag.dy = p.y - drag.sy;
        drag.moved = Math.max(drag.moved, Math.hypot(drag.dx, drag.dy));
        if (drag.moved > 8) squish = 0.3;
      });
      const up = () => {
        if (!drag) return;
        const ac = audio();
        if (drag.moved < 8) {
          // 轻戳：附近的点获得向内的冲量
          const sig = R * 0.45;
          for (const q of P) {
            const w = Math.exp(-((q.x - drag.sx) ** 2 + (q.y - drag.sy) ** 2) / (2 * sig * sig));
            const L = Math.hypot(C.x - q.x, C.y - q.y) || 1;
            q.vx += ((C.x - q.x) / L) * 420 * w; q.vy += ((C.y - q.y) / L) * 420 * w;
          }
          if (ac) tone(ac, { freq: 320, to: 760, dur: 0.12, vol: 0.25 });
        } else if (ac) tone(ac, { freq: 240, to: 110, dur: 0.32, vol: 0.28 });
        navigator.vibrate?.(10);
        squish = 0.6;
        drag = null;
      };
      cv.addEventListener('pointerup', up);
      cv.addEventListener('pointercancel', up);
      $$('#colors .chip', root).forEach((b) => b.addEventListener('click', () => {
        color = b.dataset.c;
        $$('#colors .chip', root).forEach((x) => x.classList.toggle('on', x === b));
      }));
      soundToggle($('#sound', root));
      return loop((dt) => {
        step(dt / 2); step(dt / 2);
        if (!drag) squish = Math.max(0, squish - dt);
        draw();
      });
    },
  };
}

/* ============================== 曼陀罗画板 ============================== */
export function mandalaView() {
  let sym = 8, mirror = true;
  return {
    title: '曼陀罗画板', tab: 3, back: '#/tools',
    html: `<h1 class="large-title">曼陀罗画板</h1><p class="large-sub">随手画一笔，它会自动变成对称的图案。荣格曾用画曼陀罗来观察自己的内心。</p>
      <div class="segmented" id="sym">${[6, 8, 12, 16].map((n) => `<button data-n="${n}" class="${n === sym ? 'on' : ''}">${n} 瓣</button>`).join('')}</div>
      <div class="toy-canvas mandala-box" id="box" style="margin-top:12px"><canvas id="cv" aria-label="曼陀罗画布"></canvas></div>
      <div class="row-btns" style="margin-top:14px">
        <button class="btn glass" id="mirror"></button>
        <button class="btn glass" id="clear">${icon('trash')}清空</button>
        <button class="btn glass" id="save">${icon('download')}保存</button>
      </div>`,
    mount(root) {
      played('mandala');
      const box = $('#box', root), cv = $('#cv', root);
      const W = box.clientWidth, H = Math.round(Math.min(W, window.innerHeight * 0.6));
      const { ctx } = setupCanvas(cv, W, H);
      const cx = W / 2, cy = H / 2;
      let hue = Math.random() * 360, last = null;
      const clear = () => {
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowBlur = 0;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
        g.addColorStop(0, '#1a2150'); g.addColorStop(1, '#05070f');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 1;
        for (let k = 0; k < sym; k++) {
          const a = (k / sym) * TAU;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * W, cy + Math.sin(a) * W); ctx.stroke();
        }
      };
      const stroke = (a, b) => {
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        hue = (hue + d * 0.5) % 360;
        const col = `hsl(${hue.toFixed(0)}, 95%, 65%)`;
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 10;
        ctx.lineWidth = 2.2; ctx.lineCap = 'round';
        for (let k = 0; k < sym; k++) {
          for (const m of mirror ? [1, -1] : [1]) {
            ctx.save();
            ctx.translate(cx, cy); ctx.rotate((k / sym) * TAU); ctx.scale(1, m);
            ctx.beginPath(); ctx.moveTo(a.x - cx, a.y - cy); ctx.lineTo(b.x - cx, b.y - cy); ctx.stroke();
            ctx.restore();
          }
        }
      };
      cv.addEventListener('pointerdown', (e) => { last = localPt(cv, e); cv.setPointerCapture(e.pointerId); });
      cv.addEventListener('pointermove', (e) => {
        if (!last) return;
        const p = localPt(cv, e);
        if (Math.hypot(p.x - last.x, p.y - last.y) < 2) return;
        stroke(last, p); last = p;
      });
      const up = () => (last = null);
      cv.addEventListener('pointerup', up);
      cv.addEventListener('pointercancel', up);
      $$('#sym button', root).forEach((b) => b.addEventListener('click', () => {
        sym = +b.dataset.n;
        $$('#sym button', root).forEach((x) => x.classList.toggle('on', x === b));
        clear();
      }));
      const mBtn = $('#mirror', root);
      const showMirror = () => (mBtn.innerHTML = `${icon('layers')}镜像：${mirror ? '开' : '关'}`);
      mBtn.onclick = () => { mirror = !mirror; showMirror(); };
      $('#clear', root).onclick = clear;
      $('#save', root).onclick = () => cv.toBlob((b) => b && download('曼陀罗.png', b));
      showMirror();
      clear();
    },
  };
}

/* ============================== 音乐涟漪 ============================== */
const PENTA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
let bus = null;
/** 带混响的输出总线（混响用衰减噪声生成脉冲响应） */
function chimeBus(ac) {
  if (bus?.ac === ac) return bus.node;
  const node = ac.createGain();
  node.connect(ac.destination);
  const conv = ac.createConvolver();
  const len = Math.floor(ac.sampleRate * 2.8);
  const ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  conv.buffer = ir;
  const wet = ac.createGain();
  wet.gain.value = 0.35;
  node.connect(conv).connect(wet).connect(ac.destination);
  bus = { ac, node };
  return node;
}
function bell(ac, f) {
  const dest = chimeBus(ac);
  [[1, 0.22, 2.6], [2.0, 0.08, 1.4], [3.0, 0.04, 0.8], [4.2, 0.025, 0.5]].forEach(([r, vol, dur]) => tone(ac, { freq: f * r, dur, vol, dest }));
}

export function chimesView() {
  let auto = null;
  return {
    title: '音乐涟漪', tab: 3, back: '#/tools',
    html: `<h1 class="large-title">音乐涟漪</h1><p class="large-sub">点一下，泛起一圈涟漪和一个音符。五声音阶怎么弹都好听，随便点就好。</p>
      <div class="toy-canvas chimes-box" id="box"><canvas id="cv" aria-label="音乐涟漪画布"></canvas></div>
      <div class="row-btns" style="margin-top:14px"><button class="btn glass" id="auto"></button></div>
      <p class="center muted small" style="margin-top:12px">左边低音，右边高音 · 也可以按住滑动</p>`,
    mount(root) {
      played('chimes');
      const box = $('#box', root), cv = $('#cv', root);
      const W = box.clientWidth, H = Math.round(Math.min(W * 1.05, window.innerHeight * 0.58));
      const { ctx, dpr } = setupCanvas(cv, W, H);
      const bg = document.createElement('canvas');
      bg.width = cv.width; bg.height = cv.height;
      const b = bg.getContext('2d');
      const g = b.createLinearGradient(0, 0, 0, bg.height);
      g.addColorStop(0, '#0b1240'); g.addColorStop(1, '#1d1450');
      b.fillStyle = g; b.fillRect(0, 0, bg.width, bg.height);
      for (let i = 0; i < 90; i++) {
        b.fillStyle = `rgba(255,255,255,${(0.2 + Math.random() * 0.6).toFixed(2)})`;
        b.beginPath(); b.arc(Math.random() * bg.width, Math.random() * bg.height, (0.4 + Math.random() * 1.1) * dpr, 0, TAU); b.fill();
      }
      const ripples = [];
      let lastNote = null;
      const play = (x, y) => {
        const idx = Math.max(0, Math.min(PENTA.length - 1, Math.floor((x / W) * PENTA.length)));
        const ac = audio();
        if (ac) bell(ac, PENTA[idx]);
        ripples.push({ x, y, r: 0, life: 1, hue: 190 + idx * 14 });
        lastNote = { x, y };
      };
      cv.addEventListener('pointerdown', (e) => { const p = localPt(cv, e); play(p.x, p.y); cv.setPointerCapture(e.pointerId); });
      cv.addEventListener('pointermove', (e) => {
        if (!lastNote || !e.buttons) return;
        const p = localPt(cv, e);
        if (Math.hypot(p.x - lastNote.x, p.y - lastNote.y) > 46) play(p.x, p.y);
      });
      cv.addEventListener('pointerup', () => (lastNote = null));
      const aBtn = $('#auto', root);
      const showAuto = () => (aBtn.innerHTML = auto ? `${icon('x')}停止风铃` : `${icon('wind')}风铃模式`);
      const breeze = () => {
        play(Math.random() * W, Math.random() * H);
        lastNote = null;
        auto = setTimeout(breeze, 600 + Math.random() * 1400);
      };
      aBtn.onclick = () => { if (auto) { clearTimeout(auto); auto = null; } else breeze(); showAuto(); };
      showAuto();
      const stop = loop((dt) => {
        ctx.drawImage(bg, 0, 0, W, H);
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.r += 80 * dt; r.life -= dt / 2.6;
          if (r.life <= 0) { ripples.splice(i, 1); continue; }
          for (const [k, w] of [[1, 2.2], [0.68, 1.6], [0.4, 1.1]]) {
            ctx.strokeStyle = `hsla(${r.hue}, 90%, 72%, ${(r.life * (k === 1 ? 0.9 : 0.5)).toFixed(3)})`;
            ctx.lineWidth = w;
            ctx.beginPath(); ctx.arc(r.x, r.y, r.r * k, 0, TAU); ctx.stroke();
          }
          const glow = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, 26);
          glow.addColorStop(0, `hsla(${r.hue}, 100%, 80%, ${(r.life * r.life * 0.8).toFixed(3)})`);
          glow.addColorStop(1, `hsla(${r.hue}, 100%, 80%, 0)`);
          ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(r.x, r.y, 26, 0, TAU); ctx.fill();
        }
      });
      return () => { stop(); clearTimeout(auto); };
    },
  };
}

/* ============================== 白噪音 ============================== */
const SOUNDS = [
  { k: 'rain', n: '雨声', ic: 'cloud-rain', c: '#5ac8fa' },
  { k: 'waves', n: '海浪', ic: 'waves', c: '#30b0c7' },
  { k: 'stream', n: '溪流', ic: 'droplet', c: '#64d2ff' },
  { k: 'wind', n: '风声', ic: 'wind', c: '#7d7aff' },
  { k: 'fire', n: '篝火', ic: 'flame', c: '#ff9500' },
  { k: 'white', n: '白噪音', ic: 'radio', c: '#8e8e93' },
  { k: 'pink', n: '粉红噪音', ic: 'leaf', c: '#ff8fa3' },
  { k: 'brown', n: '褐噪音', ic: 'moon', c: '#a2845e' },
];
const PRESETS = [
  { n: '雨夜篝火', s: { rain: 60, fire: 50 } },
  { n: '海边', s: { waves: 70, wind: 25 } },
  { n: '林间小溪', s: { stream: 60, wind: 20 } },
  { n: '深度专注', s: { brown: 60, rain: 25 } },
];

/** 稀疏的短促噪声脉冲：rain 用作雨滴，fire 用作木柴的噼啪声 */
function sparkBuffer(ac, kind) {
  const sr = ac.sampleRate, len = sr * 3;
  const buf = ac.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  const n = kind === 'rain' ? 140 : 60;
  for (let k = 0; k < n; k++) {
    const pos = Math.floor(Math.random() * (len - 4000));
    const amp = kind === 'rain' ? 0.15 + Math.random() * 0.5 : 0.3 + Math.random() * 0.7;
    const dur = kind === 'rain' ? 80 + Math.random() * 200 : 20 + Math.random() * (Math.random() < 0.15 ? 600 : 90);
    for (let j = 0; j < dur * 4; j++) d[pos + j] += amp * (Math.random() * 2 - 1) * Math.exp(-j / (dur / 2));
  }
  return buf;
}

function buildSound(ac, k, dest) {
  const vol = ac.createGain();
  vol.gain.value = 0;
  vol.connect(dest);
  const nodes = [];
  const src = (color, sec = 4) => { const s = ac.createBufferSource(); s.buffer = noiseBuffer(ac, sec, color); s.loop = true; s.start(); nodes.push(s); return s; };
  const spark = (kind) => { const s = ac.createBufferSource(); s.buffer = sparkBuffer(ac, kind); s.loop = true; s.start(); nodes.push(s); return s; };
  const filt = (type, f, q = 0.7) => { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  const gain = (v) => { const g = ac.createGain(); g.gain.value = v; return g; };
  const lfo = (f, depth, param) => { const o = ac.createOscillator(); o.frequency.value = f; o.connect(gain(depth)).connect(param); o.start(); nodes.push(o); };
  switch (k) {
    case 'white': src('white').connect(gain(0.45)).connect(vol); break;
    case 'pink': src('pink').connect(gain(0.8)).connect(vol); break;
    case 'brown': src('brown').connect(gain(0.9)).connect(vol); break;
    case 'rain':
      src('pink').connect(filt('highpass', 500)).connect(filt('lowpass', 7000)).connect(gain(0.8)).connect(vol);
      spark('rain').connect(filt('highpass', 2000)).connect(gain(0.45)).connect(vol);
      break;
    case 'waves': {
      const lp = filt('lowpass', 600), amp = gain(0.55), foam = gain(0.1);
      src('brown').connect(lp).connect(amp).connect(vol);
      src('pink', 3).connect(filt('highpass', 2500)).connect(foam).connect(vol);
      lfo(0.085, 0.45, amp.gain); lfo(0.085, 450, lp.frequency); lfo(0.085, 0.1, foam.gain);
      break;
    }
    case 'wind': {
      const bp = filt('bandpass', 450, 1.2), amp = gain(0.9);
      src('pink').connect(bp).connect(amp).connect(vol);
      lfo(0.07, 250, bp.frequency); lfo(0.19, 120, bp.frequency); lfo(0.11, 0.35, amp.gain);
      break;
    }
    case 'fire':
      src('brown').connect(filt('lowpass', 350)).connect(gain(0.7)).connect(vol);
      spark('fire').connect(filt('highpass', 1200)).connect(gain(0.6)).connect(vol);
      break;
    case 'stream': {
      const bp = filt('bandpass', 1600, 0.6), amp = gain(0.45);
      src('white').connect(bp).connect(amp).connect(vol);
      src('pink', 3).connect(filt('lowpass', 500)).connect(gain(0.35)).connect(vol);
      lfo(1.3, 0.12, amp.gain); lfo(2.9, 0.1, amp.gain); lfo(4.7, 0.08, amp.gain); lfo(0.6, 500, bp.frequency);
      break;
    }
  }
  return { vol, stop: () => { nodes.forEach((x) => { try { x.stop(); } catch { /* 已停止 */ } }); setTimeout(() => vol.disconnect(), 50); } };
}

export function noiseView() {
  const levels = Object.fromEntries(SOUNDS.map((s) => [s.k, 60]));
  const active = new Map();
  let master = null, timer = null, timerMin = 0;
  return {
    title: '白噪音', tab: 3, back: '#/tools',
    html: `<h1 class="large-title">白噪音</h1><p class="large-sub">雨声、海浪、篝火……自由混合，帮你专注、放松或入睡。全部为实时合成。</p>
      <div class="chips" id="presets">${PRESETS.map((p, i) => `<button class="chip" data-p="${i}">${p.n}</button>`).join('')}</div>
      <div class="grid2 wide3" id="tiles" style="margin-top:12px">${SOUNDS.map((s) => `
        <div class="card glass noise-tile" data-k="${s.k}" style="--tint:${s.c}">
          <button class="nt-btn" aria-pressed="false">${appIcon(s.ic, s.c, 'sm')}<span>${s.n}</span></button>
          <input class="range" type="range" min="5" max="100" value="60" aria-label="${s.n}音量">
        </div>`).join('')}</div>
      <div class="card glass" style="margin-top:12px">
        <h3 style="font-size:15px;margin-bottom:8px" class="muted">定时关闭</h3>
        <div class="segmented" id="timer">${[0, 15, 30, 60].map((m) => `<button data-m="${m}" class="${m ? '' : 'on'}">${m ? `${m} 分钟` : '不限'}</button>`).join('')}</div>
        <button class="btn glass block" id="stopall" style="margin-top:12px">${icon('x')}全部停止</button>
      </div>
      <p class="center muted small" style="margin-top:12px" id="nstat">离开这个页面后声音会自动停止</p>`,
    mount(root) {
      played('noise');
      const ac = () => audio(true);
      const ensureMaster = (c) => {
        if (master?.context === c) return master;
        master = c.createGain();
        master.connect(c.destination);
        return master;
      };
      const setVol = (k) => { const s = active.get(k); if (s) s.vol.gain.setTargetAtTime((levels[k] / 100) ** 2, s.vol.context.currentTime, 0.3); };
      const sync = () => {
        $$('.noise-tile', root).forEach((t) => {
          const on = active.has(t.dataset.k);
          t.classList.toggle('on', on);
          $('.nt-btn', t).setAttribute('aria-pressed', on);
        });
        $('#nstat', root).textContent = active.size ? `正在播放 ${active.size} 种声音${timerMin ? ` · ${timerMin} 分钟后关闭` : ''}` : '离开这个页面后声音会自动停止';
      };
      const start = (k) => {
        const c = ac();
        if (!c || active.has(k)) return;
        const m = ensureMaster(c);
        m.gain.cancelScheduledValues(c.currentTime);
        m.gain.setValueAtTime(1, c.currentTime);
        active.set(k, buildSound(c, k, m));
        setVol(k);
      };
      const stopOne = (k) => {
        const s = active.get(k);
        if (!s) return;
        s.vol.gain.setTargetAtTime(0, s.vol.context.currentTime, 0.15);
        setTimeout(s.stop, 600);
        active.delete(k);
      };
      const stopAll = () => { [...active.keys()].forEach(stopOne); clearTimeout(timer); sync(); };
      const armTimer = () => {
        clearTimeout(timer);
        if (timerMin) timer = setTimeout(() => {
          if (master) master.gain.setTargetAtTime(0, master.context.currentTime, 3);
          setTimeout(() => { stopAll(); toast('白噪音已定时关闭', { icon: 'moon', tint: '#5e5ce6' }); }, 9000);
        }, timerMin * 60e3);
      };
      $$('.noise-tile', root).forEach((t) => {
        const k = t.dataset.k;
        $('.nt-btn', t).onclick = () => { active.has(k) ? stopOne(k) : start(k); armTimer(); sync(); };
        $('.range', t).addEventListener('input', (e) => { levels[k] = +e.target.value; setVol(k); });
      });
      $$('#presets .chip', root).forEach((b) => b.addEventListener('click', () => {
        const p = PRESETS[+b.dataset.p];
        [...active.keys()].filter((k) => !(k in p.s)).forEach(stopOne);
        for (const [k, v] of Object.entries(p.s)) {
          levels[k] = v;
          $(`.noise-tile[data-k="${k}"] .range`, root).value = v;
          start(k); setVol(k);
        }
        armTimer(); sync();
      }));
      $$('#timer button', root).forEach((b) => b.addEventListener('click', () => {
        timerMin = +b.dataset.m;
        $$('#timer button', root).forEach((x) => x.classList.toggle('on', x === b));
        armTimer(); sync();
      }));
      $('#stopall', root).onclick = stopAll;
      return stopAll;
    },
  };
}

/* ============================== 烦恼粉碎机 ============================== */
export function shredView() {
  let mode = 'shred';
  const DONE = ['它已经不在这里了。', '放下了一点点，就轻松了一点点。', '烦恼还会来，但你知道怎么放下它了。', '你比这些烦恼更大。'];
  return {
    title: '烦恼粉碎机', tab: 3, back: '#/tools',
    html: `<h1 class="large-title">烦恼粉碎机</h1><p class="large-sub">把让你烦心的事写下来，然后亲手把它粉碎。</p>
      <div class="segmented" id="mode"><button data-m="shred" class="on">碎纸机</button><button data-m="wind">随风吹散</button></div>
      <div class="card glass shred-stage" id="stage" style="margin-top:12px"></div>
      <p class="ref">${icon('lock')}<span>你写下的内容只存在于这个页面，不会被保存或上传。</span></p>`,
    mount(root) {
      played('shred');
      const stage = $('#stage', root);
      let busy = false;
      const write = () => {
        stage.innerHTML = `<textarea class="field" id="worry" maxlength="300" placeholder="比如：明天的汇报好紧张，怕讲不好……" style="min-height:150px"></textarea>
          <button class="btn block" id="go" style="margin-top:12px;background:#5e5ce6">${icon(mode === 'shred' ? 'scissors' : 'wind')}${mode === 'shred' ? '粉碎它' : '吹散它'}</button>`;
        $('#go', stage).onclick = go;
      };
      const finish = () => {
        stats.bump('shred');
        busy = false;
        stage.innerHTML = `<div class="lab-stage fade-in" style="min-height:260px">${appIcon('sparkles', '#5e5ce6', 'lg')}
          <h2 style="font-size:22px">${DONE[Math.floor(Math.random() * DONE.length)]}</h2>
          <p class="hint">研究发现，把烦恼写在纸上再亲手丢掉，人们会在心理上与这些想法拉开距离，受它们的影响也会变小。（Briñol 等，2013）</p>
          <button class="btn mt" id="again" style="background:#5e5ce6">${icon('refresh')}再写一个</button></div>`;
        $('#again', stage).onclick = write;
      };
      const go = () => {
        const text = $('#worry', stage).value.trim();
        if (!text) return toast('先写点什么吧', { icon: 'info' });
        if (busy) return;
        busy = true;
        (mode === 'shred' ? shred : blow)(text);
      };
      const shred = (text) => {
        const N = 14;
        stage.innerHTML = `<div class="shredder">
          <div class="feed"><div class="paper" id="paper">${esc(text)}</div></div>
          <div class="machine"><i></i></div>
          <div class="strips">${Array.from({ length: N }, (_, i) => `<div class="strip" style="clip-path:inset(0 ${(100 - ((i + 1) * 100) / N).toFixed(2)}% 0 ${((i * 100) / N).toFixed(2)}%)"><div class="paper">${esc(text)}</div></div>`).join('')}</div>
        </div>`;
        const h = $('#paper', stage).offsetHeight;
        $('.feed', stage).style.height = `${h}px`;
        $('.strips', stage).style.height = `${h + 60}px`;
        const D = 1500;
        $('#paper', stage).animate([{ transform: 'translateY(0)' }, { transform: `translateY(${h}px)` }], { duration: D, easing: 'linear', fill: 'forwards' });
        $('.machine', stage).animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-1.5px)' }, { transform: 'translateX(1.5px)' }], { duration: 70, iterations: D / 70 });
        $$('.strip', stage).forEach((s) => {
          s.firstElementChild.animate([{ transform: `translateY(${-h}px)` }, { transform: 'translateY(0)' }], { duration: D, easing: 'linear', fill: 'forwards' });
          s.animate([{ transform: 'none', opacity: 1 }, { transform: `translateY(${40 + Math.random() * 60}px) rotate(${(Math.random() * 16 - 8).toFixed(1)}deg)`, opacity: 0 }],
            { duration: 700, delay: D + Math.random() * 300, easing: 'ease-in', fill: 'forwards' });
        });
        const ac = audio();
        if (ac) {
          const { g, src } = noiseBurst(ac, { dur: D / 1000, freq: 2200, q: 0.6, vol: 0.3, curve: 0.3 });
          const o = ac.createOscillator(), og = ac.createGain();
          o.frequency.value = 32; og.gain.value = 0.22;
          o.connect(og).connect(g.gain);
          o.start(); o.stop(ac.currentTime + D / 1000);
          src.onended = () => og.disconnect();
        }
        navigator.vibrate?.([30, 40, 30, 40, 30, 40, 30]);
        setTimeout(finish, D + 1200);
      };
      const blow = (text) => {
        const chars = [...text];
        stage.innerHTML = `<div class="paper blow" id="paper">${chars.map((c) => (c === '\n' ? '<br>' : `<span>${esc(c)}</span>`)).join('')}</div>`;
        const paper = $('#paper', stage);
        const spans = $$('span', paper);
        const step = Math.min(18, 1400 / Math.max(1, spans.length));
        spans.forEach((s, i) => s.animate([
          { transform: 'translate(0,0) rotate(0)', opacity: 1, filter: 'blur(0)' },
          { transform: `translate(${120 + Math.random() * 260}px, ${-40 - Math.random() * 180}px) rotate(${(Math.random() * 360 - 180).toFixed(0)}deg)`, opacity: 0, filter: 'blur(2px)' },
        ], { duration: 1200 + Math.random() * 600, delay: i * step + Math.random() * 120, easing: 'cubic-bezier(.4,0,.8,.6)', fill: 'forwards' }));
        const total = spans.length * step + 1900;
        paper.animate([{ background: '#fffdf6', boxShadow: '0 6px 20px rgba(0,0,0,.12)' }, { background: 'transparent', boxShadow: 'none' }], { duration: 800, delay: total - 900, fill: 'forwards' });
        const ac = audio();
        if (ac) {
          const { bp } = noiseBurst(ac, { dur: 2, freq: 500, q: 0.5, vol: 0.5, curve: 1 });
          bp.frequency.setValueAtTime(500, ac.currentTime);
          bp.frequency.exponentialRampToValueAtTime(1600, ac.currentTime + 1.2);
        }
        setTimeout(finish, total);
      };
      $$('#mode button', root).forEach((b) => b.addEventListener('click', () => {
        if (busy) return;
        mode = b.dataset.m;
        $$('#mode button', root).forEach((x) => x.classList.toggle('on', x === b));
        const prev = $('#worry', stage)?.value;
        write();
        if (prev) $('#worry', stage).value = prev;
      }));
      write();
      return () => { busy = false; };
    },
  };
}

export const TOYS = { muyu: muyuView, spinner: spinnerView, sand: sandView, slime: slimeView, mandala: mandalaView, chimes: chimesView, noise: noiseView, shred: shredView };

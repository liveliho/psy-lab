// 动态天空背景：朝霞 / 晴空 / 晚霞随时间变化，深色模式为星空（带流星）。纯 CSS 绘制 + 少量 JS 控制。
const CLOUDS = [
  // top(vh), width(px), duration(s), delay(s), opacity, layer
  [8, 340, 150, -20, 0.95, 'near'],
  [22, 220, 210, -120, 0.8, 'far'],
  [36, 420, 180, -60, 0.9, 'near'],
  [52, 260, 240, -170, 0.7, 'far'],
  [64, 380, 200, -100, 0.85, 'near'],
  [80, 300, 260, -30, 0.75, 'far'],
  [14, 180, 280, -220, 0.6, 'far'],
];

let el, starsBuilt = false, shootTimer = null, current = '';

function starField(n, seed) {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = (rnd() * 100).toFixed(2), y = (rnd() * 85).toFixed(2);
    const a = (0.35 + rnd() * 0.65).toFixed(2);
    out.push(`${x}vw ${y}vh 0 ${rnd() > 0.9 ? 1 : 0}px rgba(255,255,255,${a})`);
  }
  return out.join(',');
}

function build() {
  el = document.createElement('div');
  el.className = 'sky';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `
    <div class="sky-layer sky-dawn"></div><div class="sky-layer sky-day"></div>
    <div class="sky-layer sky-sunset"></div><div class="sky-layer sky-night"></div>
    <div class="stars s1"></div><div class="stars s2"></div><div class="stars s3"></div>
    <div class="sun"></div><div class="moon"></div><div class="shooting"></div>
    <div class="clouds">${CLOUDS.map(([top, w, dur, delay, op, layer]) =>
      `<i class="cloud ${layer}" style="top:${top}vh;--w:${w}px;--o:${op};animation-duration:${dur}s;animation-delay:${delay}s"></i>`).join('')}</div>`;
  document.body.prepend(el);
}

function buildStars() {
  if (starsBuilt) return;
  starsBuilt = true;
  el.querySelector('.s1').style.boxShadow = starField(110, 7);
  el.querySelector('.s2').style.boxShadow = starField(70, 42);
  el.querySelector('.s3').style.boxShadow = starField(30, 99);
}

function scheduleShooting() {
  clearTimeout(shootTimer);
  if (current !== 'night' || document.documentElement.classList.contains('reduce-motion')) return;
  shootTimer = setTimeout(() => {
    const s = el.querySelector('.shooting');
    s.style.top = `${5 + Math.random() * 35}vh`;
    s.style.left = `${30 + Math.random() * 60}vw`;
    s.classList.remove('go');
    void s.offsetWidth;
    s.classList.add('go');
    scheduleShooting();
  }, 5000 + Math.random() * 9000);
}

/** 根据设置与时间计算天空阶段 */
export function skyPhase(pref, dark, hour = new Date().getHours()) {
  if (dark) return 'night';
  if (pref && pref !== 'time') return pref;
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  return 'sunset';
}

export function setSky(phase) {
  if (!el) build();
  if (phase === 'night') buildStars();
  current = phase;
  el.dataset.phase = phase;
  document.documentElement.dataset.sky = phase;
  scheduleShooting();
}

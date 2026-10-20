import { settings } from './store.js';
import { icon } from './icons.js';
import { setSky, skyPhase } from './sky.js';
import { newlyUnlocked } from './badges.js';
import { $, $$, toast, esc } from './util.js';
import { nav } from './nav.js';
import { homeView } from './views/home.js';
import { testsView, introView, quizView, resultRoute, sharedRoute } from './views/tests.js';
import { toolsView, moodView, breatheView, groundView, bubblesView, articleView } from './views/tools.js';
import { stroopView, reactionView, spanView } from './views/lab.js';
import { meView, badgesView, historyView, helpView, aboutView } from './views/me.js';
import { learnView, psyView, expView, timelineView, triviaView } from './views/learn.js';

const SITE = '心理实验室';
const view = $('#view');
const navbar = $('#navbar');
let cleanup = null;

const ROUTES = {
  home: homeView,
  tests: testsView,
  test: introView,
  quiz: quizView,
  result: resultRoute,
  s: sharedRoute,
  tools: toolsView,
  mood: moodView,
  breathe: breatheView,
  ground: groundView,
  bubbles: bubblesView,
  article: articleView,
  learn: learnView,
  psy: psyView,
  exp: expView,
  timeline: timelineView,
  trivia: triviaView,
  lab: ([kind]) => ({ stroop: stroopView, reaction: reactionView, span: spanView })[kind]?.(),
  me: meView,
  badges: badgesView,
  history: historyView,
  help: helpView,
  about: aboutView,
};

const notFound = (msg = '页面不存在') => ({
  title: msg, tab: 0, back: '#/',
  html: `<div class="empty" style="padding-top:80px">${icon('compass')}<h2 style="color:var(--label)">${esc(msg)}</h2><p>可能是链接有误或已失效</p><a class="btn" href="#/">回到首页</a></div>`,
});

/* ============================== 设置 / 主题 / 天空 ============================== */
const darkMQ = matchMedia('(prefers-color-scheme: dark)');
function applySettings() {
  const s = settings.get();
  const root = document.documentElement;
  if (s.theme === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', s.theme);
  root.style.setProperty('--glass-a', (s.glass / 100).toFixed(2));
  root.classList.toggle('reduce-motion', !!s.reduceMotion);
  const dark = s.theme === 'dark' || (s.theme === 'auto' && darkMQ.matches);
  const phase = skyPhase(s.sky, dark);
  setSky(phase);
  const themeColor = { dawn: '#7d9be0', day: '#3a88db', sunset: '#6276c9', night: '#050817' }[phase];
  $('meta[name="theme-color"]').setAttribute('content', themeColor);
}
darkMQ.addEventListener('change', applySettings);
setInterval(() => { if (!document.hidden) applySettings(); }, 5 * 60e3); // 跟随时间切换天空

function checkBadges() {
  for (const b of newlyUnlocked()) toast(`解锁成就：${b.name}`, { icon: b.icon, tint: b.tint });
}

/* ============================== 路由 ============================== */
function parse() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  const [name = '', ...params] = path.split('/').filter(Boolean).map(decodeURIComponent);
  return { name: name || 'home', params, query: new URLSearchParams(qs) };
}

// 用 history.state 记录站内导航深度，判断"返回"应后退还是跳转父页面
let depth = -1;
let replacing = false;
function trackDepth() {
  const st = window.history.state;
  if (st && typeof st.d === 'number') depth = st.d;
  else {
    depth = depth < 0 ? 0 : replacing ? depth : depth + 1;
    window.history.replaceState({ d: depth }, '');
  }
  replacing = false;
}

function render() {
  cleanup?.();
  cleanup = null;
  trackDepth();
  const { name, params, query } = parse();
  const fn = Object.hasOwn(ROUTES, name) ? ROUTES[name] : null;
  let v = null;
  try { v = fn ? fn(params, query) : null; } catch (e) { console.error(e); }
  v ||= notFound();

  const apply = () => {
    document.title = name === 'home' ? `${SITE} · 心理与性格测评` : `${v.title} · ${SITE}`;
    document.body.classList.toggle('immersive', !!v.immersive);

    const back = $('#navBack');
    back.innerHTML = v.back ? (v.backIcon ? icon(v.backIcon) : `${icon('chevron-left')}<span>返回</span>`) : '';
    back.classList.toggle('glass', !!v.backIcon);
    back.classList.toggle('icon-only', !!v.backIcon);
    back.dataset.href = v.back || '';
    $('#navTitle').textContent = v.title;
    $('#navRight').innerHTML = v.right || '';

    $$('.tabbar a').forEach((a, i) => { a.classList.toggle('on', i === v.tab); a.setAttribute('aria-current', i === v.tab ? 'page' : 'false'); });
    if (v.tab != null) $('.tab-lens').style.transform = `translateX(${v.tab * 100}%)`;

    view.innerHTML = v.html;
    window.scrollTo(0, 0);
    onScroll();
    cleanup = v.mount?.(view) || null;
    checkBadges();
  };

  const reduce = settings.get().reduceMotion || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.startViewTransition && !reduce && view.childElementCount && !document.hidden) {
    const vt = document.startViewTransition(apply);
    vt.ready.catch(() => {});
    vt.finished.catch(() => {});
  } else apply();
}

function onScroll() { navbar.classList.toggle('scrolled', window.scrollY > 24); }

/* ============================== 启动 ============================== */
Object.assign(nav, {
  render,
  replace: (hash) => { replacing = true; location.replace(hash); },
  applySettings,
  checkBadges,
});

applySettings();
$('#tabbar').innerHTML = `<span class="tab-lens"></span>
  <a href="#/">${icon('home')}<span>首页</span></a>
  <a href="#/tests">${icon('grid')}<span>测评</span></a>
  <a href="#/learn">${icon('book')}<span>学堂</span></a>
  <a href="#/tools">${icon('leaf')}<span>工具</span></a>
  <a href="#/me">${icon('user')}<span>我的</span></a>`;
$('#navBack').addEventListener('click', () => {
  const href = $('#navBack').dataset.href;
  if (!href) return;
  if (depth > 0) window.history.back();
  else location.hash = href;
});
window.addEventListener('hashchange', render);
window.addEventListener('scroll', onScroll, { passive: true });
render();

if ('serviceWorker' in navigator && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

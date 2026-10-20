// 认知实验室：经典心理学实验的网页版
import { stats } from '../store.js';
import { renderViz } from '../charts.js';
import { icon, appIcon } from '../icons.js';
import { $, $$, shuffle, toast } from '../util.js';
import { nav } from '../nav.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const secCard = (title, text) => `<div class="card glass sec"><h3>${title}</h3><p>${text}</p></div>`;

/* ---------- 斯特鲁普效应 ---------- */
export function stroopView() {
  const COLORS = [
    { n: '红', c: '#ff3b30' }, { n: '绿', c: '#28b350' },
    { n: '蓝', c: '#007aff' }, { n: '黄', c: '#f2b300' },
  ];
  const TRIALS = 24;
  let alive = true;
  return {
    title: '斯特鲁普效应', tab: 3, back: '#/tools',
    html: `<h1 class="large-title">斯特鲁普效应</h1><p class="large-sub">1935 年 J. R. Stroop 发现：当字义与颜色冲突时，我们的反应会明显变慢。</p>
      <div class="card glass lab-stage" id="stage"></div>
      <div class="stroop-btns" id="btns" hidden>${COLORS.map((c, i) => `<button class="btn" data-i="${i}">${c.n}</button>`).join('')}</div>
      <div id="out"></div>`,
    mount(root) {
      const stage = $('#stage', root), btns = $('#btns', root), out = $('#out', root);
      const intro = () => {
        btns.hidden = true; out.innerHTML = '';
        stage.innerHTML = `${appIcon('type', '#ff6b35', 'lg')}<h2 style="font-size:22px">选择<b style="color:#ff6b35">字的颜色</b>，而不是字本身</h2>
          <p class="hint">例如看到 <b style="color:#007aff;font-size:22px">红</b>，应该选"蓝"。共 ${TRIALS} 题，越快越好。</p>
          <button class="btn mt" id="go" style="background:#ff6b35">${icon('play')}开始</button>`;
        $('#go', stage).onclick = run;
      };
      const run = async () => {
        // 一半一致、一半冲突
        const trials = shuffle(Array.from({ length: TRIALS }, (_, i) => {
          const word = i % 4;
          const ink = i < TRIALS / 2 ? word : (word + 1 + Math.floor(Math.random() * 3)) % 4;
          return { word, ink };
        }));
        const res = [];
        btns.hidden = false;
        for (const [k, tr] of trials.entries()) {
          if (!alive) return;
          stage.innerHTML = '<div class="big" style="color:var(--label3)">+</div>';
          await sleep(350 + Math.random() * 250);
          if (!alive) return;
          stage.innerHTML = `<div class="big" style="color:${COLORS[tr.ink].c};font-size:96px">${COLORS[tr.word].n}</div><p class="hint">${k + 1} / ${TRIALS}</p>`;
          const t0 = performance.now();
          const pick = await new Promise((resolve) => {
            const handler = (e) => { const b = e.target.closest('[data-i]'); if (!b) return; btns.removeEventListener('click', handler); resolve(+b.dataset.i); };
            btns.addEventListener('click', handler);
          });
          res.push({ rt: performance.now() - t0, ok: pick === tr.ink, congruent: tr.word === tr.ink });
        }
        btns.hidden = true;
        show(res);
      };
      const show = (res) => {
        const avg = (arr) => (arr.length ? Math.round(arr.reduce((s, r) => s + r.rt, 0) / arr.length) : 0);
        const okRes = res.filter((r) => r.ok);
        const con = avg(okRes.filter((r) => r.congruent)), inc = avg(okRes.filter((r) => !r.congruent));
        const acc = Math.round((okRes.length / res.length) * 100);
        const diff = inc - con;
        if (acc === 100) stats.bump('stroopPerfect');
        stats.best('stroopBest', diff, (a, b) => a < b);
        nav.checkBadges?.();
        stage.innerHTML = `${appIcon('type', '#ff6b35', 'lg')}<div class="big" style="font-size:52px">${diff > 0 ? '+' : ''}${diff}<span style="font-size:22px"> ms</span></div>
          <p class="hint">干扰效应：颜色冲突时你平均慢了 ${Math.max(0, diff)} 毫秒 · 正确率 ${acc}%</p>
          <button class="btn mt" id="again" style="background:#ff6b35">${icon('refresh')}再来一次</button>`;
        $('#again', stage).onclick = run;
        out.innerHTML = `<div class="card glass viz" style="--tint:#ff6b35;margin-top:12px">${renderViz({ type: 'bars', rows: [
          { label: '颜色一致', value: con, max: Math.max(con, inc, 1), unit: ' ms' }, { label: '颜色冲突', value: inc, max: Math.max(con, inc, 1), unit: ' ms' }] })}</div>
          ${secCard('为什么会这样？', '阅读对成年人来说是高度自动化的过程，你几乎"无法不读"。当字义和颜色冲突时，大脑需要调动注意控制来抑制自动反应，于是变慢、出错。干扰效应越小，说明你的抑制控制能力越强。')}`;
      };
      intro();
      return () => { alive = false; };
    },
  };
}

/* ---------- 反应速度 ---------- */
export function reactionView() {
  const ROUNDS = 5;
  let state = 'idle', timer = null, t0 = 0;
  let times = [];
  return {
    title: '反应速度', tab: 3, back: '#/tools',
    html: `<h1 class="large-title">反应速度测试</h1><p class="large-sub">屏幕变绿的瞬间点击。共 ${ROUNDS} 轮，取平均值。</p>
      <div class="react-pad idle" id="pad" role="button" tabindex="0"></div>
      <div id="out"></div>`,
    mount(root) {
      const pad = $('#pad', root), out = $('#out', root);
      const set = (s, ic, title, sub) => { state = s; pad.className = `react-pad ${s}`; pad.innerHTML = `${icon(ic)}<b>${title}</b><p>${sub}</p>`; };
      const idle = () => set('idle', 'stopwatch', '点击开始', `${ROUNDS} 轮 · 变绿就点`);
      const arm = () => {
        set('wait', 'clock', '等待变绿…', '别着急，变绿再点');
        timer = setTimeout(() => { set('go', 'zap', '点！', ''); t0 = performance.now(); }, 1500 + Math.random() * 3000);
      };
      const rating = (ms) => (ms < 200 ? '职业电竞级' : ms < 250 ? '非常快' : ms < 300 ? '平均水平' : ms < 400 ? '稍慢一点' : '放松，再来一次');
      const press = (e) => {
        e.preventDefault();
        if (state === 'idle' || state === 'done') { times = []; out.innerHTML = ''; arm(); }
        else if (state === 'wait') { clearTimeout(timer); set('early', 'alert', '太早了！', '点击重试本轮'); }
        else if (state === 'early') arm();
        else if (state === 'go') {
          const ms = Math.round(performance.now() - t0);
          times.push(ms);
          if (times.length < ROUNDS) { set('done', 'check', `${ms} ms`, `第 ${times.length}/${ROUNDS} 轮 · 点击继续`); state = 'between'; }
          else finish();
        } else if (state === 'between') arm();
      };
      const finish = () => {
        const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
        const best = Math.min(...times);
        const newBest = stats.best('bestReaction', avg, (a, b) => a < b);
        set('done', 'trophy', `${avg} ms`, `${rating(avg)} · 最快 ${best} ms${newBest ? ' · 新纪录！' : ''} · 点击再来`);
        out.innerHTML = `<div class="card glass viz" style="--tint:#34c759;margin-top:12px"><div class="viz-h">每轮成绩</div>${renderViz({ type: 'bars', rows: times.map((t, i) => ({ label: `第 ${i + 1} 轮`, value: t, max: Math.max(...times), unit: ' ms' })) })}</div>
          ${secCard('参考', '人类对视觉刺激的简单反应时通常在 200–300 毫秒之间。它受年龄、睡眠、咖啡因、设备延迟等因素影响——熬夜后的反应时会明显变慢。')}`;
        nav.checkBadges?.();
      };
      pad.addEventListener('pointerdown', press);
      pad.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') press(e); });
      idle();
      return () => clearTimeout(timer);
    },
  };
}

/* ---------- 数字广度 ---------- */
export function spanView() {
  let alive = true;
  return {
    title: '数字记忆广度', tab: 3, back: '#/tools',
    html: `<h1 class="large-title">数字记忆广度</h1><p class="large-sub">记住依次出现的数字，然后按顺序输入。测的是你的工作记忆容量。</p>
      <div class="card glass lab-stage" id="stage"></div>
      <div id="pad"></div><div id="out"></div>`,
    mount(root) {
      const stage = $('#stage', root), padBox = $('#pad', root), out = $('#out', root);
      let len = 3, fails = 0, best = 0;
      const intro = () => {
        padBox.innerHTML = ''; out.innerHTML = '';
        stage.innerHTML = `${appIcon('hash', '#ff2d55', 'lg')}<h2 style="font-size:22px">从 3 位数字开始</h2>
          <p class="hint">答对一次增加一位，同一长度连续答错两次结束。</p>
          <button class="btn mt" id="go" style="background:#ff2d55">${icon('play')}开始</button>`;
        $('#go', stage).onclick = () => { len = 3; fails = 0; best = 0; round(); };
      };
      const round = async () => {
        padBox.innerHTML = '';
        const seq = Array.from({ length: len }, () => Math.floor(Math.random() * 10));
        stage.innerHTML = `<p class="hint">记住这 ${len} 个数字</p><div class="big" id="digit" style="font-size:110px">·</div>`;
        await sleep(900);
        for (const d of seq) {
          if (!alive) return;
          $('#digit', stage).textContent = d;
          await sleep(800);
          if (!alive) return;
          $('#digit', stage).textContent = '';
          await sleep(220);
        }
        if (!alive) return;
        input(seq);
      };
      const input = (seq) => {
        let typed = '', submitted = false;
        stage.innerHTML = `<p class="hint">按顺序输入刚才的 ${seq.length} 个数字</p><div class="span-input" id="typed">&nbsp;</div>`;
        padBox.innerHTML = `<div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-n="${n}">${n}</button>`).join('')}
          <button data-del aria-label="删除">${icon('chevron-left')}</button><button data-n="0">0</button><button data-ok aria-label="确认" style="color:var(--blue)">${icon('check')}</button></div>`;
        const show = () => ($('#typed', stage).innerHTML = typed || '&nbsp;');
        const submit = () => {
          if (submitted) return;
          if (typed.length !== seq.length) return toast(`需要输入 ${seq.length} 位`, { icon: 'info' });
          submitted = true;
          document.removeEventListener('keydown', onKey);
          if (typed === seq.join('')) { best = len; len++; fails = 0; toast(`正确！升级到 ${len} 位`, { icon: 'check', tint: '#34c759' }); round(); }
          else if (++fails < 2) { toast(`答案是 ${seq.join('')}，再试一次`, { icon: 'refresh', tint: '#ff9500' }); round(); }
          else finish(seq);
        };
        padBox.querySelector('.keypad').addEventListener('click', (e) => {
          const b = e.target.closest('button');
          if (!b) return;
          if (b.dataset.n != null && typed.length < seq.length) typed += b.dataset.n;
          else if (b.hasAttribute('data-del')) typed = typed.slice(0, -1);
          else if (b.hasAttribute('data-ok')) return submit();
          show();
          if (typed.length === seq.length) setTimeout(submit, 200);
        });
        const onKey = (e) => {
          if (/^\d$/.test(e.key) && typed.length < seq.length) { typed += e.key; show(); if (typed.length === seq.length) setTimeout(submit, 200); }
          else if (e.key === 'Backspace') { typed = typed.slice(0, -1); show(); }
          else if (e.key === 'Enter') submit();
        };
        document.addEventListener('keydown', onKey);
        cleanupKey = () => document.removeEventListener('keydown', onKey);
      };
      let cleanupKey = () => {};
      const finish = (seq) => {
        padBox.innerHTML = '';
        const newBest = stats.best('bestSpan', best);
        nav.checkBadges?.();
        const lvl = best >= 9 ? '超强记忆' : best >= 7 ? '高于平均' : best >= 5 ? '正常范围' : '可以多练练';
        stage.innerHTML = `${appIcon('brain', '#ff2d55', 'lg')}<div class="big">${best}<span style="font-size:22px"> 位</span></div>
          <p class="hint">${lvl}${newBest && best ? ' · 新纪录！' : ''} · 最后一题答案 ${seq.join('')}</p>
          <button class="btn mt" id="again" style="background:#ff2d55">${icon('refresh')}再来一次</button>`;
        $('#again', stage).onclick = () => { len = 3; fails = 0; best = 0; round(); };
        out.innerHTML = secCard('神奇的数字 7±2', '1956 年，心理学家 George Miller 发现人的短时记忆容量大约是 7±2 个组块。把数字分组记忆（比如把手机号拆成 3-4-4）就是利用"组块化"来突破这个限制。');
      };
      intro();
      return () => { alive = false; cleanupKey(); };
    },
  };
}

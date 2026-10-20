// 心理学堂：心理学家、经典实验、流派时间线、知识问答
import { PSYCHOLOGISTS, EXPERIMENTS, TIMELINE, TRIVIA } from '../psychology.js';
import { ARTICLES } from '../content.js';
import { getTest } from '../tests/index.js';
import { reads, stats } from '../store.js';
import { icon, appIcon } from '../icons.js';
import { esc, $, shuffle } from '../util.js';
import { listItem, sectionH, testCard } from '../ui.js';
import { nav } from '../nav.js';

const surname = (p) => p.name.split(/[·\s]/).pop()[0];
export const avatar = (p, size = '') => `<span class="avatar ${size}" style="--tint:${p.tint}" aria-hidden="true">${surname(p)}</span>`;

export function learnView() {
  const read = new Set(reads.all());
  const best = stats.get().bestTrivia;
  return {
    title: '学堂', tab: 2,
    html: `<h1 class="large-title">心理学堂</h1><p class="large-sub">从弗洛伊德到卡尼曼，读懂心理学的一百多年</p>
      <a class="card hero pressable" href="#/trivia" style="--c1:#5856d6;--c2:#2a2f7a">
        <div class="kicker">心理学知识问答 · 10 题</div><h2>你能答对几道？</h2>
        <p>巴甫洛夫为什么得诺贝尔奖？米尔格拉姆实验里多少人按到了 450 伏？${best != null ? `最佳成绩 ${best}/10。` : ''}</p>
        <span class="btn white">${icon('play')}开始答题</span><span class="hero-icon">${appIcon('lightbulb', '#5856d6', 'xl')}</span>
      </a>

      ${sectionH('心理学家', 'users')}
      <div class="psy-scroll">${PSYCHOLOGISTS.map((p) => `<a class="card glass psy-card pressable" href="#/psy/${p.id}">
        ${avatar(p)}<b>${esc(p.name)}</b><span>${esc(p.school)}</span><span class="muted small">${esc(p.years)}</span>
        ${read.has(`psy:${p.id}`) ? `<i class="read-dot" title="已读">${icon('check', { size: 12, sw: 3 })}</i>` : ''}</a>`).join('')}</div>

      ${sectionH('流派时间线', 'clock', ['展开', '#/timeline'])}
      <a class="card glass pressable" href="#/timeline" style="display:block;color:inherit">
        <div class="mini-tl">${['1879', '1899', '1913', '1943', '1956', '1998'].map((y) => {
          const e = TIMELINE.find((t) => t.year === y);
          return `<div><b>${y}</b><span>${esc(e.title)}</span></div>`;
        }).join('')}</div>
      </a>

      ${sectionH('经典实验', 'activity')}
      <div class="card glass list">${EXPERIMENTS.map((e) => listItem({ href: `#/exp/${e.id}`, ic: e.icon, tint: e.tint, title: esc(e.title), sub: `${esc(e.who)} · ${esc(e.year)}`,
        right: read.has(`exp:${e.id}`) ? icon('check', { size: 16, sw: 2.5 }) : '' })).join('')}</div>

      ${sectionH('知识文章', 'book')}
      <div class="card glass list">${ARTICLES.map((a) => listItem({ href: `#/article/${a.id}`, ic: a.icon, tint: a.tint, title: esc(a.title), sub: `${esc(a.sub)} · ${a.min} 分钟`,
        right: read.has(a.id) ? icon('check', { size: 16, sw: 2.5 }) : '' })).join('')}</div>`,
  };
}

const block = (title, ic, inner) => `<div class="card glass sec"><h3 class="sec-ic">${icon(ic)}${esc(title)}</h3>${inner}</div>`;

export function psyView([id]) {
  const i = PSYCHOLOGISTS.findIndex((x) => x.id === id);
  const p = PSYCHOLOGISTS[i];
  if (!p) return null;
  const prev = PSYCHOLOGISTS[i - 1], next = PSYCHOLOGISTS[i + 1];
  const tests = p.tests.map(getTest).filter(Boolean);
  return {
    title: p.name, tab: 2, back: '#/learn',
    html: `<div style="--tint:${p.tint}">
      <div class="card glass psy-hero fade-in">
        ${avatar(p, 'xl')}
        <h1 class="large-title center" style="margin-top:14px">${esc(p.name)}</h1>
        <p class="muted center">${esc(p.en)} · ${esc(p.years)}</p>
        <div class="chips" style="justify-content:center;margin-top:10px;flex-wrap:wrap"><span class="chip static">${esc(p.country)}</span><span class="chip static">${esc(p.school)}</span></div>
        <p class="psy-tag">${esc(p.tagline)}</p>
      </div>
      <div class="stack" style="margin-top:12px">
        ${block('生平', 'user', `<p>${esc(p.bio)}</p>`)}
        <div class="card glass sec"><h3 class="sec-ic">${icon('lightbulb')}核心思想</h3>
          <div class="ideas">${p.ideas.map(([h, t], k) => `<div class="idea"><span class="idea-n">${k + 1}</span><div><b>${esc(h)}</b><p>${esc(t)}</p></div></div>`).join('')}</div></div>
        ${p.quote ? `<blockquote class="card glass quote">${icon('quote')}<p>${esc(p.quote)}</p><cite>—— ${esc(p.name)}</cite></blockquote>` : ''}
        ${block('代表作', 'book', `<ul>${p.works.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>`)}
        ${block('影响', 'star', `<p>${esc(p.legacy)}</p>`)}
        ${block('争议与局限', 'alert', `<p>${esc(p.critique)}</p>`)}
      </div>
      ${tests.length ? `${sectionH('相关测评', 'grid')}<div class="grid2">${tests.map(testCard).join('')}</div>` : ''}
      <div class="row-btns" style="margin-top:20px">
        ${prev ? `<a class="btn glass" href="#/psy/${prev.id}">${icon('chevron-left')}${esc(prev.name.split(/[·\s]/).pop())}</a>` : '<span></span>'}
        ${next ? `<a class="btn glass" href="#/psy/${next.id}">${esc(next.name.split(/[·\s]/).pop())}${icon('chevron-right')}</a>` : ''}
      </div>
    </div>`,
    mount() { reads.add(`psy:${id}`); },
  };
}

export function expView([id]) {
  const e = EXPERIMENTS.find((x) => x.id === id);
  if (!e) return null;
  const others = EXPERIMENTS.filter((x) => x.id !== id).slice(0, 3);
  return {
    title: e.title, tab: 2, back: '#/learn',
    html: `<div style="--tint:${e.tint}">
      <div class="card glass psy-hero fade-in">
        <div style="display:flex;justify-content:center">${appIcon(e.icon, e.tint, 'xl')}</div>
        <h1 class="large-title center" style="margin-top:14px">${esc(e.title)}</h1>
        <p class="muted center">${esc(e.who)} · ${esc(e.year)}</p>
        <p class="psy-tag">${esc(e.q)}</p>
      </div>
      <div class="stack" style="margin-top:12px">
        ${block('实验过程', 'clipboard', `<p>${esc(e.method)}</p>`)}
        ${block('发现', 'search', `<p>${esc(e.finding)}</p>`)}
        ${block('争议与反思', 'alert', `<p>${esc(e.debate)}</p>`)}
        ${block('生活中的启示', 'lightbulb', `<p>${esc(e.life)}</p>`)}
      </div>
      ${sectionH('更多实验', 'activity')}
      <div class="card glass list">${others.map((o) => listItem({ href: `#/exp/${o.id}`, ic: o.icon, tint: o.tint, title: esc(o.title), sub: `${esc(o.who)} · ${esc(o.year)}` })).join('')}</div>
    </div>`,
    mount() { reads.add(`exp:${id}`); },
  };
}

export function timelineView() {
  const byId = Object.fromEntries(PSYCHOLOGISTS.map((p) => [p.id, p]));
  return {
    title: '流派时间线', tab: 2, back: '#/learn',
    html: `<h1 class="large-title">流派时间线</h1><p class="large-sub">心理学有一个漫长的过去，却只有一段短暂的历史。</p>
      <div class="timeline">${TIMELINE.map((t) => {
        const p = t.psy && byId[t.psy];
        const inner = `<div class="tl-year">${esc(t.year)}</div><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p>${p ? `<span class="tl-link">${avatar(p, 'sm')}了解${esc(p.name)}${icon('chevron-right', { size: 14 })}</span>` : ''}`;
        return `<div class="tl-item"><span class="tl-dot">${icon(t.icon, { size: 14, sw: 2.4 })}</span>
          ${p ? `<a class="card glass tl-card pressable" href="#/psy/${p.id}">${inner}</a>` : `<div class="card glass tl-card">${inner}</div>`}</div>`;
      }).join('')}</div>
      <p class="ref" style="justify-content:center">"心理学有一个漫长的过去，却只有一段短暂的历史"——艾宾浩斯（大意）</p>`,
  };
}

export function triviaView() {
  const N = 10;
  return {
    title: '知识问答', tab: 2, back: '#/learn', immersive: true, backIcon: 'x',
    html: `<div style="--tint:#5856d6">
      <div class="quiz-top"><div class="progress"><i id="tbar"></i></div><div class="quiz-count" id="tcount"></div></div>
      <div id="tbox"></div></div>`,
    mount(root) {
      const box = $('#tbox', root);
      let qs, k, score;
      const start = () => {
        qs = shuffle(TRIVIA).slice(0, N).map((q) => {
          const order = shuffle(q.a.map((_, i) => i));
          return { ...q, a: order.map((i) => q.a[i]), ok: order.indexOf(q.ok) };
        });
        k = 0; score = 0;
        draw();
      };
      const draw = () => {
        const q = qs[k];
        $('#tbar', root).style.width = `${(k / N) * 100}%`;
        $('#tcount', root).textContent = `${k + 1} / ${N}`;
        box.innerHTML = `<div class="q-anim"><div class="card glass q-card"><div class="q-prompt">第 ${k + 1} 题</div><div class="q-text">${esc(q.q)}</div></div>
          <div class="opts">${q.a.map((a, i) => `<button class="opt" data-i="${i}"><span class="radio"></span>${esc(a)}</button>`).join('')}</div><div id="why"></div></div>`;
        box.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => answer(+b.dataset.i)));
      };
      const answer = (i) => {
        const q = qs[k];
        if (box.querySelector('.opt.right')) return;
        const btns = box.querySelectorAll('.opt');
        btns[q.ok].classList.add('right');
        if (i !== q.ok) btns[i].classList.add('wrong'); else score++;
        navigator.vibrate?.(i === q.ok ? 10 : [20, 40, 20]);
        $('#why', box).innerHTML = `<div class="card glass sec why ${i === q.ok ? 'ok' : 'no'}"><h3 class="sec-ic">${icon(i === q.ok ? 'check' : 'x')}${i === q.ok ? '答对了' : '答错了'}</h3><p>${esc(q.why)}</p>
          <button class="btn block mt" id="tnext" style="background:#5856d6">${k === N - 1 ? '查看成绩' : '下一题'}</button></div>`;
        $('#tnext', box).onclick = () => { if (++k < N) draw(); else finish(); };
        $('#tnext', box).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };
      const finish = () => {
        const nb = stats.best('bestTrivia', score);
        nav.checkBadges?.();
        $('#tbar', root).style.width = '100%';
        const lvl = score >= 9 ? '心理学大师' : score >= 7 ? '心理学达人' : score >= 5 ? '入门学者' : '好奇新手';
        box.innerHTML = `<div class="card glass lab-stage fade-in">${appIcon(score >= 7 ? 'trophy' : 'book', '#5856d6', 'xl')}
          <div class="big" style="margin-top:14px">${score}<span style="font-size:24px"> / ${N}</span></div><h2 style="font-size:22px;margin-top:4px">${lvl}</h2>
          <p class="hint">${nb ? '新的最佳成绩！' : `最佳成绩 ${stats.get().bestTrivia}/${N}`} 题目从 ${TRIVIA.length} 道题库中随机抽取。</p>
          <div class="row-btns mt" style="width:100%"><button class="btn" id="again" style="background:#5856d6">${icon('refresh')}再来一轮</button><a class="btn glass" href="#/learn">回到学堂</a></div></div>`;
        $('#again', box).onclick = start;
      };
      start();
    },
  };
}

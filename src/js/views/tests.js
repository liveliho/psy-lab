import { TESTS, CATEGORIES, getTest } from '../tests/index.js';
import { optionsOf } from '../tests/common.js';
import { history as records, progress, stats } from '../store.js';
import { renderViz, vectorOf, alignVectors, similarity, compareChart } from '../charts.js';
import { makeShareImage, shareUrl, decodeAnswers } from '../share.js';
import { icon, appIcon } from '../icons.js';
import { esc, $, $$, fmtDate, relDate, toast, sheet, download } from '../util.js';
import { testCard, sectionH, alertBox, refLine } from '../ui.js';
import { nav } from '../nav.js';

export function testsView(_, q) {
  const cat = q.get('c') || 'all';
  const list = cat === 'all' ? TESTS : TESTS.filter((t) => t.category === cat);
  return {
    title: '测评', tab: 1,
    html: `
      <h1 class="large-title">测评</h1><p class="large-sub">${TESTS.length} 个科学量表与趣味测试，数据只保存在你的设备上</p>
      <div class="chips" style="margin-bottom:4px">
        <a class="chip ${cat === 'all' ? 'on' : ''}" href="#/tests">全部</a>
        ${CATEGORIES.map((c) => `<a class="chip ${cat === c.id ? 'on' : ''}" href="#/tests?c=${c.id}">${icon(c.icon)}${c.name}</a>`).join('')}
      </div>
      ${CATEGORIES.filter((c) => list.some((t) => t.category === c.id)).map((c) => `
        ${sectionH(c.name, c.icon)}
        <div class="grid2 wide3 stagger">${list.filter((t) => t.category === c.id).map(testCard).join('')}</div>`).join('')}
    `,
  };
}

export function introView([id]) {
  const t = getTest(id);
  if (!t) return null;
  const prog = progress.get(id);
  const answered = prog ? prog.answers.filter((a) => a != null).length : 0;
  const last = records.latest(id);
  const cat = CATEGORIES.find((c) => c.id === t.category);
  return {
    title: t.short, tab: 1, back: '#/tests',
    html: `
      <div class="card glass fade-in" style="text-align:center;padding:30px 22px;--tint:${t.tint}">
        <div style="display:flex;justify-content:center">${appIcon(t.icon, t.tint, 'xl')}</div>
        <h1 class="large-title" style="margin-top:16px">${esc(t.name)}</h1>
        <p class="muted" style="margin-top:4px">${t.items.length} 题 · 约 ${t.minutes} 分钟 · ${cat.name}</p>
      </div>
      <div class="card glass sec" style="--tint:${t.tint}"><h3>关于这个测试</h3><p>${esc(t.intro)}</p></div>
      ${t.sensitive ? alertBox('info', 'info', '温馨提示', '这是一份筛查工具，不是诊断。如果你正处于困难时期，结果无论如何都不代表你的全部。', '<a class="small" href="#/help">需要帮助？</a>') : ''}
      <div class="stack" style="margin-top:18px">
        ${answered ? `<a class="btn block" href="#/quiz/${id}" style="background:${t.tint}">${icon('play')}继续（已答 ${answered}/${t.items.length}）</a>
                      <button class="btn tinted block" data-restart>${icon('refresh')}重新开始</button>`
                   : `<a class="btn block" href="#/quiz/${id}" style="background:${t.tint}">${icon('play')}开始测试</a>`}
        ${last ? `<a class="btn glass block" href="#/result/${last.id}">查看上次结果（${relDate(last.ts)}）</a>` : ''}
      </div>
      ${refLine('book', t.reference)}
    `,
    mount(root) {
      $('[data-restart]', root)?.addEventListener('click', () => { progress.clear(id); location.hash = `#/quiz/${id}`; });
    },
  };
}

export function quizView([id]) {
  const t = getTest(id);
  if (!t) return null;
  const n = t.items.length;
  const saved = progress.get(id);
  const answers = saved?.answers?.length === n ? saved.answers : Array(n).fill(null);
  let idx = Math.min(saved?.idx ?? 0, n - 1);
  let busy = false;

  return {
    title: t.short, immersive: true, back: `#/test/${id}`, backIcon: 'x',
    html: `<div style="--tint:${t.tint}">
      <div class="quiz-top"><div class="progress"><i id="qbar"></i></div><div class="quiz-count" id="qcount"></div></div>
      <div id="qbox"></div>
      <div class="quiz-foot"><button class="btn glass small" id="qprev">${icon('chevron-left')}上一题</button>
      <span class="muted small" id="qhint"></span></div>
    </div>`,
    mount(root) {
      const box = $('#qbox', root);
      const draw = (dir = 1) => {
        const item = t.items[idx];
        const opts = optionsOf(t, item);
        const cur = answers[idx];
        $('#qbar', root).style.width = `${(answers.filter((a) => a != null).length / n) * 100}%`;
        $('#qcount', root).textContent = `${idx + 1} / ${n}`;
        $('#qprev', root).disabled = idx === 0;
        if (!matchMedia('(pointer: coarse)').matches) $('#qhint', root).textContent = `按数字键 1–${opts.length} 快速作答`;
        const useAgree = !item.opts && t.scaleStyle === 'agree' && opts.length === 5;
        const prompt = item.opts && item.k === 'SA' ? '你在多大程度上同意这句话？' : t.prompt;
        const head = `<div class="card glass q-card"><div class="q-prompt">${esc(prompt)}</div><div class="q-text">${esc(item.t)}</div></div>`;
        let body;
        if (useAgree) {
          const colors = ['var(--purple)', 'color-mix(in srgb, var(--purple) 55%, var(--label3))', 'var(--label3)', 'color-mix(in srgb, var(--green) 55%, var(--label3))', 'var(--green)'];
          body = `<div class="agree glass"><div class="agree-row">${opts.map((o, i) =>
            `<button class="dot ${cur === o.v ? 'sel' : ''}" data-i="${i}" data-v="${o.v}" style="--c:${colors[i]}" aria-label="${o.l}"></button>`).join('')}</div>
            <div class="agree-labels"><span style="color:var(--purple)">${opts[0].l}</span><span style="color:var(--green)">${opts[4].l}</span></div>
            <div class="agree-sel" id="agsel">${cur != null ? esc(opts.find((o) => o.v === cur)?.l) : ''}</div></div>`;
        } else {
          body = `<div class="opts">${opts.map((o) => `<button class="opt ${cur === o.v ? 'sel' : ''}" data-v="${o.v}" aria-label="${esc(o.l)}"><span class="radio"></span>${esc(o.l)}</button>`).join('')}</div>`;
        }
        box.innerHTML = `<div class="q-anim ${dir < 0 ? 'back' : ''}">${head}${body}</div>`;
        $$('[data-v]', box).forEach((b) => b.addEventListener('click', () => choose(+b.dataset.v, b)));
      };
      const choose = (v, btn) => {
        if (busy) return;
        busy = true;
        answers[idx] = v;
        progress.set(id, { answers, idx });
        $$('[data-v]', box).forEach((b) => b.classList.toggle('sel', b === btn));
        const lbl = $('#agsel', box);
        if (lbl && btn) lbl.textContent = btn.getAttribute('aria-label');
        navigator.vibrate?.(8);
        setTimeout(() => {
          busy = false;
          const firstMissing = answers.indexOf(null);
          if (firstMissing === -1) return finish();
          const next = answers.findIndex((a, i) => a == null && i > idx);
          idx = next !== -1 ? next : firstMissing;
          progress.set(id, { answers, idx });
          draw(1);
        }, 260);
      };
      const finish = () => {
        const result = t.score(answers);
        const rec = records.add(id, [...answers], result.line);
        progress.clear(id);
        nav.replace(`#/result/${rec.id}`);
      };
      $('#qprev', root).addEventListener('click', () => { if (idx > 0) { idx--; draw(-1); } });
      const onKey = (e) => {
        if (e.target.closest?.('input,textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
        const opts = optionsOf(t, t.items[idx]);
        const k = parseInt(e.key, 10);
        if (k >= 1 && k <= opts.length) {
          const v = opts[k - 1].v;
          choose(v, $$('[data-v]', box).find((b) => +b.dataset.v === v));
        } else if (e.key === 'Backspace' || e.key === 'ArrowLeft') { if (idx > 0) { idx--; draw(-1); } }
      };
      document.addEventListener('keydown', onKey);
      draw();
      return () => document.removeEventListener('keydown', onKey);
    },
  };
}

const sec = (s) => `<div class="card glass sec"><h3>${esc(s.title)}</h3>${s.text ? `<p>${esc(s.text)}</p>` : ''}${s.list ? `<ul>${s.list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}${s.chips ? `<div class="chips">${s.chips.map((c) => `<span class="chip static">${esc(c)}</span>`).join('')}</div>` : ''}</div>`;

function compareCard(t, mine, theirs) {
  const a = vectorOf(mine), b = alignVectors(a, vectorOf(theirs));
  const sim = similarity(a, b);
  const verdict = sim == null ? '' : sim >= 85 ? '灵魂双胞胎' : sim >= 70 ? '非常合拍' : sim >= 50 ? '互补搭档' : '反差萌组合';
  return `<div class="card glass viz">
    <div class="viz-h"><span>我们有多像？</span></div>
    <div class="compare-head">
      <div>${appIcon(mine.icon, t.tint, 'lg')}<b>${esc(mine.headline)}</b><span>我</span></div>
      <div class="vs">VS</div>
      <div>${appIcon(theirs.icon, '#ff9500', 'lg')}<b>${esc(theirs.headline)}</b><span>TA</span></div>
    </div>
    ${sim != null ? `<div class="compare-score"><b>${sim}%</b><p>${verdict}</p></div>${compareChart(a, b)}` : ''}
  </div>`;
}

function resultView(t, answers, { rec, shared }) {
  const r = t.score(answers);
  const latest = shared ? records.latest(t.id) : null;
  const mine = latest?.answers?.length === t.items.length ? latest : null;
  const myResult = mine ? t.score(mine.answers) : null;
  const alert = r.alert ? alertBox(r.alert.level, r.alert.level === 'danger' ? 'heart' : 'info', r.alert.title, r.alert.text,
    r.alert.link ? `<a class="btn small danger" style="margin-top:10px" href="${r.alert.link}">${icon('phone')}查看求助资源</a>` : '') : '';

  return {
    title: t.short, tab: 1, back: shared ? '#/' : `#/test/${t.id}`,
    right: !shared ? `<button class="nav-btn glass icon-only" data-share aria-label="分享">${icon('share')}</button>` : '',
    html: `<div style="--tint:${t.tint}">
      ${shared ? alertBox('info', 'users', '这是朋友分享给你的测试结果', myResult ? '下面是你们的对比，看看有多像。' : '好奇自己的结果吗？测完还能和 TA 对比。') : ''}
      ${shared && myResult ? compareCard(t, myResult, r) : ''}
      <div class="card glass result-hero">
        ${appIcon(r.icon, t.tint, 'xl')}
        <div class="headline">${esc(r.headline)}</div>
        <div class="rtitle">${esc(r.title)}</div>
        <p class="rsum">${esc(r.summary)}</p>
        ${rec ? `<p class="small muted" style="margin-top:12px">${esc(t.name)} · ${fmtDate(rec.ts)}</p>` : shared ? '<p class="small muted" style="margin-top:12px">TA 的结果</p>' : ''}
      </div>
      <div class="stack" style="margin-top:12px">
        ${alert}
        ${r.viz.map((v) => `<div class="card glass viz">${renderViz(v)}</div>`).join('')}
        ${r.sections.map(sec).join('')}
      </div>
      <div class="stack" style="margin-top:18px">
        ${shared ? `<a class="btn block" style="background:${t.tint}" href="#/test/${t.id}">${icon(myResult ? 'refresh' : 'play')}${myResult ? '重新测一次' : '我也来测一测'}</a>`
                 : `<div class="row-btns"><button class="btn" style="background:${t.tint}" data-share>${icon('share')}分享结果</button><a class="btn glass" href="#/test/${t.id}">${icon('refresh')}重新测试</a></div>`}
        <a class="btn tinted block" href="#/tests">探索更多测评</a>
      </div>
      ${refLine('book', t.reference)}
      ${refLine('alert', '本结果仅供自我探索与参考，不能替代专业的心理评估或医学诊断。')}
    </div>`,
    mount() {
      requestAnimationFrame(() => setTimeout(() => $$('.g-arc').forEach((p) => (p.style.strokeDashoffset = p.dataset.to)), 60));
      $$('[data-share]').forEach((b) => b.addEventListener('click', () => openShare(t, answers, r)));
    },
  };
}

function openShare(t, answers, r) {
  sheet(`<h3>分享结果</h3>
    <div id="shareImg" style="aspect-ratio:3/4;border-radius:20px;background:var(--fill);display:grid;place-items:center" class="muted">正在生成图片…</div>
    <div class="stack" style="margin-top:16px">
      <button class="btn block" data-save disabled>${icon('download')}保存图片</button>
      ${t.shareable ? `<button class="btn tinted block" data-link>${icon('link')}复制对比链接</button><p class="small muted center">朋友打开链接即可看到你的结果，并和自己的结果对比</p>`
                    : '<p class="small muted center">出于隐私考虑，情绪类量表不提供结果链接。</p>'}
      <button class="btn glass block" data-close>完成</button>
    </div>`, async (wrap) => {
    const blob = await makeShareImage(t, r);
    const url = URL.createObjectURL(blob);
    $('#shareImg', wrap).outerHTML = `<img src="${url}" alt="分享图片">`;
    const save = $('[data-save]', wrap);
    save.disabled = false;
    save.addEventListener('click', async () => {
      stats.bump('shares');
      const file = new File([blob], `${t.short}-${r.headline}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: '心理实验室' }); return; } catch { /* 用户取消或不支持 */ }
      }
      download(file.name, blob);
    });
    $('[data-link]', wrap)?.addEventListener('click', async () => {
      stats.bump('shares');
      const link = shareUrl(t, answers);
      try { await navigator.clipboard.writeText(link); toast('链接已复制', { icon: 'link', tint: '#007aff' }); }
      catch { prompt('复制下面的链接：', link); }
    });
  });
}

export function resultRoute([hid]) {
  const rec = records.get(hid);
  const t = rec && getTest(rec.testId);
  return t && rec.answers?.length === t.items.length ? resultView(t, rec.answers, { rec }) : null;
}

export function sharedRoute([id, code]) {
  const t = getTest(id);
  const answers = t && t.shareable && decodeAnswers(t, code || '');
  return answers ? resultView(t, answers, { shared: true }) : null;
}

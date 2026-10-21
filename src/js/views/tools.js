import { ARTICLES, MOODS, MOOD_TAGS, EMOTIONS } from '../content.js';
import { moods, stats, reads, settings } from '../store.js';
import { audio, noiseBurst } from '../audio.js';
import { moodChart, emotionWheel } from '../charts.js';
import { icon, appIcon, moodFace } from '../icons.js';
import { esc, $, $$, fmtDate, toast, confirmSheet } from '../util.js';
import { toolCard, listItem, sectionH, emptyBox } from '../ui.js';
import { moodStreak } from '../badges.js';
import { nav } from '../nav.js';

export function toolsView() {
  return {
    title: '工具', tab: 3,
    html: `<h1 class="large-title">工具</h1><p class="large-sub">照顾情绪的小练习、解压玩具，和好玩的心理学实验</p>
      ${sectionH('情绪照顾', 'heart')}
      <div class="stack stagger">
        ${toolCard('#/mood', 'smile', '#ff9500', '心情日记', '情绪打卡 + 情绪轮，看见自己的变化趋势')}
        ${toolCard('#/breathe', 'wind', '#40c8e0', '呼吸练习', '盒式呼吸 · 4-7-8 呼吸 · 放松呼吸')}
        ${toolCard('#/pmr', 'body', '#34c759', '渐进式肌肉放松', '先收紧再放松，跟着引导释放身体里的紧张')}
        ${toolCard('#/ground', 'anchor', '#af52de', '5-4-3-2-1 着陆练习', '焦虑或恐慌时，用五感把自己带回当下')}
        ${toolCard('#/play/shred', 'scissors', '#5e5ce6', '烦恼粉碎机', '写下烦恼，然后亲手粉碎或吹散它')}
        ${toolCard('#/play/noise', 'headphones', '#30b0c7', '白噪音', '雨声 · 海浪 · 篝火 · 溪流，自由混合')}
      </div>
      ${sectionH('解压玩具', 'gamepad')}
      <div class="grid2 wide3 stagger">
        ${toolCard('#/play/muyu', 'muyu', '#b8692c', '电子木鱼', '功德 +1')}
        ${toolCard('#/bubbles', 'bubbles', '#64d2ff', '泡泡纸', '捏到停不下来')}
        ${toolCard('#/play/spinner', 'spinner', '#ff9500', '指尖陀螺', '看看能转多久')}
        ${toolCard('#/play/slime', 'blob', '#45d6b8', '果冻史莱姆', 'Q 弹可拉扯')}
        ${toolCard('#/play/sand', 'waves', '#c7a26b', '禅意沙盘', '数字枯山水')}
        ${toolCard('#/play/mandala', 'flower', '#bf5af2', '曼陀罗画板', '画一笔变对称')}
        ${toolCard('#/play/chimes', 'bell', '#5856d6', '音乐涟漪', '随手弹出旋律')}
      </div>
      ${sectionH('认知实验室', 'brain')}
      <div class="stack stagger">
        ${toolCard('#/lab/reaction', 'stopwatch', '#34c759', '反应速度测试', '屏幕变绿就点，测测你的反应时')}
        ${toolCard('#/lab/stroop', 'type', '#ff6b35', '斯特鲁普效应', '说出字的颜色，而不是字本身')}
        ${toolCard('#/lab/span', 'hash', '#ff2d55', '数字记忆广度', '你的工作记忆能装下几个数字？')}
      </div>
      ${sectionH('心理知识', 'book', ['学堂', '#/learn'])}
      ${toolCard('#/learn', 'book', '#5856d6', '心理学堂', '15 位心理学家 · 10 个经典实验 · 流派时间线 · 知识问答')}`,
  };
}

export function moodView(_, q) {
  let level = MOODS.some((m) => m.v === +q.get('l')) ? +q.get('l') : null;
  let emotion = null;
  const tags = new Set();
  const all = moods.all().filter((m) => MOODS[m.level - 1]);
  const days = new Set(all.map((m) => m.date)).size;
  const last30 = all.filter((m) => m.ts > Date.now() - 30 * 864e5);
  const avg = last30.length ? last30.reduce((s, m) => s + m.level, 0) / last30.length : 0;
  const avgMood = avg ? MOODS[Math.round(avg) - 1] : null;
  const streak = moodStreak(all);

  return {
    title: '心情日记', tab: 3, back: '#/tools',
    html: `<h1 class="large-title">心情日记</h1><p class="large-sub">记录情绪，是理解自己的第一步</p>
      <div class="card glass">
        <h3 style="font-size:17px;margin-bottom:10px">现在感觉怎么样？</h3>
        <div class="mood-pick" id="mpick">${MOODS.map((m) => `<button data-l="${m.v}" style="--c:${m.color}" class="${level === m.v ? 'on' : ''}" aria-label="${m.label}">${moodFace(m.v, m.color, 42)}${m.label}</button>`).join('')}</div>
        <button class="disclose" id="wheelToggle" style="margin-top:12px"><span>用情绪轮描述得更精确</span>${icon('chevron-right')}</button>
        <div id="wheelBox" hidden>${emotionWheel(EMOTIONS)}<div class="wheel-sel muted" id="wheelSel">越靠近圆心，情绪越强烈</div></div>
        <h3 style="font-size:15px;margin:14px 0 8px" class="muted">和什么有关？（可多选）</h3>
        <div class="chips tag-chips" id="mtags">${MOOD_TAGS.map((t) => `<button class="chip" data-t="${t}">${t}</button>`).join('')}</div>
        <textarea class="field" id="mnote" placeholder="想说点什么吗？试着给感受起个更精确的名字……" maxlength="500" style="margin-top:14px"></textarea>
        <button class="btn block" id="msave" style="margin-top:14px;background:var(--orange)" ${level ? '' : 'disabled'}>${icon('check')}记录</button>
      </div>
      ${sectionH('近 14 天', 'activity')}
      <div class="card glass">
        ${all.length ? moodChart(all) : emptyBox('activity', '记录几天后，这里会出现你的情绪曲线')}
        <div class="stat-row">
          <div class="stat"><b>${streak}</b><span>连续天数</span></div>
          <div class="stat">${avgMood ? moodFace(avgMood.v, avgMood.color, 30) : '<b>—</b>'}<span>30 天平均</span></div>
          <div class="stat"><b>${days}</b><span>记录天数</span></div>
        </div>
      </div>
      ${all.length ? `${sectionH('记录', 'calendar')}<div class="card glass list">${all.slice(0, 40).map((m) => {
        const mo = MOODS[m.level - 1];
        const extra = [m.emotion?.word, ...(m.tags || [])].filter(Boolean).map(esc).join('、');
        return listItem({ tag: 'div', lead: moodFace(m.level, mo.color, 32), title: `${mo.label}${extra ? ` · ${extra}` : ''}`, sub: `${fmtDate(m.ts)}${m.note ? ` · ${esc(m.note)}` : ''}`,
          right: `<button class="nav-btn icon-only" data-del="${m.id}" aria-label="删除" style="color:var(--label3)">${icon('trash')}</button>` });
      }).join('')}</div>` : ''}`,
    mount(root) {
      const save = $('#msave', root);
      $$('#mpick button', root).forEach((b) => b.addEventListener('click', () => {
        level = +b.dataset.l;
        $$('#mpick button', root).forEach((x) => x.classList.toggle('on', x === b));
        save.disabled = false;
      }));
      $('#wheelToggle', root).addEventListener('click', (e) => {
        const box = $('#wheelBox', root);
        box.hidden = !box.hidden;
        e.currentTarget.classList.toggle('open', !box.hidden);
      });
      $$('.wheel path', root).forEach((p) => p.addEventListener('click', () => {
        const same = emotion?.word === p.dataset.word;
        emotion = same ? null : { word: p.dataset.word, base: p.dataset.base };
        $$('.wheel path', root).forEach((x) => x.classList.toggle('on', !same && x === p));
        $('#wheelSel', root).innerHTML = emotion ? `此刻的感受：<b style="color:var(--label)">${esc(emotion.word)}</b>（${esc(emotion.base)}）` : '越靠近圆心，情绪越强烈';
        navigator.vibrate?.(6);
      }));
      $$('#mtags .chip', root).forEach((b) => b.addEventListener('click', () => {
        const t = b.dataset.t;
        tags.has(t) ? tags.delete(t) : tags.add(t);
        b.classList.toggle('on', tags.has(t));
      }));
      save.addEventListener('click', () => {
        moods.add({ level, tags: [...tags], note: $('#mnote', root).value.trim(), ...(emotion ? { emotion } : {}) });
        toast('已记录', { icon: 'check', tint: '#34c759' });
        window.history.replaceState(window.history.state, '', '#/mood');
        nav.render();
      });
      $$('[data-del]', root).forEach((b) => b.addEventListener('click', async () => {
        if (await confirmSheet('删除这条记录？', '删除后无法恢复。', '删除', true)) { moods.remove(b.dataset.del); nav.render(); }
      }));
    },
  };
}

export function breatheView() {
  const MODES = {
    box: { name: '盒式呼吸', desc: '四个阶段各 4 秒，常被用于高压情境下快速稳定情绪。', phases: [['吸气', 4, 1.9], ['屏息', 4, 1.9], ['呼气', 4, 1], ['屏息', 4, 1]] },
    m478: { name: '4-7-8', desc: '较长的呼气能激活副交感神经，有助于入睡和平复焦虑。', phases: [['吸气', 4, 1.9], ['屏息', 7, 1.9], ['呼气', 8, 1]] },
    calm: { name: '放松呼吸', desc: '吸 4 秒、呼 6 秒，简单易上手，适合随时练习。', phases: [['吸气', 4, 1.9], ['呼气', 6, 1]] },
  };
  let mode = 'box', timer = null, running = false, startTs = 0, cycles = 0;
  return {
    title: '呼吸练习', tab: 3, back: '#/tools',
    html: `<h1 class="large-title">呼吸练习</h1><p class="large-sub" id="bdesc"></p>
      <div class="segmented" id="bmode">${Object.entries(MODES).map(([k, m]) => `<button data-m="${k}">${m.name}</button>`).join('')}</div>
      <div class="breath-stage"><div class="breath-ring"></div><div class="breath-orb" id="orb"></div>
        <div class="breath-text"><b id="bphase">准备好了吗</b><span id="bcount"></span></div></div>
      <button class="btn block" id="bstart" style="background:var(--teal)">${icon('play')}开始</button>
      <p class="center muted small" style="margin-top:12px" id="bstat">建议每次练习 1–3 分钟</p>`,
    mount(root) {
      const orb = $('#orb', root), ph = $('#bphase', root), ct = $('#bcount', root), btn = $('#bstart', root);
      const setMode = (k) => {
        if (running) stop();
        mode = k;
        $$('#bmode button', root).forEach((b) => b.classList.toggle('on', b.dataset.m === k));
        $('#bdesc', root).textContent = MODES[k].desc;
      };
      const run = (pi = 0, first = false) => {
        const [label, sec, scale] = MODES[mode].phases[pi];
        if (pi === 0 && !first) cycles++;
        ph.textContent = label;
        orb.style.transitionDuration = `${sec}s`;
        orb.style.transform = `scale(${scale})`;
        navigator.vibrate?.(15);
        let left = sec;
        ct.textContent = `${left}`;
        timer = setInterval(() => {
          left--;
          if (left > 0) ct.textContent = `${left}`;
          else { clearInterval(timer); run((pi + 1) % MODES[mode].phases.length); }
        }, 1000);
      };
      const start = () => { running = true; startTs = Date.now(); cycles = 0; btn.innerHTML = `${icon('x')}结束`; run(0, true); };
      const stop = () => {
        clearInterval(timer); running = false;
        orb.style.transitionDuration = '1s'; orb.style.transform = 'scale(1)';
        ph.textContent = '做得很好'; ct.textContent = '';
        btn.innerHTML = `${icon('refresh')}再来一次`;
        const min = (Date.now() - startTs) / 60000;
        if (min > 0.2) { stats.bump('breathMin', Math.round(min * 10) / 10); $('#bstat', root).textContent = `本次练习 ${Math.max(1, Math.round(min * 60))} 秒，完成 ${cycles} 轮`; nav.checkBadges?.(); }
      };
      $$('#bmode button', root).forEach((b) => b.addEventListener('click', () => setMode(b.dataset.m)));
      btn.addEventListener('click', () => (running ? stop() : start()));
      setMode('box');
      return () => { if (running) stop(); };
    },
  };
}

export function pmrView() {
  const GROUPS = [
    ['双手', '用力握紧双拳，感受手掌和手指的紧绷', '慢慢松开拳头，感受手心的温热和放松'],
    ['手臂', '弯曲手肘，绷紧上臂的肌肉', '放下手臂，让它们沉沉地垂落'],
    ['肩膀', '把肩膀用力耸向耳朵', '让肩膀沉下来，感觉重量从肩上卸下'],
    ['额头', '用力皱起眉头，抬高眉毛', '舒展额头，让它变得平滑、松弛'],
    ['眼睛和脸颊', '紧紧闭上眼睛，皱起鼻子', '放松眼周和脸颊，让面部柔软下来'],
    ['下巴', '咬紧牙关，嘴角向两侧拉开', '松开牙齿，让下巴微微张开'],
    ['胸和背', '深吸一口气，挺胸，肩胛骨向后夹紧', '慢慢呼气，让胸口和后背放松'],
    ['腹部', '收紧腹部，像要迎接一记轻拳', '放开腹部，让呼吸自然地起伏'],
    ['双腿和双脚', '伸直双腿，脚尖用力向上勾起', '放松双腿，让双脚完全落在地上'],
  ];
  const TENSE = 5, RELAX = 10;
  let gi = -1, phase = '', left = 0, timer = null;
  return {
    title: '肌肉放松', tab: 3, back: '#/tools',
    html: `<h1 class="large-title">渐进式肌肉放松</h1><p class="large-sub">由 Edmund Jacobson 于 1930 年代提出：依次收紧再放松全身肌肉，学会分辨"紧张"与"放松"的感觉。全程约 2.5 分钟。</p>
      <div class="card glass lab-stage pmr-stage" id="pbox"></div>
      <div class="row-btns" style="margin-top:14px"><button class="btn" id="pgo" style="background:#34c759"></button></div>`,
    mount(root) {
      const box = $('#pbox', root), btn = $('#pgo', root);
      const dots = () => `<div class="ground-dots">${GROUPS.map((_, k) => `<i class="${k === gi ? 'on' : ''}"></i>`).join('')}</div>`;
      const intro = () => {
        gi = -1;
        box.innerHTML = `${appIcon('body', '#34c759', 'lg')}<h2 style="font-size:22px">找一个舒服的姿势</h2><p class="hint">坐着或躺着都可以。每个部位收紧 ${TENSE} 秒、放松 ${RELAX} 秒。收紧时用七分力即可，不要引起疼痛。</p>`;
        btn.innerHTML = `${icon('play')}开始`;
      };
      const draw = () => {
        const [name, tense, relax] = GROUPS[gi];
        const t = phase === 'tense';
        box.innerHTML = `<div class="pmr-orb ${t ? 'tense' : ''}"></div>
          <div class="small muted">${gi + 1} / ${GROUPS.length} · ${name}</div>
          <h2 style="font-size:24px;margin-top:4px">${t ? '收紧' : '放松'} <span class="muted" style="font-variant-numeric:tabular-nums">${left}</span></h2>
          <p class="hint">${t ? tense : relax}</p>${dots()}`;
      };
      const tick = () => {
        left--;
        if (left > 0) return draw();
        if (phase === 'tense') { phase = 'relax'; left = RELAX; navigator.vibrate?.(20); return draw(); }
        if (gi < GROUPS.length - 1) { gi++; phase = 'tense'; left = TENSE; navigator.vibrate?.([15, 60, 15]); return draw(); }
        stop(true);
      };
      const start = () => { gi = 0; phase = 'tense'; left = TENSE; draw(); timer = setInterval(tick, 1000); btn.innerHTML = `${icon('x')}结束`; };
      const stop = (done) => {
        clearInterval(timer); timer = null;
        if (done) {
          stats.bump('pmrCount');
          nav.checkBadges?.();
          box.innerHTML = `${appIcon('sparkles', '#34c759', 'lg')}<h2 style="font-size:22px">做得很好</h2><p class="hint">花一点时间感受全身的放松。留意现在的身体和开始前有什么不同。</p>`;
          btn.innerHTML = `${icon('refresh')}再来一次`;
        } else intro();
      };
      btn.onclick = () => (timer ? stop(false) : start());
      intro();
      return () => clearInterval(timer);
    },
  };
}

export function groundView() {
  const steps = [
    { ic: 'leaf', h: '先停下来', p: '找一个舒服的姿势，慢慢地深呼吸三次。接下来我们用五种感官，把注意力带回此时此地。' },
    { n: '5', ic: 'eye', h: '看到的 5 样东西', p: '环顾四周，在心里说出你看到的 5 样东西。注意它们的颜色、形状和细节。' },
    { n: '4', ic: 'hand', h: '能触摸到的 4 样东西', p: '感受衣服的质地、椅子的支撑、脚踩着地面、手中物体的温度。' },
    { n: '3', ic: 'radio', h: '听到的 3 种声音', p: '远处的车声、空调的嗡嗡声、自己的呼吸……静静地听。' },
    { n: '2', ic: 'wind', h: '闻到的 2 种气味', p: '空气、咖啡、洗手液或衣服上的味道。闻不到也没关系，回忆两种你喜欢的气味。' },
    { n: '1', ic: 'droplet', h: '尝到的 1 种味道', p: '留意嘴里的味道，或者喝一口水，专注地感受它。' },
    { ic: 'sparkles', h: '你回来了', p: '此刻你在这里，你是安全的。感谢自己花时间照顾自己。' },
  ];
  let i = 0;
  return {
    title: '着陆练习', tab: 3, back: '#/tools',
    html: `<h1 class="large-title">5-4-3-2-1 着陆</h1><p class="large-sub">感到焦虑、恐慌或思绪纷乱时，用它帮自己"落地"。</p>
      <div class="card glass ground-step" id="gbox" style="--tint:var(--purple)"></div>
      <div class="row-btns" style="margin-top:16px"><button class="btn glass" id="gprev">上一步</button><button class="btn" id="gnext" style="background:var(--purple)">下一步</button></div>`,
    mount(root) {
      const draw = () => {
        const s = steps[i];
        $('#gbox', root).innerHTML = `<div class="fade-in">${s.n ? `<div class="num">${s.n}</div>` : appIcon(s.ic, '#af52de', 'xl')}<h2>${s.h}</h2><p>${s.p}</p></div>
          <div class="ground-dots">${steps.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>`;
        $('#gprev', root).disabled = i === 0;
        $('#gnext', root).textContent = i === steps.length - 1 ? '完成' : '下一步';
      };
      $('#gprev', root).onclick = () => { if (i > 0) { i--; draw(); } };
      $('#gnext', root).onclick = () => {
        if (i < steps.length - 1) { i++; draw(); }
        else { stats.bump('groundCount'); toast('练习完成，做得很好', { icon: 'leaf', tint: '#34c759' }); location.hash = '#/tools'; }
      };
      draw();
    },
  };
}

/* ---------- 泡泡纸 ---------- */
function popSound() {
  const ac = audio();
  if (ac) noiseBurst(ac, { freq: 900 + Math.random() * 900 });
}

export function bubblesView() {
  const N = 48;
  let popped = 0, pending = 0;
  const total = () => (stats.get().bubbles || 0) + pending;
  return {
    title: '解压泡泡纸', tab: 3, back: '#/tools',
    html: `<h1 class="large-title">解压泡泡纸</h1><p class="large-sub">什么都不用想，捏就对了。</p>
      <div class="card glass" style="padding:0"><div class="bubble-sheet" id="sheet"></div></div>
      <div class="row-btns" style="margin-top:14px">
        <button class="btn glass" id="refill">${icon('refresh')}换一张</button>
        <button class="btn glass" id="sound"></button>
      </div>
      <p class="center muted small" style="margin-top:12px" id="bcount"></p>`,
    mount(root) {
      const grid = $('#sheet', root), cnt = $('#bcount', root), snd = $('#sound', root);
      const flush = () => { if (pending) { stats.bump('bubbles', pending); pending = 0; nav.checkBadges?.(); } };
      const showCount = () => (cnt.textContent = `这张已捏 ${popped}/${N} · 累计 ${total()} 个`);
      const showSound = () => (snd.innerHTML = `${icon(settings.get().sound ? 'music' : 'x')}${settings.get().sound ? '声音：开' : '声音：关'}`);
      const fill = () => {
        popped = 0;
        grid.innerHTML = Array.from({ length: N }, (_, i) => `<button class="bubble" aria-label="泡泡 ${i + 1}"></button>`).join('');
        showCount();
      };
      grid.addEventListener('pointerdown', (e) => {
        const b = e.target.closest('.bubble:not(.popped)');
        if (!b) return;
        b.classList.add('popped');
        popSound();
        navigator.vibrate?.(10);
        popped++; pending++;
        if (pending >= 10) flush();
        showCount();
        if (popped === N) setTimeout(() => { flush(); toast('一整张捏完啦', { icon: 'sparkles', tint: '#64d2ff' }); fill(); }, 600);
      });
      $('#refill', root).onclick = () => { flush(); fill(); };
      snd.onclick = () => { settings.set({ sound: !settings.get().sound }); showSound(); };
      fill();
      showSound();
      return flush;
    },
  };
}

export function articleView([id]) {
  const a = ARTICLES.find((x) => x.id === id);
  if (!a) return null;
  const blk = ([type, c]) => ({
    p: () => `<p>${esc(c)}</p>`,
    h: () => `<h2>${esc(c)}</h2>`,
    list: () => `<ul>${c.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`,
    tip: () => `<div class="tip">${icon('lightbulb')}<span>${esc(c)}</span></div>`,
  })[type]();
  return {
    title: a.title, tab: 2, back: '#/learn',
    html: `<article class="article card glass" style="--tint:${a.tint};padding:26px 22px">
      <div style="display:flex;justify-content:center">${appIcon(a.icon, a.tint, 'lg')}</div>
      <h1 class="large-title center" style="font-size:28px">${esc(a.title)}</h1>
      <p class="center muted" style="margin:4px 0 10px">${esc(a.sub)} · 阅读约 ${a.min} 分钟</p>${a.body.map(blk).join('')}</article>`,
    mount() { reads.add(id); },
  };
}

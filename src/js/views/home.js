import { getTest } from '../tests/index.js';
import { TIPS, MOODS } from '../content.js';
import { history as records, progress, moods, todayKey } from '../store.js';
import { icon, appIcon, moodFace } from '../icons.js';
import { esc, $$ } from '../util.js';
import { testCard, toolCard, historyItem, sectionH } from '../ui.js';

export function homeView() {
  const h = new Date().getHours();
  const hello = h < 5 ? '夜深了' : h < 11 ? '早上好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好';
  const greetIcon = h < 5 || h >= 19 ? 'moon' : h < 8 ? 'sunrise' : h < 17 ? 'sun' : 'sunset';
  const d = new Date();
  const week = '日一二三四五六'[d.getDay()];
  const tip = TIPS[Math.floor(Date.now() / 864e5) % TIPS.length];
  const todayMoods = moods.all().filter((m) => m.date === todayKey());
  const inProg = Object.entries(progress.all()).map(([id, p]) => ({ t: getTest(id), p })).find((x) => x.t);
  const recent = records.all().slice(0, 3);
  const hero = inProg
    ? { t: inProg.t, kicker: '继续测评', title: inProg.t.name, text: `已完成 ${inProg.p.answers.filter((a) => a != null).length}/${inProg.t.items.length} 题，接着上次的进度吧。`, btn: '继续', href: `#/quiz/${inProg.t.id}` }
    : { t: getTest('ie'), kicker: '今日推荐 · 2 分钟', title: '你是 I 人还是 E 人？', text: '测测你的社交电量，顺便分清"内向"和"社恐"。', btn: '开始测试', href: '#/test/ie' };

  return {
    title: hello, tab: 0,
    html: `
      <div class="greet"><div class="date">${icon(greetIcon)}${d.getMonth() + 1}月${d.getDate()}日 星期${week}</div><h1 class="large-title">${hello}</h1></div>
      <div class="stagger">
        <a class="card hero pressable" href="${hero.href}" style="--c1:${hero.t.tint};--c2:color-mix(in srgb, ${hero.t.tint} 45%, #1c2a5a)">
          <div class="kicker">${hero.kicker}</div><h2>${esc(hero.title)}</h2><p>${esc(hero.text)}</p>
          <span class="btn white">${icon('play')}${hero.btn}</span><span class="hero-icon">${appIcon(hero.t.icon, hero.t.tint, 'xl')}</span>
        </a>
        <div class="card glass">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px">
            <h3 style="font-size:17px">此刻感觉如何？</h3>
            <a class="small" href="#/mood">${todayMoods.length ? `今天已记录 ${todayMoods.length} 次` : '心情日记'}</a>
          </div>
          <div class="mood-pick">${MOODS.map((m) => `<button data-mood="${m.v}" style="--c:${m.color}" aria-label="${m.label}">${moodFace(m.v, m.color, 40)}${m.label}</button>`).join('')}</div>
        </div>
        <div class="card glass tip-card">${appIcon('quote', '#5e5ce6')}<div><div class="small muted">每日一句</div><p>${esc(tip)}</p></div></div>
      </div>

      ${sectionH('热门测评', 'grid', ['全部', '#/tests'])}
      <div class="grid2 wide3 stagger">${['mbti', 'bigfive', 'hsp', 'love', 'enneagram', 'eq'].map((id) => testCard(getTest(id))).join('')}</div>

      ${sectionH('认知小实验', 'brain', ['更多', '#/tools'])}
      <div class="grid2">
        ${toolCard('#/lab/reaction', 'stopwatch', '#34c759', '反应速度', '你的手有多快？')}
        ${toolCard('#/lab/stroop', 'type', '#ff6b35', '斯特鲁普效应', '大脑的"打架"时刻')}
      </div>

      ${sectionH('放松一下', 'leaf', ['更多', '#/tools'])}
      <div class="grid2">
        ${toolCard('#/breathe', 'wind', '#40c8e0', '呼吸练习', '1 分钟平静下来')}
        ${toolCard('#/bubbles', 'bubbles', '#64d2ff', '解压泡泡纸', '捏到停不下来')}
      </div>

      ${recent.length ? `${sectionH('最近结果', 'clock', ['全部', '#/history'])}<div class="card glass list">${recent.map(historyItem).join('')}</div>` : ''}
      <p class="ref" style="justify-content:center;margin-top:28px">所有测评结果仅供自我了解，不构成医学诊断 · <a href="#/about">关于本站</a></p>
    `,
    mount(root) {
      $$('[data-mood]', root).forEach((b) => b.addEventListener('click', () => (location.hash = `#/mood?l=${b.dataset.mood}`)));
    },
  };
}

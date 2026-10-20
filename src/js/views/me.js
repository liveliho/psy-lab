import { TESTS, getTest } from '../tests/index.js';
import { HOTLINES } from '../content.js';
import { settings, history as records, moods, stats, exportAll, importAll, clearAll, todayKey } from '../store.js';
import { BADGES, unlockedBadges } from '../badges.js';
import { icon, appIcon } from '../icons.js';
import { esc, $, $$, fmtDate, toast, confirmSheet, download } from '../util.js';
import { listItem, historyItem, alertBox, emptyBox } from '../ui.js';
import { nav } from '../nav.js';

const badgeHtml = (b, on) => `<div class="badge">${appIcon(b.icon, b.tint, `lg round medal ${on ? '' : 'off'}`)}<b>${esc(b.name)}</b><span>${esc(b.desc)}</span></div>`;

export function meView() {
  const s = settings.get();
  const st = stats.get();
  const h = records.all();
  const unlocked = unlockedBadges();
  const preview = [...BADGES].sort((a, b) => unlocked.has(b.id) - unlocked.has(a.id)).slice(0, 3);
  return {
    title: '我的', tab: 4,
    html: `<h1 class="large-title">我的</h1><p class="large-sub">数据仅保存在本设备的浏览器中，我们看不到任何内容</p>
      <div class="card glass"><div class="stat-row" style="margin-top:0">
        <div class="stat"><b>${h.length}</b><span>完成测评</span></div>
        <div class="stat"><b>${moods.all().length}</b><span>心情记录</span></div>
        <div class="stat"><b>${Math.round(st.breathMin || 0)}</b><span>呼吸分钟</span></div>
      </div></div>

      <div class="list-h">成就 · ${unlocked.size}/${BADGES.length}</div>
      <a class="card glass pressable" href="#/badges" style="display:block;color:inherit;padding:0">
        <div class="badge-grid" style="grid-template-columns:repeat(3,1fr);padding-bottom:12px">${preview.map((b) => badgeHtml(b, unlocked.has(b.id))).join('')}</div>
        <div class="center small" style="color:var(--blue);padding-bottom:16px;font-weight:500">查看全部成就</div>
      </a>

      <div class="list-h">测评历史</div>
      <div class="card glass list">${h.length ? h.slice(0, 5).map(historyItem).join('') + (h.length > 5 ? listItem({ href: '#/history', ic: 'layers', tint: '#8e8e93', title: `查看全部 ${h.length} 条` }) : '')
        : emptyBox('grid', '还没有测评记录<br><a href="#/tests">去做第一个测试</a>')}</div>

      <div class="list-h">外观</div>
      <div class="card glass">
        <div class="setting-row" style="margin-bottom:8px"><span>主题</span></div>
        <div class="segmented" id="theme">${[['auto', '自动'], ['light', '浅色'], ['dark', '深色']].map(([k, l]) => `<button data-v="${k}" class="${s.theme === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <div class="setting-gap"></div>
        <div class="setting-row" style="margin-bottom:8px"><span>天空</span><span class="muted small">深色模式下为星空</span></div>
        <div class="segmented" id="sky">${[['time', '跟随时间'], ['dawn', '朝霞'], ['day', '晴空'], ['sunset', '晚霞']].map(([k, l]) => `<button data-v="${k}" class="${s.sky === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <div class="setting-gap"></div>
        <div class="setting-row"><span>玻璃质感</span><span class="muted" id="glassv"></span></div>
        <input class="range" type="range" min="15" max="90" value="${s.glass}" id="glass" aria-label="玻璃透明度">
        <div style="display:flex;justify-content:space-between" class="small muted"><span>清透</span><span>着色</span></div>
        <div class="setting-gap"></div>
        <label class="setting-row">减弱动态效果<input type="checkbox" class="switch" id="rm" ${s.reduceMotion ? 'checked' : ''}></label>
        <div class="setting-gap"></div>
        <label class="setting-row">音效<input type="checkbox" class="switch" id="snd" ${s.sound ? 'checked' : ''}></label>
      </div>

      <div class="list-h">数据</div>
      <div class="card glass list">
        ${listItem({ tag: 'button', ic: 'download', tint: '#007aff', title: '导出数据', sub: '下载 JSON 备份文件', attrs: 'data-act="export"' })}
        ${listItem({ tag: 'button', ic: 'upload', tint: '#34c759', title: '导入数据', sub: '从备份文件恢复', attrs: 'data-act="import"' })}
        ${listItem({ tag: 'button', ic: 'trash', tint: '#ff3b30', title: '<span style="color:var(--red)">清除所有数据</span>', attrs: 'data-act="clear"' })}
      </div>
      <input type="file" accept="application/json,.json" id="importFile" hidden>

      <div class="list-h">支持</div>
      <div class="card glass list">
        ${listItem({ href: '#/help', ic: 'lifebuoy', tint: '#ff2d55', title: '求助资源', sub: '心理援助热线' })}
        ${listItem({ href: '#/about', ic: 'info', tint: '#5856d6', title: '关于与隐私', sub: '免责声明 · 量表来源 · 开源说明' })}
      </div>`,
    mount(root) {
      const seg = (id, key) => $$(`#${id} button`, root).forEach((b) => b.addEventListener('click', () => {
        settings.set({ [key]: b.dataset.v }); nav.applySettings();
        $$(`#${id} button`, root).forEach((x) => x.classList.toggle('on', x === b));
      }));
      seg('theme', 'theme');
      seg('sky', 'sky');
      const g = $('#glass', root), gv = $('#glassv', root);
      const showG = () => (gv.textContent = g.value < 40 ? '清透' : g.value > 70 ? '着色' : '均衡');
      g.addEventListener('input', () => { settings.set({ glass: +g.value }); nav.applySettings(); showG(); });
      showG();
      $('#rm', root).addEventListener('change', (e) => { settings.set({ reduceMotion: e.target.checked }); nav.applySettings(); });
      $('#snd', root).addEventListener('change', (e) => settings.set({ sound: e.target.checked }));
      const file = $('#importFile', root);
      file.addEventListener('change', async () => {
        try { importAll(JSON.parse(await file.files[0].text())); nav.applySettings(); toast('导入成功', { icon: 'check', tint: '#34c759' }); nav.render(); }
        catch (err) { toast(`导入失败：${err.message}`, { icon: 'alert', tint: '#ff3b30' }); }
      });
      $$('[data-act]', root).forEach((b) => b.addEventListener('click', async () => {
        const act = b.dataset.act;
        if (act === 'export') download(`psy-lab-backup-${todayKey()}.json`, new Blob([JSON.stringify(exportAll(), null, 2)], { type: 'application/json' }));
        if (act === 'import') file.click();
        if (act === 'clear' && await confirmSheet('清除所有数据？', '测评历史、心情日记、成就和设置都将被删除，且无法恢复。建议先导出备份。', '全部清除', true)) {
          clearAll(); nav.applySettings(); toast('已清除', { icon: 'trash', tint: '#8e8e93' }); nav.render();
        }
      }));
    },
  };
}

export function badgesView() {
  const unlocked = unlockedBadges();
  return {
    title: '成就', tab: 4, back: '#/me',
    html: `<h1 class="large-title">成就</h1><p class="large-sub">已解锁 ${unlocked.size} / ${BADGES.length}，慢慢来，照顾自己本身就是成就</p>
      <div class="card glass"><div class="badge-grid">${BADGES.map((b) => badgeHtml(b, unlocked.has(b.id))).join('')}</div></div>`,
  };
}

export function historyView() {
  const h = records.all();
  return {
    title: '测评历史', tab: 4, back: '#/me',
    html: `<h1 class="large-title">测评历史</h1><p class="large-sub">共 ${h.length} 条记录</p>
      <div class="card glass list">${h.length ? h.map((x) => {
        const t = getTest(x.testId);
        return t ? listItem({ href: `#/result/${x.id}`, ic: t.icon, tint: t.tint, title: esc(x.line), sub: `${esc(t.name)} · ${fmtDate(x.ts)}` }) : '';
      }).join('') : emptyBox('grid', '暂无记录')}</div>
      ${h.length ? '<p class="list-f">同一测试多次作答，可以对比自己的变化。</p>' : ''}`,
  };
}

export function helpView() {
  return {
    title: '求助资源', tab: 4, back: '#/me',
    html: `<h1 class="large-title">求助资源</h1><p class="large-sub">你不必独自面对。拨打热线是勇敢的一步。</p>
      ${alertBox('danger', 'alert', '如果你或身边的人有立即的危险', '请马上拨打 120 或 110，或前往最近的医院急诊。')}
      <div class="card glass list" style="margin-top:12px">${HOTLINES.map((x) => listItem({ tag: 'a', attrs: `href="tel:${x.tel}"`, ic: 'phone', tint: '#34c759', title: esc(x.name), sub: esc(x.note), right: `<b style="color:var(--blue)">${esc(x.show || x.tel)}</b>` })).join('')}</div>
      <p class="list-f">热线信息可能变化，请以官方公布为准。海外用户可访问 <a href="https://findahelpline.com" target="_blank" rel="noopener">findahelpline.com</a> 查找当地热线。</p>
      <div class="card glass sec" style="margin-top:18px"><h3>其他可以求助的地方</h3><ul>
        <li>学校的心理咨询中心（通常免费）</li><li>正规医院的精神科 / 心理科</li><li>单位的员工援助计划（EAP）</li><li>你信任的家人、朋友或老师</li></ul></div>`,
  };
}

export function aboutView() {
  return {
    title: '关于', tab: 4, back: '#/me',
    html: `<div style="display:flex;justify-content:center;margin:6px 0 12px">${appIcon('heart-pulse', '#5856d6', 'xl')}</div>
      <h1 class="large-title center">心理实验室</h1><p class="large-sub center">一个开源、纯前端、注重隐私的心理测评网站</p>
      <div class="stack">
        <div class="card glass sec"><h3>隐私</h3><p>本站没有后端服务器，不使用任何统计或追踪脚本。你的所有答案、结果和日记都只保存在当前浏览器的 localStorage 中。清除浏览器数据会删除它们，可以在「我的」中导出备份。</p></div>
        <div class="card glass sec"><h3>免责声明</h3><p>本站的测评仅用于自我探索与心理健康科普，不能替代专业的心理评估、诊断或治疗。PHQ-9、GAD-7 等是筛查工具，高分只提示"值得关注"，不等于患病；低分也不代表你的感受不重要。标注"原创"的测试题目未经大样本信效度检验，结果请作参考。</p></div>
        <div class="card glass sec"><h3>量表来源</h3><ul>
          ${TESTS.map((t) => `<li><b>${esc(t.short)}</b>：${esc(t.reference)}</li>`).join('')}</ul></div>
        <div class="card glass sec"><h3>开源</h3><p>原生 HTML / CSS / JavaScript 编写，零依赖，通过 GitHub Actions 自动构建并部署到 GitHub Pages。图标为自绘线性图标，部分图形参考 Feather Icons 与 Lucide（MIT 许可）。</p></div>
      </div>`,
  };
}

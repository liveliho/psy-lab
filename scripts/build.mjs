// 零依赖构建脚本：校验题库与图标 → 复制 src 到 dist → 注入版本号
// 用法：node scripts/build.mjs
import { cp, rm, readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const load = (p) => import(pathToFileURL(path.join(src, p)));

const { TESTS, CATEGORIES } = await load('js/tests/index.js');
const { optionsOf } = await load('js/tests/common.js');
const { PATHS } = await load('js/icons.js');
const { ARTICLES } = await load('js/content.js');
const { BADGES } = await load('js/badges.js');

const errors = [];
const ids = new Set();

// 1. 校验所有测评：结构完整，且用极端、中间、随机答案都能正常计分
for (const t of TESTS) {
  const tag = `[${t.id}]`;
  if (ids.has(t.id)) errors.push(`${tag} id 重复`);
  ids.add(t.id);
  for (const f of ['name', 'short', 'icon', 'tint', 'category', 'intro', 'prompt', 'reference']) if (!t[f]) errors.push(`${tag} 缺少字段 ${f}`);
  if (!PATHS[t.icon]) errors.push(`${tag} 图标 "${t.icon}" 不存在`);
  if (!CATEGORIES.some((c) => c.id === t.category)) errors.push(`${tag} 分类 "${t.category}" 不存在`);
  if (!t.items?.length) errors.push(`${tag} 没有题目`);
  t.items.forEach((it, i) => {
    const opts = optionsOf(t, it);
    if (!it.t) errors.push(`${tag} 第 ${i + 1} 题缺少文本`);
    if (!opts?.length) errors.push(`${tag} 第 ${i + 1} 题没有选项`);
    if (opts?.length > 10) errors.push(`${tag} 第 ${i + 1} 题选项超过 10 个（分享链接编码不支持）`);
  });
  const strategies = {
    min: (o) => o[0], max: (o) => o[o.length - 1], mid: (o) => o[Math.floor(o.length / 2)],
    rand: (o) => o[Math.floor(Math.random() * o.length)],
  };
  for (const [name, pick] of Object.entries(strategies)) {
    try {
      const answers = t.items.map((it) => pick(optionsOf(t, it)).v);
      const r = t.score(answers);
      for (const f of ['headline', 'title', 'summary', 'line']) if (typeof r[f] !== 'string' || !r[f]) errors.push(`${tag} ${name} 作答时结果缺少 ${f}`);
      if (!Array.isArray(r.viz) || !Array.isArray(r.sections)) errors.push(`${tag} ${name} 作答时 viz/sections 不是数组`);
      if (/NaN|undefined/.test(JSON.stringify(r))) errors.push(`${tag} ${name} 作答时结果含 NaN/undefined`);
      if (!PATHS[r.icon]) errors.push(`${tag} ${name} 作答时结果图标 "${r.icon}" 不存在`);
    } catch (e) {
      errors.push(`${tag} ${name} 作答时计分出错：${e.message}`);
    }
  }
}

// 2. 其他引用的图标
for (const c of CATEGORIES) if (!PATHS[c.icon]) errors.push(`[分类 ${c.id}] 图标 "${c.icon}" 不存在`);
for (const a of ARTICLES) if (!PATHS[a.icon]) errors.push(`[文章 ${a.id}] 图标 "${a.icon}" 不存在`);
for (const b of BADGES) if (!PATHS[b.icon]) errors.push(`[成就 ${b.id}] 图标 "${b.icon}" 不存在`);

// 3. 心理学堂内容
const { PSYCHOLOGISTS, EXPERIMENTS, TIMELINE, TRIVIA } = await load('js/psychology.js');
const psyIds = new Set();
for (const p of PSYCHOLOGISTS) {
  if (psyIds.has(p.id)) errors.push(`[心理学家 ${p.id}] id 重复`);
  psyIds.add(p.id);
  for (const f of ['name', 'en', 'years', 'school', 'tagline', 'bio', 'legacy', 'critique']) if (!p[f]) errors.push(`[心理学家 ${p.id}] 缺少 ${f}`);
  if (!PATHS[p.icon]) errors.push(`[心理学家 ${p.id}] 图标 "${p.icon}" 不存在`);
  if (!p.ideas?.length || !p.works?.length) errors.push(`[心理学家 ${p.id}] 缺少核心思想或代表作`);
  for (const t of p.tests) if (!ids.has(t)) errors.push(`[心理学家 ${p.id}] 关联测评 "${t}" 不存在`);
}
for (const e of EXPERIMENTS) {
  for (const f of ['title', 'who', 'year', 'q', 'method', 'finding', 'debate', 'life']) if (!e[f]) errors.push(`[实验 ${e.id}] 缺少 ${f}`);
  if (!PATHS[e.icon]) errors.push(`[实验 ${e.id}] 图标 "${e.icon}" 不存在`);
}
for (const t of TIMELINE) {
  if (!PATHS[t.icon]) errors.push(`[时间线 ${t.year}] 图标 "${t.icon}" 不存在`);
  if (t.psy && !psyIds.has(t.psy)) errors.push(`[时间线 ${t.year}] 心理学家 "${t.psy}" 不存在`);
}
TRIVIA.forEach((q, i) => {
  if (q.a.length !== 4 || q.ok < 0 || q.ok >= q.a.length || !q.why) errors.push(`[问答 ${i + 1}] 选项或答案无效`);
  if (new Set(q.a).size !== q.a.length) errors.push(`[问答 ${i + 1}] 选项重复`);
});
if (TRIVIA.length < 10) errors.push('[问答] 题库少于 10 题');

// 4. 全站禁止 emoji，统一使用 SVG 图标
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}]/u;
for (const f of await readdir(src, { recursive: true })) {
  if (!/\.(js|html|css|webmanifest)$/.test(f)) continue;
  (await readFile(path.join(src, f), 'utf8')).split('\n').forEach((l, i) => {
    if (EMOJI.test(l)) errors.push(`[emoji] ${f}:${i + 1} 含有 emoji，请改用 SVG 图标`);
  });
}

if (errors.length) {
  console.error('[x] 校验失败：\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log(`[ok] 校验通过：${TESTS.length} 个测评，共 ${TESTS.reduce((s, t) => s + t.items.length, 0)} 题，${Object.keys(PATHS).length} 个图标`);

// 5. 复制并注入版本号
const version = (process.env.GITHUB_SHA || '').slice(0, 7) || Date.now().toString(36);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(src, dist, { recursive: true });
for (const f of ['index.html', 'sw.js']) {
  const p = path.join(dist, f);
  await writeFile(p, (await readFile(p, 'utf8')).replaceAll('__BUILD__', version));
}
await writeFile(path.join(dist, '.nojekyll'), '');
console.log(`[ok] 已构建到 dist/（版本 ${version}）`);

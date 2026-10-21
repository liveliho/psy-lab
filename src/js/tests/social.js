// 人际关系类：孤独感、讨好型人格。
import { AGREE5, dimMeans, pct5, band, total, round } from './common.js';

// ---------- 孤独感 ULS-8 ----------
const OFTEN4 = [
  { v: 1, l: '从不' },
  { v: 2, l: '很少' },
  { v: 3, l: '有时' },
  { v: 4, l: '经常' },
];
const ULS_BANDS = [
  { max: 30, label: '很少感到孤独', icon: 'users', color: '#34c759', text: '你和周围的人有着不错的联结，在需要的时候能找到陪伴和理解。' },
  { max: 55, label: '偶尔孤独', icon: 'user', color: '#30b0c7', text: '你偶尔会感到孤独，这是非常普遍的人类体验。大部分时候，你的社会联结还算充足。' },
  { max: 75, label: '比较孤独', icon: 'user-minus', color: '#ff9500', text: '你最近常常感到孤独，觉得和别人之间隔着一层什么。孤独不是你的错，它是一个信号，提醒你需要更多有质量的联结。' },
  { max: 100, label: '强烈的孤独感', icon: 'user-minus', color: '#ff3b30', text: '你正经历着强烈的孤独感。长期孤独对身心健康的影响不亚于吸烟和肥胖，值得认真对待。请试着迈出一小步，也可以和心理咨询师聊聊。' },
];

export const loneliness = {
  id: 'loneliness', name: '孤独感量表 ULS-8', short: '孤独感', icon: 'user-minus', tint: '#64d2ff', category: 'relationship', minutes: 1,
  intro: '孤独感不等于独处：一个人也可以很自在，一群人中也可能很孤独。它是"想要的联结"和"实际拥有的联结"之间的落差。本测试采用 UCLA 孤独感量表的 8 题简版。',
  prompt: '你有多常有这样的感受？', scale: OFTEN4, scaleStyle: 'list',
  reference: 'Hays, R. D., & DiMatteo, M. R. (1987). A short-form measure of loneliness (ULS-8). J Pers Assess. 中文为意译。该简版没有官方划界分，等级为本站按得分比例划分。',
  items: [
    { t: '我觉得缺少陪伴。', k: 'L' },
    { t: '我找不到可以求助的人。', k: 'L' },
    { t: '我是一个外向、喜欢和人交往的人。', k: 'L', r: 1 },
    { t: '我觉得自己被冷落了。', k: 'L' },
    { t: '我觉得和别人隔绝开了。', k: 'L' },
    { t: '当我需要时，总能找到人陪伴。', k: 'L', r: 1 },
    { t: '我因为太孤僻而感到不开心。', k: 'L' },
    { t: '虽然周围有人，但没有人真正懂我。', k: 'L' },
  ],
  score(answers) {
    const s = total(this, answers);
    const p = round(((s - 8) / 24) * 100);
    const b = band(p, ULS_BANDS);
    return {
      headline: b.label, title: `孤独指数 ${p}%`, icon: b.icon, summary: b.text, line: `孤独感 ${s}/32 · ${b.label}`,
      viz: [{ type: 'gauge', value: s, max: 32, color: b.color, label: b.label }],
      sections: [
        { title: '关于你', text: b.text },
        { title: '缓解孤独的小步骤', list: ['联系一个很久没聊的老朋友，哪怕只是说"突然想到你"', '加入一个以兴趣为中心的小组：读书会、运动群、志愿活动', '孤独会让人对社交信号更敏感、更容易往坏处想——提醒自己：别人可能没有你以为的那么冷淡', '照顾一株植物或一只宠物，也是一种联结'] },
        { title: '研究发现', text: '哈佛成人发展研究追踪了七百多人长达 80 多年，发现决定人们幸福和健康的最重要因素，是良好的人际关系。' },
      ],
    };
  },
};

// ---------- 讨好型人格（原创） ----------
const PL_BANDS = [
  { max: 40, label: '边界清晰', icon: 'shield-check', color: '#34c759', text: '你能比较自如地表达自己的需要，也能在必要时说"不"。你在照顾别人和照顾自己之间找到了不错的平衡。' },
  { max: 60, label: '有点讨好', icon: 'smile', color: '#30b0c7', text: '你很体贴，常常顾及别人的感受。但在某些关系或场合中，你会为了避免冲突而委屈自己。' },
  { max: 100, label: '讨好型人格', icon: 'message-heart', color: '#ff9500', text: '你习惯把别人的需要放在自己前面，很难拒绝，害怕让人失望。这种模式往往源自早年"只有懂事才会被爱"的经验。它曾经保护过你，但现在可能正在消耗你。' },
];

export const pleaser = {
  id: 'pleaser', name: '讨好型人格测试', short: '讨好型人格', icon: 'message-heart', tint: '#ff9f0a', category: 'relationship', minutes: 2, shareable: true,
  intro: '"讨好型人格"不是正式的临床诊断，而是对一种常见行为模式的描述：过度在意他人的认可、难以拒绝、压抑自己的需要。这个测试从难以拒绝、渴望认可、回避冲突三个方面评估。',
  prompt: '这句话在多大程度上符合你？', scale: AGREE5, scaleStyle: 'agree',
  reference: '题目为原创。理论依据：Braiker (2001) The Disease to Please；心理学中关于"讨好"（fawn）反应和社会赞许需要的研究。',
  items: [
    { t: '别人请我帮忙时，即使不方便，我也很难开口拒绝。', k: 'N' },
    { t: '如果有人对我不满意，我会一直惦记着这件事。', k: 'A' },
    { t: '为了避免争吵，我常常顺着别人的意思。', k: 'C' },
    { t: '拒绝别人之后，我会感到内疚。', k: 'N' },
    { t: '我很在意别人是否喜欢我。', k: 'A' },
    { t: '就算心里不同意，我也很少当面说出来。', k: 'C' },
    { t: '我经常答应下超出自己能力范围的事情。', k: 'N' },
    { t: '我会根据别人的反应来判断自己做得好不好。', k: 'A' },
    { t: '别人不高兴时，我会下意识地觉得是不是我做错了什么。', k: 'C' },
    { t: '我很少主动提出自己的需要。', k: 'N' },
    { t: '被人夸"懂事""好说话"时，我会感到安心。', k: 'A' },
    { t: '我能够坦然地对别人说"不"。', k: 'N', r: 1 },
  ],
  score(answers) {
    const m = dimMeans(this, answers);
    const p = { N: pct5(m.N), A: pct5(m.A), C: pct5(m.C) };
    const all = round((p.N + p.A + p.C) / 3);
    const b = band(all, PL_BANDS);
    return {
      headline: b.label, title: `讨好指数 ${all}%`, icon: b.icon, summary: b.text, line: `讨好指数 ${all}% · ${b.label}`,
      viz: [
        { type: 'gauge', value: all, max: 100, color: b.color, label: '讨好指数' },
        { type: 'bars', rows: [{ label: '难以拒绝', value: p.N, max: 100 }, { label: '渴望认可', value: p.A, max: 100 }, { label: '回避冲突', value: p.C, max: 100 }] },
      ],
      sections: [
        { title: '关于你', text: b.text },
        { title: '练习温和地坚定', list: ['先别急着答应："我看一下安排，晚点回复你"', '拒绝不需要长篇解释，一句"这次不太方便"就够了', '从小事开始练习表达偏好：今天想吃什么、想去哪', '提醒自己：别人的情绪是别人的责任，不是你的', '真正的关系经得起一次拒绝'] },
      ],
    };
  },
};

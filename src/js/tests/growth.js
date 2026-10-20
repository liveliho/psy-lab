// 自我成长类：拖延、心理韧性、职业倦怠、情商。题目均为原创，依据相应理论框架编写。
import { AGREE5, FREQ5, dimMeans, pct5, band, clamp, round } from './common.js';

const mean = (o) => Object.values(o).reduce((a, b) => a + b, 0) / Object.values(o).length;

// ---------- 拖延 ----------
const procrastItems = [
  { t: '明明知道该做，我还是会先去做别的事。', k: 'A' },
  { t: '我常常低估一件事实际需要的时间。', k: 'T' },
  { t: '我担心做得不够好，所以迟迟不敢开始。', k: 'E' },
  { t: '遇到困难或无聊的任务时，我会一拖再拖。', k: 'A' },
  { t: '我经常在截止日期前熬夜赶工。', k: 'T' },
  { t: '想到要做的事，我会感到焦虑和压力。', k: 'E' },
  { t: '我经常说"等会儿再做"，然后一直没做。', k: 'A' },
  { t: '我的计划很少能按时完成。', k: 'T' },
  { t: '拖延之后，我会自责、内疚。', k: 'E' },
  { t: '我会用刷手机、整理桌面来逃避正事。', k: 'A' },
  { t: '一件事最难的是开始，一旦开始反而还好。', k: 'T' },
  { t: '我总想等到"状态最好"的时候再开始。', k: 'E' },
];
const PRO_TYPES = {
  A: { name: '逃避型拖延', icon: 'coffee', text: '你的拖延主要来自"不想面对"：任务枯燥或困难时，大脑会本能地寻找更舒服的事情。',
    tips: ['5 分钟法则：告诉自己"只做 5 分钟"，开始后往往能继续', '把手机放到另一个房间，减少诱惑', '做完一小步就奖励自己'] },
  T: { name: '时间盲型拖延', icon: 'clock', text: '你的拖延主要来自时间感知：总觉得"还来得及"，常常低估任务所需的时间。',
    tips: ['把预估时间乘以 1.5，给自己留出缓冲', '用番茄钟（25 分钟专注 + 5 分钟休息）', '给大任务设置多个小截止点'] },
  E: { name: '完美主义型拖延', icon: 'target', text: '你的拖延主要来自情绪：害怕做不好、害怕被评价，于是干脆不开始。',
    tips: ['把目标从"完美"改为"完成"，先做一个粗糙的版本', '拖延时对自己温和一点，自责只会让人更想逃避', '问自己："最坏的结果是什么？我能承受吗？"'] },
};
const PRO_BANDS = [
  { max: 35, label: '行动派', icon: 'zap', text: '你很少拖延，想到就做，执行力很强。' },
  { max: 60, label: '偶尔拖延', icon: 'clock', text: '你和大多数人一样，偶尔会拖延，但总体可控。' },
  { max: 100, label: '拖延星人', icon: 'coffee', text: '拖延已经比较明显地影响到你了。好消息是，拖延是一种可以改变的习惯，而不是性格缺陷。' },
];

export const procrast = {
  id: 'procrast', name: '拖延类型测试', short: '拖延类型', icon: 'clock', tint: '#a2845e', category: 'growth', minutes: 2, shareable: true,
  intro: '拖延不是懒，而是一种情绪调节问题——我们在逃避任务带来的不舒服感受。这个测试从"逃避""时间感知""完美主义焦虑"三个角度，帮你找到自己拖延的主要原因。',
  prompt: '这句话在多大程度上符合你？', scale: AGREE5, scaleStyle: 'agree',
  reference: '题目为原创。理论依据：Steel (2007) 拖延的时间动机理论；Sirois & Pychyl (2013) 拖延与情绪调节。',
  items: procrastItems,
  score(answers) {
    const m = dimMeans(this, answers);
    const p = { A: pct5(m.A), T: pct5(m.T), E: pct5(m.E) };
    const all = pct5(mean(m));
    const b = band(all, PRO_BANDS);
    const top = Object.keys(p).reduce((a, k) => (p[k] > p[a] ? k : a), 'A');
    const ty = PRO_TYPES[top];
    return {
      headline: b.label, title: all > 35 ? ty.name : '拖延指数很低', icon: all > 35 ? ty.icon : b.icon,
      summary: b.text, line: `拖延 ${all}% · ${all > 35 ? ty.name : b.label}`,
      viz: [
        { type: 'gauge', value: all, max: 100, color: '#a2845e', label: '拖延指数' },
        { type: 'bars', rows: [{ label: '逃避倾向', value: p.A, max: 100 }, { label: '时间盲区', value: p.T, max: 100 }, { label: '完美主义焦虑', value: p.E, max: 100 }] },
      ],
      sections: [
        { title: ty.name, text: ty.text },
        { title: '对症下药', list: ty.tips },
        { title: '记住', text: '研究发现，原谅上一次的拖延，反而能减少下一次的拖延。' },
      ],
    };
  },
};

// ---------- 心理韧性 ----------
const resItems = [
  { t: '遇到挫折后，我通常能很快重新振作。', k: 'T' },
  { t: '我相信事情最终会好起来。', k: 'O' },
  { t: '遇到困难时，我知道可以向谁求助。', k: 'S' },
  { t: '压力之下，我依然能专注于要做的事。', k: 'T' },
  { t: '遇到问题时，我会先想办法，而不是抱怨。', k: 'O' },
  { t: '我能够控制自己的情绪，不被它淹没。', k: 'S' },
  { t: '我相信困难能让我变得更强大。', k: 'T' },
  { t: '我能从失败中找到值得学习的东西。', k: 'O' },
  { t: '我对自己处理问题的能力有信心。', k: 'S' },
  { t: '即使事情看起来没有希望，我也不会轻易放弃。', k: 'T' },
  { t: '我能在困境中看到幽默的一面。', k: 'O' },
  { t: '我有清晰的目标，知道自己为什么而努力。', k: 'S' },
];
const RES_BANDS = [
  { max: 45, label: '韧性待增强', icon: 'sprout', color: '#ff9500', text: '最近你可能感到有些难以招架。心理韧性就像肌肉，可以通过练习慢慢变强。' },
  { max: 70, label: '韧性良好', icon: 'leaf', color: '#34c759', text: '你具备不错的心理韧性，面对大多数困难都能慢慢调整过来。' },
  { max: 100, label: '韧性很强', icon: 'mountain', color: '#30b0c7', text: '你像一棵扎根很深的树，风雨来时会摇晃，但不会倒下。' },
];
export const resilience = {
  id: 'resilience', name: '心理韧性测试', short: '心理韧性', icon: 'sprout', tint: '#30d158', category: 'growth', minutes: 2, shareable: true,
  intro: '心理韧性（Resilience）是指面对逆境、压力和挫折时"弹回来"的能力。它不是天生的，而是可以培养的。本测试从坚韧、乐观和掌控力三个方面评估。',
  prompt: '这句话在多大程度上符合你？', scale: AGREE5, scaleStyle: 'agree',
  reference: '题目为原创。理论依据：Connor & Davidson (2003) 心理韧性的坚韧、力量与乐观三维度。',
  items: resItems,
  score(answers) {
    const m = dimMeans(this, answers);
    const p = { T: pct5(m.T), O: pct5(m.O), S: pct5(m.S) };
    const all = pct5(mean(m));
    const b = band(all, RES_BANDS);
    const low = Object.keys(p).reduce((a, k) => (p[k] < p[a] ? k : a), 'T');
    const tips = {
      T: ['把大困难拆成能完成的小目标，积累"我能行"的体验', '回想过去克服过的困难，它们证明了你的力量'],
      O: ['每天写下三件进展顺利的小事', '遇到问题时问自己："这件事里有什么是我能控制的？"'],
      S: ['列一张"支持清单"：难过时可以联系的人', '规律运动和睡眠是情绪稳定的基础'],
    }[low];
    return {
      headline: `${all} 分`, title: b.label, icon: b.icon, summary: b.text, line: `心理韧性 ${all} · ${b.label}`,
      viz: [
        { type: 'gauge', value: all, max: 100, color: b.color, label: b.label },
        { type: 'bars', rows: [{ label: '坚韧', value: p.T, max: 100 }, { label: '乐观', value: p.O, max: 100 }, { label: '掌控与支持', value: p.S, max: 100 }] },
      ],
      sections: [
        { title: '结果说明', text: b.text },
        { title: '从最弱的一环开始', list: tips },
      ],
    };
  },
};

// ---------- 职业倦怠 ----------
const burnItems = [
  { t: '一天工作或学习下来，我感到身心俱疲', k: 'EX' },
  { t: '我对工作或学习越来越提不起兴趣', k: 'CY' },
  { t: '我能有效地解决工作或学习中遇到的问题', k: 'EF', r: 1 },
  { t: '早上一想到又要面对工作或学习，就觉得累', k: 'EX' },
  { t: '我开始怀疑自己所做的事情有没有意义', k: 'CY' },
  { t: '我觉得自己在做有价值的事', k: 'EF', r: 1 },
  { t: '我觉得自己的精力被一点点耗光', k: 'EX' },
  { t: '我对同事、同学或客户变得冷漠、不耐烦', k: 'CY' },
  { t: '完成任务时，我会有成就感', k: 'EF', r: 1 },
  { t: '即使休息了，我也很难恢复过来', k: 'EX' },
  { t: '我只想应付了事，不想多投入', k: 'CY' },
  { t: '我对自己的能力有信心', k: 'EF', r: 1 },
];
const BURN_BANDS = [
  { max: 35, label: '状态良好', icon: 'battery', color: '#34c759', text: '你目前的精力和投入状态都不错，继续保持工作与生活的平衡。' },
  { max: 55, label: '轻度倦怠', icon: 'cloud-sun', color: '#ffcc00', text: '你出现了一些倦怠的迹象，这是身体在提醒你：该适当休息了。' },
  { max: 75, label: '中度倦怠', icon: 'cloud', color: '#ff9500', text: '你的倦怠感比较明显。建议认真审视工作量和休息方式，必要时和上级或老师沟通。' },
  { max: 100, label: '严重倦怠', icon: 'flame', color: '#ff3b30', text: '你可能正处于严重的倦怠中。请优先照顾自己，考虑寻求专业支持。' },
];
export const burnout = {
  id: 'burnout', name: '倦怠程度自评', short: '倦怠程度', icon: 'flame', tint: '#ff6b35', category: 'growth', minutes: 2,
  intro: '倦怠是长期压力下的耗竭状态，表现为精力透支、对工作或学习变得疏离、以及效能感下降。适用于上班族，也适用于学生。请回想过去一个月的状态。',
  prompt: '在过去一个月里，你有多常——', scale: FREQ5, scaleStyle: 'list',
  reference: '题目为原创。理论依据：Maslach & Leiter 职业倦怠三维模型（情绪耗竭、去人格化、个人成就感降低）。',
  items: burnItems,
  score(answers) {
    const m = dimMeans(this, answers);
    const q = (v) => clamp(round((v / 4) * 100));
    const p = { EX: q(m.EX), CY: q(m.CY), EF: q(m.EF) };
    const all = round((p.EX + p.CY + p.EF) / 3);
    const b = band(all, BURN_BANDS);
    return {
      headline: b.label, title: `倦怠指数 ${all}%`, icon: b.icon, summary: b.text, line: `倦怠 ${all}% · ${b.label}`,
      viz: [
        { type: 'gauge', value: all, max: 100, color: b.color, label: b.label },
        { type: 'bars', rows: [{ label: '精力耗竭', value: p.EX, max: 100 }, { label: '疏离感', value: p.CY, max: 100 }, { label: '效能感下降', value: p.EF, max: 100 }] },
      ],
      sections: [
        { title: '结果说明', text: b.text },
        { title: '给自己充电', list: ['下班或放学后设一个"关机时间"，不再处理工作消息', '找回一件与工作无关、纯粹让你开心的事', '和信任的人聊聊你的感受', '把"必须做"和"可以不做"的事分开，学会适当拒绝'] },
      ],
    };
  },
};

// ---------- 情商 ----------
const eqItems = [
  { t: '我通常能准确说出自己当下的情绪。', k: 'SA' },
  { t: '生气时，我能先冷静下来再回应。', k: 'SM' },
  { t: '我能从别人的语气和表情中读出他们的感受。', k: 'SO' },
  { t: '我能在不伤害对方的前提下表达不同意见。', k: 'RM' },
  { t: '我知道哪些事情容易触发我的负面情绪。', k: 'SA' },
  { t: '遇到挫折时，我能较快调整心态。', k: 'SM' },
  { t: '别人还没开口，我常常已经察觉到他们不对劲。', k: 'SO' },
  { t: '朋友之间有矛盾时，我常常是调解的那个人。', k: 'RM' },
  { t: '我清楚自己的优点和短板。', k: 'SA' },
  { t: '即使不想做，我也能让自己坚持完成重要的事。', k: 'SM' },
  { t: '我能理解和自己观点不同的人。', k: 'SO' },
  { t: '我善于鼓励和安慰别人。', k: 'RM' },
  { t: '我能察觉情绪是如何影响我的决定的。', k: 'SA' },
  { t: '压力大时，我有健康的方式来释放。', k: 'SM' },
  { t: '在一个群体里，我能感觉到氛围的微妙变化。', k: 'SO' },
  { t: '我能和不同类型的人建立良好的关系。', k: 'RM' },
];
const EQ_DIMS = { SA: '自我觉察', SM: '自我管理', SO: '社会觉察', RM: '关系管理' };
const EQ_TIPS = {
  SA: '每天花一分钟问自己："我现在是什么感受？为什么？"给情绪命名是觉察的第一步。',
  SM: '情绪上头时，先暂停 6 秒、深呼吸，再决定怎么回应。',
  SO: '聊天时多问一句"你怎么看？"，并认真倾听，不急着给建议。',
  RM: '表达不满时试试"我感到……因为……我希望……"的句式，对事不对人。',
};
const EQ_BANDS = [
  { max: 45, label: '情商成长中', icon: 'sprout' },
  { max: 70, label: '情商良好', icon: 'heart-pulse' },
  { max: 100, label: '高情商', icon: 'sparkles' },
];
export const eq = {
  id: 'eq', name: '情商自评', short: '情商 EQ', icon: 'heart-pulse', tint: '#e8508f', category: 'growth', minutes: 3, shareable: true,
  intro: '情绪智力（EQ）是识别、理解和管理自己与他人情绪的能力。本测试基于 Goleman 的四维模型：自我觉察、自我管理、社会觉察与关系管理。',
  prompt: '这句话在多大程度上符合你？', scale: AGREE5, scaleStyle: 'agree',
  reference: '题目为原创。理论依据：Goleman (1995)《情商》；Salovey & Mayer (1990) 情绪智力模型。',
  items: eqItems,
  score(answers) {
    const m = dimMeans(this, answers);
    const p = Object.fromEntries(Object.keys(EQ_DIMS).map((k) => [k, pct5(m[k])]));
    const all = pct5(mean(m));
    const b = band(all, EQ_BANDS);
    const top = Object.keys(p).reduce((a, k) => (p[k] > p[a] ? k : a));
    const low = Object.keys(p).reduce((a, k) => (p[k] < p[a] ? k : a));
    return {
      headline: `EQ ${all}`, title: b.label, icon: b.icon,
      summary: `你最擅长「${EQ_DIMS[top]}」，最值得练习的是「${EQ_DIMS[low]}」。`,
      line: `情商 ${all} · 强项${EQ_DIMS[top]}`,
      viz: [{ type: 'radar', axes: Object.keys(EQ_DIMS).map((k) => ({ label: EQ_DIMS[k], value: p[k] })) }],
      sections: [
        { title: `强项：${EQ_DIMS[top]}`, text: `你在${EQ_DIMS[top]}上得分 ${p[top]}%，这是你在人际与情绪方面的优势。` },
        { title: `练习：${EQ_DIMS[low]}`, text: EQ_TIPS[low] },
        { title: '情商可以提升', text: '与智商不同，情绪智力在成年后依然可以通过有意识的练习显著提高。' },
      ],
    };
  },
};

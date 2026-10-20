import { AGREE5, dimMeans, pct5 } from './common.js';

// IPIP Big-Five Factor Markers（50 题，公有领域，Goldberg 1992）中文译本。r: 反向计分
const items = [
  { t: '我是聚会中的活跃分子。', k: 'E' },
  { t: '我不太关心别人。', k: 'A', r: 1 },
  { t: '我总是做好准备。', k: 'C' },
  { t: '我很容易感到有压力。', k: 'N' },
  { t: '我的词汇量很丰富。', k: 'O' },
  { t: '我话不多。', k: 'E', r: 1 },
  { t: '我对人很感兴趣。', k: 'A' },
  { t: '我会把东西到处乱放。', k: 'C', r: 1 },
  { t: '大多数时候我都很放松。', k: 'N', r: 1 },
  { t: '我很难理解抽象的概念。', k: 'O', r: 1 },
  { t: '和别人在一起时我感到自在。', k: 'E' },
  { t: '我有时会出言冒犯别人。', k: 'A', r: 1 },
  { t: '我很注意细节。', k: 'C' },
  { t: '我经常担心各种事情。', k: 'N' },
  { t: '我有生动的想象力。', k: 'O' },
  { t: '我喜欢待在不显眼的位置。', k: 'E', r: 1 },
  { t: '我能体会别人的感受。', k: 'A' },
  { t: '我会把事情弄得一团糟。', k: 'C', r: 1 },
  { t: '我很少感到忧郁。', k: 'N', r: 1 },
  { t: '我对抽象的想法不感兴趣。', k: 'O', r: 1 },
  { t: '我会主动发起对话。', k: 'E' },
  { t: '我对别人的问题不感兴趣。', k: 'A', r: 1 },
  { t: '我会立刻把杂事做完。', k: 'C' },
  { t: '我很容易心烦意乱。', k: 'N' },
  { t: '我经常有好点子。', k: 'O' },
  { t: '我没什么话可说。', k: 'E', r: 1 },
  { t: '我心肠很软。', k: 'A' },
  { t: '我经常忘记把东西放回原处。', k: 'C', r: 1 },
  { t: '我很容易生气或沮丧。', k: 'N' },
  { t: '我的想象力并不好。', k: 'O', r: 1 },
  { t: '在聚会上我会和很多不同的人交谈。', k: 'E' },
  { t: '我其实对别人不太感兴趣。', k: 'A', r: 1 },
  { t: '我喜欢井然有序。', k: 'C' },
  { t: '我的情绪变化很大。', k: 'N' },
  { t: '我理解事物很快。', k: 'O' },
  { t: '我不喜欢引起别人的注意。', k: 'E', r: 1 },
  { t: '我愿意花时间帮助别人。', k: 'A' },
  { t: '我会逃避自己的责任。', k: 'C', r: 1 },
  { t: '我的情绪起伏很频繁。', k: 'N' },
  { t: '我喜欢使用复杂的词汇。', k: 'O' },
  { t: '我不介意成为众人关注的焦点。', k: 'E' },
  { t: '我能感受到别人的情绪。', k: 'A' },
  { t: '我会按照计划表做事。', k: 'C' },
  { t: '我很容易被激怒。', k: 'N' },
  { t: '我常花时间反思事物。', k: 'O' },
  { t: '在陌生人面前我很安静。', k: 'E', r: 1 },
  { t: '我能让别人感到放松自在。', k: 'A' },
  { t: '我对工作要求严格、一丝不苟。', k: 'C' },
  { t: '我经常感到情绪低落。', k: 'N' },
  { t: '我脑子里充满了各种想法。', k: 'O' },
];

const TRAITS = {
  O: { name: '开放性', en: 'Openness', icon: 'palette',
    high: '你好奇心旺盛、富有想象力，喜欢新奇的体验、艺术与抽象思考，乐于接受不同的观点。',
    mid: '你在新鲜事物与熟悉的方式之间保持平衡，既能欣赏创新，也重视实用。',
    low: '你务实、脚踏实地，更偏好熟悉和经过验证的方式，关注具体而非抽象。' },
  C: { name: '尽责性', en: 'Conscientiousness', icon: 'target',
    high: '你自律、有条理、目标明确，做事可靠，常常提前规划并坚持到底。',
    mid: '你在计划与弹性之间取得平衡，重要的事会认真对待，也懂得适度放松。',
    low: '你随性、灵活，不喜欢被计划束缚；可能需要一些外部工具来帮助管理任务。' },
  E: { name: '外向性', en: 'Extraversion', icon: 'sun',
    high: '你热情、健谈、精力充沛，在人群中如鱼得水，社交能为你充电。',
    mid: '你是"中间性格"，既享受社交也需要独处，能根据场合切换状态。',
    low: '你安静、内敛，偏好小圈子和深度交流，独处是你恢复能量的方式。' },
  A: { name: '宜人性', en: 'Agreeableness', icon: 'heart',
    high: '你友善、富有同情心、乐于合作，重视人际和谐，常常为他人着想。',
    mid: '你既能体谅他人，也能在必要时坚持自己的立场。',
    low: '你直率、有主见、善于独立判断，不轻易随大流，在竞争中更有韧性。' },
  N: { name: '神经质', en: 'Neuroticism', icon: 'activity',
    high: '你的情绪感受细腻而强烈，更容易体验到焦虑、紧张或低落。学习情绪调节技巧会很有帮助。',
    mid: '你的情绪总体平稳，偶尔会因压力起伏，但通常能较快恢复。',
    low: '你情绪稳定、沉着冷静，面对压力时不容易慌乱。' },
};
const ORDER = ['O', 'C', 'E', 'A', 'N'];

export default {
  id: 'bigfive',
  name: '大五人格测试',
  short: '大五人格',
  icon: 'pentagon',
  tint: '#ff2d55',
  category: 'personality',
  minutes: 8,
  shareable: true,
  intro: '大五人格（OCEAN）是当代心理学中研究最充分、最被认可的人格模型，从开放性、尽责性、外向性、宜人性和神经质五个维度描述人格。共 50 题，请描述"现在真实的你"，而不是"希望成为的你"。',
  prompt: '这句话在多大程度上符合你？',
  scale: AGREE5,
  scaleStyle: 'agree',
  reference: 'Goldberg, L. R. (1992). The development of markers for the Big-Five factor structure. 题目来自 IPIP（ipip.ori.org，公有领域），中文为本站翻译。',
  items,
  score(answers) {
    const m = dimMeans(this, answers);
    const p = Object.fromEntries(ORDER.map((k) => [k, pct5(m[k])]));
    const lvl = (v) => (v >= 60 ? 'high' : v <= 40 ? 'low' : 'mid');
    const lvlWord = { high: '偏高', mid: '中等', low: '偏低' };
    const traitsNoN = ['O', 'C', 'E', 'A'];
    const top = traitsNoN.reduce((a, b) => (p[a] >= p[b] ? a : b));
    const stab = 100 - p.N;

    return {
      headline: `${TRAITS[top].name}`,
      title: `你最突出的特质 · ${p[top]}%`,
      icon: TRAITS[top].icon,
      summary: `${TRAITS[top].high.split('，')[0]}；情绪稳定度 ${stab}%。`,
      line: ORDER.map((k) => `${TRAITS[k].name.slice(0, 2)}${p[k]}`).join(' · '),
      viz: [
        { type: 'radar', axes: ORDER.map((k) => ({ label: TRAITS[k].name, value: p[k] })) },
        { type: 'bars', rows: ORDER.map((k) => ({ label: TRAITS[k].name, value: p[k], max: 100, note: lvlWord[lvl(p[k])] })) },
      ],
      sections: [
        ...ORDER.map((k) => ({ title: `${TRAITS[k].name} · ${p[k]}%`, text: TRAITS[k][lvl(p[k])] })),
        { title: '小贴士', text: '大五人格的每个维度都是连续谱，没有好坏之分。分数反映的是相对于中点的位置，会随年龄与经历缓慢变化。' },
      ],
    };
  },
};

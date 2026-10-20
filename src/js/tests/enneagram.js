import { AGREE5, dimMeans, pct5 } from './common.js';

// 原创题目，依据九型人格（Enneagram）的九种核心动机
const RAW = {
  1: ['我对自己和别人都有很高的标准。', '看到事情做得不对，我会忍不住想纠正。', '我很在意对错与原则。'],
  2: ['我很享受被别人需要的感觉。', '我常常把别人的需求放在自己前面。', '我很容易察觉别人需要什么帮助。'],
  3: ['我非常在意自己是否成功、是否被认可。', '我能根据场合调整自己，展现最好的一面。', '我是目标导向的人，效率对我很重要。'],
  4: ['我常觉得自己和别人不一样，有独特的感受。', '我容易被忧郁、怀旧这类深刻的情绪吸引。', '真实地表达自我对我来说非常重要。'],
  5: ['我需要大量独处的时间来思考和充电。', '我喜欢在行动前先把事情研究透彻。', '我更习惯观察，而不是参与。'],
  6: ['我经常预想可能出错的情况，并提前做准备。', '我非常重视忠诚和安全感。', '做重要决定前，我希望听听信任的人的意见。'],
  7: ['我总是在计划下一个有趣的体验。', '我不喜欢被限制，喜欢保持多种选择。', '遇到不开心的事，我倾向于转移注意力去想开心的。'],
  8: ['我说话直接，不怕冲突。', '我喜欢掌控局面，不愿意被别人控制。', '我会站出来保护弱者。'],
  9: ['我很容易理解每个人的观点。', '我会尽量避免冲突，维持和谐。', '我比较随和，常常顺着别人的意思。'],
};
const items = [];
for (let i = 0; i < 3; i++) for (let t = 1; t <= 9; t++) items.push({ t: RAW[t][i], k: String(t) });

const TYPES = {
  1: { name: '完美型', icon: 'target', desire: '做正确的事，成为好人', fear: '犯错、变得堕落', text: '你有原则、负责、追求卓越，内心有一把清晰的尺子。', grow: '允许自己和别人不完美，"足够好"有时就是最好。' },
  2: { name: '助人型', icon: 'heart', desire: '被爱、被需要', fear: '不被爱、没有价值', text: '你温暖、慷慨、善解人意，总能第一时间察觉别人的需要。', grow: '照顾别人之前，先问问自己需要什么。' },
  3: { name: '成就型', icon: 'trophy', desire: '成功、有价值', fear: '失败、毫无价值', text: '你高效、有魅力、目标明确，擅长把事情做成。', grow: '你的价值不只在于成就，试着享受过程本身。' },
  4: { name: '自我型', icon: 'palette', desire: '找到自我与独特意义', fear: '没有身份认同、平庸', text: '你敏感、有创造力、情感深刻，追求真实与独特。', grow: '平凡的日常里也有美，不必总等待深刻的时刻。' },
  5: { name: '理智型', icon: 'search', desire: '理解世界、有能力', fear: '无能、被耗尽', text: '你好奇、独立、善于分析，享受知识与思考。', grow: '试着走出头脑，用身体和情感去体验生活。' },
  6: { name: '忠诚型', icon: 'shield', desire: '安全与支持', fear: '失去依靠、被抛弃', text: '你可靠、负责、有忧患意识，是值得托付的伙伴。', grow: '相信自己的判断，不是所有担心都会成真。' },
  7: { name: '活跃型', icon: 'sparkles', desire: '快乐、自由与满足', fear: '被困在痛苦中', text: '你乐观、有活力、充满好奇，总能发现生活的乐趣。', grow: '允许自己停下来，感受那些不那么愉快的情绪。' },
  8: { name: '领袖型', icon: 'zap', desire: '掌控自己的命运', fear: '被伤害、被控制', text: '你强大、果断、有保护欲，敢于面对挑战。', grow: '展示脆弱不是软弱，它能让人更靠近你。' },
  9: { name: '和平型', icon: 'leaf', desire: '内心与外在的平和', fear: '冲突、分离', text: '你随和、包容、善于调解，让身边的人感到安心。', grow: '你的意见同样重要，勇敢地说出"我想要"。' },
};

export default {
  id: 'enneagram', name: '九型人格测试', short: '九型人格', icon: 'enneagram', tint: '#bf5af2', category: 'personality', minutes: 4, shareable: true,
  intro: '九型人格关注的是"你为什么这样做"——行为背后的核心动机与恐惧。它把人分为九种类型，每种都有独特的渴望、恐惧与成长方向。共 27 题。',
  prompt: '这句话在多大程度上符合你？', scale: AGREE5, scaleStyle: 'agree',
  reference: '题目为原创。理论依据：Riso & Hudson (1999)《九型人格的智慧》。九型人格在学术界的实证支持有限，适合用于自我反思。',
  items,
  score(answers) {
    const m = dimMeans(this, answers);
    const p = Object.fromEntries(Object.keys(TYPES).map((k) => [k, pct5(m[k])]));
    const top = Object.keys(p).reduce((a, k) => (p[k] > p[a] ? k : a), '1');
    const n = +top;
    const left = String(n === 1 ? 9 : n - 1), right = String(n === 9 ? 1 : n + 1);
    const wing = p[left] >= p[right] ? left : right;
    const t = TYPES[top];
    return {
      headline: `${top}w${wing}`, title: `${top} 号 · ${t.name}`, icon: t.icon, summary: t.text,
      line: `九型 ${top}w${wing} · ${t.name}`,
      viz: [{ type: 'bars', rows: Object.keys(TYPES).map((k) => ({ label: `${k} ${TYPES[k].name}`, value: p[k], max: 100 })) }],
      sections: [
        { title: '核心动机', list: [`渴望：${t.desire}`, `恐惧：${t.fear}`] },
        { title: `侧翼 ${wing} 号 · ${TYPES[wing].name}`, text: `你的主型受到相邻的 ${wing} 号影响，带有一些「${TYPES[wing].text.replace(/^你/, '')}」的色彩。` },
        { title: '成长方向', text: t.grow },
      ],
    };
  },
};

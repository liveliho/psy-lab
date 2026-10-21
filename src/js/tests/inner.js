// 内在成长类：自我关怀、正念、成长型思维、情绪调节、感恩、冒名顶替。
// 公开量表的中文为本站意译；标注"原创"的题目依据相应理论框架编写。
import { AGREE5, AGREE7, dimMeans, pct5, band, total, round } from './common.js';

const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

// ---------- 自我关怀 SCS-SF ----------
const OFTEN5 = [
  { v: 1, l: '几乎从不' },
  { v: 2, l: '很少' },
  { v: 3, l: '有时' },
  { v: 4, l: '经常' },
  { v: 5, l: '几乎总是' },
];
const SC_AXES = [['SK', '善待自己'], ['SJ', '少自我批判'], ['CH', '共通人性'], ['IS', '少孤立感'], ['MI', '正念觉察'], ['OI', '少过度沉溺']];
const SC_BANDS = [
  { max: 2.49, label: '自我关怀偏低', icon: 'sprout', color: '#ff9500', text: '你对自己可能相当严厉：犯错时习惯责备自己，难过时容易觉得只有自己这么糟。好消息是，自我关怀是可以练习的技能。' },
  { max: 3.5, label: '自我关怀中等', icon: 'leaf', color: '#30b0c7', text: '你在一些时候能善待自己，但在压力大或失败时，内心的批评声音可能还是会占上风。' },
  { max: 5, label: '自我关怀较高', icon: 'heart', color: '#34c759', text: '你能像对待好朋友那样对待自己：承认痛苦、不过度自责，也明白不完美是人类共同的经历。' },
];

export const selfcomp = {
  id: 'selfcomp', name: '自我关怀量表', short: '自我关怀', icon: 'hug', tint: '#ff6482', category: 'growth', minutes: 3, shareable: true,
  intro: '自我关怀（self-compassion）由心理学家 Kristin Neff 提出：在痛苦和失败时，像对待一个好朋友那样温和地对待自己。研究发现它比"高自尊"更能预测心理健康，而且不会让人变得懈怠。本测试采用 12 题简版量表，从六个方面评估。',
  prompt: '在困难的时候，我通常会——', scale: OFTEN5, scaleStyle: 'list',
  reference: 'Raes, F., Pommier, E., Neff, K. D., & Van Gucht, D. (2011). Construction and factorial validation of a short form of the Self-Compassion Scale. 量表可免费用于非商业用途，中文为意译。',
  items: [
    { t: '当我在重要的事情上失败时，会被"自己不够好"的感觉吞没。', k: 'OI', r: 1 },
    { t: '我会试着理解和包容自己性格中不喜欢的部分。', k: 'SK' },
    { t: '发生痛苦的事情时，我会试着用平衡的视角看待它。', k: 'MI' },
    { t: '情绪低落时，我常觉得别人大概都比我过得好。', k: 'IS', r: 1 },
    { t: '我会把自己的不足看作人人都会有的一部分。', k: 'CH' },
    { t: '经历艰难时期时，我会给自己需要的关心和温柔。', k: 'SK' },
    { t: '当有事让我难过时，我会试着让情绪保持平衡。', k: 'MI' },
    { t: '当我在重要的事情上失败时，常常感到孤单无助。', k: 'IS', r: 1 },
    { t: '情绪低落时，我容易执着地纠结于所有出错的地方。', k: 'OI', r: 1 },
    { t: '当我觉得自己不够好时，会提醒自己：大多数人都有过这种感觉。', k: 'CH' },
    { t: '对于自己的缺点和不足，我会不满并苛责自己。', k: 'SJ', r: 1 },
    { t: '对于自己不喜欢的性格部分，我缺乏耐心和包容。', k: 'SJ', r: 1 },
  ],
  score(answers) {
    const m = dimMeans(this, answers);
    const all = mean(Object.values(m));
    const b = band(all, SC_BANDS);
    const axes = SC_AXES.map(([k, label]) => ({ label, value: pct5(m[k]) }));
    const low = [...axes].sort((a, b2) => a.value - b2.value)[0];
    return {
      headline: b.label, title: `自我关怀 ${all.toFixed(1)} / 5`, icon: b.icon, summary: b.text, line: `自我关怀 ${all.toFixed(1)} · ${b.label}`,
      viz: [{ type: 'radar', axes }],
      sections: [
        { title: '关于你', text: b.text },
        { title: '最值得练习的部分', text: `你在「${low.label}」上得分最低。${{
          善待自己: '试着在难过时问自己：如果是好朋友遇到这件事，我会对 TA 说什么？然后把这句话说给自己听。',
          少自我批判: '留意脑海里那个严厉的声音，给它起个名字，比如"批评家"。当它出现时，你可以说："谢谢你的提醒，但我不需要被骂。"',
          共通人性: '失败和痛苦是人类的共同经历，不是你独有的缺陷。此刻世界上有无数人和你有着相似的感受。',
          少孤立感: '在低落的时候，试着主动联系一个人，哪怕只是发一条消息。',
          正念觉察: '难过时先命名情绪："我注意到我现在很沮丧。"命名本身就能让情绪降温。',
          少过度沉溺: '给反复回想设一个"截止时间"，然后把注意力转到身体或周围环境上。',
        }[low.label]}` },
        { title: '自我关怀小练习', list: ['把手放在胸口，感受它的温度，对自己说："这很难，我会陪着自己"', '写一封信给自己，用一个无条件爱你的朋友的口吻', '自我关怀不是自我放纵：它是在跌倒后把自己扶起来，而不是一直躺着'] },
      ],
    };
  },
};

// ---------- 正念觉察 MAAS ----------
const MAAS_SCALE = [
  { v: 1, l: '几乎总是' },
  { v: 2, l: '非常频繁' },
  { v: 3, l: '有些频繁' },
  { v: 4, l: '不太频繁' },
  { v: 5, l: '很少' },
  { v: 6, l: '几乎从不' },
];
const MAAS_BANDS = [
  { max: 3.2, label: '自动驾驶模式', icon: 'zap', color: '#ff9500', text: '你常常处于"自动驾驶"状态：人在这里，心却在别处。这在忙碌的现代生活中很常见，但长期如此容易让人疲惫、焦虑，也错过很多当下的美好。' },
  { max: 4.3, label: '时常觉察', icon: 'eye', color: '#30b0c7', text: '你的正念水平和大多数人相近：有时全情投入，有时也会走神、分心。' },
  { max: 6, label: '高度觉察', icon: 'flower', color: '#34c759', text: '你能比较稳定地觉察当下正在发生的事情，包括身体感受和情绪变化，较少陷入"自动驾驶"。' },
];

export const maas = {
  id: 'maas', name: '正念觉察量表 MAAS', short: '正念水平', icon: 'flower', tint: '#30b0c7', category: 'growth', minutes: 3, shareable: true,
  intro: '正念（mindfulness）是指有意识地、不加评判地觉察当下。正念注意觉知量表（MAAS）测量的是日常生活中你有多常"心不在焉"。没有标准答案，请按照你真实的日常经验，而不是你认为"应该"的样子作答。',
  prompt: '在日常生活中，下面的情况有多常发生？', scale: MAAS_SCALE, scaleStyle: 'list',
  reference: 'Brown, K. W., & Ryan, R. M. (2003). The benefits of being present: Mindfulness and its role in psychological well-being. JPSP. 量表可免费使用，中文为意译。',
  items: [
    '我可能正在体验某种情绪，但过了一会儿才意识到。',
    '我会因为粗心、没注意或者在想别的事而打碎或洒出东西。',
    '我很难把注意力一直放在当下正在发生的事情上。',
    '去某个地方时，我常常走得很快，而没留意沿途的所见所感。',
    '直到身体的紧张或不适变得非常明显，我才会注意到它们。',
    '别人第一次告诉我名字后，我几乎马上就忘了。',
    '我做事时好像在"自动驾驶"，没有真正意识到自己在做什么。',
    '我匆匆忙忙地完成各种事情，却没有真正专注于它们。',
    '我太专注于想要达到的目标，以至于忽略了此刻正在做的事情。',
    '我会机械地做事，而没有意识到自己在做什么。',
    '我发现自己一边听别人说话，一边在做别的事情。',
    '我会"自动导航"般地到达某个地方，然后才纳闷自己为什么去那里。',
    '我发现自己总是想着过去或未来。',
    '我发现自己做事时心不在焉。',
    '我会不知不觉地吃零食。',
  ].map((t, i) => ({ t, k: i === 0 || i === 4 ? 'B' : i === 2 || i === 10 || i === 12 ? 'A' : 'P' })),
  score(answers) {
    const m = mean(answers);
    const b = band(m, MAAS_BANDS);
    const p = round(((m - 1) / 5) * 100);
    const dm = dimMeans(this, answers);
    const p6 = (x) => round(((x - 1) / 5) * 100);
    return {
      headline: b.label, title: `正念指数 ${p}%`, icon: b.icon, summary: b.text, line: `正念 ${m.toFixed(1)}/6 · ${b.label}`,
      viz: [
        { type: 'gauge', value: Number(m.toFixed(1)), max: 6, color: b.color, label: b.label },
        { type: 'bars', rows: [{ label: '对身心感受的觉察', value: p6(dm.B), max: 100 }, { label: '注意力停留在当下', value: p6(dm.A), max: 100 }, { label: '做事时的专注投入', value: p6(dm.P), max: 100 }] },
      ],
      sections: [
        { title: '关于你', text: b.text },
        { title: '分数参考', text: `成年人的平均分大约在 3.8–4.2 之间，你的平均分是 ${m.toFixed(1)}。分数越高，代表越少处于"自动驾驶"状态。` },
        { title: '在生活中练习正念', list: ['吃第一口饭时，认真感受它的味道和口感', '每天做 3 分钟呼吸练习（「工具」页有引导）', '走路时留意脚掌接触地面的感觉', '洗碗、刷牙时只做这一件事', '试试「工具」里的渐进式肌肉放松，练习觉察身体'] },
      ],
    };
  },
};

// ---------- 成长型思维（原创） ----------
const MS_BANDS = [
  { max: 40, label: '偏固定型思维', icon: 'lock', color: '#ff9500', text: '你倾向于认为能力和天赋是天生的、很难改变。这可能让你在面对挑战时更想证明自己，而不是去学习；失败也更容易被理解为"我不行"。' },
  { max: 60, label: '混合型思维', icon: 'layers', color: '#30b0c7', text: '你在一些领域相信努力能带来改变，在另一些领域则觉得"天生就这样"。这其实是大多数人的状态。' },
  { max: 100, label: '成长型思维', icon: 'trending-up', color: '#34c759', text: '你相信能力可以通过努力、策略和他人的帮助不断发展。你更愿意接受挑战，也更能从失败中学习。' },
];

export const mindset = {
  id: 'mindset', name: '成长型思维测试', short: '思维模式', icon: 'trending-up', tint: '#34c759', category: 'growth', minutes: 2, shareable: true,
  intro: '斯坦福大学心理学家 Carol Dweck 发现，人们对"能力能否改变"的信念，会深刻影响他们如何面对挑战、努力和失败。这个测试从智力、天赋与性格、面对失败三个角度，看看你更接近成长型还是固定型思维。',
  prompt: '你在多大程度上同意这句话？', scale: AGREE5, scaleStyle: 'agree',
  reference: '题目为原创。理论依据：Dweck, C. S. (2006). Mindset: The New Psychology of Success; Dweck, Chiu & Hong (1995) 内隐理论。',
  items: [
    { t: '一个人的聪明程度基本是固定的，很难真正改变。', k: 'I', r: 1 },
    { t: '只要方法得当，任何人都可以变得明显更聪明。', k: 'I' },
    { t: '有些人天生就不是学数学（或某项技能）的料。', k: 'T', r: 1 },
    { t: '如果需要很努力才能做好一件事，说明我没有这方面的天赋。', k: 'T', r: 1 },
    { t: '我喜欢做有难度的事情，即使可能会失败。', k: 'F' },
    { t: '别人批评我的时候，我会觉得是在否定我这个人。', k: 'F', r: 1 },
    { t: '人的性格可以在成年后发生很大的变化。', k: 'T' },
    { t: '看到别人成功，我会想学习 TA 是怎么做到的，而不是感到威胁。', k: 'F' },
    { t: '我更愿意做自己擅长的事，以免显得能力不足。', k: 'F', r: 1 },
    { t: '大脑就像肌肉，越用越强。', k: 'I' },
  ],
  score(answers) {
    const m = dimMeans(this, answers);
    const p = { I: pct5(m.I), T: pct5(m.T), F: pct5(m.F) };
    const all = round((p.I + p.T + p.F) / 3);
    const b = band(all, MS_BANDS);
    return {
      headline: b.label, title: `成长指数 ${all}%`, icon: b.icon, summary: b.text, line: `思维模式 ${all}% · ${b.label}`,
      viz: [
        { type: 'bipolar', rows: [{ left: '成长型', right: '固定型', value: all }] },
        { type: 'bars', rows: [{ label: '相信智力可以提升', value: p.I, max: 100 }, { label: '相信天赋与性格可塑', value: p.T, max: 100 }, { label: '拥抱挑战与失败', value: p.F, max: 100 }] },
      ],
      sections: [
        { title: '关于你', text: b.text },
        { title: '培养成长型思维', list: ['在"我不会"后面加上"还"：我还不会', '夸奖自己和别人的努力与策略，而不是"聪明"', '把失败当作数据：这次哪里可以调整？', '多读一些专家早年笨拙的故事——没人生来就是高手'] },
        { title: '一点提醒', text: '成长型思维不是"只要努力就一定成功"，也不是盲目乐观。它强调的是：努力、好的策略和向他人求助，三者缺一不可。' },
      ],
    };
  },
};

// ---------- 情绪调节 ERQ ----------
export const erq = {
  id: 'erq', name: '情绪调节方式问卷 ERQ', short: '情绪调节', icon: 'thermometer', tint: '#ff6b35', category: 'growth', minutes: 2, shareable: true,
  intro: '面对情绪，有人会换个角度重新理解（认知重评），有人会把情绪压在心里不表现出来（表达抑制）。斯坦福大学 James Gross 编制的 ERQ 测量的就是这两种最常见的情绪调节策略。共 10 题。',
  prompt: '你在多大程度上同意这句话？', scale: AGREE7, scaleStyle: 'list',
  reference: 'Gross, J. J., & John, O. P. (2003). Individual differences in two emotion regulation processes. JPSP. 量表可免费使用，中文为意译。',
  items: [
    { t: '当我想多感受一些积极情绪（比如快乐、愉悦）时，我会改变自己思考问题的角度。', k: 'R' },
    { t: '我会把自己的情绪藏在心里，不表露出来。', k: 'S' },
    { t: '当我想少感受一些消极情绪（比如难过、愤怒）时，我会改变自己思考问题的角度。', k: 'R' },
    { t: '感到开心时，我会小心地不把它表现出来。', k: 'S' },
    { t: '面对有压力的情境时，我会用一种能让自己保持平静的方式去思考它。', k: 'R' },
    { t: '我控制情绪的方式是：不表达它们。', k: 'S' },
    { t: '当我想多感受积极情绪时，我会改变对当前处境的看法。', k: 'R' },
    { t: '我会通过改变对处境的看法来控制自己的情绪。', k: 'R' },
    { t: '感到消极情绪时，我会确保自己不把它表现出来。', k: 'S' },
    { t: '当我想少感受消极情绪时，我会改变对当前处境的看法。', k: 'R' },
  ],
  score(answers) {
    const m = dimMeans(this, answers);
    const hiR = m.R >= 4.6, hiS = m.S >= 3.6;
    const ty = hiR && !hiS ? { name: '灵活重评型', icon: 'refresh', text: '你擅长换个角度看问题，同时允许情绪自然流露。研究显示，这是与幸福感、良好人际关系联系最紧密的调节模式。' }
      : !hiR && hiS ? { name: '内敛压抑型', icon: 'lock', text: '你习惯把情绪藏在心里。压抑能让场面保持平静，但情绪并没有消失：长期压抑与更多的负面情绪、更低的亲密感有关，身体也会默默承担压力。' }
        : hiR && hiS ? { name: '全面掌控型', icon: 'shield', text: '你既会换角度思考，也习惯控制情绪的表达。你在情绪管理上投入了很多精力，或许可以试着在安全的人面前多放松一点。' }
          : { name: '顺其自然型', icon: 'wind', text: '你较少刻意调节情绪，既不太压抑，也不常重新解读。情绪来了就感受它——这很真实，但遇到强烈情绪时，可以试试"换个角度"的技巧。' };
    const pr = round(((m.R - 1) / 6) * 100), ps = round(((m.S - 1) / 6) * 100);
    return {
      headline: ty.name, title: `重评 ${m.R.toFixed(1)} · 抑制 ${m.S.toFixed(1)}`, icon: ty.icon, summary: ty.text, line: `情绪调节 · ${ty.name}`,
      viz: [
        { type: 'quadrant', x: pr, y: ps, xLabel: '认知重评 →', yLabel: '表达抑制 →', labels: ['内敛压抑', '全面掌控', '顺其自然', '灵活重评'] },
        { type: 'bars', rows: [{ label: '认知重评', value: Number(m.R.toFixed(1)), max: 7, note: '平均约 4.6' }, { label: '表达抑制', value: Number(m.S.toFixed(1)), max: 7, note: '平均约 3.4' }] },
      ],
      sections: [
        { title: ty.name, text: ty.text },
        { title: '练习认知重评', list: ['问自己：一年后回头看，这件事还有多重要？', '想想还有没有其他解释：TA 没回消息，可能只是在忙', '如果是朋友遇到这件事，我会怎么劝 TA？', '找到这件事里"可以学到什么"'] },
        { title: '关于压抑', text: '压抑情绪的表达，并不会减少内心的感受，反而会让心率和血压升高，也会让身边的人觉得和你有距离。找一个安全的人、一本日记，让情绪有个出口。' },
      ],
    };
  },
};

// ---------- 感恩倾向 GQ-6 ----------
const GQ_BANDS = [
  { max: 30, label: '感恩待发掘', icon: 'sprout', color: '#ff9500', text: '你目前较少留意生活中值得感激的部分。也许最近压力较大，注意力都被问题占据了。感恩是一种可以培养的"注意力习惯"。' },
  { max: 38, label: '常怀感恩', icon: 'gift', color: '#30b0c7', text: '你能感受到生活中很多值得感激的人和事，这和大多数人相近。' },
  { max: 42, label: '感恩之心', icon: 'heart', color: '#34c759', text: '你有很强的感恩倾向，常常注意到生活中的美好和他人的善意。研究发现，这与更高的幸福感、更好的睡眠和更亲密的关系相关。' },
];

export const gratitude = {
  id: 'gratitude', name: '感恩倾向量表 GQ-6', short: '感恩倾向', icon: 'gift', tint: '#ffb340', category: 'growth', minutes: 1, shareable: true,
  intro: '感恩是积极心理学研究最多的品格优势之一。GQ-6 由 McCullough 等人编制，测量的是你在日常生活中体验感恩的频率、强度和广度。共 6 题。',
  prompt: '你在多大程度上同意这句话？', scale: AGREE7, scaleStyle: 'list',
  reference: 'McCullough, M. E., Emmons, R. A., & Tsang, J. (2002). The grateful disposition. JPSP. 量表可免费用于研究和非商业用途，中文为意译。',
  items: [
    { t: '生活中有很多值得我感恩的东西。', k: 'G' },
    { t: '如果要列出所有我感激的事，那会是一份很长的清单。', k: 'G' },
    { t: '环顾这个世界，我看不到太多值得感激的东西。', k: 'G', r: 1 },
    { t: '我对形形色色的人都心怀感激。', k: 'G' },
    { t: '随着年龄增长，我越来越懂得欣赏生活中的人、事和经历。', k: 'G' },
    { t: '往往要过很久，我才会对某人或某事心生感激。', k: 'G', r: 1 },
  ],
  score(answers) {
    const s = total(this, answers);
    const b = band(s, GQ_BANDS);
    return {
      headline: b.label, title: `感恩指数 ${s}/42`, icon: b.icon, summary: b.text, line: `感恩 ${s}/42 · ${b.label}`,
      viz: [{ type: 'gauge', value: s, max: 42, color: b.color, label: b.label }],
      sections: [
        { title: '关于你', text: b.text },
        { title: '感恩练习', list: ['三件好事：每晚写下今天发生的三件好事，以及它们为什么会发生', '感恩拜访：给一个曾经帮助过你、却没好好感谢过的人写一封信', '把"不得不"换成"有机会"：我不得不上班 → 我有机会做这份工作'] },
        { title: '研究发现', text: 'Emmons 和 McCullough 在 2003 年的实验中让参与者每周写下感恩的事，10 周后他们比对照组更乐观、运动更多、身体不适也更少。' },
      ],
    };
  },
};

// ---------- 冒名顶替综合征（原创） ----------
const IMP_BANDS = [
  { max: 40, label: '自我认可稳定', icon: 'shield-check', color: '#34c759', text: '你基本能把成功归因于自己的能力和努力，较少担心被"识破"。' },
  { max: 60, label: '偶有冒名感', icon: 'mask', color: '#30b0c7', text: '在新环境或高压时刻，你偶尔会怀疑自己是否真的够格。这非常普遍——约 70% 的人一生中都有过这种体验。' },
  { max: 100, label: '冒名顶替感强烈', icon: 'mask', color: '#ff9500', text: '你常常觉得自己的成就"名不副实"，担心有一天会被人发现自己没那么厉害。讽刺的是，这种感受在能力强、成就高的人中尤其常见。' },
];

export const imposter = {
  id: 'imposter', name: '冒名顶替综合征测试', short: '冒名顶替感', icon: 'mask', tint: '#8e8e93', category: 'growth', minutes: 2, shareable: true,
  intro: '明明做得不错，却总觉得是运气好、是别人高估了自己，害怕有一天被"拆穿"？这种体验被称为"冒名顶替现象"（Impostor Phenomenon），由心理学家 Pauline Clance 于 1978 年首次提出。',
  prompt: '这句话在多大程度上符合你？', scale: AGREE5, scaleStyle: 'agree',
  reference: '题目为原创。理论依据：Clance, P. R., & Imes, S. A. (1978). The imposter phenomenon in high achieving women.',
  items: [
    { t: '我担心别人会发现我其实没有他们以为的那么能干。', k: 'F' },
    { t: '我取得的成绩，很多是因为运气好或时机对了。', k: 'L' },
    { t: '被人夸奖时，我会觉得不自在，甚至想反驳。', k: 'D' },
    { t: '接手新任务前，我常担心这次会暴露自己的不足。', k: 'F' },
    { t: '我觉得自己能走到今天，是因为别人看走了眼。', k: 'L' },
    { t: '我很难把自己的成功归功于自己的能力。', k: 'D' },
    { t: '即使准备得很充分，我仍然觉得自己是在"装"。', k: 'F' },
    { t: '我会把自己的成功和周围更优秀的人比较，然后觉得不值一提。', k: 'D' },
    { t: '如果这次做得好，我会担心下一次没法再做到。', k: 'F' },
    { t: '我常常觉得身边的人都比我聪明、比我有能力。', k: 'L' },
    { t: '我能坦然地接受别人对我的认可。', k: 'D', r: 1 },
    { t: '我相信自己的成就是靠实力取得的。', k: 'L', r: 1 },
  ],
  score(answers) {
    const m = dimMeans(this, answers);
    const p = { F: pct5(m.F), L: pct5(m.L), D: pct5(m.D) };
    const all = round((p.F + p.L + p.D) / 3);
    const b = band(all, IMP_BANDS);
    return {
      headline: b.label, title: `冒名指数 ${all}%`, icon: b.icon, summary: b.text, line: `冒名顶替 ${all}% · ${b.label}`,
      viz: [
        { type: 'gauge', value: all, max: 100, color: b.color, label: '冒名指数' },
        { type: 'bars', rows: [{ label: '害怕被识破', value: p.F, max: 100 }, { label: '归因于运气', value: p.L, max: 100 }, { label: '贬低自身成就', value: p.D, max: 100 }] },
      ],
      sections: [
        { title: '关于你', text: b.text },
        { title: '和冒名感共处', list: ['建一个"证据文件夹"：存下别人的感谢、好评和你完成的作品', '区分感受和事实："我觉得自己不够格"不等于"我不够格"', '和信任的人聊聊，你会惊讶地发现很多人也有同样的感受', '允许自己"还在学习"：没有人是什么都懂才开始的'] },
        { title: '你并不孤单', text: '据报道，许多公认的成功人士都曾坦言有过这种"自己是冒牌货"的感觉。冒名感常常意味着你在挑战舒适区。' },
      ],
    };
  },
};

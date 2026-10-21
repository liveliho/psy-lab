import { FREQ4, FREQ5, AGREE4, total, band } from './common.js';

const C = { green: '#34c759', yellow: '#ffcc00', orange: '#ff9500', red: '#ff3b30', deep: '#c0392b' };

const SEEK_HELP = '如果这些困扰已经持续了两周以上，并影响到学习、工作或人际关系，建议尽早联系专业的心理咨询师或精神科医生。寻求帮助是勇敢的表现。';

const CRISIS_ALERT = {
  level: 'danger',
  title: '你并不孤单',
  text: '你提到最近有过伤害自己或"不如死掉"的念头。请尽快和信任的人聊聊，或立即拨打心理援助热线 12356 / 400-161-9995。如有紧急危险，请拨打 120 或 110。',
  link: '#/help',
};

// ---------- PHQ-9 ----------
const phqItems = [
  '做事时提不起劲或没有兴趣',
  '感到心情低落、沮丧或绝望',
  '入睡困难、睡不安稳，或睡得过多',
  '感觉疲倦或没有活力',
  '食欲不振或吃得太多',
  '觉得自己很糟，或觉得自己很失败，让自己或家人失望',
  '难以集中注意力，例如阅读或看视频时',
  '动作或说话速度缓慢到别人能察觉；或正好相反，烦躁、坐立不安',
  '有不如死掉，或用某种方式伤害自己的念头',
].map((t) => ({ t, k: 'D' }));

const PHQ_BANDS = [
  { max: 4, label: '无或极轻微', color: C.green, text: '你目前的情绪状态总体良好。继续保持规律作息、运动和社交联结。' },
  { max: 9, label: '轻度', color: C.yellow, text: '你可能有一些轻度的抑郁情绪。可以尝试增加运动、保证睡眠、多与朋友交流，并在两周后再次自评观察变化。' },
  { max: 14, label: '中度', color: C.orange, text: '你的抑郁症状达到中等程度。建议认真关注自己的状态，考虑与心理咨询师沟通。' },
  { max: 19, label: '中重度', color: C.red, text: '你的抑郁症状比较明显。强烈建议尽快寻求专业心理或精神科评估。' },
  { max: 27, label: '重度', color: C.deep, text: '你的抑郁症状较重。请尽快到正规医院精神心理科就诊，同时告诉身边信任的人你的状况。' },
];

export const phq9 = {
  id: 'phq9',
  name: '抑郁症状自评 PHQ-9',
  short: 'PHQ-9 抑郁',
  icon: 'cloud-rain',
  tint: '#007aff',
  category: 'mood',
  minutes: 2,
  sensitive: true,
  intro: 'PHQ-9（患者健康问卷）是全球基层医疗中最常用的抑郁筛查工具之一。请回想过去两周的情况作答。结果仅供自我了解，不能替代医生诊断。',
  prompt: '过去两周里，你有多少时间受到以下问题困扰？',
  scale: FREQ4,
  scaleStyle: 'list',
  reference: 'Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001). The PHQ-9. J Gen Intern Med. 量表可免费使用。',
  items: phqItems,
  score(answers) {
    const s = total(this, answers);
    const b = band(s, PHQ_BANDS);
    const risk = answers[8] > 0;
    return {
      headline: `${s} 分`,
      title: `${b.label}抑郁症状`,
      icon: s <= 4 ? 'sun' : s <= 14 ? 'cloud-sun' : 'cloud-rain',
      summary: b.text,
      line: `PHQ-9 ${s} 分 · ${b.label}`,
      alert: risk ? CRISIS_ALERT : undefined,
      viz: [{ type: 'gauge', value: s, max: 27, color: b.color, label: b.label, bands: PHQ_BANDS }],
      sections: [
        { title: '结果说明', text: b.text },
        { title: '分数参考', list: ['0–4：无或极轻微', '5–9：轻度', '10–14：中度', '15–19：中重度', '20–27：重度'] },
        { title: '可以试试', list: ['每天至少 20 分钟户外活动或散步', '固定起床时间，哪怕前一晚没睡好', '把一件很小的事做完，给自己一点掌控感', '在「工具」页记录每天的心情'] },
        ...(s >= 10 ? [{ title: '寻求帮助', text: SEEK_HELP }] : []),
      ],
    };
  },
};

// ---------- GAD-7 ----------
const gadItems = [
  '感到紧张、焦虑或烦躁',
  '无法停止或控制担忧',
  '对各种各样的事情担忧过多',
  '很难放松下来',
  '心神不宁，以至于难以静坐',
  '变得容易烦恼或急躁',
  '感到好像有什么可怕的事情会发生',
].map((t) => ({ t, k: 'A' }));

const GAD_BANDS = [
  { max: 4, label: '极轻微', color: C.green, text: '你目前的焦虑水平很低，状态不错。' },
  { max: 9, label: '轻度', color: C.yellow, text: '你有轻度的焦虑。适度的焦虑很正常，可以试试呼吸练习和规律运动来缓解。' },
  { max: 14, label: '中度', color: C.orange, text: '你的焦虑达到中等程度，可能已经影响到部分生活。建议学习放松技巧，并考虑寻求专业支持。' },
  { max: 21, label: '重度', color: C.red, text: '你的焦虑程度较高。建议尽快与心理咨询师或精神科医生沟通。' },
];

export const gad7 = {
  id: 'gad7',
  name: '焦虑症状自评 GAD-7',
  short: 'GAD-7 焦虑',
  icon: 'wind',
  tint: '#ff9500',
  category: 'mood',
  minutes: 2,
  sensitive: true,
  intro: 'GAD-7（广泛性焦虑量表）是筛查焦虑症状最常用的工具之一。请回想过去两周的情况作答。结果仅供参考，不能替代医生诊断。',
  prompt: '过去两周里，你有多少时间受到以下问题困扰？',
  scale: FREQ4,
  scaleStyle: 'list',
  reference: 'Spitzer, R. L., Kroenke, K., Williams, J. B., & Löwe, B. (2006). A brief measure for assessing generalized anxiety disorder: the GAD-7. 量表可免费使用。',
  items: gadItems,
  score(answers) {
    const s = total(this, answers);
    const b = band(s, GAD_BANDS);
    return {
      headline: `${s} 分`,
      title: `${b.label}焦虑`,
      icon: s <= 4 ? 'leaf' : s <= 9 ? 'wind' : 'alert',
      summary: b.text,
      line: `GAD-7 ${s} 分 · ${b.label}`,
      viz: [{ type: 'gauge', value: s, max: 21, color: b.color, label: b.label, bands: GAD_BANDS }],
      sections: [
        { title: '结果说明', text: b.text },
        { title: '分数参考', list: ['0–4：极轻微', '5–9：轻度', '10–14：中度', '15–21：重度'] },
        { title: '可以试试', list: ['「工具」中的 4-7-8 呼吸法，几分钟就能让身体平静', '5-4-3-2-1 着陆练习，把注意力拉回当下', '给担忧设定"专属时间"，其余时间先放一放', '减少咖啡因摄入，保证睡眠'] },
        ...(s >= 10 ? [{ title: '寻求帮助', text: SEEK_HELP }] : []),
      ],
    };
  },
};

// ---------- PSS-10 ----------
const pssItems = [
  { t: '因为一些意料之外的事情而感到心烦意乱', k: 'S' },
  { t: '感觉无法掌控自己生活中重要的事情', k: 'S' },
  { t: '感到紧张不安和压力很大', k: 'S' },
  { t: '对自己处理个人问题的能力感到有信心', k: 'S', r: 1 },
  { t: '感到事情正按照你的意愿发展', k: 'S', r: 1 },
  { t: '发现自己无法应付所有必须做的事情', k: 'S' },
  { t: '能够控制生活中让你烦躁的事情', k: 'S', r: 1 },
  { t: '觉得自己对各种事情都游刃有余', k: 'S', r: 1 },
  { t: '因为超出自己控制的事情而生气', k: 'S' },
  { t: '感到困难堆积如山，以至于无法克服', k: 'S' },
];
const PSS_BANDS = [
  { max: 13, label: '低压力', color: C.green, text: '你目前感受到的压力较低，应对资源充足。' },
  { max: 26, label: '中等压力', color: C.orange, text: '你正承受着中等程度的压力，这在现代生活中很常见。注意劳逸结合，别让压力持续累积。' },
  { max: 40, label: '高压力', color: C.red, text: '你感受到的压力很大。试着梳理压力来源、寻求支持，必要时请专业人士帮忙。' },
];

export const pss = {
  id: 'pss',
  name: '压力知觉量表 PSS-10',
  short: '压力水平',
  icon: 'gauge',
  tint: '#af52de',
  category: 'mood',
  minutes: 2,
  sensitive: true,
  intro: 'PSS-10（知觉压力量表）测量的是你在多大程度上觉得生活"不可预测、不可控、超负荷"。请回想过去一个月的情况。',
  prompt: '在过去一个月里，你有多常——',
  scale: FREQ5,
  scaleStyle: 'list',
  reference: 'Cohen, S., Kamarck, T., & Mermelstein, R. (1983). A global measure of perceived stress. 用于非商业用途。',
  items: pssItems,
  score(answers) {
    const s = total(this, answers);
    const b = band(s, PSS_BANDS);
    return {
      headline: `${s} 分`,
      title: b.label,
      icon: s <= 13 ? 'leaf' : s <= 26 ? 'gauge' : 'flame',
      summary: b.text,
      line: `PSS ${s} 分 · ${b.label}`,
      viz: [{ type: 'gauge', value: s, max: 40, color: b.color, label: b.label, bands: PSS_BANDS }],
      sections: [
        { title: '结果说明', text: b.text },
        { title: '减压小方法', list: ['列出让你有压力的事，区分"能控制"与"不能控制"的部分', '每天留 10 分钟完全属于自己的时间', '运动是最被低估的减压方式', '和朋友聊聊，说出来本身就有帮助'] },
      ],
    };
  },
};

// ---------- RSES ----------
const rsesItems = [
  { t: '总的来说，我对自己是满意的。', k: 'SE' },
  { t: '有时我觉得自己一无是处。', k: 'SE', r: 1 },
  { t: '我觉得自己有不少优点。', k: 'SE' },
  { t: '我能像大多数人一样把事情做好。', k: 'SE' },
  { t: '我觉得自己没有太多值得骄傲的地方。', k: 'SE', r: 1 },
  { t: '有时我确实感到自己没用。', k: 'SE', r: 1 },
  { t: '我觉得自己是个有价值的人，至少与别人处在同一水平。', k: 'SE' },
  { t: '我希望自己能更多地尊重自己。', k: 'SE', r: 1 },
  { t: '总而言之，我倾向于觉得自己是个失败者。', k: 'SE', r: 1 },
  { t: '我对自己持肯定的态度。', k: 'SE' },
];
const RSES_BANDS = [
  { max: 14, label: '自尊偏低', color: C.orange, text: '你对自己的评价偏低。请记住：你的价值不取决于成绩或他人的评价。试着每天记录一件自己做得不错的小事。' },
  { max: 25, label: '自尊正常', color: C.green, text: '你的自尊水平处于健康范围，能够客观地看待自己的优点与不足。' },
  { max: 30, label: '自尊较高', color: '#30b0c7', text: '你对自己有积极稳定的认同感，这是心理韧性的重要基础。' },
];

export const rses = {
  id: 'rses',
  name: '罗森伯格自尊量表',
  short: '自尊水平',
  icon: 'mirror',
  tint: '#30b0c7',
  category: 'mood',
  minutes: 2,
  intro: '罗森伯格自尊量表（RSES）是心理学中使用最广泛的自尊测量工具，评估你对自己整体价值的感受。共 10 题。',
  prompt: '你在多大程度上同意这句话？',
  scale: AGREE4,
  scaleStyle: 'list',
  reference: 'Rosenberg, M. (1965). Society and the Adolescent Self-Image. 量表可免费使用。',
  items: rsesItems,
  score(answers) {
    const s = total(this, answers);
    const b = band(s, RSES_BANDS);
    return {
      headline: `${s} 分`,
      title: b.label,
      icon: s <= 14 ? 'sprout' : s <= 25 ? 'leaf' : 'star',
      summary: b.text,
      line: `自尊 ${s}/30 · ${b.label}`,
      viz: [{ type: 'gauge', value: s, max: 30, color: b.color, label: b.label, bands: RSES_BANDS }],
      sections: [
        { title: '结果说明', text: b.text },
        { title: '提升自我认同', list: ['像对待好朋友一样对待自己（自我关怀）', '少和别人的"精选集"比较', '设定小而可达成的目标，积累成功体验', '留意内心的批评声音，并温和地反驳它'] },
      ],
    };
  },
};

// ---------- ASRS v1.1 成人 ADHD 自填量表（A 部分） ----------
const ASRS_SCALE = [
  { v: 0, l: '从不' },
  { v: 1, l: '很少' },
  { v: 2, l: '有时' },
  { v: 3, l: '经常' },
  { v: 4, l: '非常频繁' },
];
const asrsItems = [
  { t: '当一件事最有挑战的部分完成后，你有多常难以把剩下的细节收尾？', k: 'I', cut: 2 },
  { t: '当需要做一件需要条理的事情时，你有多常难以把它安排得井井有条？', k: 'I', cut: 2 },
  { t: '你有多常难以记住约会或必须要做的事情？', k: 'I', cut: 2 },
  { t: '当遇到一件需要花很多心思的任务时，你有多常回避或拖延开始？', k: 'I', cut: 3 },
  { t: '当需要长时间坐着时，你有多常手脚不停地动或扭来扭去？', k: 'H', cut: 3 },
  { t: '你有多常像被马达驱动一样，感到过度活跃、停不下来？', k: 'H', cut: 3 },
];

export const asrs = {
  id: 'asrs',
  name: '成人 ADHD 自评 ASRS',
  short: 'ADHD 筛查',
  icon: 'zap',
  tint: '#ff9f0a',
  category: 'mood',
  minutes: 1,
  sensitive: true,
  intro: '注意缺陷多动障碍（ADHD）并不只发生在儿童身上，约 2.5%–3% 的成年人也受其影响，表现为注意力难以维持、做事缺乏条理、坐立不安等。ASRS v1.1 是世界卫生组织与哈佛大学合作编制的筛查工具，其中 A 部分的 6 题筛查效果最好。请回想过去 6 个月的情况。',
  prompt: '过去 6 个月里——',
  scale: ASRS_SCALE,
  scaleStyle: 'list',
  reference: 'Kessler, R. C. et al. (2005). The World Health Organization Adult ADHD Self-Report Scale (ASRS). Psychol Med. 中文为意译。筛查阳性不等于确诊，ADHD 需由精神科医生综合评估。',
  items: asrsItems,
  score(answers) {
    const hits = asrsItems.filter((it, i) => answers[i] >= it.cut).length;
    const sum = total(this, answers);
    const pos = hits >= 4;
    const inatt = answers.slice(0, 4).reduce((a, v) => a + v, 0), hyper = answers.slice(4).reduce((a, v) => a + v, 0);
    const text = pos
      ? '你的回答中有 ' + hits + ' 项达到了筛查标准，提示你的表现与成人 ADHD 的特征较为一致。这不是诊断——焦虑、抑郁、睡眠不足也可能带来类似的表现。如果这些困扰长期影响到你的学习、工作或生活，建议到精神科或心理科做进一步评估。'
      : hits >= 2
        ? '你有 ' + hits + ' 项达到筛查标准，尚未达到阳性界限。每个人都会有分心、拖延的时候，但如果它们明显影响了生活，也值得关注。'
        : '你的回答没有显示明显的 ADHD 特征。偶尔分心、拖延是正常现象。';
    return {
      headline: pos ? '筛查阳性' : '筛查阴性',
      title: hits + ' / 6 项达到筛查标准',
      icon: pos ? 'alert' : 'check',
      summary: text,
      line: 'ASRS ' + hits + '/6 · ' + (pos ? '筛查阳性' : '筛查阴性'),
      viz: [
        { type: 'gauge', value: hits, max: 6, color: pos ? C.orange : hits >= 2 ? C.yellow : C.green, label: pos ? '筛查阳性' : '筛查阴性' },
        { type: 'bars', rows: [{ label: '注意力与条理', value: inatt, max: 16 }, { label: '多动与坐立不安', value: hyper, max: 8 }, { label: '总分', value: sum, max: 24 }] },
      ],
      sections: [
        { title: '结果说明', text },
        { title: '计分方式', text: '前 3 题选择"有时"及以上、后 3 题选择"经常"及以上即计为 1 项。6 项中有 4 项及以上时，筛查结果为阳性。' },
        { title: '无论结果如何，这些方法都有帮助', list: ['把大任务拆成 15 分钟就能完成的小步骤', '使用外部提醒：日历、闹钟、便利贴，而不是依赖记忆', '把手机放远一点，用番茄钟保护专注时间', '规律运动对注意力的改善效果被大量研究证实'] },
      ],
    };
  },
};

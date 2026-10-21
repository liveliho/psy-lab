// 生活状态类：幸福感、生活满意度、睡眠、作息类型、手机依赖。
// 中文题目为本站意译；量表作者允许非商业免费使用。
import { AGREE6, AGREE7, total, band, clamp, round } from './common.js';

const C = { green: '#34c759', teal: '#30b0c7', yellow: '#ffcc00', orange: '#ff9500', red: '#ff3b30' };

// ---------- WHO-5 幸福感指数 ----------
const WHO_SCALE = [
  { v: 5, l: '所有时间' },
  { v: 4, l: '大部分时间' },
  { v: 3, l: '一半以上的时间' },
  { v: 2, l: '不到一半的时间' },
  { v: 1, l: '偶尔' },
  { v: 0, l: '从未有过' },
];
const WHO_BANDS = [
  { max: 28, label: '幸福感很低', color: C.red, text: '你最近的状态可能相当低落。这个分数常提示可能存在抑郁情绪，建议做一下 PHQ-9 自评，或与专业人士聊聊。' },
  { max: 50, label: '幸福感偏低', color: C.orange, text: '你最近的幸福感偏低，可能有些疲惫或提不起劲。值得留意一下自己的状态，必要时做个 PHQ-9 进一步了解。' },
  { max: 75, label: '幸福感良好', color: C.teal, text: '你的整体幸福感处于不错的水平，生活中有让你放松和感兴趣的部分。' },
  { max: 100, label: '幸福感很高', color: C.green, text: '你最近状态很好：心情愉快、精力充沛，对生活保持着兴趣。' },
];

export const who5 = {
  id: 'who5', name: 'WHO-5 幸福感指数', short: 'WHO-5 幸福感', icon: 'smile', tint: '#34c759', category: 'life', minutes: 1,
  intro: 'WHO-5 是世界卫生组织推荐的幸福感简短量表，只有 5 题，却是全球使用最广泛的心理健康"体温计"之一。它关注的不是有没有问题，而是你过得好不好。请回想过去两周。',
  prompt: '过去两周里——', scale: WHO_SCALE, scaleStyle: 'list',
  reference: 'World Health Organization (1998); Topp, C. W. et al. (2015). The WHO-5 Well-Being Index: a systematic review. 量表可免费使用，中文为意译。',
  items: [
    '我感到快乐、心情舒畅',
    '我感到平静和放松',
    '我感到精力充沛、有活力',
    '我早上醒来时感到神清气爽',
    '我的日常生活中充满了让我感兴趣的事情',
  ].map((t) => ({ t, k: 'W' })),
  score(answers) {
    const s = total(this, answers) * 4;
    const b = band(s, WHO_BANDS);
    return {
      headline: `${s} 分`, title: b.label, icon: s > 50 ? 'sun' : s > 28 ? 'cloud-sun' : 'cloud-rain',
      summary: b.text, line: `WHO-5 ${s}/100 · ${b.label}`,
      viz: [{ type: 'gauge', value: s, max: 100, color: b.color, label: b.label }],
      sections: [
        { title: '结果说明', text: b.text },
        { title: '分数参考', list: ['0–28：幸福感很低，可能存在抑郁情绪', '29–50：幸福感偏低', '51–75：良好', '76–100：很高', '两次测量相差 10 分以上，代表状态有明显变化'] },
        { title: '提升幸福感的小事', list: ['每天晒 15 分钟太阳', '和一个喜欢的人好好吃顿饭', '做一件"没有用但开心"的事', '睡前写下今天的三件好事'] },
      ],
    };
  },
};

// ---------- SWLS 生活满意度 ----------
const SWLS_BANDS = [
  { max: 9, label: '非常不满意', color: C.red, text: '你对目前的生活非常不满意。这可能和最近发生的事有关，也可能是长期积累的结果。如果这种感受持续很久，和专业人士聊聊会有帮助。' },
  { max: 14, label: '不满意', color: C.orange, text: '你对生活的多个方面感到不满意。试着找出最让你在意的一两个领域，从小的改变开始。' },
  { max: 19, label: '略低于平均', color: C.yellow, text: '你对生活有些不满意，可能某些领域明显拖了后腿。这很常见，也值得认真看看是哪里需要调整。' },
  { max: 20, label: '中立', color: C.teal, text: '你对生活的满意与不满意大致相当。' },
  { max: 25, label: '比较满意', color: C.teal, text: '你对生活总体比较满意，这是大多数人所处的范围。有些方面还可以更好，但整体在正轨上。' },
  { max: 30, label: '满意', color: C.green, text: '你喜欢自己的生活，觉得它在大多数方面都不错。' },
  { max: 35, label: '非常满意', color: C.green, text: '你非常热爱自己的生活。各方面都运转良好，这是一种难得的状态。' },
];

export const swls = {
  id: 'swls', name: '生活满意度量表 SWLS', short: '生活满意度', icon: 'sun', tint: '#ff9f0a', category: 'life', minutes: 1, shareable: true,
  intro: '生活满意度量表由积极心理学家 Ed Diener 编制，是测量"主观幸福感"认知部分的经典工具：不问你开不开心，而是问你如何评价自己的整体生活。共 5 题。',
  prompt: '你在多大程度上同意这句话？', scale: AGREE7, scaleStyle: 'list',
  reference: 'Diener, E., Emmons, R. A., Larsen, R. J., & Griffin, S. (1985). The Satisfaction With Life Scale. 量表可免费使用，中文为意译。',
  items: [
    '我的生活在大多数方面都接近我的理想。',
    '我的生活状况非常好。',
    '我对自己的生活感到满意。',
    '到目前为止，我已经得到了生活中我认为重要的东西。',
    '如果能重新活一次，我几乎什么都不想改变。',
  ].map((t) => ({ t, k: 'L' })),
  score(answers) {
    const s = total(this, answers);
    const b = band(s, SWLS_BANDS);
    return {
      headline: `${s} 分`, title: b.label, icon: s >= 26 ? 'sun' : s >= 20 ? 'cloud-sun' : 'cloud',
      summary: b.text, line: `生活满意度 ${s}/35 · ${b.label}`,
      viz: [
        { type: 'gauge', value: s, max: 35, color: b.color, label: b.label },
        { type: 'bars', rows: ['接近理想', '生活状况', '整体满意', '已获所需', '不想改变'].map((label, i) => ({ label, value: answers[i], max: 7 })) },
      ],
      sections: [
        { title: '结果说明', text: b.text },
        { title: '分数参考', list: ['5–9：非常不满意', '10–14：不满意', '15–19：略低于平均', '20：中立', '21–25：比较满意', '26–30：满意', '31–35：非常满意'] },
        { title: '满意度从哪里来？', text: 'Diener 的研究发现，生活满意度最稳定的来源是亲密关系、有意义的工作和健康，而收入超过基本需求后影响会迅速变小。' },
      ],
    };
  },
};

// ---------- AIS 阿森斯失眠量表 ----------
const lv = (...l) => l.map((x, v) => ({ v, l: x }));
const AIS_BANDS = [
  { max: 3, label: '睡眠良好', color: C.green, text: '你的睡眠状况不错，没有明显的失眠迹象。' },
  { max: 6, label: '可疑失眠', color: C.yellow, text: '你的睡眠有一些问题，处于"可疑失眠"范围。调整作息和睡眠习惯通常就能明显改善。' },
  { max: 24, label: '失眠', color: C.red, text: '你的得分提示存在失眠。如果已经持续一个月以上并影响白天的状态，建议到睡眠门诊或精神心理科咨询。失眠认知行为治疗（CBT-I）是首选的非药物疗法。' },
];

export const ais = {
  id: 'ais', name: '阿森斯失眠量表 AIS', short: '睡眠质量', icon: 'bed', tint: '#5e5ce6', category: 'life', minutes: 2,
  intro: '阿森斯失眠量表（AIS）是国际通用的失眠自评工具，从入睡、夜醒、早醒、睡眠时长、睡眠质量和白天状态八个方面评估。如果过去一个月里，下列情况每周至少出现 3 次，请选择相应选项。',
  prompt: '过去一个月里——', scale: lv('没问题', '轻微', '显著', '严重'), scaleStyle: 'list',
  reference: 'Soldatos, C. R., Dikeos, D. G., & Paparrigopoulos, T. J. (2000). Athens Insomnia Scale. J Psychosom Res. 中文为意译。',
  items: [
    { t: '入睡时间（关灯后到睡着）', k: 'N', opts: lv('没问题', '轻微延迟', '显著延迟', '严重延迟或几乎没睡') },
    { t: '夜间醒来', k: 'N', opts: lv('没问题', '有一点影响', '影响明显', '影响严重或几乎没睡') },
    { t: '比期望的时间早醒', k: 'N', opts: lv('没问题', '稍微早一点', '明显提早', '严重提早或几乎没睡') },
    { t: '总睡眠时间', k: 'N', opts: lv('足够', '稍有不足', '明显不足', '严重不足或几乎没睡') },
    { t: '总体睡眠质量（不论睡了多久）', k: 'N', opts: lv('满意', '稍不满意', '明显不满意', '非常不满意或几乎没睡') },
    { t: '白天的情绪', k: 'D', opts: lv('正常', '稍显低落', '明显低落', '非常低落') },
    { t: '白天的身体与精神状态（体力、记忆、注意力）', k: 'D', opts: lv('足够', '稍受影响', '明显受影响', '严重受影响') },
    { t: '白天犯困', k: 'D', opts: lv('不困', '有点困', '明显犯困', '非常困') },
  ],
  score(answers) {
    const s = total(this, answers);
    const b = band(s, AIS_BANDS);
    const night = answers.slice(0, 5).reduce((a, v) => a + v, 0), day = answers.slice(5).reduce((a, v) => a + v, 0);
    const worst = ['入睡困难', '夜间易醒', '早醒', '睡眠不足', '睡眠质量差'][answers.slice(0, 5).indexOf(Math.max(...answers.slice(0, 5)))];
    return {
      headline: `${s} 分`, title: b.label, icon: s <= 3 ? 'moon' : s <= 6 ? 'moonstar' : 'bed',
      summary: b.text, line: `AIS ${s}/24 · ${b.label}`,
      viz: [
        { type: 'gauge', value: s, max: 24, color: b.color, label: b.label },
        { type: 'bars', rows: [{ label: '夜间睡眠问题', value: night, max: 15 }, { label: '白天受影响程度', value: day, max: 9 }] },
      ],
      sections: [
        { title: '结果说明', text: b.text + (s > 3 && Math.max(...answers.slice(0, 5)) > 0 ? `你最突出的问题是：${worst}。` : '') },
        { title: '分数参考', list: ['0–3：无睡眠障碍', '4–6：可疑失眠', '7 分及以上：失眠'] },
        { title: '睡眠卫生小贴士', list: ['每天同一时间起床，周末也一样——这是最重要的一条', '床只用来睡觉：躺 20 分钟睡不着就起来，困了再回去', '下午 2 点后不喝咖啡和浓茶', '睡前 1 小时远离手机，把灯光调暗', '卧室保持凉爽、黑暗、安静'] },
      ],
    };
  },
};

// ---------- rMEQ 早鸟还是夜猫子 ----------
const CHRONO = [
  { max: 7, label: '绝对夜猫子', icon: 'moonstar', color: '#5e5ce6', text: '你是典型的夜晚型：早上像没开机，越晚越清醒，最佳状态出现在晚上甚至深夜。' },
  { max: 11, label: '偏夜猫子', icon: 'moon', color: '#7d7aff', text: '你偏向夜晚型：早起有些痛苦，下午到晚上精力最好。' },
  { max: 17, label: '中间型', icon: 'cloud-sun', color: '#30b0c7', text: '你属于中间型（约占人群的六成）：没有特别强烈的早晚偏好，对作息调整的适应力也比较好。' },
  { max: 21, label: '偏早鸟', icon: 'sunrise', color: '#ff9f0a', text: '你偏向早晨型：早上头脑清醒、效率高，晚上比较容易困。' },
  { max: 25, label: '绝对早鸟', icon: 'sun', color: '#ff9500', text: '你是典型的早晨型：天亮就醒、上午效率爆表，熬夜对你来说很痛苦。' },
];

export const chrono = {
  id: 'chrono', name: '早鸟还是夜猫子？', short: '作息类型', icon: 'sunrise', tint: '#ff9f0a', category: 'life', minutes: 1, shareable: true,
  intro: '每个人的生物钟都不一样，这被称为"时间型"（chronotype），很大程度上由基因决定。这份测试改编自经典的简版晨型-夜型问卷（rMEQ），只有 5 题。想象你可以完全自由安排时间来作答。',
  prompt: '如果完全按自己的喜好安排——', scaleStyle: 'list',
  reference: 'Adan, A., & Almirall, H. (1991). Horne & Östberg Morningness-Eveningness Questionnaire: a reduced scale. 中文为意译。',
  items: [
    { t: '你会选择几点起床？', k: 'C', opts: [{ v: 5, l: '5:00–6:30' }, { v: 4, l: '6:30–7:45' }, { v: 3, l: '7:45–9:45' }, { v: 2, l: '9:45–11:00' }, { v: 1, l: '11:00 以后' }] },
    { t: '起床后的头半小时，你感觉怎么样？', k: 'C', opts: [{ v: 1, l: '非常困倦' }, { v: 2, l: '比较困倦' }, { v: 3, l: '比较清醒' }, { v: 4, l: '非常清醒' }] },
    { t: '晚上大约几点你会觉得累、想睡觉？', k: 'C', opts: [{ v: 5, l: '20:00–21:00' }, { v: 4, l: '21:00–22:15' }, { v: 3, l: '22:15–00:45' }, { v: 2, l: '00:45–02:00' }, { v: 1, l: '02:00 以后' }] },
    { t: '一天中你通常在哪个时段状态最好？', k: 'C', opts: [{ v: 5, l: '5:00–8:00' }, { v: 4, l: '8:00–10:00' }, { v: 3, l: '10:00–17:00' }, { v: 2, l: '17:00–22:00' }, { v: 1, l: '22:00–5:00' }] },
    { t: '你觉得自己是哪种类型？', k: 'C', opts: [{ v: 6, l: '绝对的早晨型' }, { v: 4, l: '偏早晨型' }, { v: 2, l: '偏夜晚型' }, { v: 0, l: '绝对的夜晚型' }] },
  ],
  score(answers) {
    const s = total(this, answers);
    const b = band(s, CHRONO);
    const morning = clamp(round(((s - 4) / 21) * 100));
    const peak = s >= 18 ? '上午 8–12 点' : s >= 12 ? '上午 10 点到下午 2 点' : '下午 4 点到晚上 10 点';
    return {
      headline: b.label, title: `晨型指数 ${s}/25`, icon: b.icon, summary: b.text, line: `作息 ${s}/25 · ${b.label}`,
      viz: [{ type: 'bipolar', rows: [{ left: '早鸟', right: '夜猫子', value: morning }] }],
      sections: [
        { title: '你的生物钟', text: b.text },
        { title: '黄金时段', text: `把最需要专注的工作安排在${peak}，把机械性的杂事留给状态一般的时候。` },
        { title: '给你的建议', list: s <= 11
          ? ['夜猫子不是懒，是生物钟。但长期"社交时差"会影响健康', '早上多晒太阳、晚上调暗灯光，可以把生物钟慢慢往前拨', '尽量固定起床时间，周末也别睡到中午']
          : s >= 18
            ? ['你的优势在早上，别把重要的事拖到晚上', '晚上的社交和加班对你消耗更大，学会提前离场', '保持规律作息，你会比大多数人更容易拥有好睡眠']
            : ['你的作息弹性很好，能适应不同的日程', '仍然建议保持固定的起床时间，帮助生物钟稳定'] },
      ],
    };
  },
};

// ---------- SAS-SV 手机依赖 ----------
export const phone = {
  id: 'phone', name: '手机依赖程度测试', short: '手机依赖', icon: 'smartphone', tint: '#ff2d55', category: 'life', minutes: 2, shareable: true,
  intro: '刷着刷着天就黑了？这份测试基于韩国学者编制的智能手机成瘾量表简版（SAS-SV），从生活受影响程度、戒断反应、失控感等方面评估你对手机的依赖。共 10 题。',
  prompt: '你在多大程度上同意这句话？', scale: AGREE6, scaleStyle: 'list',
  reference: 'Kwon, M., Kim, D. J., Cho, H., & Yang, S. (2013). The Smartphone Addiction Scale: Development and Validation of a Short Version for Adolescents. PLoS ONE. 中文为意译。',
  items: [
    '因为玩手机，我耽误了原本计划好的事情。',
    '因为玩手机，我在上课或工作时难以集中注意力。',
    '玩手机时，我的手腕或后颈会感到酸痛。',
    '如果没有手机，我会觉得难以忍受。',
    '手机不在身边时，我会感到焦躁、不耐烦。',
    '即使没在用手机，我脑子里也总惦记着它。',
    '即使手机已经明显影响了我的生活，我也不会减少使用。',
    '我会不停地查看手机，生怕错过别人在社交平台上的消息和动态。',
    '我实际用手机的时间，总比自己原本打算的更长。',
    '身边的人说我玩手机玩得太多了。',
  ].map((t, i) => ({ t, k: i < 3 ? 'L' : i < 6 ? 'W' : 'C' })),
  score(answers) {
    const s = total(this, answers);
    const pct = round(((s - 10) / 50) * 100);
    const lvl = s >= 31 ? { label: '手机依赖风险高', icon: 'alert', color: C.red, text: '你的得分达到了研究中提示"可能存在手机成瘾"的分界线（男性 31 分、女性 33 分左右）。手机可能已经在挤占你的睡眠、专注和现实中的关系。' }
      : s >= 23 ? { label: '有依赖倾向', icon: 'smartphone', color: C.orange, text: '你和手机的关系有点"黏"了，偶尔会失控，但还在可调整的范围内。' }
        : { label: '健康使用', icon: 'check', color: C.green, text: '你能比较好地掌控手机，而不是被手机掌控。' };
    const sub = (k) => {
      const idx = this.items.map((it, i) => (it.k === k ? i : -1)).filter((i) => i >= 0);
      return round(((idx.reduce((a, i) => a + answers[i], 0) - idx.length) / (idx.length * 5)) * 100);
    };
    return {
      headline: lvl.label, title: `依赖指数 ${pct}%`, icon: lvl.icon, summary: lvl.text, line: `手机依赖 ${s}/60 · ${lvl.label}`,
      viz: [
        { type: 'gauge', value: s, max: 60, color: lvl.color, label: lvl.label },
        { type: 'bars', rows: [{ label: '影响生活', value: sub('L'), max: 100 }, { label: '戒断焦虑', value: sub('W'), max: 100 }, { label: '失控感', value: sub('C'), max: 100 }] },
      ],
      sections: [
        { title: '结果说明', text: lvl.text },
        { title: '和手机好好相处', list: ['把手机设为黑白（灰度）模式，吸引力会大打折扣', '关掉所有非必要的通知', '睡觉时让手机待在卧室外，用传统闹钟', '给自己设"无手机时段"，比如吃饭和睡前一小时', '想拿起手机时，先问自己：我要用它做什么？'] },
      ],
    };
  },
};

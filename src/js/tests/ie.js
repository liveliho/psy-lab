import { AGREE5, clamp, round } from './common.js';

const o3 = (e, m, i) => [
  { v: 2, l: e },
  { v: 1, l: m },
  { v: 0, l: i },
];

// 情境题：E=2 中间=1 I=0；最后 3 题单独评估社交焦虑倾向（k: 'SA'），不计入内外向
const items = [
  { t: '周五下班，朋友临时喊你去一个有很多陌生人的局。', k: 'IE', opts: o3('太好了，马上到！', '看是谁组的局、看心情', '只想回家躺着，找个理由推掉') },
  { t: '连续两天聚会/团建之后，你的状态是？', k: 'IE', opts: o3('意犹未尽，还想继续', '有点累，但还行', '电量耗尽，需要一个人待很久') },
  { t: '在电梯里遇到不太熟的同事或同学。', k: 'IE', opts: o3('主动寒暄聊几句', '对方开口我就接', '假装看手机，祈祷快点到') },
  { t: '你理想中的假期是——', k: 'IE', opts: o3('和一群朋友去热闹的地方', '和一两个好友小范围出行', '一个人宅着或独自旅行') },
  { t: '在群聊里，你通常是——', k: 'IE', opts: o3('活跃气氛的那个', '偶尔冒个泡', '潜水为主，看得多说得少') },
  { t: '遇到一件开心的事，你的第一反应是？', k: 'IE', opts: o3('立刻分享给很多人', '告诉一两个最亲近的人', '自己默默开心，或者写下来') },
  { t: '思考一个复杂问题时，你更习惯——', k: 'IE', opts: o3('找人聊，边说边想', '看情况', '一个人安静地想清楚再说') },
  { t: '打电话 vs 发消息？', k: 'IE', opts: o3('打电话更直接高效', '都可以', '能发消息绝不打电话') },
  { t: '哪种环境让你更有效率？', k: 'IE', opts: o3('热闹开放、有人交流的环境', '无所谓', '安静独立的空间') },
  { t: '进入一个新集体（新班级/新公司）后——', k: 'IE', opts: o3('很快就和大家熟络起来', '慢慢融入', '需要很久，只和少数人熟') },
  { t: '一个人在家待了一整天，你会觉得——', k: 'IE', opts: o3('无聊，想找人说话', '挺舒服，但也想出门', '简直完美，充电完成'), },
  { t: '在会议或课堂上需要发言时——', k: 'IE', opts: o3('乐于第一个开口', '有想法时会说', '除非被点名，否则尽量不说') },
  { t: '我担心自己在别人面前说错话或出丑。', k: 'SA', opts: AGREE5 },
  { t: '即使很想参与社交，我也会因为紧张而退缩。', k: 'SA', opts: AGREE5 },
  { t: '在社交场合中，我常常感觉别人在评判我。', k: 'SA', opts: AGREE5 },
];

export default {
  id: 'ie',
  name: 'I 人还是 E 人？',
  short: 'I人/E人',
  icon: 'battery',
  tint: '#34c759',
  category: 'personality',
  minutes: 2,
  shareable: true,
  intro: '内向与外向的核心区别，是"从哪里获得能量"：外向者在与人互动中充电，内向者在独处中回血。这是一条光谱，大多数人都在中间。最后 3 题会额外帮你区分"内向"与"社交焦虑"——它们并不是一回事。',
  prompt: '选择最接近你的反应',
  scaleStyle: 'list',
  reference: '理论依据：Eysenck 人格理论、大五人格外向性维度；内向与社交焦虑的区分参考 Cain《安静：内向性格的竞争力》。',
  items,
  score(answers) {
    let e = 0, n = 0, sa = 0, sn = 0;
    items.forEach((it, i) => {
      if (it.k === 'IE') { e += answers[i]; n++; } else { sa += answers[i]; sn++; }
    });
    const ep = clamp(round((e / (2 * n)) * 100));
    const saMean = sa / sn;

    let headline, title, icon, summary;
    if (ep < 20) { headline = 'I 人'; title = '深度内向者'; icon = 'moon'; summary = '独处是你最好的充电器，安静的时光让你思考深刻、内心丰盈。'; }
    else if (ep < 40) { headline = 'I 人'; title = '温和内向者'; icon = 'book'; summary = '你偏爱小圈子与深度交流，也能享受适量社交，只是需要时间回血。'; }
    else if (ep <= 60) { headline = 'I/E 中间人'; title = '灵活切换者（Ambivert）'; icon = 'cloud-sun'; summary = '你能在社交和独处之间自如切换——该热闹时热闹，该安静时安静。'; }
    else if (ep <= 80) { headline = 'E 人'; title = '阳光外向者'; icon = 'sun'; summary = '和人在一起让你充满能量，你乐于分享、善于连接。'; }
    else { headline = 'E 人'; title = '超级社交电池'; icon = 'zap'; summary = '人群就是你的充电桩！你热情奔放，总能点亮全场。'; }

    const tips = ep < 40
      ? ['提前安排好"独处回血"时间，再去参加社交活动', '一对一或小范围交流，往往更能发挥你的优势', '内向不是缺点：深度思考、专注与倾听都是你的长处']
      : ep <= 60
        ? ['留意自己当下的电量，不必勉强保持"一种状态"', '你很适合做团队里的"桥梁"角色', '社交与独处都给自己留出空间']
        : ['试着在热闹之余留一点安静时间，听听内心的声音', '耐心对待需要慢热的朋友，给他们一点空间', '你的热情是团队的燃料，记得也照顾好自己'];

    const sections = [
      { title: '社交电量', text: `你的外向倾向约为 ${ep}%。${summary}` },
      { title: '给你的建议', list: tips },
    ];
    let alert;
    if (saMean >= 3.7) {
      sections.push({ title: '内向 ≠ 社恐', text: '你的回答显示出一定的社交焦虑倾向：不是"不想社交"，而是"想参与却担心被评判"。这和内向是两回事——外向的人也可能社交焦虑。如果这种紧张明显影响了你的学习、工作或生活，可以试试「广泛性焦虑 GAD-7」自评，或与心理咨询师聊聊。' });
      alert = { level: 'info', title: '检测到社交焦虑倾向', text: '这不是诊断，只是一个提醒。往下看"内向 ≠ 社恐"一节。' };
    } else {
      sections.push({ title: '内向 ≠ 社恐', text: '你的社交焦虑倾向不高 记住：内向是"喜欢独处充电"，社交焦虑是"想社交但害怕被评判"，两者常被混为一谈。' });
    }

    return {
      headline, title, icon, summary,
      line: `${headline} · 外向 ${ep}%`,
      alert,
      viz: [
        { type: 'battery', value: ep, label: '外向指数' },
        { type: 'bipolar', rows: [{ left: '外向 E', right: '内向 I', value: ep }] },
      ],
      sections,
    };
  },
};

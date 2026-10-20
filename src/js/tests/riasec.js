import { LIKE5, dimMeans, pct5 } from './common.js';

const RAW = {
  R: ['修理电器或组装家具', '使用工具亲手制作东西', '在户外工作，例如园艺或野外勘测', '操作机器设备或驾驶', '动手做实验或搭建模型'],
  I: ['做科学实验、分析数据', '研究一个现象背后的原理', '解数学题或逻辑谜题', '阅读科普或学术文章', '写代码解决技术问题'],
  A: ['画画、做设计或摄影', '写故事、诗歌或剧本', '演奏乐器或唱歌', '布置房间、搭配穿着', '剪辑视频或创作内容'],
  S: ['教别人学会一项技能', '倾听并帮朋友解决烦恼', '参加志愿服务或公益活动', '照顾老人、孩子或病人', '组织活动让大家相处融洽'],
  E: ['说服别人接受你的想法', '带领团队完成一个目标', '策划项目并推动它落地', '谈判、推销或做点小生意', '在众人面前演讲'],
  C: ['整理文件、表格和数据', '制定预算、记账', '按照规范流程完成任务', '检查文字或数字中的错误', '管理日程、物资或清单'],
};
// 交错排列，避免同类题连续出现
const items = [];
for (let i = 0; i < 5; i++) for (const k of Object.keys(RAW)) items.push({ t: RAW[k][i], k });

const TYPES = {
  R: { name: '实际型', icon: 'wrench', desc: '喜欢动手、操作工具和处理具体事物，务实而踏实。', jobs: ['工程师', '机械师', '建筑/土木', '农业/园艺', '运动员', '电工'] },
  I: { name: '研究型', icon: 'search', desc: '喜欢观察、分析和探索未知，享受独立思考与解决难题。', jobs: ['科研人员', '程序员', '数据分析师', '医生', '心理学研究者', '药剂师'] },
  A: { name: '艺术型', icon: 'palette', desc: '富有想象力与表现力，喜欢不受拘束地创作与表达。', jobs: ['设计师', '作家/编辑', '音乐人', '摄影师', '导演/剪辑', '建筑师'] },
  S: { name: '社会型', icon: 'users', desc: '乐于助人、善解人意，喜欢与人合作、教导和照顾他人。', jobs: ['教师', '心理咨询师', '社工', '护士', '人力资源', '康复治疗师'] },
  E: { name: '企业型', icon: 'target', desc: '自信、有影响力，喜欢领导、说服他人并追求目标。', jobs: ['创业者', '销售/市场', '管理者', '律师', '产品经理', '公关'] },
  C: { name: '常规型', icon: 'clipboard', desc: '细致、有条理，喜欢在清晰的规则和结构中高效工作。', jobs: ['会计/审计', '行政', '数据管理', '银行职员', '质量检测', '档案管理'] },
};
const ORDER = ['R', 'I', 'A', 'S', 'E', 'C'];

export default {
  id: 'riasec',
  name: '霍兰德职业兴趣测试',
  short: '职业兴趣',
  icon: 'briefcase',
  tint: '#ff9f0a',
  category: 'career',
  minutes: 4,
  shareable: true,
  intro: '霍兰德 RIASEC 模型把职业兴趣分为六种类型。了解自己的兴趣代码，有助于选专业、找工作或规划转行。共 30 题，不必考虑自己是否擅长，只看喜不喜欢。',
  prompt: '你对这项活动的喜欢程度是？',
  scale: LIKE5,
  scaleStyle: 'agree',
  reference: '理论依据：Holland, J. L. (1997). Making Vocational Choices. 题目为原创，参考 O*NET Interest Profiler 的结构。',
  items,
  score(answers) {
    const m = dimMeans(this, answers);
    const p = Object.fromEntries(ORDER.map((k) => [k, pct5(m[k])]));
    const top = [...ORDER].sort((a, b) => p[b] - p[a]).slice(0, 3);
    const code = top.join('');
    const t0 = TYPES[top[0]];
    return {
      headline: code,
      title: top.map((k) => TYPES[k].name).join(' · '),
      icon: t0.icon,
      summary: t0.desc,
      line: `霍兰德代码 ${code}`,
      viz: [
        { type: 'radar', axes: ORDER.map((k) => ({ label: TYPES[k].name, value: p[k] })) },
        { type: 'bars', rows: ORDER.map((k) => ({ label: `${k} ${TYPES[k].name}`, value: p[k], max: 100 })) },
      ],
      sections: [
        ...top.map((k, i) => ({ title: `${['第一', '第二', '第三'][i]}兴趣：${TYPES[k].name}`, text: TYPES[k].desc, chips: TYPES[k].jobs })),
        { title: '如何使用', text: '兴趣代码的前两位最重要。兴趣不等于能力，但做感兴趣的事更容易坚持和成长。可以把推荐职业当作探索起点，再结合能力、价值观与现实条件做选择。' },
      ],
    };
  },
};

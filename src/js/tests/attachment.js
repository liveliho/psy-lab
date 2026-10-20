import { AGREE5, dimMeans, pct5 } from './common.js';

// 原创题目，依据成人依恋的"焦虑-回避"二维模型（Brennan, Clark & Shaver, 1998）
const items = [
  { t: '我常担心对方不像我在乎他/她那样在乎我。', k: 'ANX' },
  { t: '我不太习惯向别人倾诉内心深处的感受。', k: 'AVO' },
  { t: '如果对方很久没回消息，我会忍不住胡思乱想。', k: 'ANX' },
  { t: '当关系变得非常亲密时，我会想往后退一点。', k: 'AVO' },
  { t: '我需要对方反复确认，才会觉得安心。', k: 'ANX' },
  { t: '遇到困难时，向亲近的人求助对我来说很自然。', k: 'AVO', r: 1 },
  { t: '我害怕被抛弃或被冷落。', k: 'ANX' },
  { t: '我更愿意自己解决问题，不想依赖任何人。', k: 'AVO' },
  { t: '当对方和别人走得很近时，我会感到不安。', k: 'ANX' },
  { t: '对方想要更亲近时，我有时会感到压力。', k: 'AVO' },
  { t: '我很少担心对方会离开我。', k: 'ANX', r: 1 },
  { t: '我很难完全信任别人。', k: 'AVO' },
];

const STYLES = {
  secure: { name: '安全型', icon: 'shield-check', text: '你在亲密关系中感到自在：既能信任和依赖对方，也能保持独立。你相信自己值得被爱，也相信别人是可靠的。',
    tips: ['继续保持开放、直接的沟通', '你的稳定能给伴侣很大安全感', '安全型也会有不安的时刻，接纳它们'] },
  anxious: { name: '焦虑型', icon: 'radio', text: '你非常渴望亲密，对关系中的信号很敏感，容易担心对方不够爱你或会离开。这份敏感背后，是你对连接的珍视。',
    tips: ['担心时先觉察："这是事实，还是我的想象？"', '直接表达需要，而不是用试探的方式', '培养关系之外的兴趣与支持系统，增加自我价值感'] },
  avoidant: { name: '回避型', icon: 'mountain', text: '你重视独立与自主，在关系过于亲密时会本能地保持距离，习惯自己消化情绪。这曾经保护过你，但也可能让你错过被理解的机会。',
    tips: ['试着每次多分享一点点内心感受', '想后退时，告诉对方"我需要一点时间"而不是消失', '依赖别人不等于软弱'] },
  fearful: { name: '恐惧型', icon: 'cloud-sun', text: '你既渴望亲密又害怕受伤，常在"靠近"与"逃离"之间摇摆。这种矛盾往往来自过去的经历，值得被温柔对待。',
    tips: ['觉察自己"想靠近又想逃"的时刻，给它命名', '和安全、稳定的人建立关系会很有帮助', '心理咨询对理解和改变依恋模式非常有效'] },
};

export default {
  id: 'attachment',
  name: '依恋风格测试',
  short: '依恋风格',
  icon: 'link',
  tint: '#ff375f',
  category: 'relationship',
  minutes: 3,
  shareable: true,
  intro: '依恋风格描述了我们在亲密关系中如何与人连接。心理学用"依恋焦虑"（担心被抛弃）和"依恋回避"（不习惯亲密）两个维度来刻画。请想着你的伴侣、前任或最亲近的人作答。',
  prompt: '你在多大程度上同意这句话？',
  scale: AGREE5,
  scaleStyle: 'agree',
  reference: '题目为原创，理论依据：Brennan, Clark & Shaver (1998)；Bartholomew & Horowitz (1991) 四类依恋模型。',
  items,
  score(answers) {
    const m = dimMeans(this, answers);
    const anx = pct5(m.ANX), avo = pct5(m.AVO);
    const key = anx < 50 ? (avo < 50 ? 'secure' : 'avoidant') : (avo < 50 ? 'anxious' : 'fearful');
    const s = STYLES[key];
    return {
      headline: s.name,
      title: '依恋风格',
      icon: s.icon,
      summary: s.text,
      line: `${s.name} · 焦虑${anx} 回避${avo}`,
      viz: [
        { type: 'quadrant', x: avo, y: anx, xLabel: '依恋回避 →', yLabel: '依恋焦虑 →', labels: ['焦虑型', '恐惧型', '安全型', '回避型'] },
        { type: 'bars', rows: [{ label: '依恋焦虑', value: anx, max: 100 }, { label: '依恋回避', value: avo, max: 100 }] },
      ],
      sections: [
        { title: '关于你', text: s.text },
        { title: '在关系中', list: s.tips },
        { title: '依恋是可以改变的', text: '依恋风格并非一成不变。研究发现，稳定的关系、自我觉察和心理咨询都能帮助人逐渐走向"习得的安全型"。' },
      ],
    };
  },
};

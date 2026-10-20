import { AGREE5, dimMeans, pct5, band } from './common.js';

// 原创题目，依据 Aron & Aron (1997) 的感觉加工敏感性（SPS）理论
const items = [
  { t: '强光、噪音、刺鼻的气味或粗糙的衣料很容易让我不舒服。', k: 'S' },
  { t: '我很容易感受到别人的情绪，仿佛那是我自己的。', k: 'E' },
  { t: '一天里事情太多时，我需要躲到安静的地方缓一缓。', k: 'O' },
  { t: '我能注意到环境中细微的变化，比如朋友换了发型。', k: 'S' },
  { t: '看到暴力或悲伤的影视画面，我会难受很久。', k: 'E' },
  { t: '被人盯着做事或限时完成任务时，我会紧张到表现变差。', k: 'O' },
  { t: '我常被艺术、音乐或大自然深深打动。', k: 'S' },
  { t: '做决定前，我会反复思考很多细节和可能性。', k: 'E' },
  { t: '生活中的突然变化会让我手足无措。', k: 'O' },
  { t: '我对咖啡因、饥饿或疼痛的反应比别人更明显。', k: 'S' },
  { t: '别人的一句批评会让我在意很久。', k: 'E' },
  { t: '拥挤热闹的场合很快就会让我感到疲惫。', k: 'O' },
  { t: '别人觉得没什么的背景噪音，会让我很难集中注意力。', k: 'S' },
  { t: '我有丰富而复杂的内心世界。', k: 'E' },
  { t: '我会刻意安排生活，避免让自己陷入混乱或压力过大的局面。', k: 'O' },
];

const BANDS = [
  { max: 45, label: '敏感度较低', icon: 'mountain', color: '#34c759', text: '你对外界刺激不太敏感，在嘈杂、多变的环境中也能保持稳定，抗干扰能力强。' },
  { max: 65, label: '中等敏感', icon: 'leaf', color: '#30b0c7', text: '你对环境和他人情绪有一定的敏感度，既能感受细节，也不容易被刺激淹没。' },
  { max: 100, label: '高敏感人群 HSP', icon: 'radio', color: '#64d2ff', text: '你可能是高敏感人群（约占人口的 15%–20%）。你的神经系统对信息加工得更深入，这带来了细腻、共情和创造力，也意味着更容易被过度刺激。' },
];

export default {
  id: 'hsp', name: '高敏感人群测试', short: '高敏感 HSP', icon: 'radio', tint: '#40b8e0', category: 'personality', minutes: 3, shareable: true,
  intro: '高敏感（Highly Sensitive Person）不是缺点，也不是疾病，而是一种天生的气质特征：对感官刺激、情绪和细节的加工更深入。本测试从感官敏感、情绪共鸣与易受过度刺激三方面评估。',
  prompt: '这句话在多大程度上符合你？', scale: AGREE5, scaleStyle: 'agree',
  reference: '题目为原创。理论依据：Aron, E. N., & Aron, A. (1997). Sensory-processing sensitivity and its relation to introversion and emotionality.',
  items,
  score(answers) {
    const m = dimMeans(this, answers);
    const p = { S: pct5(m.S), E: pct5(m.E), O: pct5(m.O) };
    const all = Math.round((p.S + p.E + p.O) / 3);
    const b = band(all, BANDS);
    const tips = all > 65
      ? ['安排固定的"降噪时间"，让神经系统休息', '降噪耳机、柔和灯光是你的好朋友', '提前告诉亲近的人你需要独处，这不是冷漠', '把敏感当作天赋：你能察觉到别人察觉不到的美与情绪']
      : all > 45
        ? ['留意哪些场景最容易让你疲惫，提前做准备', '你的敏感度让你善于理解他人，在团队中很有价值']
        : ['你的稳定是一种优势，在高压环境中尤其明显', '试着多留意身边人的情绪信号，能让关系更亲密'];
    return {
      headline: b.label, title: `敏感指数 ${all}%`, icon: b.icon, summary: b.text, line: `高敏感 ${all}% · ${b.label}`,
      viz: [
        { type: 'gauge', value: all, max: 100, color: b.color, label: '敏感指数' },
        { type: 'bars', rows: [{ label: '感官敏感', value: p.S, max: 100 }, { label: '情绪共鸣', value: p.E, max: 100 }, { label: '易受过度刺激', value: p.O, max: 100 }] },
      ],
      sections: [
        { title: '关于你', text: b.text },
        { title: '给你的建议', list: tips },
        { title: '高敏感 ≠ 内向', text: '约 30% 的高敏感者是外向的。高敏感描述的是信息加工的深度，内外向描述的是能量来源，两者是不同的维度。' },
      ],
    };
  },
};

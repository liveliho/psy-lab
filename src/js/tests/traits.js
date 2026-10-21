// 性格探索补充：黑暗三联征、完美主义。题目均为原创，依据相应理论框架编写。
import { AGREE5, dimMeans, pct5, band, round } from './common.js';

// ---------- 黑暗人格三联征 ----------
const DT = {
  M: { name: '马基雅维利主义', short: '权谋', icon: 'puzzle', text: '你很懂得审时度势，善于策略性地思考人际关系，知道什么时候该说什么话。这让你在复杂环境中游刃有余，但过度时可能让人觉得你"心思太深"。' },
  N: { name: '自恋', short: '自恋', icon: 'crown', text: '你自信、渴望被看见，喜欢成为焦点。适度的自恋是一种健康的自信，但过度时可能让你对批评格外敏感、忽视他人的感受。' },
  P: { name: '精神病态', short: '冷酷冲动', icon: 'zap', text: '你大胆、追求刺激，在高压下也能保持冷静，不太容易被情绪左右。但过度时可能表现为冲动、冷漠和不顾后果。' },
};

export const darktriad = {
  id: 'darktriad', name: '黑暗人格测试', short: '黑暗人格', icon: 'crown', tint: '#3a3a3c', category: 'personality', minutes: 3, shareable: true,
  intro: '"黑暗三联征"（Dark Triad）是心理学家 Paulhus 和 Williams 在 2002 年提出的概念，指三种社会上不太受欢迎、但每个人身上都或多或少存在的人格特质：马基雅维利主义、自恋和精神病态（亚临床水平）。测着玩，别太当真——得分高也不代表你是坏人。',
  prompt: '你在多大程度上同意这句话？', scale: AGREE5, scaleStyle: 'agree',
  reference: '题目为原创。理论依据：Paulhus, D. L., & Williams, K. M. (2002). The Dark Triad of personality; Jones & Paulhus (2014) SD3。本测试不具备临床诊断意义。',
  items: [
    { t: '把自己的秘密告诉别人是不明智的。', k: 'M' },
    { t: '我喜欢成为众人关注的焦点。', k: 'N' },
    { t: '我喜欢刺激和冒险，哪怕可能有风险。', k: 'P' },
    { t: '要想成功，有时候必须使用一些手段。', k: 'M' },
    { t: '我知道自己很特别，因为大家总这么说。', k: 'N' },
    { t: '如果有人惹了我，我会让 TA 后悔。', k: 'P' },
    { t: '我会留意收集一些将来可能对自己有用的信息。', k: 'M' },
    { t: '我觉得自己比大多数人更有能力。', k: 'N' },
    { t: '别人的痛苦通常不太会影响到我。', k: 'P' },
    { t: '和重要的人保持好关系，主要是因为将来可能用得上。', k: 'M' },
    { t: '被别人忽视时，我会感到很不舒服。', k: 'N' },
    { t: '我做事常常不考虑后果。', k: 'P' },
    { t: '大多数人都是可以被操纵的。', k: 'M' },
    { t: '我希望自己有一天能成为大人物。', k: 'N' },
    { t: '为了得到想要的东西，我可以说一些违心的话。', k: 'P' },
    { t: '我会避免和别人发生直接冲突，因为他们以后可能对我有用。', k: 'M' },
    { t: '我很容易在人群中脱颖而出。', k: 'N' },
    { t: '规则是用来打破的。', k: 'P' },
  ],
  score(answers) {
    const m = dimMeans(this, answers);
    const p = { M: pct5(m.M), N: pct5(m.N), P: pct5(m.P) };
    const all = round((p.M + p.N + p.P) / 3);
    const top = Object.keys(p).reduce((a, k) => (p[k] > p[a] ? k : a), 'M');
    const t = DT[top];
    const head = all >= 65 ? '暗黑气场全开' : all >= 45 ? '亦正亦邪' : all >= 25 ? '光明为主' : '纯良小天使';
    const icon = all >= 45 ? t.icon : all >= 25 ? 'sun' : 'sparkles';
    return {
      headline: head, title: `暗黑指数 ${all}% · 最突出：${t.name}`, icon, summary: all >= 25 ? t.text : '你几乎没有表现出黑暗人格特质。你真诚、善良、讲规则，愿意信任别人。偶尔也要记得保护自己。',
      line: `黑暗指数 ${all}% · ${head}`,
      viz: [
        { type: 'gauge', value: all, max: 100, color: '#636366', label: '暗黑指数' },
        { type: 'bars', rows: Object.entries(DT).map(([k, d]) => ({ label: d.name, value: p[k], max: 100 })) },
      ],
      sections: [
        { title: `最突出的特质：${t.name}`, text: t.text },
        { title: '三种特质分别是什么？', list: ['马基雅维利主义：得名于《君主论》作者，指精于算计、操纵他人以达到目的', '自恋：夸大的自我形象、渴望被崇拜、对批评敏感', '精神病态（亚临床）：冲动、寻求刺激、共情较低'] },
        { title: '"黑暗"也有光', text: '研究发现，适度的黑暗特质与领导力、谈判能力、抗压能力有关。真正需要警惕的是它们走向极端，伤害到身边的人。' },
      ],
    };
  },
};

// ---------- 完美主义 ----------
const PF = {
  S: '自我高标准',
  C: '担心犯错',
  P: '感知外界期待',
  D: '怀疑与反复检查',
};

export const perfection = {
  id: 'perfection', name: '完美主义测试', short: '完美主义', icon: 'ruler', tint: '#bf5af2', category: 'personality', minutes: 2, shareable: true,
  intro: '完美主义并不只有一种。心理学研究区分了"积极追求型"（为自己设定高标准，享受进步）和"焦虑担忧型"（害怕犯错、担心辜负期待）。前者常常带来成就，后者则与焦虑、拖延和倦怠密切相关。',
  prompt: '这句话在多大程度上符合你？', scale: AGREE5, scaleStyle: 'agree',
  reference: '题目为原创。理论依据：Frost et al. (1990) 多维完美主义；Hewitt & Flett (1991) 自我导向与社会期待型完美主义；Stoeber & Otto (2006) 积极与消极完美主义。',
  items: [
    { t: '我对自己做的事情有很高的标准。', k: 'S' },
    { t: '哪怕只犯了一个小错，我也会觉得整件事都失败了。', k: 'C' },
    { t: '我觉得身边的人期待我把每件事都做到最好。', k: 'P' },
    { t: '我会反复检查自己做完的事情，确保没有任何错误。', k: 'D' },
    { t: '我会为自己设定有挑战性的目标。', k: 'S' },
    { t: '犯了错之后，我会很长时间都放不下。', k: 'C' },
    { t: '如果我做得不够好，别人就会对我失望。', k: 'P' },
    { t: '即使已经做完了，我还是不确定自己做得对不对。', k: 'D' },
    { t: '追求卓越让我感到充实和有动力。', k: 'S' },
    { t: '我宁愿不做，也不想做得不完美。', k: 'C' },
    { t: '我从小就觉得，只有表现好才能得到认可。', k: 'P' },
    { t: '做决定时，我总担心选错，迟迟下不了决心。', k: 'D' },
  ],
  score(answers) {
    const m = dimMeans(this, answers);
    const p = Object.fromEntries(Object.keys(PF).map((k) => [k, pct5(m[k])]));
    const worry = round((p.C + p.P + p.D) / 3);
    const ty = p.S >= 60 && worry < 50 ? { name: '积极追求型', icon: 'target', text: '你对自己要求高，但不被恐惧驱动。你享受把事情做好的过程，也能接受不完美。这是"健康的完美主义"——心理学家称之为"追求卓越"。' }
      : worry >= 50 && p.S >= 60 ? { name: '焦虑完美型', icon: 'ruler', text: '你既有很高的标准，又非常害怕达不到。这种组合会带来出色的成果，但代价是持续的紧绷：完成了也难以放松，犯错时会狠狠责备自己。' }
        : worry >= 50 ? { name: '担忧回避型', icon: 'alert', text: '你的标准未必很高，但对犯错和他人评价格外担心。这种担忧可能让你拖延、回避尝试，或在决定前反复犹豫。' }
          : { name: '随性自在型', icon: 'leaf', text: '你对自己没有特别严苛的要求，也不太担心犯错。"够好就行"的心态让你活得轻松，必要时也可以给自己定一些更有挑战的目标。' };
    return {
      headline: ty.name, title: `高标准 ${p.S}% · 担忧 ${worry}%`, icon: ty.icon, summary: ty.text, line: `完美主义 · ${ty.name}`,
      viz: [{ type: 'radar', axes: Object.entries(PF).map(([k, label]) => ({ label, value: p[k] })) }],
      sections: [
        { title: ty.name, text: ty.text },
        { title: '和完美主义和解', list: ['给任务设定"够好"的标准：完成 80 分，就先交出去', '把"我必须"换成"我希望"', '记录犯错后实际发生了什么——通常没有想象中那么糟', '对自己的进步给予和对结果一样多的关注'] },
      ],
    };
  },
};

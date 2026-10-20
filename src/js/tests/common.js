// 通用量表选项与计分工具。这些模块不依赖 DOM，可在 Node 中被构建脚本导入校验。

export const AGREE5 = [
  { v: 1, l: '非常不同意' },
  { v: 2, l: '不同意' },
  { v: 3, l: '中立' },
  { v: 4, l: '同意' },
  { v: 5, l: '非常同意' },
];

export const AGREE4 = [
  { v: 3, l: '非常同意' },
  { v: 2, l: '同意' },
  { v: 1, l: '不同意' },
  { v: 0, l: '非常不同意' },
];

export const FREQ4 = [
  { v: 0, l: '完全不会' },
  { v: 1, l: '有几天' },
  { v: 2, l: '一半以上的天数' },
  { v: 3, l: '几乎每天' },
];

export const FREQ5 = [
  { v: 0, l: '从不' },
  { v: 1, l: '偶尔' },
  { v: 2, l: '有时' },
  { v: 3, l: '经常' },
  { v: 4, l: '总是' },
];

export const LIKE5 = [
  { v: 1, l: '非常不喜欢' },
  { v: 2, l: '不喜欢' },
  { v: 3, l: '无所谓' },
  { v: 4, l: '喜欢' },
  { v: 5, l: '非常喜欢' },
];

export const clamp = (n, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));
export const round = (n) => Math.round(n);

/** 题目可选项：优先使用题目自带的 opts，否则用测评的 scale */
export const optionsOf = (test, item) => item.opts || test.scale;

/** 计算单题得分（处理反向计分） */
export function itemValue(test, i, v) {
  const item = test.items[i];
  if (!item.r) return v;
  const vals = optionsOf(test, item).map((o) => o.v);
  return Math.min(...vals) + Math.max(...vals) - v;
}

/** 按维度 key 求平均分 */
export function dimMeans(test, answers) {
  const acc = {};
  test.items.forEach((item, i) => {
    if (answers[i] == null) return;
    const k = item.k;
    acc[k] ??= { sum: 0, n: 0 };
    acc[k].sum += itemValue(test, i, answers[i]);
    acc[k].n += 1;
  });
  const out = {};
  for (const k in acc) out[k] = acc[k].sum / acc[k].n;
  return out;
}

/** 总分 */
export const total = (test, answers) =>
  answers.reduce((s, v, i) => s + itemValue(test, i, v), 0);

/** 从分数段数组中找到所在等级：bands 按 max 升序 */
export const band = (value, bands) => bands.find((b) => value <= b.max) || bands[bands.length - 1];

/** 1~5 均分转 0~100 */
export const pct5 = (mean) => clamp(round(((mean - 1) / 4) * 100));

export const strengthWord = (p) => {
  const d = Math.abs(p - 50);
  if (d < 8) return '几乎平衡';
  if (d < 20) return '轻微偏向';
  if (d < 35) return '明显偏向';
  return '非常明显地偏向';
};

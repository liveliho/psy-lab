// 成就徽章：根据本地数据实时计算，无需额外存储（只记录"已提示过"的徽章）
import { TESTS } from './tests/index.js';
import { ARTICLES } from './content.js';
import { PSYCHOLOGISTS, EXPERIMENTS } from './psychology.js';
import { history, moods, stats, reads, badgesSeen, todayKey } from './store.js';

function moodStreak(list) {
  const days = new Set(list.map((m) => m.date));
  let n = 0;
  const d = new Date();
  if (!days.has(todayKey(d))) d.setDate(d.getDate() - 1); // 今天还没记，从昨天算起
  while (days.has(todayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export const BADGES = [
  { id: 'first', name: '初次探索', desc: '完成第一个测评', icon: 'star', tint: '#ffb340', test: (c) => c.done.size >= 1 },
  { id: 'persona', name: '人格拼图', desc: '完成 3 个性格探索测评', icon: 'puzzle', tint: '#5856d6', test: (c) => TESTS.filter((t) => t.category === 'personality' && c.done.has(t.id)).length >= 3 },
  { id: 'all', name: '全图鉴', desc: '完成全部测评', icon: 'trophy', tint: '#ff9f0a', test: (c) => TESTS.every((t) => c.done.has(t.id)) },
  { id: 'streak3', name: '坚持记录', desc: '连续 3 天记录心情', icon: 'calendar', tint: '#34c759', test: (c) => c.streak >= 3 },
  { id: 'streak7', name: '情绪观察家', desc: '连续 7 天记录心情', icon: 'eye', tint: '#30b0c7', test: (c) => c.streak >= 7 },
  { id: 'granular', name: '情绪颗粒度', desc: '用情绪轮记录 5 次', icon: 'pie', tint: '#af52de', test: (c) => c.wheel >= 5 },
  { id: 'owl', name: '夜猫子', desc: '在凌晨 0–5 点记录心情', icon: 'moon', tint: '#5e5ce6', test: (c) => c.owl },
  { id: 'breath', name: '呼吸大师', desc: '累计呼吸练习 10 分钟', icon: 'wind', tint: '#40c8e0', test: (c) => (c.s.breathMin || 0) >= 10 },
  { id: 'ground', name: '脚踏实地', desc: '完成 3 次着陆练习', icon: 'anchor', tint: '#a2845e', test: (c) => (c.s.groundCount || 0) >= 3 },
  { id: 'fast', name: '闪电反应', desc: '反应时平均低于 250ms', icon: 'zap', tint: '#ffcc00', test: (c) => c.s.bestReaction != null && c.s.bestReaction < 250 },
  { id: 'memory', name: '记忆大师', desc: '数字广度达到 8 位', icon: 'brain', tint: '#ff2d55', test: (c) => (c.s.bestSpan || 0) >= 8 },
  { id: 'focus', name: '专注之眼', desc: 'Stroop 实验全部答对', icon: 'target', tint: '#ff6b35', test: (c) => (c.s.stroopPerfect || 0) >= 1 },
  { id: 'pmr', name: '身心放松', desc: '完成一次渐进式肌肉放松', icon: 'body', tint: '#34c759', test: (c) => (c.s.pmrCount || 0) >= 1 },
  { id: 'life', name: '生活观察家', desc: '完成全部生活状态测评', icon: 'sun', tint: '#ff9f0a', test: (c) => TESTS.filter((t) => t.category === 'life').every((t) => c.done.has(t.id)) },
  { id: 'growth', name: '向内探索', desc: '完成 5 个自我成长测评', icon: 'sprout', tint: '#34c759', test: (c) => TESTS.filter((t) => t.category === 'growth' && c.done.has(t.id)).length >= 5 },
  { id: 'toys', name: '解压玩家', desc: '玩过 6 种解压玩具', icon: 'gamepad', tint: '#ff9500', test: (c) => Object.keys(c.s).filter((k) => k.startsWith('toy_')).length >= 6 },
  { id: 'merit', name: '功德无量', desc: '电子木鱼累计敲 1000 下', icon: 'muyu', tint: '#b8692c', test: (c) => (c.s.muyu || 0) >= 1000 },
  { id: 'letgo', name: '学会放下', desc: '粉碎 5 个烦恼', icon: 'scissors', tint: '#5e5ce6', test: (c) => (c.s.shred || 0) >= 5 },
  { id: 'spin', name: '停不下来', desc: '指尖陀螺一次转满 30 秒', icon: 'spinner', tint: '#ff9500', test: (c) => (c.s.spinBest || 0) >= 30 },
  { id: 'bubbles', name: '泡泡终结者', desc: '累计捏破 500 个泡泡', icon: 'bubbles', tint: '#64d2ff', test: (c) => (c.s.bubbles || 0) >= 500 },
  { id: 'reader', name: '知识达人', desc: '读完全部心理知识', icon: 'book', tint: '#34c759', test: (c) => ARTICLES.every((a) => c.reads.has(a.id)) },
  { id: 'historian', name: '心理学史学家', desc: '读完 5 位心理学家的介绍', icon: 'landmark', tint: '#a2845e', test: (c) => PSYCHOLOGISTS.filter((p) => c.reads.has(`psy:${p.id}`)).length >= 5 },
  { id: 'lab', name: '实验观察员', desc: '读完全部经典实验', icon: 'activity', tint: '#ff6b35', test: (c) => EXPERIMENTS.every((e) => c.reads.has(`exp:${e.id}`)) },
  { id: 'scholar', name: '心理学达人', desc: '知识问答答对 8 题以上', icon: 'lightbulb', tint: '#5856d6', test: (c) => (c.s.bestTrivia || 0) >= 8 },
  { id: 'share', name: '分享达人', desc: '分享一次测评结果', icon: 'share', tint: '#007aff', test: (c) => (c.s.shares || 0) >= 1 },
];

function context() {
  const m = moods.all();
  return {
    done: new Set(history.all().map((h) => h.testId)),
    streak: moodStreak(m),
    wheel: m.filter((x) => x.emotion).length,
    owl: m.some((x) => new Date(x.ts).getHours() < 5),
    s: stats.get(),
    reads: new Set(reads.all()),
  };
}

export function unlockedBadges() {
  const c = context();
  return new Set(BADGES.filter((b) => b.test(c)).map((b) => b.id));
}

/** 返回自上次检查以来新解锁的徽章 */
export function newlyUnlocked() {
  const now = unlockedBadges();
  const seen = badgesSeen.all();
  badgesSeen.set([...now]);
  if (seen == null) return []; // 首次运行（例如导入旧数据）不弹提示
  return BADGES.filter((b) => now.has(b.id) && !seen.includes(b.id));
}

export { moodStreak };

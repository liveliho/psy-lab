import mbti from './mbti.js';
import bigfive from './bigfive.js';
import ie from './ie.js';
import hsp from './hsp.js';
import enneagram from './enneagram.js';
import attachment from './attachment.js';
import love from './love.js';
import riasec from './riasec.js';
import { procrast, resilience, burnout, eq } from './growth.js';
import { phq9, gad7, pss, rses, asrs } from './clinical.js';
import { who5, swls, ais, chrono, phone } from './life.js';
import { selfcomp, maas, mindset, erq, gratitude, imposter } from './inner.js';
import { loneliness, pleaser } from './social.js';
import { darktriad, perfection } from './traits.js';
import { anchors } from './anchors.js';

export const TESTS = [
  ie, mbti, bigfive, hsp, enneagram, darktriad, perfection,
  attachment, love, pleaser, loneliness,
  eq, resilience, mindset, selfcomp, erq, maas, imposter, gratitude, procrast, burnout,
  riasec, anchors,
  who5, swls, ais, chrono, phone,
  phq9, gad7, pss, rses, asrs,
];
export const getTest = (id) => TESTS.find((t) => t.id === id);

export const CATEGORIES = [
  { id: 'personality', name: '性格探索', icon: 'puzzle' },
  { id: 'relationship', name: '人际关系', icon: 'heart' },
  { id: 'growth', name: '自我成长', icon: 'sprout' },
  { id: 'career', name: '职业发展', icon: 'briefcase' },
  { id: 'life', name: '生活状态', icon: 'sun' },
  { id: 'mood', name: '情绪健康', icon: 'activity' },
];

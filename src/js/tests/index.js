import mbti from './mbti.js';
import bigfive from './bigfive.js';
import ie from './ie.js';
import hsp from './hsp.js';
import enneagram from './enneagram.js';
import attachment from './attachment.js';
import love from './love.js';
import riasec from './riasec.js';
import { procrast, resilience, burnout, eq } from './growth.js';
import { phq9, gad7, pss, rses } from './clinical.js';

export const TESTS = [ie, mbti, bigfive, hsp, enneagram, attachment, love, eq, resilience, procrast, burnout, riasec, phq9, gad7, pss, rses];
export const getTest = (id) => TESTS.find((t) => t.id === id);

export const CATEGORIES = [
  { id: 'personality', name: '性格探索', icon: 'puzzle' },
  { id: 'relationship', name: '人际关系', icon: 'heart' },
  { id: 'growth', name: '自我成长', icon: 'sprout' },
  { id: 'career', name: '职业发展', icon: 'briefcase' },
  { id: 'mood', name: '情绪健康', icon: 'activity' },
];

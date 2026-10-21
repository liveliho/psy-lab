// Web Audio 小工具：所有声音都实时合成，不需要任何音频文件
import { settings } from './store.js';

let ctx;

/** 获取共享的 AudioContext。force 为真时忽略"音效"开关（用于白噪音这类用户主动播放的声音） */
export function audio(force = false) {
  if (!force && !settings.get().sound) return null;
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** 生成可无缝循环的噪声：white 白噪音 / pink 粉红噪音 / brown 褐噪音 */
export function noiseBuffer(ac, seconds = 4, color = 'white') {
  const sr = ac.sampleRate, len = Math.floor(sr * seconds), fade = Math.floor(sr * 0.25);
  const x = new Float32Array(len + fade);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
  for (let i = 0; i < x.length; i++) {
    const w = Math.random() * 2 - 1;
    if (color === 'pink') {
      // Paul Kellet 的粉红噪声滤波器
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      x[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    } else if (color === 'brown') {
      last = (last + 0.02 * w) / 1.02;
      x[i] = last * 3.5;
    } else x[i] = w * 0.5;
  }
  // 交叉淡化首尾，避免循环接缝处的"咔哒"声
  const buf = ac.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = i < fade ? x[i] * (i / fade) + x[len + i] * (1 - i / fade) : x[i];
  return buf;
}

/** 播放一个带包络的正弦音：freq 起始频率，to 结束频率，dur 时长，vol 音量 */
export function tone(ac, { freq, to, dur = 0.3, vol = 0.3, type = 'sine', at = 0, dest } = {}) {
  const t = ac.currentTime + at;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest || ac.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

/** 一段经过带通滤波的噪声，用于"啵"、"沙沙"等短促音效 */
export function noiseBurst(ac, { dur = 0.06, freq = 1200, q = 1.2, vol = 0.9, color = 'white', curve = 3 } = {}) {
  const t = ac.currentTime;
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, curve);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = freq;
  bp.Q.value = q;
  const g = ac.createGain();
  g.gain.value = vol;
  src.connect(bp).connect(g).connect(ac.destination);
  src.start(t);
  return { src, bp, g };
}

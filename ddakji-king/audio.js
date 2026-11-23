// 딱지왕 — 효과음·배경음 (WebAudio 즉석 합성: 파일/저작권 없음). 피처폰 벨소리 느낌의 8비트 음색.
(function (root) {
  'use strict';
  let ctx = null, master = null, sfxGain = null, bgmGain = null, bgmTimer = 0, bgmOn = false;
  let mode = 0; // 0 전부 켬, 1 효과음만, 2 전부 끔 (저장 키 ddk.snd)
  try { const v = localStorage.getItem('ddk.snd'); if (v !== null) mode = Math.max(0, Math.min(2, +v || 0)); } catch (e) {}

  function init() {
    if (ctx) return ctx;
    const AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      sfxGain = ctx.createGain(); sfxGain.connect(master);
      bgmGain = ctx.createGain(); bgmGain.gain.value = 0.4; bgmGain.connect(master);
    } catch (e) { ctx = null; }
    return ctx;
  }
  function unlock() { if (!init()) return; if (ctx.state === 'suspended') ctx.resume(); applyMode(); }
  ['pointerdown', 'touchstart', 'keydown', 'click'].forEach(ev => root.addEventListener && root.addEventListener(ev, unlock, { passive: true }));

  function tone(type, f0, f1, dur, vol, delay, dest) {
    if (!ctx) return;
    const t = ctx.currentTime + (delay || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || sfxGain); o.start(t); o.stop(t + dur + 0.03);
  }
  let noiseBuf = null;
  function noise(dur, vol, delay, hp, lp) {
    if (!ctx) return;
    if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const t = ctx.currentTime + (delay || 0);
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = hp ? 'highpass' : 'lowpass'; f.frequency.value = hp || lp || 2000;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t); s.stop(t + dur + 0.02);
  }
  const N = { C4: 262, D4: 294, E4: 330, G4: 392, A4: 440, C5: 523, D5: 587, E5: 659, G5: 784, A5: 880, C6: 1047 };

  const SOUNDS = {
    click: () => tone('square', 700, 900, 0.05, 0.07),
    tick: () => tone('square', 1200, 1200, 0.02, 0.04),
    lock: () => { tone('square', 520, 520, 0.06, 0.12); tone('square', 780, 780, 0.08, 0.1, 0.05); },
    whoosh: () => { noise(0.28, 0.3, 0, 900, null); tone('sawtooth', 200, 700, 0.22, 0.06); },
    slap: () => { noise(0.08, 0.5, 0, null, 3000); tone('sine', 180, 50, 0.16, 0.55); },
    flip: () => { noise(0.12, 0.25, 0.05, 2500); tone('triangle', 420, 880, 0.18, 0.2, 0.05); tone('triangle', 880, 420, 0.18, 0.15, 0.2); },
    miss: () => { tone('square', 320, 190, 0.22, 0.12); },
    perfect: () => { [N.C6, N.G5, N.C6].forEach((f, i) => tone('square', f, f, 0.1, 0.12, i * 0.07)); },
    hurt: () => { tone('sawtooth', 220, 70, 0.35, 0.28); noise(0.12, 0.3, 0, null, 900); },
    pick: () => { tone('square', N.E5, N.E5, 0.07, 0.1); tone('square', N.A5, N.A5, 0.1, 0.1, 0.07); },
    win: () => { [N.C5, N.E5, N.G5, N.C6, N.G5, N.C6].forEach((f, i) => { tone('square', f, f, 0.16, 0.13, i * 0.11); tone('triangle', f / 2, f / 2, 0.16, 0.12, i * 0.11); }); },
    lose: () => { [N.G4, N.E4, N.D4, N.C4].forEach((f, i) => tone('triangle', f, f * 0.97, 0.3, 0.2, i * 0.2)); },
    prize: () => { [N.G5, N.C6, N.G5, N.C6, N.A5, N.C6].forEach((f, i) => tone('square', f, f, 0.09, 0.1, i * 0.08)); noise(0.2, 0.15, 0.1, 5000); },
    heal: () => { [N.C5, N.E5, N.G5].forEach((f, i) => tone('triangle', f, f, 0.2, 0.2, i * 0.08)); },
  };

  // 배경음: 피처폰 벨소리 느낌의 밝은 8비트 루프
  const MELODY = ['E5', 'E5', 'G5', 'E5', 'D5', 'C5', 'D5', '', 'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', '', 'A4', 'C5', 'E5', 'C5', 'D5', 'E5', 'D5', 'C5', 'G4', 'A4', 'C5', 'D5', 'E5', '', '', ''];
  const BASS = ['C4', 'C4', 'A4', 'G4'];
  let step = 0;
  function bgmTick() {
    if (!ctx || !bgmOn || ctx.state !== 'running') return;
    const n = MELODY[step % MELODY.length];
    if (n) tone('square', N[n], N[n], 0.2, 0.05, 0, bgmGain);
    if (step % 4 === 0) { const b = N[BASS[(step / 4 | 0) % 4]] / 2; tone('triangle', b, b, 0.4, 0.09, 0, bgmGain); }
    if (step % 8 === 4) noise(0.04, 0.04, 0, 6000);
    step++;
  }
  function applyMode() {
    if (!ctx) return;
    sfxGain.gain.value = mode === 2 ? 0 : 1;
    bgmGain.gain.value = mode === 0 ? 0.4 : 0;
    const want = mode === 0;
    if (want && !bgmOn) { bgmOn = true; bgmTimer = setInterval(bgmTick, 230); }
    if (!want && bgmOn) { bgmOn = false; clearInterval(bgmTimer); }
  }

  root.SFX = {
    play(n) { if (mode === 2) return; if (!init()) return; if (ctx.state === 'suspended') ctx.resume(); const f = SOUNDS[n]; if (f) f(); },
    get mode() { return mode; },
    label() { return ['🔊 소리 켬', '🔉 효과음만', '🔇 소리 끔'][mode]; },
    icon() { return ['🔊', '🔉', '🔇'][mode]; },
    cycle() { mode = (mode + 1) % 3; try { localStorage.setItem('ddk.snd', String(mode)); } catch (e) {} init(); applyMode(); if (mode < 2) this.play('click'); return mode; },
  };
})(typeof window !== 'undefined' ? window : globalThis);

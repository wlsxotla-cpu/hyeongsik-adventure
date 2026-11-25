/* 페리온 전사 — 소리 (WebAudio 합성: 효과음 + 간단한 BGM) */
(function (root) {
  'use strict';
  const S = { ctx: null, master: null, sfxG: null, musG: null, sound: true, music: true, track: null, timer: null, step: 0, next: 0 };
  const N = (m) => 440 * Math.pow(2, (m - 69) / 12); // MIDI → Hz
  S.init = function () {
    if (S.ctx) { if (S.ctx.state === 'suspended') S.ctx.resume(); return; }
    const AC = root.AudioContext || root.webkitAudioContext; if (!AC) return;
    S.ctx = new AC(); S.master = S.ctx.createGain(); S.master.gain.value = 0.9; S.master.connect(S.ctx.destination);
    S.sfxG = S.ctx.createGain(); S.sfxG.gain.value = S.sound ? 0.55 : 0; S.sfxG.connect(S.master);
    S.musG = S.ctx.createGain(); S.musG.gain.value = S.music ? 0.16 : 0; S.musG.connect(S.master);
    const len = S.ctx.sampleRate * 0.6; S.nbuf = S.ctx.createBuffer(1, len, S.ctx.sampleRate); const d = S.nbuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    if (S.track) { const t = S.track; S.track = null; S.play(t); }
  };
  S.setSound = (b) => { S.sound = b; if (S.sfxG) S.sfxG.gain.value = b ? 0.55 : 0; };
  S.setMusic = (b) => { S.music = b; if (S.musG) S.musG.gain.value = b ? 0.16 : 0; };
  function tone(f, dur, type, vol, slide, when, dest) {
    const c = S.ctx; if (!c) return; const t = when || c.currentTime; const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || S.sfxG); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol, fq, q, when, type) {
    const c = S.ctx; if (!c) return; const t = when || c.currentTime; const s = c.createBufferSource(); s.buffer = S.nbuf; const f = c.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = fq || 1200; f.Q.value = q || 1; const g = c.createGain();
    g.gain.setValueAtTime(vol || 0.3, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(S.sfxG); s.start(t); s.stop(t + dur);
  }
  const SFX = {
    swing: () => { noise(0.12, 0.25, 2400, 0.8); tone(520, 0.1, 'triangle', 0.08, 0.5); },
    whiff: () => { },
    hit: () => { noise(0.09, 0.35, 900, 1.2); tone(180, 0.1, 'square', 0.18, 0.5); },
    crit: () => { noise(0.14, 0.45, 1400, 1); tone(300, 0.16, 'sawtooth', 0.22, 0.4); tone(900, 0.12, 'square', 0.12, 0.6); },
    skill: () => { noise(0.22, 0.3, 1800, 0.7); tone(220, 0.25, 'sawtooth', 0.14, 2.2); },
    kill: () => { tone(380, 0.08, 'square', 0.14, 1.5); tone(570, 0.12, 'square', 0.12, 1.5, S.ctx && S.ctx.currentTime + 0.06); },
    bossdie: () => { noise(0.9, 0.5, 300, 0.6, null, 'lowpass'); for (let i = 0; i < 5; i++) tone(300 - i * 40, 0.4, 'sawtooth', 0.2, 0.4, S.ctx.currentTime + i * 0.12); },
    hurt: () => { tone(220, 0.22, 'sawtooth', 0.28, 0.45); noise(0.1, 0.3, 500, 1); },
    jump: () => { tone(300, 0.14, 'square', 0.1, 2); },
    pickup: () => { tone(880, 0.07, 'square', 0.1); tone(1320, 0.09, 'square', 0.1, 1, S.ctx && S.ctx.currentTime + 0.05); },
    potion: () => { tone(500, 0.12, 'sine', 0.2, 1.8); tone(750, 0.14, 'sine', 0.16, 1.5, S.ctx && S.ctx.currentTime + 0.08); },
    levelup: () => { [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => tone(N(m), 0.28, 'square', 0.14, 1, S.ctx.currentTime + i * 0.07)); },
    portal: () => { tone(300, 0.5, 'sine', 0.2, 3); tone(450, 0.5, 'triangle', 0.14, 2.5); },
    buy: () => { tone(1000, 0.06, 'square', 0.1); tone(1500, 0.1, 'square', 0.1, 1, S.ctx && S.ctx.currentTime + 0.06); },
    equip: () => { noise(0.07, 0.3, 3000, 2); tone(700, 0.08, 'triangle', 0.12); },
    buff: () => { [64, 68, 71].forEach((m, i) => tone(N(m), 0.3, 'triangle', 0.16, 1, S.ctx.currentTime + i * 0.06)); },
    deny: () => { tone(160, 0.14, 'square', 0.14); },
    quest: () => { [67, 72].forEach((m, i) => tone(N(m), 0.18, 'square', 0.14, 1, S.ctx.currentTime + i * 0.1)); },
    questdone: () => { [60, 64, 67, 72].forEach((m, i) => tone(N(m), 0.22, 'square', 0.15, 1, S.ctx.currentTime + i * 0.09)); tone(N(79), 0.5, 'triangle', 0.18, 1, S.ctx.currentTime + 0.4); },
    slam: () => { noise(0.35, 0.55, 220, 0.8, null, 'lowpass'); tone(80, 0.3, 'sine', 0.4, 0.4); },
    roar: () => { tone(110, 0.5, 'sawtooth', 0.22, 0.6); noise(0.4, 0.2, 400, 0.6, null, 'lowpass'); },
    fire: () => { noise(0.3, 0.25, 1500, 0.5, null, 'highpass'); tone(340, 0.3, 'sawtooth', 0.1, 0.6); },
    click: () => { tone(900, 0.04, 'square', 0.07); },
  };
  S.sfx = function (n) { if (!S.ctx || !S.sound || !SFX[n]) return; try { SFX[n](); } catch (e) { } };

  // BGM: 트랙 = 템포, 코드 진행(루트 MIDI), 멜로디(스케일 인덱스 16스텝×4마디)
  const TR = {
    town: { bpm: 112, root: 60, scale: [0, 2, 4, 7, 9, 12, 14, 16], chords: [0, 7, 9, 5], mel: [4, null, 3, 4, 5, null, 4, null, 2, null, 3, 4, 3, null, null, null, 4, null, 5, 6, 7, null, 6, null, 5, null, 4, 3, 4, null, null, null, 3, null, 4, 5, 6, null, 5, null, 4, null, 3, 2, 3, null, null, null, 2, null, 3, 4, 3, null, 2, null, 1, null, 2, 3, 4, null, null, null], wave: 'triangle', bass: 'square' },
    field: { bpm: 100, root: 57, scale: [0, 2, 4, 7, 9, 12, 14, 16], chords: [0, 5, 7, 4], mel: [2, null, null, 3, 4, null, 3, null, 2, null, null, 1, 2, null, null, null, 3, null, null, 4, 5, null, 4, null, 3, null, 2, null, 1, null, null, null, 4, null, 5, null, 6, null, 5, null, 4, null, 3, null, 4, null, null, null, 2, null, 3, null, 2, null, 1, null, 0, null, null, null, null, null, null, null], wave: 'triangle', bass: 'triangle' },
    forest: { bpm: 92, root: 55, scale: [0, 2, 3, 7, 8, 12, 14, 15], chords: [0, 5, 3, 7], mel: [3, null, null, 2, 3, null, 4, null, 3, null, null, null, 2, null, 1, null, 4, null, null, 3, 4, null, 5, null, 4, null, 3, null, null, null, 2, null, 5, null, null, 4, 5, null, 6, null, 5, null, 4, null, 3, null, null, null, 2, null, 3, null, 2, null, 1, null, 0, null, null, null, null, null, null, null], wave: 'sine', bass: 'triangle' },
    cave: { bpm: 84, root: 50, scale: [0, 3, 5, 7, 10, 12, 15, 17], chords: [0, 3, 5, 2], mel: [0, null, null, null, 2, null, null, 1, 0, null, null, null, 3, null, null, null, 4, null, null, 3, 2, null, null, null, 1, null, 2, null, 0, null, null, null, 0, null, null, 4, null, null, 3, null, 2, null, null, null, 1, null, 0, null, 2, null, null, 3, 4, null, null, null, 3, null, 2, 1, 0, null, null, null], wave: 'sine', bass: 'sine' },
    quarry: { bpm: 104, root: 52, scale: [0, 2, 3, 5, 7, 8, 10, 12], chords: [0, 5, 3, 6], mel: [4, null, 4, null, 5, null, 4, 3, 4, null, null, null, 2, null, 3, null, 4, null, 4, null, 6, null, 5, 4, 5, null, null, null, 3, null, 4, null, 5, null, 5, null, 6, null, 7, 6, 5, null, 4, null, 3, null, 2, null, 3, null, 4, 3, 2, null, 1, null, 2, null, 0, null, null, null], wave: 'square', bass: 'triangle' },
    boss: { bpm: 144, root: 52, scale: [0, 1, 3, 5, 7, 8, 10, 12], chords: [0, 0, 5, 6], mel: [4, 4, null, 4, 5, null, 4, 3, 4, 4, null, 4, 6, null, 5, 4, 4, 4, null, 4, 5, null, 6, 7, 6, null, 5, null, 4, null, null, null, 7, 7, null, 7, 6, null, 5, 4, 5, 5, null, 5, 4, null, 3, 2, 3, null, 4, null, 3, null, 2, null, 1, null, 0, null, 0, null], wave: 'sawtooth', bass: 'sawtooth' },
  };
  S.play = function (name) {
    if (S.track === name) return; S.track = name; if (!S.ctx) return;
    if (S.timer) clearInterval(S.timer); const T = TR[name]; if (!T) return;
    S.step = 0; S.next = S.ctx.currentTime + 0.1;
    S.timer = setInterval(() => {
      if (!S.ctx || S.ctx.state !== 'running') return;
      const spb = 60 / T.bpm / 2;
      while (S.next < S.ctx.currentTime + 0.25) {
        const st = S.step % 64, bar = (st / 16) | 0;
        const m = T.mel[st]; if (m != null && S.music) tone(N(T.root + 12 + T.scale[m]), spb * 1.7, T.wave, 0.5, 1, S.next, S.musG);
        if (st % 4 === 0 && S.music) { const ch = T.chords[bar]; tone(N(T.root - 12 + ch), spb * 3.4, T.bass, 0.55, 1, S.next, S.musG); if (st % 8 === 4 || name === 'boss') tone(N(T.root + ch + 7), spb * 1.2, 'triangle', 0.18, 1, S.next + spb, S.musG); }
        if (name === 'boss' && st % 2 === 0 && S.music) { const c = S.ctx, t = S.next; const s = c.createBufferSource(); s.buffer = S.nbuf; const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6000; const g = c.createGain(); g.gain.setValueAtTime(0.22, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05); s.connect(f); f.connect(g); g.connect(S.musG); s.start(t); s.stop(t + 0.06); }
        S.next += spb; S.step++;
      }
    }, 90);
  };
  S.stop = function () { if (S.timer) clearInterval(S.timer); S.timer = null; S.track = null; };
  root.Snd = S;
})(window);

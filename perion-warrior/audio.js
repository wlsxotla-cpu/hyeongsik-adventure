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
  S.setMusic = (b) => { S.music = b; if (S.musG) S.musG.gain.value = b ? 0.16 : 0; try { if (S.yt && S.yt.playVideo) { if (b && S.ytWant && S.ytReady) S.yt.playVideo(); else if (!b) S.yt.pauseVideo(); } } catch (e) { } };

  // 원곡 BGM(유튜브 임베드): 음원 파일은 게임에 넣지 않고 유튜브 플레이어로만 재생한다. 실패하면 합성 BGM으로 되돌아감.
  // 구역별 원곡: 마을=Perion(Nightmare) / 바위산 사냥터=Highland Star / 개미굴·채석장=Ancient Remains
  // 고목의 숲=Ellinia: Missing You / 보스(고목 대장·바위왕)=Horntail / 불꽃 협곡=El Nath: Abandoned Mine(Dead Mine) / 자쿰=Zakum: Final Fight / 히든 스트리트=Sleepywood: Ancient Move(Ant Tunnel) / 시련의 탑=Ellinia: Moonlight Shadow(수련의 숲)
  S.ytMap = { town: '9lwOsX763N0', field: 'kOhEqf0wPnE', cave: 'fdoT7nTWMO8', quarry: 'fdoT7nTWMO8', forest: '2NoF8PHQJqQ', boss: 'WnLrTMmnyBc', lava: 'WmHOENuKkmk', zakum: 'rEtDrkAYs68', hidden: 'w9HagZ099c0', trial: 'XYtHWyrVm30',
    // 오르비스 확장: 오르비스=Upon the Sky / 항구=Shinin' Harbor / 배=Aqua Road: Shining Sea / 구름 정원=Orbis: Come with Me / 천상의 정원=Ellinia: When the Morning Comes / 얼음 협곡=El Nath: Snowy Village / 눈보라 고원=El Nath: Mine Quest / 서리 왕좌=El Nath: Hell Gate
    orbis: 'fTYJEdEcTbA', port: 'DThWMbPZXy8', ship: '3jdRxzy3K9s', cloud: 'sNCwJu5Buz0', garden: 'gfgBDs8z6WE', ice1: 'X6X7U5V9Obk', ice2: '8LaAGZ5kxvk', frost: '923LpjaA9Ps' };
  // 유튜브 재생이 막혔을 때 쓸 합성 BGM (새 구역은 비슷한 분위기의 곡으로)
  S.alias = { orbis: 'town', port: 'town', ship: 'field', cloud: 'field', garden: 'forest', ice1: 'cave', ice2: 'quarry', frost: 'boss' };
  S.ytId = null; S.ytReady = false; S.ytCur = null; S.ytOn = false; S.ytWant = false; S.ytFail = false; S.yt = null;
  function ytFallback() { S.ytFail = true; S.ytWant = false; const t = S.track; S.track = null; if (t) S.play(t); }
  function ytLoad(cb) {
    if (root.YT && root.YT.Player) return cb();
    if (!S.ytq) {
      S.ytq = []; const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; s.onerror = ytFallback; document.head.appendChild(s);
      root.onYouTubeIframeAPIReady = () => { const q = S.ytq; S.ytq = []; q.forEach((f) => f()); };
    }
    S.ytq.push(cb);
  }
  function ytStart() { try { if (S.ytCur !== S.ytId) { S.ytCur = S.ytId; S.yt.loadVideoById(S.ytId); } else S.yt.playVideo(); } catch (e) { } }
  S.ytPlay = function (id) {
    S.ytWant = true; S.ytId = id; if (!S.music) return;
    ytLoad(() => {
      if (!S.ytWant) return;
      if (S.yt) { if (S.ytReady) ytStart(); return; }
      const box = document.createElement('div'); box.style.cssText = 'position:fixed;left:-300px;top:0;width:200px;height:200px;opacity:0;pointer-events:none;z-index:-1';
      const inner = document.createElement('div'); box.appendChild(inner); document.body.appendChild(box);
      S.yt = new root.YT.Player(inner, { width: 200, height: 200, videoId: S.ytId, playerVars: { playsinline: 1, controls: 0, rel: 0, disablekb: 1, fs: 0 },
        events: { onReady: (e) => { S.ytReady = true; S.ytCur = S.ytId; e.target.setVolume(70); if (S.ytWant && S.music) ytStart(); },
          onStateChange: (e) => { if (e.data === 0 && S.ytWant) { e.target.seekTo(0); e.target.playVideo(); } }, onError: ytFallback } });
    });
  };
  S.ytPause = function () { S.ytWant = false; try { if (S.yt && S.yt.pauseVideo) S.yt.pauseVideo(); } catch (e) { } };
  S.setYt = function (b) { S.ytOn = !!b; if (S.track) { const t = S.track; S.track = null; S.play(t); } };
  // iPhone은 소리 자동 재생을 막으므로, 화면을 아무 데나 터치하면 멈춰 있던 원곡 BGM을 다시 시작한다
  document.addEventListener('pointerdown', () => { try { if (S.ytWant && S.music && S.yt && S.yt.getPlayerState) { const st = S.yt.getPlayerState(); if (st !== 1 && st !== 3) S.yt.playVideo(); } } catch (e) { } }, true);
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
    // 주문서: 착! 붙는 소리 → 지이잉 차오르는 빛 → 성공이면 팡! 반짝, 실패면 펑! 터지며 파편
    scrollApply: () => { const t = S.ctx.currentTime; noise(0.09, 0.5, 1700, 0.9, t + 0.02); tone(250, 0.14, 'triangle', 0.26, 0.5, t + 0.02); noise(0.06, 0.3, 3400, 1.5, t + 0.17); tone(520, 0.1, 'square', 0.08, 0.7, t + 0.2); for (let i = 0; i < 9; i++) tone(420 + i * 85, 0.14, 'triangle', 0.09, 1.15, t + 0.55 + i * 0.17); noise(1.2, 0.06, 4200, 2, t + 0.5); },
    enhOk: () => { const t = S.ctx.currentTime; noise(0.16, 0.6, 5200, 0.8, t, 'highpass'); tone(1400, 0.14, 'square', 0.22, 0.45, t); tone(300, 0.2, 'sine', 0.35, 0.5, t); [72, 76, 79, 84, 88].forEach((m, i) => tone(N(m), 0.3, 'square', 0.14, 1, t + 0.1 + i * 0.07)); tone(N(96), 0.9, 'triangle', 0.2, 1, t + 0.5); noise(0.5, 0.25, 7000, 1, t + 0.1, 'highpass'); },
    enhFail: () => { const t = S.ctx.currentTime; noise(0.55, 0.75, 170, 0.6, t, 'lowpass'); tone(95, 0.55, 'sine', 0.55, 0.35, t); noise(0.3, 0.55, 2400, 0.8, t + 0.02); tone(320, 0.5, 'sawtooth', 0.2, 0.25, t + 0.04); for (let i = 0; i < 6; i++) tone(700 + (i * 137) % 600, 0.05, 'square', 0.08, 0.6, t + 0.14 + i * 0.07); tone(150, 0.8, 'sawtooth', 0.12, 0.3, t + 0.35); },
    tick: () => { tone(1300, 0.03, 'square', 0.05); },
    click: () => { tone(900, 0.04, 'square', 0.07); },
  };
  S.sfx = function (n) { if (!S.ctx || !S.sound || !SFX[n]) return; try { SFX[n](); } catch (e) { } };

  // BGM: 트랙 = 템포, 코드 진행(루트 MIDI), 멜로디(스케일 인덱스 16스텝×4마디)
  const TR = {
    town: { bpm: 116, root: 57, scale: [0, 2, 3, 5, 7, 9, 10, 12], chords: [0, 0, 5, 5, 0, 10, 5, 7], mel: [4, null, null, 4, 5, null, 4, null, 2, null, null, 3, 4, null, null, null, 2, null, null, 2, 3, null, 2, null, 0, null, null, 1, 2, null, null, null, 5, null, null, 5, 6, null, 5, null, 4, null, null, 3, 4, null, 2, null, 3, null, null, 3, 4, null, 3, null, 1, null, null, 2, 3, null, null, null, 4, null, 5, null, 6, null, 7, null, 6, null, 5, null, 4, null, null, null, 5, null, null, 6, 5, null, 4, null, 2, null, null, 3, 2, null, null, null, 3, null, null, 4, 5, null, 4, null, 3, null, 2, null, 1, null, null, null, 2, null, null, 3, 4, null, 2, null, 1, null, 0, null, 0, null, null, null], wave: 'triangle', bass: 'square' },
    field: { bpm: 100, root: 57, scale: [0, 2, 4, 7, 9, 12, 14, 16], chords: [0, 5, 7, 4], mel: [2, null, null, 3, 4, null, 3, null, 2, null, null, 1, 2, null, null, null, 3, null, null, 4, 5, null, 4, null, 3, null, 2, null, 1, null, null, null, 4, null, 5, null, 6, null, 5, null, 4, null, 3, null, 4, null, null, null, 2, null, 3, null, 2, null, 1, null, 0, null, null, null, null, null, null, null], wave: 'triangle', bass: 'triangle' },
    forest: { bpm: 92, root: 55, scale: [0, 2, 3, 7, 8, 12, 14, 15], chords: [0, 5, 3, 7], mel: [3, null, null, 2, 3, null, 4, null, 3, null, null, null, 2, null, 1, null, 4, null, null, 3, 4, null, 5, null, 4, null, 3, null, null, null, 2, null, 5, null, null, 4, 5, null, 6, null, 5, null, 4, null, 3, null, null, null, 2, null, 3, null, 2, null, 1, null, 0, null, null, null, null, null, null, null], wave: 'sine', bass: 'triangle' },
    cave: { bpm: 84, root: 50, scale: [0, 3, 5, 7, 10, 12, 15, 17], chords: [0, 3, 5, 2], mel: [0, null, null, null, 2, null, null, 1, 0, null, null, null, 3, null, null, null, 4, null, null, 3, 2, null, null, null, 1, null, 2, null, 0, null, null, null, 0, null, null, 4, null, null, 3, null, 2, null, null, null, 1, null, 0, null, 2, null, null, 3, 4, null, null, null, 3, null, 2, 1, 0, null, null, null], wave: 'sine', bass: 'sine' },
    quarry: { bpm: 104, root: 52, scale: [0, 2, 3, 5, 7, 8, 10, 12], chords: [0, 5, 3, 6], mel: [4, null, 4, null, 5, null, 4, 3, 4, null, null, null, 2, null, 3, null, 4, null, 4, null, 6, null, 5, 4, 5, null, null, null, 3, null, 4, null, 5, null, 5, null, 6, null, 7, 6, 5, null, 4, null, 3, null, 2, null, 3, null, 4, 3, 2, null, 1, null, 2, null, 0, null, null, null, null, null], wave: 'square', bass: 'triangle' },
    boss: { bpm: 144, root: 52, scale: [0, 1, 3, 5, 7, 8, 10, 12], chords: [0, 0, 5, 6], mel: [4, 4, null, 4, 5, null, 4, 3, 4, 4, null, 4, 6, null, 5, 4, 4, 4, null, 4, 5, null, 6, 7, 6, null, 5, null, 4, null, null, null, 7, 7, null, 7, 6, null, 5, 4, 5, 5, null, 5, 4, null, 3, 2, 3, null, 4, null, 3, null, 2, null, 1, null, 0, null, 0, null, null, null], wave: 'sawtooth', bass: 'sawtooth', perc: true },
    lava: { bpm: 126, root: 50, scale: [0, 1, 4, 5, 7, 8, 10, 12], chords: [0, 0, 5, 1], mel: [4, null, 4, null, 5, null, 4, 2, 1, null, 2, null, 4, null, null, null, 4, null, 4, null, 5, null, 6, 5, 4, null, 2, null, 1, null, 0, null, 2, null, 2, null, 4, null, 2, 1, 0, null, 1, null, 2, null, null, null, 4, null, 5, null, 6, null, 5, 4, 2, null, 1, null, 0, null, null, null], wave: 'square', bass: 'sawtooth', perc: true },
    zakum: { bpm: 150, root: 47, scale: [0, 1, 3, 5, 7, 8, 10, 12], chords: [0, 1, 0, 6], mel: [7, 7, null, 7, 6, null, 5, null, 4, 4, null, 4, 5, null, 3, null, 7, 7, null, 7, 6, null, 5, 6, 7, null, 5, null, 4, null, 3, null, 3, 3, null, 3, 5, null, 3, 1, 0, null, 1, null, 3, null, null, null, 4, 5, null, 6, 7, null, 6, 5, 4, null, 3, null, 1, null, 0, null], wave: 'sawtooth', bass: 'sawtooth', perc: true },
    hidden: { bpm: 78, root: 57, scale: [0, 3, 5, 7, 10, 12, 15, 17], chords: [0, 3, 5, 2], mel: [4, null, null, null, 2, null, null, null, 3, null, null, null, null, null, null, null, 5, null, null, null, 4, null, null, null, 2, null, null, null, 0, null, null, null, 3, null, null, null, 2, null, null, null, 4, null, null, null, null, null, null, null, 5, null, null, 4, 3, null, null, null, 1, null, null, null, 0, null, null, null], wave: 'sine', bass: 'triangle' },
    trial: { bpm: 134, root: 60, scale: [0, 2, 3, 5, 7, 8, 10, 12], chords: [0, 5, 3, 7], mel: [0, 2, 4, 2, 0, 2, 4, 5, 4, 2, 4, 5, 7, 5, 4, 2, 1, 3, 5, 3, 1, 3, 5, 6, 5, 3, 5, 6, 7, 6, 5, 3, 0, 2, 4, 2, 0, 2, 4, 5, 4, 2, 4, 5, 7, 5, 4, 2, 3, 5, 6, 5, 3, 5, 6, 7, 6, 5, 4, 2, 0, null, null, null], wave: 'square', bass: 'triangle' },
  };
  S.play = function (name) {
    if (S.track === name) return; S.track = name; if (!S.ctx) return;
    if (S.timer) clearInterval(S.timer); S.timer = null; const T = TR[name] || TR[S.alias[name]]; if (!T) return;
    if (S.ytMap[name] && S.ytOn && !S.ytFail) { S.ytPlay(S.ytMap[name]); return; }
    S.ytPause();
    S.step = 0; S.next = S.ctx.currentTime + 0.1;
    S.timer = setInterval(() => {
      if (!S.ctx || S.ctx.state !== 'running') return;
      const spb = 60 / T.bpm / 2;
      while (S.next < S.ctx.currentTime + 0.25) {
        const L = T.mel.length, st = S.step % L, bar = (st / 16) | 0;
        const m = T.mel[st]; if (m != null && S.music) tone(N(T.root + 12 + T.scale[m]), spb * 1.7, T.wave, 0.5, 1, S.next, S.musG);
        if (st % 4 === 0 && S.music) { const ch = T.chords[bar]; tone(N(T.root - 12 + ch), spb * 3.4, T.bass, 0.55, 1, S.next, S.musG); if (st % 8 === 4 || T.perc) tone(N(T.root + ch + 7), spb * 1.2, 'triangle', 0.18, 1, S.next + spb, S.musG); }
        if (T.perc && st % 2 === 0 && S.music) { const c = S.ctx, t = S.next; const s = c.createBufferSource(); s.buffer = S.nbuf; const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6000; const g = c.createGain(); g.gain.setValueAtTime(0.22, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05); s.connect(f); f.connect(g); g.connect(S.musG); s.start(t); s.stop(t + 0.06); }
        S.next += spb; S.step++;
      }
    }, 90);
  };
  S.stop = function () { if (S.timer) clearInterval(S.timer); S.timer = null; S.track = null; S.ytPause(); };
  root.Snd = S;
})(window);

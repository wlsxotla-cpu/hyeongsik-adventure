// 딱지왕 골목대장 — 게임 규칙 (DOM 없음. 브라우저와 node 둘 다에서 돈다)
(function (root) {
  'use strict';

  // ---------- 딱지 도감 (24종) ----------
  // [id, 이름, 아이콘, 희귀도(1~4), 공격, 방어, 던지기쉬움(zone), 색1, 색2, 무늬, 설명]
  const RAW = [
    ['news', '신문지딱지', '📰', 1, 0.00, 0.00, 1.25, '#d9d2bd', '#a89f86', 'plain', '접어 만든 기본 딱지. 던지기 제일 쉬워요'],
    ['star', '노랑별딱지', '⭐', 1, 0.02, 0.00, 1.10, '#ffd84a', '#f08a00', 'stars', '반짝반짝 별 무늬'],
    ['red', '빨강동그라미', '🔴', 1, 0.03, 0.01, 1.05, '#ff5a4d', '#a3141b', 'dots', '문방구 앞에서 제일 많이 보이던 색'],
    ['blue', '파랑줄무늬', '🔵', 1, 0.01, 0.03, 1.05, '#4aa3ff', '#1b4aa8', 'stripes', '줄무늬라 은근 튼튼해요'],
    ['green', '초록체크', '🟩', 1, 0.02, 0.02, 1.00, '#5fd16a', '#15783a', 'checker', '교과서 뒷장으로 접은 딱지'],
    ['box', '골판지딱지', '📦', 1, 0.00, 0.05, 0.95, '#c9965a', '#7f5527', 'stripes', '이사 박스로 만든 두꺼운 딱지. 잘 안 뒤집혀요'],
    ['cal', '달력딱지', '📅', 1, 0.04, 0.00, 1.00, '#ff9db1', '#c2416a', 'dots', '빳빳한 달력 종이라 때리는 맛이 좋아요'],
    ['milk', '우유곽딱지', '🥛', 1, 0.00, 0.03, 1.15, '#f4f7ff', '#8fb4ff', 'halftone', '가볍고 던지기 쉬워요'],

    ['flame', '불꽃용사', '🔥', 2, 0.07, 0.02, 0.95, '#ff7a2f', '#7a1000', 'flames', '공격 특화! 불꽃 같은 한 방'],
    ['robot', '로봇합체', '🤖', 2, 0.05, 0.06, 0.90, '#9fb4c8', '#31475e', 'circuit', '공격도 방어도 든든한 균형형'],
    ['mask', '복면영웅', '🦸', 2, 0.08, 0.03, 0.90, '#ff4757', '#1e2a78', 'rays', '정의의 이름으로 뒤집는다!'],
    ['devil', '마왕', '😈', 2, 0.09, 0.01, 0.90, '#7a2cff', '#240a52', 'flames', '공격만 세고 방어는 약해요'],
    ['soccer', '축구왕', '⚽', 2, 0.04, 0.07, 1.00, '#5fe08a', '#0b6b34', 'checker', '방어가 좋은 운동장의 영웅'],
    ['dino', '공룡대왕', '🦖', 2, 0.06, 0.06, 0.90, '#8ccf3f', '#2b5d12', 'scales', '쿵쿵! 두꺼운 비늘 딱지'],
    ['alien', '외계인', '👽', 2, 0.05, 0.05, 1.00, '#b7f06a', '#2c6b4e', 'halftone', '신비한 은빛 무늬'],
    ['oni', '도깨비', '👹', 2, 0.08, 0.04, 0.88, '#ff6b6b', '#5b0f3c', 'scales', '뿔 달린 힘센 딱지'],

    ['dragon', '용', '🐉', 3, 0.10, 0.06, 0.85, '#35e0c4', '#0b4a6b', 'scales', '번쩍이는 홀로그램 용'],
    ['thunder', '번개', '⚡', 3, 0.12, 0.03, 0.88, '#fff25a', '#3a3aff', 'rays', '공격력 최고급! 대신 방어는 얇아요'],
    ['ghost', '유령', '👻', 3, 0.06, 0.10, 0.85, '#e6e8ff', '#5a5a9a', 'halftone', '스르륵 피하는 방어형'],
    ['pirate', '해적왕', '🏴‍☠️', 3, 0.09, 0.08, 0.85, '#2b2b2b', '#c8a64a', 'checker', '보물 같은 균형형'],
    ['rocket', '우주전사', '🚀', 3, 0.10, 0.07, 0.85, '#6c7bff', '#0c1040', 'stars', '별빛 속에서 날아온 딱지'],

    ['gold', '금박딱지', '👑', 4, 0.14, 0.08, 0.80, '#ffe27a', '#b8860b', 'foil', '골목대장의 상징. 반짝이는 금박'],
    ['rainbow', '무지개딱지', '🌈', 4, 0.12, 0.12, 0.80, '#ff6bd6', '#4be3ff', 'rainbow', '전설 속 무지개 딱지'],
    ['iron', '철판딱지', '🛡️', 4, 0.08, 0.16, 0.70, '#cfd8e3', '#5a6877', 'circuit', '진짜 철판! 거의 안 뒤집혀요'],
  ];
  const DEX = {}; const DEX_LIST = [];
  RAW.forEach(r => {
    const d = { id: r[0], name: r[1], icon: r[2], rarity: r[3], atk: r[4], def: r[5], zone: r[6], c1: r[7], c2: r[8], pattern: r[9], desc: r[10] };
    DEX[d.id] = d; DEX_LIST.push(d);
  });
  const RARITY = { 1: { name: '일반', stars: '★' }, 2: { name: '레어', stars: '★★' }, 3: { name: '에픽', stars: '★★★' }, 4: { name: '전설', stars: '★★★★' } };

  // ---------- 바닥 ----------
  const SURFACES = {
    sand: { name: '모래바닥', icon: '🏖️', mod: -0.09, note: '푹신해서 뒤집기 어려워요' },
    cement: { name: '시멘트', icon: '🧱', mod: 0, note: '평범한 딱딱한 바닥' },
    mat: { name: '장판', icon: '🟫', mod: 0.07, note: '미끄러워서 잘 뒤집혀요' },
    wet: { name: '젖은 바닥', icon: '💧', mod: -0.05, note: '딱지가 착 달라붙어요' },
  };

  // ---------- 상대 6명 (골목 순서) ----------
  const OPPS = [
    { id: 'dongsu', name: '동수', nick: '옆집 꼬마', place: '동네 놀이터', time: '오후 4시', surface: 'sand', wind: 0, skill: 0.28, tier: 1,
      look: { skin: '#ffd9b3', hair: '#3a2a1a', style: 'bowl', shirt: '#ff8a3d', extra: 'snot' },
      intro: '"형아 나랑 딱지 할래? 나 오늘 새 딱지 샀다!"', hurt: '"으앙... 한 번만 더!"', win: '"야호! 내가 이겼다~"', miss: '"어어... 안 넘어가네?"' },
    { id: 'jihun', name: '지훈', nick: '안경 반장', place: '아파트 상가 앞', time: '오후 5시', surface: 'cement', wind: 0, skill: 0.36, tier: 1,
      look: { skin: '#ffe0c2', hair: '#1d1d28', style: 'side', shirt: '#5b8def', extra: 'glasses' },
      intro: '"공부는 내가 잘하지만 딱지도 자신 있지."', hurt: '"계산이 틀렸나..."', win: '"역시 내 계산이 맞았어."', miss: '"각도가 살짝 어긋났군."' },
    { id: 'minjae', name: '민재', nick: '문방구 아들', place: '문방구 앞 좌판', time: '오후 5시 반', surface: 'mat', wind: 0, skill: 0.44, tier: 2,
      look: { skin: '#f6cba0', hair: '#5b3a1e', style: 'spiky', shirt: '#2fb67c', extra: 'cap' },
      intro: '"우리 가게 딱지가 제일 좋은 거거든!"', hurt: '"아빠한테 새 거 가져와야겠다..."', win: '"역시 공짜로 쓰는 딱지는 다르다니까."', miss: '"장판이라 미끄러졌어!"' },
    { id: 'taekwon', name: '철민', nick: '태권도장 형', place: '학교 운동장', time: '오후 6시', surface: 'cement', wind: 0.9, skill: 0.52, tier: 2,
      look: { skin: '#e9b98a', hair: '#161616', style: 'short', shirt: '#f5f5f5', extra: 'band' },
      intro: '"바람 불 때가 진짜 실력이지. 덤벼 봐!"', hurt: '"이 형을 이기다니..."', win: '"기합이 부족해!"', miss: '"바람이 방해했어!"' },
    { id: 'rainy', name: '영철', nick: '골목 그림자', place: '비 온 뒤 골목', time: '오후 7시', surface: 'wet', wind: 0.4, skill: 0.60, tier: 3,
      look: { skin: '#e2b48c', hair: '#2b2118', style: 'long', shirt: '#6a5acd', extra: 'scar' },
      intro: '"이 골목을 지나가려면... 나를 이겨야 해."', hurt: '"...대단하군."', win: '"아직 멀었다."', miss: '"물기가 문제야."' },
    { id: 'boss', name: '대철', nick: '동네짱', place: '골목 끝 가로등', time: '해질녘', surface: 'cement', wind: 0.7, skill: 0.68, tier: 4,
      look: { skin: '#f0c08e', hair: '#111', style: 'pomade', shirt: '#d62839', extra: 'crown' },
      intro: '"여기 골목대장은 나야. 네 딱지 전부 내 거다!"', hurt: '"내... 내 왕관이..."', win: '"하하하! 골목대장은 영원하다!"', miss: '"뭐야 이 바닥은!"' },
  ];

  const MAX_ROUNDS = 5;     // 한 판에서 각자 최대 던지는 횟수
  const HEARTS = 3;
  const P0 = 0.78;          // 힘 게이지의 정답 위치
  const T0 = 0.80;          // 타이밍 링의 정답 위치
  const WP = 0.30, WT = 0.24; // 정답 범위 반폭 (딱지 zone 을 곱함)

  // ---------- 난수 ----------
  function mulberry(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(rng) { let u = 0, v = 0; while (u === 0) u = rng(); v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  // ---------- 계산 ----------
  function accuracy(pos, center, half) { return clamp(1 - Math.abs(pos - center) / half, 0, 1); }
  function flipChance(q, atk, def, surfMod) {
    return clamp(0.05 + 0.70 * Math.pow(q, 1.15) + (q >= 0.9 ? 0.08 : 0) + atk - def + surfMod, 0.03, 0.95);
  }

  // 던지기 준비: 이번 던지기에서 정답 위치가 어디인지 (바람 때문에 매번 조금 달라짐)
  function setupThrow(G) {
    const D = G.duel;
    const w = D.opp.wind ? Math.round((G.rng() * 2 - 1) * 100) / 100 * D.opp.wind : 0;
    const z = D.mine.zone;
    D.sweet = { p: clamp(P0 + w * 0.13, 0.3, 0.95), t: T0, wp: WP * z, wt: WT * z, wind: w };
  }

  function newGame(seed, opts) {
    opts = opts || {};
    const rng = mulberry(seed == null ? (Math.random() * 1e9) | 0 : seed);
    const G = {
      rng, seed, phase: 'choose', stage: 0, hearts: HEARTS, level: Math.min(3, opts.level | 0),
      hand: (opts.hand || ['news', 'star', 'red']).slice(), wonIds: [], events: [], duel: null,
      duelsWon: 0, throws: 0, flips: 0, perfects: 0,
    };
    beginStage(G);
    return G;
  }

  function beginStage(G) {
    const base = OPPS[G.stage];
    const opp = Object.assign({}, base, { skill: clamp(base.skill + 0.05 * G.level, 0, 0.95) });
    const pool = DEX_LIST.filter(d => d.rarity === base.tier);
    const prize = pool[Math.floor(G.rng() * pool.length)];
    G.duel = {
      opp, prize: prize.id, theirs: prize, mine: null, mineId: null, surface: SURFACES[opp.surface],
      first: G.rng() < 0.5 ? 'me' : 'opp', round: 0, turn: null, result: null, sweet: null, log: [],
    };
    G.phase = 'choose';
    G.events.push({ t: 'stage', stage: G.stage });
  }

  function canAct(G, id, arg) {
    if (id === 'choose') return G.phase === 'choose' && G.hand.indexOf(arg) >= 0;
    if (id === 'throw') return G.phase === 'duel' && G.duel.turn === 'me';
    if (id === 'oppThrow') return G.phase === 'duel' && G.duel.turn === 'opp';
    if (id === 'next') return G.phase === 'duelEnd';
    return false;
  }

  function act(G, id, arg) {
    if (!canAct(G, id, arg)) return false;
    const D = G.duel;
    if (id === 'choose') {
      D.mineId = arg; D.mine = DEX[arg]; D.turn = D.first; D.round = 0; G.phase = 'duel';
      G.events.push({ t: 'start', first: D.first });
      if (D.turn === 'me') setupThrow(G);
      return true;
    }
    if (id === 'throw') {
      const p = clamp(+arg.p, 0, 1.2), t = clamp(+arg.t, 0, 1.2);
      const S = D.sweet;
      const ap = accuracy(p, S.p, S.wp), at = accuracy(t, S.t, S.wt);
      const q = 0.5 * ap + 0.5 * at;
      resolve(G, 'me', q, D.mine.atk, D.theirs.def, { p, t, ap, at });
      return true;
    }
    if (id === 'oppThrow') {
      const q = clamp(D.opp.skill + gauss(G.rng) * 0.15, 0.03, 1);
      resolve(G, 'opp', q, D.theirs.atk, D.mine.def, {});
      return true;
    }
    if (id === 'next') {
      const r = D.result;
      if (r === 'win') {
        G.wonIds.push(D.prize); G.hand.push(D.prize); G.duelsWon++;
        if (G.stage >= OPPS.length - 1) { G.phase = 'won'; G.events.push({ t: 'clear' }); return true; }
        if (G.hearts < HEARTS && (G.stage === 2 || G.stage === 4)) { G.hearts++; G.events.push({ t: 'snack' }); }
        G.stage++; beginStage(G);
      } else if (r === 'lose') {
        const i = G.hand.indexOf(D.mineId); if (i >= 0) G.hand.splice(i, 1);
        G.hearts--;
        if (G.hearts <= 0 || G.hand.length === 0) { G.phase = 'lost'; G.events.push({ t: 'gameover' }); return true; }
        beginStage(G); // 같은 상대에게 재도전
      } else { // draw
        if (G.stage >= OPPS.length - 1) { G.hearts--; if (G.hearts <= 0) { G.phase = 'lost'; return true; } beginStage(G); }
        else { G.stage++; beginStage(G); }
      }
      return true;
    }
    return false;
  }

  function resolve(G, who, q, atk, def, info) {
    const D = G.duel;
    const chance = flipChance(q, atk, def, D.surface.mod);
    const flip = G.rng() < chance;
    const perfect = q >= 0.9;
    const ev = { t: 'throw', who, q, chance, flip, perfect, round: D.round, p: info.p, tt: info.t, ap: info.ap, at: info.at };
    G.events.push(ev); D.log.push(ev);
    if (who === 'me') { G.throws++; if (flip) G.flips++; if (perfect) G.perfects++; }
    if (flip) {
      D.result = who === 'me' ? 'win' : 'lose'; G.phase = 'duelEnd';
      G.events.push({ t: 'duelEnd', result: D.result });
      return;
    }
    // 다음 차례
    D.turn = who === 'me' ? 'opp' : 'me';
    if (who !== D.first) D.round++; // 후공이 던지면 한 바퀴 끝
    if (D.round >= MAX_ROUNDS) { D.result = 'draw'; G.phase = 'duelEnd'; G.events.push({ t: 'duelEnd', result: 'draw' }); return; }
    if (D.turn === 'me') setupThrow(G);
  }

  function summary(G) { return { stage: G.stage, hearts: G.hearts, hand: G.hand.length, duelsWon: G.duelsWon }; }

  const API = { DEX, DEX_LIST, RARITY, SURFACES, OPPS, MAX_ROUNDS, HEARTS, P0, T0, WP, WT, newGame, act, canAct, accuracy, flipChance, setupThrow, summary, mulberry, gauss, clamp };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.Engine = API;
})(typeof window !== 'undefined' ? window : globalThis);

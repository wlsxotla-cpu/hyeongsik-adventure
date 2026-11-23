// 봇 시뮬레이터: node sim.js [판수]
const E = require('./engine.js');
const N = +process.argv[2] || 2000;

// 봇 종류: sd = 타이밍 손떨림(작을수록 정확). 랜덤봇은 sd=null(아무 위치나 탭)
function makeBot(name, sd, pick) {
  return { name, sd, pick };
}
function bestPick(G) { // 공격+방어+쉬움 합산이 높은 딱지
  let best = null, bs = -1;
  for (const id of G.hand) { const d = E.DEX[id]; const s = d.atk * 1.0 + d.def * 0.9 + (d.zone - 1) * 0.35; if (s > bs) { bs = s; best = id; } }
  return best;
}
function randPick(G) { return G.hand[Math.floor(G.rng() * G.hand.length)]; }

function runOne(seed, bot, level, startHand) {
  const G = E.newGame(seed, { hand: startHand, level });
  const jr = E.mulberry(seed ^ 0x9e3779b9);
  let guard = 0, deathStage = -1;
  const duels = []; // 판별 승/패
  while (G.phase !== 'won' && G.phase !== 'lost' && guard++ < 500) {
    if (G.phase === 'choose') { E.act(G, 'choose', bot.pick(G)); continue; }
    if (G.phase === 'duel') {
      if (G.duel.turn === 'me') {
        const S = G.duel.sweet;
        let p, t;
        if (bot.sd == null) { p = jr(); t = jr(); }
        else { p = S.p + E.gauss(jr) * bot.sd; t = S.t + E.gauss(jr) * bot.sd; }
        E.act(G, 'throw', { p, t });
      } else E.act(G, 'oppThrow');
      continue;
    }
    if (G.phase === 'duelEnd') { duels.push(G.duel.result); if (G.duel.result === 'lose') deathStage = G.stage; E.act(G, 'next'); continue; }
  }
  return { win: G.phase === 'won', stageEnd: G.stage, duels, hearts: G.hearts, flips: G.flips, throws: G.throws, G };
}

const START = ['news', 'star', 'red'];
const bots = [
  makeBot('랜덤봇(아무 때나 탭, 딱지도 랜덤)', null, randPick),
  makeBot('서투른 사람(sd 0.18)', 0.18, bestPick),
  makeBot('보통 사람(sd 0.12)', 0.12, bestPick),
  makeBot('합리 봇(sd 0.08)', 0.08, bestPick),
  makeBot('고수(sd 0.04)', 0.04, bestPick),
];
for (const level of [0, 1]) {
  console.log(`\n=== 난이도 별 ${level}개 (${N}판) ===`);
  for (const b of bots) {
    let wins = 0; const died = new Array(E.OPPS.length).fill(0); let dw = 0, dt = 0, flips = 0, th = 0, draws = 0;
    for (let i = 0; i < N; i++) {
      const r = runOne(1000 + i, b, level, START);
      if (r.win) wins++; else died[r.stageEnd]++;
      r.duels.forEach(d => { dt++; if (d === 'win') dw++; if (d === 'draw') draws++; });
      flips += r.flips; th += r.throws;
    }
    console.log(`${b.name}: 한 판 클리어 ${(wins / N * 100).toFixed(1)}% | 단판승률 ${(dw / dt * 100).toFixed(1)}% | 무승부 ${(draws / dt * 100).toFixed(1)}% | 내 던지기 성공 ${(flips / th * 100).toFixed(0)}% | 탈락 단계 ${died.map(x => (x / N * 100).toFixed(0)).join('/')}%`);
  }
}

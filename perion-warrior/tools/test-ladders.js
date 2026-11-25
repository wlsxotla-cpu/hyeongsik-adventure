// 모든 맵의 모든 밧줄: 바닥에서 ▲ 를 누르고 있으면 위 발판 위에 올라서는지 (엔진 그대로 시뮬레이션)
const E = require('../engine.js'), D = require('../data.js'); let bad = 0, n = 0;
for (const id in D.MAPS) { const m = D.MAPS[id]; (m.ladders || []).forEach((l, i) => { n++;
  const G = E.newGame('l', 1); E.loadMap(G, id, null); G.mons = []; G.slots = []; const p = G.p; const low = m.plats.filter((q) => Math.abs(q.y - l.y2) < 2 && l.x >= q.x && l.x <= q.x + q.w)[0];
  if (!low) { console.log('FAIL', id, '밧줄', i, '아래 끝(' + l.y2 + ')에 발판이 없음'); bad++; return; }
  const top = m.plats.filter((q) => q.y === l.y1 && l.x > q.x + 6 && l.x < q.x + q.w - 6)[0];
  if (!top) { console.log('FAIL', id, '밧줄', i, '위 끝(' + l.y1 + ')에 발판이 없음 x=' + l.x); bad++; return; }
  p.x = l.x; p.y = low.y; p.onGround = true; p.plat = low; p.vy = 0; G.input.up = true; let ok = false;
  for (let t = 0; t < 60 * 14; t++) { E.step(G, 1 / 60); G.events.length = 0; if (p.onGround && p.plat === top && Math.abs(p.y - l.y1) < 1) { ok = true; break; } }
  if (!ok) { console.log('FAIL', id, '밧줄', i, '올라가지 못함 x=' + l.x, 'y=' + Math.round(p.y), 'climb=' + !!p.climb, 'onGround=' + p.onGround); bad++; }
}); }
console.log('밧줄', n, '개', bad ? 'FAILED ' + bad : 'ALL OK'); process.exit(bad ? 1 : 0);

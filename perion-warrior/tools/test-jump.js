// 점프맵: 연속한 발판으로 실제 물리 점프가 가능한지 확인 (엔진 그대로 시뮬레이션)
const E = require('../engine.js'), D = require('../data.js');
const m = D.MAPS.trial; let bad = 0;
for (let i = 1; i < m.plats.length - 1; i++) {
  const a = m.plats[i], b = m.plats[i + 1]; let okAny = false;
  for (const off of [2, 6, 10]) {
    const G = E.newGame('j', 1); E.loadMap(G, 'trial', { x: 200 }); const p = G.p; p.x = (b.x + b.w / 2 > a.x + a.w / 2) ? a.x + a.w - off : a.x + off; p.y = a.y; p.vy = 0; p.onGround = true;
    const dirRight = b.x + b.w / 2 > a.x + a.w / 2; if (b.x < a.x + a.w && b.x + b.w > a.x) { okAny = true; break; }
    G.input.right = dirRight; G.input.left = !dirRight; E.tapJump(G);
    for (let t = 0; t < 90; t++) { E.step(G, 1 / 60); if (p.onGround && Math.abs(p.y - b.y) < 1 && p.x > b.x && p.x < b.x + b.w) { okAny = true; break; } }
    if (okAny) break;
  }
  if (!okAny) { console.log('FAIL jump', i, '->', i + 1, a, b); bad++; }
}
const last = m.plats.length - 1; console.log(bad ? 'FAILS ' + bad : 'ALL jumps OK (' + last + ' platforms, top y=' + m.plats[last].y + ')'); process.exit(bad ? 1 : 0);

// 점프맵: 연속한 발판으로 실제 물리 점프가 가능한지 + 얼마나 빡빡한지(성공 타이밍 창) 확인 (엔진 그대로 시뮬레이션)
// 플레이어 전략: 점프하며 방향키를 T프레임만 누르다 떼기 (T 0..80). 성공하는 T 개수 = 여유(창). 작을수록 어렵다.
const E = require('../engine.js'), D = require('../data.js');
const m = D.MAPS.trial; let bad = 0, tight = 0; const wins = [];
for (let i = 1; i < m.plats.length - 1; i++) {
  const a = m.plats[i], b = m.plats[i + 1]; const dirRight = b.x + b.w / 2 > a.x + a.w / 2; let win = 0;
  for (let T = 0; T <= 44; T++) {
    const G = E.newGame('j', 1); E.loadMap(G, 'trial', { x: 200 }); const p = G.p; p.x = dirRight ? a.x + a.w - 3 : a.x + 3; p.y = a.y; p.vy = 0; p.vx = 0; p.onGround = true; p.plat = a;
    G.input.right = dirRight; G.input.left = !dirRight; E.tapJump(G); let landed = false;
    for (let t = 0; t < 120; t++) { if (t === T) { G.input.right = G.input.left = false; } E.step(G, 1 / 60); if (p.onGround && p.plat === b) { landed = true; break; } if (p.onGround && p.plat === a && t > 5) break; }
    if (landed) win++;
  }
  wins.push(win); if (win === 0) { console.log('FAIL jump', i, '->', i + 1, a, b); bad++; } else if (win < 4) tight++;
}
const last = m.plats.length - 1; console.log('platforms', last, '· top y=' + m.plats[last].y, '· 타이밍 창(프레임) 최소/평균', Math.min(...wins), (wins.reduce((x, y) => x + y, 0) / wins.length).toFixed(1), '· 매우 빡빡한 구간', tight);
console.log(wins.join(' ')); console.log(bad ? 'FAILS ' + bad : 'ALL jumps OK'); process.exit(bad ? 1 : 0);

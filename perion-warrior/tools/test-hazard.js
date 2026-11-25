const E = require('../engine.js'), D = require('../data.js');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const G = E.newGame('h', 3); E.loadMap(G, 'trial', { x: 200 }); const p = G.p, m = G.map; const a = m.plats[5];
p.x = a.x + a.w / 2; p.y = a.y; p.onGround = true; p.plat = a; p.hp = p.baseHp;
let balls = 0, hurt = 0, seen = 0; const hp0 = p.hp;
for (let t = 0; t < 60 * 40; t++) { E.step(G, 1 / 60); p.x = Math.min(Math.max(p.x, a.x), a.x + a.w); if (G.proj.some((q) => q.kind === 'ball')) seen = 1; if (p.hp < hp0) { hurt = 1; break; } }
ok(seen, '탑에서 공이 날아온다'); ok(hurt, '공에 맞으면 피해/밀려남 (40초 안에 발판 높이로 오는 공에 적중)');
const G2 = E.newGame('h2', 4); E.loadMap(G2, 'perion', 'back'); for (let t = 0; t < 600; t++) E.step(G2, 1 / 60); ok(!G2.proj.some((q) => q.kind === 'ball'), '다른 맵에는 공 없음');
console.log(fails ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);

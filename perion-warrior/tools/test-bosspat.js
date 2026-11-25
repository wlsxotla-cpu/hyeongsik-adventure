// 보스 패턴 점검: 보스마다 공격 종류가 다양하고, 발판 위에 가만히 서 있어도(발판 캠핑) 바닥에 서 있어도 맞는지
const E = require('../engine.js'), D = require('../data.js'); let bad = 0; const f = (m) => { console.log('FAIL ' + m); bad++; };
for (const id of ['bosstree', 'bossgolem', 'zakum', 'frost', 'ship']) {
  const kinds = new Set(); const res = {};
  for (const where of ['ground', 'platform']) {
    const G = E.newGame('b', 5); const p = G.p; p.lv = 60; if (id === 'ship') { p.meso = 9999; E.loadMap(G, 'port', 'back'); E.boardShip(G, 'orbis'); G.ship.t = 9999; G.ship.bal = true; G.ship.balAt = 9999; } else E.loadMap(G, id, 'back'); const m = G.map;
    const pl = where === 'ground' ? m.plats[0] : m.plats.slice(1).reduce((a, b) => (b.y < a.y ? b : a)); // 가장 높은 발판
    p.x = pl.x + pl.w / 2; p.y = pl.y; p.onGround = true; p.plat = pl; p.baseHp = 999999; p.hp = 999999; let hits = 0, last = p.hp;
    for (let i = 0; i < 60 * 90; i++) { p.hp = Math.min(p.hp, 999999); p.x = pl.x + pl.w / 2; E.step(G, 1 / 60); if (G.boss && G.boss.atkn) kinds.add(G.boss.atkn); if (p.hp < last) hits++; last = p.hp; p.inv_t = Math.min(p.inv_t, 0.3); G.events.length = 0; }
    res[where] = hits;
  }
  console.log((D.MON[id] ? D.MON[id].n : id), '패턴', [...kinds].join(','), '· 90초간 피격 바닥', res.ground, '/ 최고 발판', res.platform);
  if (kinds.size < (id === 'bosstree' ? 4 : 5)) f(id + ' 패턴 종류 부족 ' + kinds.size);
  if (res.platform < 4) f(id + ' 발판 캠핑이 너무 안전함 (피격 ' + res.platform + ')');
  if (res.ground < 4) f(id + ' 바닥 피격이 너무 적음');
}
console.log(bad ? 'FAILED ' + bad : 'ALL OK'); process.exit(bad ? 1 : 0);

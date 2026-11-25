const E = require('../engine.js'), D = require('../data.js');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const G = E.newGame('e', 4); const p = G.p;
p.inv.scW60 = 50; p.inv.scA60 = 20; p.inv.scW100 = 0; p.inv.scW10 = 1; p.inv.sw1 = 1; p.lv = 10;
E.equip(G, 'sw1');
const base = E.stats(G).maxDmg;
let succ = 0, tries = 0;
while (E.enhInfo(G, 'sw1').left > 0) { const r = E.enhance(G, 'scW60', 'weapon'); tries++; if (r.success) succ++; ok(r.ok, 'scroll used #' + tries + (r.success ? ' success +' + r.bonus : ' fail')); }
ok(tries === 7, '무기 강화 횟수 7회 = ' + tries);
ok(E.enhSlots(D.ITEMS.ar1) === 10 && E.enhSlots(D.ITEMS.hm1) === 5 && E.enhSlots(D.ITEMS.gl1) === 5 && E.enhSlots(D.ITEMS.sh1) === 5, '한벌옷 10 · 모자/장갑/신발 5');
ok(!E.enhance(G, 'scW60', 'weapon').ok, '횟수 소진 후 거부');
ok(p.inv.scW60 === 50 - tries, '주문서 소모 ' + p.inv.scW60);
const after = E.stats(G).maxDmg; ok(succ === 0 ? after === base : after > base, '성공 시 공격력 증가 ' + base.toFixed(1) + '→' + after.toFixed(1));
ok(!D.ITEMS.scRe, '복구 주문서 삭제됨');
ok(E.enhance(G, 'scA60', 'weapon').ok === false, '방어구 주문서는 무기에 못 씀');
ok(E.scrollTargets(G, 'scA60').every((t) => t.slot !== 'weapon'), '방어구 대상 목록에 무기 없음');
// 방어구
const d0 = E.stats(G).def; let w = 0; for (let i = 0; i < 3; i++) { const r = E.enhance(G, 'scA60', 'armor'); if (r.success) w++; }
ok(E.stats(G).def >= d0, '방어구 강화 def ' + d0 + '→' + E.stats(G).def + ' (성공 ' + w + ')');
// 저장/불러오기 유지
const s = JSON.parse(JSON.stringify(E.serialize(G))); const g2 = E.newGame('x', 1, s); ok(JSON.stringify(g2.p.enh) === JSON.stringify(p.enh), '강화 기록 저장 유지');
// 확률 대략 (10%)
let c10 = 0; const g3 = E.newGame('r', 99); g3.p.lv = 30; g3.p.inv.sw4 = 1; E.equip(g3, 'sw4'); for (let i = 0; i < 400; i++) { g3.p.inv.scW10 = 1; g3.p.enh = {}; if (E.enhance(g3, 'scW10', 'weapon').success) c10++; }
ok(c10 > 15 && c10 < 70, '10% 주문서 성공 ' + c10 + '/400');
// 100% 주문서: 항상 성공, 보너스는 60%보다 작다
const g4 = E.newGame('h', 5); g4.p.lv = 20; g4.p.inv = { sw3: 1, scW100: 3, scW60: 3 }; E.equip(g4, 'sw3');
let all = true; for (let i = 0; i < 3; i++) { const r = E.enhance(g4, 'scW100', 'weapon'); if (!r.success) all = false; }
ok(all, '100% 주문서 3회 모두 성공 (공격력 +' + g4.p.enh.sw3.atk + ')');
const g5 = E.newGame('h2', 6); g5.p.lv = 20; g5.p.inv = { sw3: 1, scW60: 40 }; E.equip(g5, 'sw3'); let bon60 = 0; for (let i = 0; i < 100 && !bon60; i++) { g5.p.enh = {}; const r = E.enhance(g5, 'scW60', 'weapon'); if (r.success) bon60 = r.bonus; }
ok(bon60 > g4.p.enh.sw3.atk / 3, '60% 보너스(' + bon60 + ') > 100% 보너스(' + g4.p.enh.sw3.atk / 3 + ')');
console.log(fails ? 'FAILS ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);

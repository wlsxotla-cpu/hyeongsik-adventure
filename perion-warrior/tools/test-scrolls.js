// 확장된 주문서: 능력치 주문서, 황금 망치, 혼돈의 주문서, 30% 단계
const E = require('../engine.js'), D = require('../data.js');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const G = E.newGame('s', 4); const p = G.p; p.lv = 60; p.str = 99; p.dex = 99; E.loadMap(G, 'rock1', null); G.mons = []; G.slots = [];
p.inv = { sw5: 1, ar6: 1 }; E.equip(G, 'sw5'); p.inv.ar6 = 1; E.equip(G, 'ar6');
for (const id of ['scS100', 'scD60', 'scH30', 'scG', 'scC60', 'scW30', 'scA30', 'scS10', 'scD10', 'scH10']) if (!D.ITEMS[id]) ok(false, id + ' 정의됨');
// 100% 주문서는 반드시 성공
p.inv.scS100 = 5; p.inv.scD100 = 5; p.inv.scH100 = 5; const before = E.stats(G);
let r = E.enhance(G, 'scS100', 'armor'); ok(r.ok && r.success && r.bonus >= 1, '힘 주문서 100% 성공 +' + r.bonus); r = E.enhance(G, 'scD100', 'weapon'); ok(r.success, '민첩 주문서는 무기에도 가능');
r = E.enhance(G, 'scH100', 'armor'); ok(r.success && r.bonus > 50, '체력 주문서 100% (HP +' + r.bonus + ')'); const after = E.stats(G);
ok(after.str > before.str && after.dex > before.dex && after.maxHp > before.maxHp, '능력치 주문서 효과가 실제 능력치에 반영 (STR ' + before.str + '→' + after.str + ', HP ' + before.maxHp + '→' + after.maxHp + ')');
// 황금 망치: 횟수 +1, 장비당 2번까지
const slots0 = E.enhInfo(G, 'ar6').slots; p.inv.scG = 5; r = E.enhance(G, 'scG', 'armor'); ok(r.success && E.enhInfo(G, 'ar6').slots === slots0 + 1, '황금 망치: 강화 가능 횟수 +1'); E.enhance(G, 'scG', 'armor'); r = E.enhance(G, 'scG', 'armor'); ok(!r.ok && E.enhInfo(G, 'ar6').slots === slots0 + 2, '황금 망치는 장비당 2번까지');
// 혼돈: 여러 번 써서 결과가 흩어지는지(오르기도 내리기도)
let ups = 0, downs = 0; for (let i = 0; i < 60; i++) { const g = E.newGame('c', 50 + i); g.p.lv = 60; g.p.str = 99; g.p.dex = 99; g.p.inv = { ar6: 1, scC60: 1 }; E.equip(g, 'ar6'); g.p.inv.scC60 = 1; const rr = E.enhance(g, 'scC60', 'armor'); if (rr.success && rr.chaos) { if (rr.chaos.a > 0) ups++; if (rr.chaos.a < 0 || rr.chaos.s < 0) downs++; } }
ok(ups > 5 && downs > 5, '혼돈의 주문서는 오르기도 내리기도 한다 (↑' + ups + ' ↓' + downs + ')');
// 30% 단계 확률
let win = 0; for (let i = 0; i < 400; i++) { const g = E.newGame('w', 900 + i); g.p.lv = 60; g.p.str = 99; g.p.dex = 99; g.p.inv = { sw5: 1, scW30: 1 }; E.equip(g, 'sw5'); g.p.inv.scW30 = 1; if (E.enhance(g, 'scW30', 'weapon').success) win++; }
ok(win > 90 && win < 150, '30% 주문서 성공률 ' + (win / 4).toFixed(0) + '%');
// 저장·불러오기와 옛 기록 호환
const s = JSON.parse(JSON.stringify(E.serialize(G))); const g2 = E.newGame('s', 9, s); ok(E.enhInfo(g2, 'ar6').slots === slots0 + 2 && E.stats(g2).str === after.str, '저장 후에도 능력치 주문서·망치 효과 유지');
const old = E.newGame('o', 3); old.p.lv = 30; old.p.inv = { sw2: 1 }; E.equip(old, 'sw2'); old.p.enh.sw2 = { n: 1, atk: 2, def: 0, ok: 1 }; ok(E.stats(old).maxDmg > 0 && E.enhInfo(old, 'sw2').left > 0, '옛 강화 기록(새 필드 없음)도 정상');
console.log(fails ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);

// 장비 스탯 제한 + 피격 중 스킬 입력 보관 테스트
const E = require('../engine.js'), D = require('../data.js');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const G = E.newGame('r', 1); const p = G.p; p.lv = 30; p.inv.sw4 = 1; p.inv.hm4 = 1;
let r = E.equip(G, 'sw4'); ok(!r.ok && /STR/.test(r.msg), '레벨만 돼도 STR 부족하면 착용 불가: ' + r.msg);
p.str = 40; r = E.equip(G, 'sw4'); ok(!r.ok && /DEX/.test(r.msg), 'STR 충분·DEX 부족이면 불가: ' + r.msg);
p.dex = 12; r = E.equip(G, 'sw4'); ok(r.ok, '스탯 충족하면 착용');
ok(E.equip(G, 'hm4').ok === true, '투구(STR 22) 착용');
ok(E.canWear(G, D.ITEMS.sw0).ok, '기본 낡은 검은 항상 착용 가능');
// 스킬 보관: 피격(knock) 중 입력해도 끝나면 나간다
const g = E.newGame('k', 2); g.p.lv = 5; g.p.skills.power = 1; g.p.mp = 50;
const tick = (n) => { for (let i = 0; i < n; i++) E.step(g, 1 / 60); };
tick(10); g.p.knock = 0.22; g.p.atkCd = 0.5; g.input.skills.push('power'); tick(2);
ok(g.p.skBuf && !g.p.atk, '피격 중엔 스킬이 보관됨');
tick(40); ok(!!g.p.atk && g.p.atk.kind === 'power' || g.p.skCd.power > 0, '조건이 풀리면 스킬이 나감');
console.log(fails ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);

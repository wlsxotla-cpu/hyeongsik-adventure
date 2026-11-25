const E = require('../engine.js'), D = require('../data.js');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const G = E.newGame('s', 1), p = G.p; p.lv = 90; p.str = 999; p.dex = 999; const eqs = ['gludia_sword', 'gludia_hm', 'gludia_ar', 'gludia_gl', 'gludia_sh'];
p.equip.weapon = eqs[0]; ok(E.setInfo(G) === null, '1부위는 세트 효과 없음'); const a0 = E.stats(G).def;
p.equip.helmet = eqs[1]; ok(E.setInfo(G).n === 2 && E.setInfo(G).bonus.def > 0, '2부위 방어 보너스');
p.equip.armor = eqs[2]; p.equip.gloves = eqs[3]; p.equip.shoes = eqs[4]; const si = E.setInfo(G); ok(si.n === 5 && si.bonus.atk > 0 && si.bonus.str > 0, '5부위 풀세트 보너스');
ok(E.stats(G).def > a0, '스탯에 반영');
console.log(fails ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);

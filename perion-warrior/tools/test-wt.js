const E = require('../engine.js'), D = require('../data.js');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
function mk(job) { const G = E.newGame('w', 9); const p = G.p; p.lv = 30; p.str = 80; p.dex = 40; p.quests.q9 = { st: 'done', prog: [] }; p.inv = { gs2: 1, ax2: 1, mc2: 1, sp2: 1, sw2: 1 }; E.advance(G, job); return G; }
let G = mk('fighter'); ok(G.p.equip.weapon === 'sw0', '파이터: 한손검 유지'); ok(!E.equip(G, 'ax2').ok && !E.equip(G, 'mc2').ok && !E.equip(G, 'sp2').ok, '파이터: 도끼·둔기·창 불가'); ok(E.equip(G, 'gs2').ok, '파이터: 양손검 가능');
G = mk('page'); ok(G.p.equip.weapon === 'mc0', '페이지: 전직 시 나무 망치로 교체'); ok(E.equip(G, 'ax2').ok && E.equip(G, 'mc2').ok, '페이지: 도끼·둔기 가능'); ok(!E.equip(G, 'gs2').ok && !E.equip(G, 'sp2').ok, '페이지: 대검·창 불가');
G = mk('spearman'); ok(G.p.equip.weapon === 'sp0', '스피어맨: 전직 시 나무 창'); ok(E.equip(G, 'sp2').ok && !E.equip(G, 'sw2').ok, '스피어맨: 창만');
ok(E.stats(G).wt === 'spear' && E.stats(G).rng >= 80, '창 사거리');
const F = E.newGame('f', 1); F.p.lv = 30; F.p.str = 80; F.p.dex = 40; F.p.inv = { sp2: 1, mc2: 1 }; ok(E.equip(F, 'sp2').ok && E.equip(F, 'mc2').ok, '무직 전사는 모든 무기 가능');
console.log(fails ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);

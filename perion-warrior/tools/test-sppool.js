const E = require('../engine.js'), D = require('../data.js');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const G = E.newGame('s', 1), p = G.p; p.quests.q9 = { st: 'done', prog: [] };
const maxAll = () => { for (let r = 0; r < 12; r++) for (const s of D.SKILL_ORDER) E.learn(G, s); };
while (p.lv < 30) { E.gainExp(G, D.expToNext(p.lv), 0, 0); maxAll(); }
ok(p.sps[1] === 0 && p.sp === 0, '1차 풀: 30레벨에 전부 소진');
E.advance(G, 'fighter');
while (p.lv < 50) { E.gainExp(G, D.expToNext(p.lv), 0, 0); }
ok(p.sps[2] > 0 && p.sps[3] === 0 && p.sps[4] === 0, '2차 풀만 쌓임 (' + p.sps[2] + ')');
ok(!E.learn(G, 'brandish'), '3차 스킬은 2차 포인트로 못 찍음');
const before = p.sps[2]; maxAll(); ok(p.sps[2] === 0 && before > 0 && E.spSpentT(p, 3) === 0, '2차 포인트는 2차 스킬에만 쓰임');
while (p.lv < 70) E.gainExp(G, D.expToNext(p.lv), 0, 0);
maxAll(); ok(E.spSpentT(p, 2) === 50, '2차 스킬 전부 만렙 (' + E.spSpentT(p, 2) + ')');
ok(p.sps[2] === 0, '2차 포인트 남지 않음');
console.log(fails ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);

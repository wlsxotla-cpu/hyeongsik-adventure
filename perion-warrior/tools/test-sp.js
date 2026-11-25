const E = require('../engine.js'), D = require('../data.js');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const G = E.newGame('s', 1), p = G.p; p.quests.q9 = { st: 'done', prog: [] };
const maxAll = (ids) => { for (let r = 0; r < 12; r++) for (const s of ids) E.learn(G, s); };
while (p.lv < 30) { E.gainExp(G, D.expToNext(p.lv), 0, 0); maxAll(['power','slash','ironbody','rage','quake','mastery','toughness']); }
ok(p.lv === 30 && p.sp === 0, 'Lv30: 1차 스킬 전부 만렙, 남는 SP 0 (sp=' + p.sp + ')');
E.advance(G, 'fighter');
while (p.lv < 40) { E.gainExp(G, D.expToNext(p.lv), 0, 0); maxAll(['rblow','berserk','fmastery']); }
maxAll(['rblow','berserk','fmastery']);
ok(p.lv === 40 && p.sp === 0 && p.skills.rblow === 10 && p.skills.berserk === 10 && p.skills.fmastery === 10, 'Lv40: 직업 스킬 전부 만렙, 남는 SP 0 (sp=' + p.sp + ')');
// 옛 저장 보정
const o = E.newGame('o', 2); o.p.lv = 24; o.p.sp = 0; for (const s of D.SKILL_ORDER) if (D.SKILLS[s].reqLv <= 24 && !D.SKILLS[s].job) o.p.skills[s] = 10;
ok(E.fixSp(o) && E.spSpent(o.p) === 0 && o.p.sp === E.spEarned(24), '옛 과다 저장은 초기화 후 기준량만 지급 (' + o.p.sp + ')');
console.log(fails ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);

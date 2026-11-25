const E = require('../engine.js'), D = require('../data.js');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const G = E.newGame('j', 3); const p = G.p;
// 스탯 초기화 시 못 입는 장비는 벗겨짐
p.lv = 30; p.str = 60; p.dex = 20; p.inv = { sw4: 1, hm4: 1, gl3: 1 }; ['sw4', 'hm4', 'gl3'].forEach((i) => ok(E.equip(G, i).ok, i + ' 착용'));
E.resetStats(G);
ok(p.equip.weapon === 'sw0' && p.inv.sw4 === 1, '스탯 초기화 → 무기는 낡은 검으로, 미스릴 소드는 가방');
ok(!p.equip.helmet && !p.equip.gloves && p.inv.hm4 === 1, '투구·장갑 벗겨짐');
// 전직
const g = E.newGame('a', 4); const q = g.p; q.lv = 30;
ok(!E.advance(g, 'fighter').ok, '시련 전에는 전직 불가');
q.quests.q9 = { st: 'done', prog: [] };
ok(E.qState(g, 'q9') === 'done' && E.advance(g, 'fighter').ok && q.job === 'fighter', '시련 후 파이터 전직');
ok(!E.advance(g, 'page').ok, '재전직 불가');
q.sp = 5; ok(E.learn(g, 'rblow') && !E.learn(g, 'charge'), '내 직업 스킬만 배움');
const base = E.stats(g).maxDmg; q.skills.fmastery = 5; ok(E.stats(g).maxDmg > base, '파이터 숙련 반영');
const h = E.newGame('b', 5); h.p.lv = 30; h.p.quests.q9 = { st: 'done', prog: [] }; E.advance(h, 'page'); const hb = E.stats(h);
ok(hb.def > 4 && hb.maxHp > h.p.baseHp, '페이지 방어/HP 보너스');

// 직업 버프가 실제로 수치에 반영되는지
function jobGame(job) { const G = E.newGame('b' + job, 7); G.p.lv = 40; G.p.str = 100; G.p.dex = 40; G.p.quests.q9 = { st: 'done', prog: [] }; E.advance(G, job); G.p.sp = 99; for (const k of D.SKILL_ORDER) for (let i = 0; i < 12; i++) E.learn(G, k); G.p.mp = 999; return G; }
function cast(G, sid) { G.input.skills.push(sid); for (let i = 0; i < 70; i++) { G.p.mp = 999; E.step(G, 1 / 60); } }
{ const g = jobGame('fighter'); const b = E.stats(g).maxDmg; cast(g, 'berserk'); ok(E.stats(g).maxDmg > b * 1.3, '파이터 버서크: 공격력 상승 ' + (E.stats(g).maxDmg / b).toFixed(2) + 'x'); }
{ const g = jobGame('page'); const b = E.stats(g).def; cast(g, 'guard'); ok(E.stats(g).def >= b + 70, '페이지 파워 가드: 방어 상승 +' + (E.stats(g).def - b)); }
{ const g = jobGame('spearman'); const b = E.stats(g).maxHp; cast(g, 'hyper'); ok(E.stats(g).maxHp > b * 1.25, '스피어맨 하이퍼 바디: 최대 HP 상승 ' + (E.stats(g).maxHp / b).toFixed(2) + 'x'); }
console.log(fails ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);

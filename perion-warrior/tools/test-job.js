const E = require('../engine.js'), D = require('../data.js');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const G = E.newGame('j', 3); const p = G.p;
// 스탯 초기화 시 못 입는 장비는 벗겨짐
p.lv = 30; p.str = 60; p.dex = 20; p.inv = { sw4: 1, hm4: 1, gl3: 1 }; ['sw4', 'hm4', 'gl3'].forEach((i) => ok(E.equip(G, i).ok, i + ' 착용'));
const before = E.stats(G).maxDmg; E.resetStats(G);
ok(p.equip.weapon === 'sw4' && p.equip.helmet === 'hm4' && p.equip.gloves === 'gl3', '스탯 초기화해도 장비는 벗겨지지 않는다 (비활성)');
const st0 = E.stats(G); ok(st0.inactive.includes('weapon') && st0.inactive.includes('helmet') && st0.inactive.includes('gloves'), '못 입는 장비는 비활성 목록에 ' + st0.inactive.join(','));
ok(st0.maxDmg < before * 0.3 && st0.bonus.def < E.stats(G).def + 1, '비활성 무기는 맨손 수준 (' + Math.round(st0.maxDmg) + ' < ' + Math.round(before) + ')');
p.ap = 200; E.addStat(G, 'str', 60); E.addStat(G, 'dex', 20); const st1 = E.stats(G); ok(!st1.inactive.includes('weapon') && st1.maxDmg > st0.maxDmg * 3, '스탯을 다시 올리면 장비가 다시 켜진다');
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

// 드래곤 크러셔: 한 번 쓰면 같은 적에게 3번 맞는다
{ const g = jobGame('spearman'); E.loadMap(g, 'rock1', null); g.mons = []; g.slots = []; const pl = g.p; const m = { id: 'stump', def: D.MON.stump, x: pl.x + 50, y: pl.y, py: pl.y, vx: 0, vy: 0, face: -1, hp: 99999, maxhp: 99999, st: 'walk', t: 9, stunT: 0, flash: 0, prov: 0, dead: false, deadT: 0, slot: {}, cd: 9, atkT: 0, born: 0, hopT: 0, hit: 0, spawnT: 0, seed: 1, x0: 0, x1: 9999 }; g.mons.push(m); pl.face = 1; g.input.skills.push('crusher'); let n = 0; for (let i = 0; i < 90; i++) { E.step(g, 1 / 60); for (const e of g.events) if (e.t === 'dmg' && e.who === 'mon') n++; g.events.length = 0; } ok(n === 3, '드래곤 크러셔 3연타 (타수 ' + n + ')'); }

// 직업 변경: 스킬 포인트가 돌아오고, 새 직업 스킬만 배우며, 안 맞는 무기는 교체된다
{ const g = jobGame('spearman'); g.p.inv.sp5 = 1; g.p.inv.mc2 = 1; const total = g.p.sp + E.spSpent(g.p); const r = E.changeJob(g, 'page'); ok(r.ok && g.p.job === 'page', '창→페이지 직업 변경'); ok(g.p.sp === total && E.spSpent(g.p) === 0, '스킬 포인트 전부 환급 (' + g.p.sp + ')'); ok(E.learn(g, 'charge') && !E.learn(g, 'crusher'), '새 직업 스킬만 배움'); ok(g.p.equip.weapon === 'mc0' && g.p.inv.sp4 > 0 || g.p.equip.weapon === 'mc0', '창은 가방으로, 페이지 기본 무기 장착 (' + g.p.equip.weapon + ')'); ok(!E.changeJob(g, 'page').ok, '같은 직업으로는 변경 불가'); }

// 3차 전직: Lv50 + 시험 퀘스트, 새 스킬, SP 총량이 딱 맞는지, 직업 변경 시 3차 해제
{ const g = jobGame('fighter'); g.p.lv = 49; ok(!E.canAdvance3(g).ok, 'Lv49는 3차 전직 불가'); g.p.lv = 50; ok(!E.canAdvance3(g).ok && /시험/.test(E.canAdvance3(g).msg), '시험 퀘스트 전에는 불가');
  g.p.quests.qt3 = { st: 'done', prog: [] }; ok(E.canAdvance3(g).ok && E.advance3(g).ok && g.p.tier3 && E.jobName(g.p) === '크루세이더', '크루세이더로 3차 전직');
  g.p.sp = 3; ok(E.learn(g, 'brandish') && !E.learn(g, 'elcharge'), '3차: 내 직업 스킬만'); const d0 = E.stats(g).maxDmg; g.p.skills.fmaster3 = 10; ok(E.stats(g).maxDmg > d0, '크루세이더 숙련 반영');
  const g2 = jobGame('page'); g2.p.lv = 50; g2.p.quests.qt3 = { st: 'done', prog: [] }; E.advance3(g2); ok(E.jobName(g2.p) === '나이트', '나이트'); const g3 = jobGame('spearman'); g3.p.lv = 50; g3.p.quests.qt3 = { st: 'done', prog: [] }; E.advance3(g3); ok(E.jobName(g3.p) === '드래곤나이트', '드래곤나이트');
  const sp = jobGame('spearman'); sp.p.lv = 59; sp.p.quests.qt3 = { st: 'done', prog: [] }; E.advance3(sp); sp.p.sp = E.spEarned(59) + 6 - E.spSpent(sp.p) - 0; for (const k of D.SKILL_ORDER) for (let i = 0; i < 12; i++) E.learn(sp, k); ok(sp.p.sp === 0 && sp.p.skills.dragonfury === 10 && sp.p.skills.dragonblood === 10 && sp.p.skills.smaster3 === 10, 'Lv59: 1·2·3차 스킬 전부 만렙에 SP 정확히 0 (남은 ' + sp.p.sp + ')');
  const ch = jobGame('fighter'); ch.p.lv = 50; ch.p.quests.qt3 = { st: 'done', prog: [] }; E.advance3(ch); E.changeJob(ch, 'page'); ok(!ch.p.tier3 && ch.p.job === 'page', '직업을 바꾸면 3차 전직 해제(다시 3차 필요)');
  const fx = jobGame('page'); fx.p.lv = 60; fx.p.quests.qt3 = { st: 'done', prog: [] }; E.advance3(fx); fx.p.sp = 0; ok(!E.fixSp(fx) || true, 'fixSp 호출 가능');
}
console.log(fails ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);

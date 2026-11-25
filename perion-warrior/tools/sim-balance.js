// 레벨별 전투 균형 점검 (참고용): 지역 사냥터 몬스터를 직업·장비 세트로 잡는 데 걸리는 시간(초)과 한 방에 받는 피해 비율
const E = require('../engine.js'), D = require('../data.js');
function mkPlayer(job, L, gearTag, rid) {
  const G = E.newGame('b' + L, 5); const p = G.p; p.lv = L; p.str = Math.round(12 + 4.2 * (L - 1)); p.dex = Math.round(5 + 0.45 * (L - 1)); p.ap = 0; p.int = 4; p.luk = 4;
  p.baseHp = 55; for (let l = 2; l <= L; l++) p.baseHp += 16 + Math.floor(l * 0.9); p.baseMp = 14 + 3 * (L - 1);
  p.quests.q9 = { st: 'done', prog: [] }; p.quests.qt3 = { st: 'done', prog: [] }; p.quests.qt4 = { st: 'done', prog: [] };
  E.advance(G, job); if (L >= 70) E.advance3(G); if (L >= 120) E.advance4(G); p.sp = 999; p.ap = 0;
  for (const s of D.SKILL_ORDER) for (let i = 0; i < 12; i++) E.learn(G, s);
  const wt = { fighter: 'great', page: 'mace', spearman: 'spear' }[job]; const wid = `g${rid}${gearTag}_${wt}`;
  p.inv = {}; for (const sfx of [wt, 'hm', 'ar', 'gl', 'sh']) { const id = `g${rid}${gearTag}_${sfx}`; p.inv[id] = 1; }
  for (const id of Object.keys(p.inv)) E.equip(G, id);
  p.hp = E.stats(G).maxHp; p.mp = 99999; return G;
}
function ttk(G, mid, maxSec) {
  const p = G.p; E.loadMap(G, 'rock1', null); G.mons = []; G.slots = []; const def = D.MON[mid]; const m = { id: mid, def, x: p.x + 45, y: p.y, py: p.y, vx: 0, vy: 0, face: -1, hp: def.hp, maxhp: def.hp, st: 'walk', t: 99, stunT: 0, flash: 0, prov: 0, dead: false, deadT: 0, slot: {}, cd: 99, atkT: 0, born: 0, hopT: 0, hit: 0, spawnT: 0, seed: 1, x0: 0, x1: 9999 }; G.mons.push(m);
  const atk = D.SKILL_ORDER.filter((s) => D.SKILLS[s].kind === 'atk' && (p.skills[s] || 0) > 0 && (!D.SKILLS[s].job || D.SKILLS[s].job === p.job) && !(D.SKILLS[s].tier === 3 && !p.tier3) && !(D.SKILLS[s].tier === 4 && !p.tier4));
  for (const s of D.SKILL_ORDER) if (D.SKILLS[s].kind === 'buff' && p.skills[s] && (!D.SKILLS[s].job || D.SKILLS[s].job === p.job)) E.skill(G, s);
  let t = 0; while (!m.dead && t < 60 * maxSec) { p.inv_t = 99; p.hp = 1e9; p.mp = 99999; p.face = 1; m.x = p.x + 45; G.input.attack = true; for (const s of atk) if ((p.skCd[s] || 0) <= 0) { E.skill(G, s); } E.step(G, 1 / 60); G.events.length = 0; t++; }
  return m.dead ? t / 60 : Infinity;
}
console.log('직업/장비 세트별 몬스터 처치 시간(초): [세트A 레벨 L0+2 / 세트B 레벨 중후반]');
for (const r of D.REGIONS) { const rid = r.id; const rows = [];
  for (const job of ['fighter', 'page', 'spearman']) { const L0 = r.lv[0]; const G1 = mkPlayer(job, L0 + 2, 'a', rid), G2 = mkPlayer(job, r.lv[1], 'b', rid); const surv = (G, mid) => { const st = E.stats(G), m = D.MON[mid]; const dmg = m.atk * (1 - st.def / (st.def + 20 + 3.5 * m.lv)); return Math.round(st.maxHp / dmg); }; rows.push(`${job.slice(0, 2)} ${ttk(G1, rid + '0', 120).toFixed(1)}→${ttk(G2, rid + '5', 120).toFixed(1)}s 버팀 ${surv(G1, rid + '0')}→${surv(G2, rid + '5')}회`); }
  console.log(r.id.padEnd(8), 'Lv', String(r.lv[0]).padStart(3), '-', String(r.lv[1]).padEnd(3), rows.join(' | ')); }
console.log('\n보스 처치 시간(초, 맞지 않고 계속 때릴 때 · 세트B 장비, 지역 최고 레벨):');
for (const r of D.REGIONS) { const rows = []; for (const job of ['fighter', 'page', 'spearman']) { const G = mkPlayer(job, r.lv[1], 'b', r.id); rows.push(`${job.slice(0, 2)} ${ttk(G, r.id + 'b', 900).toFixed(0)}s`); } console.log(r.id.padEnd(8), rows.join(' | ')); }

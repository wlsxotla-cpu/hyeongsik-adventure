/* 밸런스 시뮬레이터: node sim.js [레벨목록...]  (바닥층 사냥 봇으로 시간당 경험치·피해량 측정) */
const D = require('./data.js'); const E = require('./engine.js');

function build(L, mapId, opt) {
  opt = opt || {};
  const G = E.newGame('봇', 1234 + L);
  const p = G.p;
  p.lv = L; p.str = 12 + 5 * (L - 1) - (opt.dexAp || 0); p.dex = 5 + (opt.dexAp || 0);
  p.baseHp = 55; for (let l = 2; l <= L; l++) p.baseHp += 16 + Math.floor(l * 0.9);
  p.baseMp = 14 + 3 * (L - 1);
  // 스킬 투자
  let sp = 3 * (L - 1); const order = ['power', 'power', 'mastery', 'power', 'slash', 'toughness', 'ironbody', 'quake', 'rage'];
  const want = { power: 10, mastery: 10, slash: 10, toughness: 6, ironbody: 5, quake: 10, rage: 5 };
  for (let guard = 0; guard < 300 && sp > 0; guard++) { let did = false; for (const s of ['power', 'mastery', 'slash', 'quake', 'toughness', 'ironbody', 'rage']) { if (sp > 0 && D.SKILLS[s].reqLv <= L && (p.skills[s] || 0) < want[s]) { p.skills[s] = (p.skills[s] || 0) + 1; sp--; did = true; } } if (!did) break; }
  p.sp = 0;
  // 장비(상점 판매 중 레벨 이하 최고)
  const pick = (slot) => { let best = null; for (const id of D.SHOPS.smith.items.concat(opt.drops || [])) { const it = D.ITEMS[id]; if (it.slot === slot && it.lv <= L && (!best || (it.atk || it.def) > (best.atk || best.def))) best = it; } return best && best.id; };
  for (const slot of ['weapon', 'helmet', 'armor', 'gloves', 'shoes']) { const id = pick(slot); if (id) p.equip[slot] = id; }
  p.inv = { hp1: 0 }; p.meso = 0;
  E.loadMap(G, mapId, { x: 300 });
  const st = E.stats(G); p.hp = st.maxHp; p.mp = st.maxMp;
  return G;
}

function run(L, mapId, secs, opt) {
  opt = opt || {};
  const G = build(L, mapId, opt); const p = G.p; const plat0 = G.map.plats[0];
  let potions = opt.potions == null ? 9999 : opt.potions;
  let exp0 = 0, expGain = 0, kills = 0, dmgTaken = 0, deaths = 0, potUsed = 0, t = 0, mesos = 0;
  const kmap = {};
  const dt = 1 / 60;
  const need = (L) => D.expToNext(L);
  let lastHp = p.hp;
  for (; t < secs; t += dt) {
    // 입력 초기화
    const inp = G.input; inp.left = inp.right = false; inp.attack = false;
    if (p.dead) { deaths++; p.dead = false; const st = E.stats(G); p.hp = st.maxHp; p.mp = st.maxMp; p.inv_t = 2; }
    // 가장 가까운 바닥 몬스터
    let tgt = null, bd = 1e9;
    for (const m of G.mons) if (!m.dead && m.py === plat0.y && m.spawnT <= 0) { const d = Math.abs(m.x - p.x); if (d < bd) { bd = d; tgt = m; } }
    if (tgt) {
      const st = E.stats(G);
      const dx = tgt.x - p.x; const reach = st.rng * 0.8;
      if (Math.abs(dx) > reach) { if (dx > 0) inp.right = true; else inp.left = true; }
      else { p.face = dx >= 0 ? 1 : -1; inp.attack = true; }
      if (Math.abs(dx) < 110 && p.onGround && !p.atk) {
        const near = G.mons.filter((m) => !m.dead && m.py === plat0.y && Math.abs(m.x - p.x) < 100).length;
        if (p.skills.quake && p.mp > 30 && !(p.skCd.quake > 0) && (near >= 3 || tgt.def.boss)) E.skill(G, 'quake');
        else if (p.skills.slash && p.mp > 12 && !(p.skCd.slash > 0) && near >= 2) E.skill(G, 'slash');
        else if (p.mp > 8 && !(p.skCd.power > 0)) E.skill(G, 'power');
      }
      if (p.skills.rage && !p.buffs.atk && p.mp > 40) E.skill(G, 'rage');
      if (p.skills.ironbody && !p.buffs.def && p.mp > 40) E.skill(G, 'ironbody');
    } else { const mid = plat0.w / 2; if (p.x < mid) inp.right = true; else inp.left = true; }
    // 물약
    const st = E.stats(G);
    if (p.hp < st.maxHp * 0.4 && G.potCd <= 0) { if (potions > 0) { p.hp = Math.min(st.maxHp, p.hp + (L < 8 ? 60 : L < 14 ? 180 : L < 22 ? 420 : 850)); potions--; potUsed++; G.potCd = 0.5; } }
    if (p.mp < 6 && L > 10 && G.potCd <= 0) { p.mp = Math.min(st.maxMp, p.mp + 150); G.potCd = 0.5; }
    const e0 = p.exp + (() => { let s = 0; return s; })(); const l0 = p.lv;
    E.step(G, dt);
    for (const e of G.events) { if (e.t === 'exp') expGain += e.amt; if (e.t === 'kill') { kills++; kmap[e.id] = (kmap[e.id] || 0) + 1; } if (e.t === 'dmg' && e.who === 'player') dmgTaken += e.amt; }
    G.events.length = 0;
    // 레벨업 방지(고정 레벨 측정)
    if (p.lv !== L) { p.lv = L; p.exp = 0; }
    mesos = p.meso;
  }
  return { L, map: mapId, secs, kills, kpm: (kills / secs * 60).toFixed(1), expPerMin: Math.round(expGain / secs * 60), levelMin: (need(L) / (expGain / secs * 60)).toFixed(1), dmgPerMin: Math.round(dmgTaken / secs * 60), hpPct: (dmgTaken / secs * 60 / st0(G) * 100).toFixed(0) + '%', potPerMin: (potUsed / secs * 60).toFixed(1), deaths, mesoPerMin: Math.round(mesos / secs * 60), kmap };
  function st0(G) { return E.stats(G).maxHp; }
}

const cases = [[1, 'rock1'], [3, 'rock1'], [5, 'rock1'], [8, 'rock2'], [10, 'rock2'], [12, 'forest'], [14, 'forest'], [14, 'ant1'], [16, 'ant1'], [19, 'ant2'], [22, 'quarry'], [25, 'quarry'], [28, 'quarry']];
const only = process.argv.slice(2).map(Number);
const secs = 240;
let totalMin = 0;
console.log('Lv  맵        kills/분  exp/분  다음레벨까지(분)  받는피해(HP%/분)  물약/분  사망  메소/분');
for (const [L, map] of cases) {
  if (only.length && !only.includes(L)) continue;
  const r = run(L, map, secs);
  console.log(String(L).padEnd(3), map.padEnd(9), String(r.kpm).padEnd(9), String(r.expPerMin).padEnd(7), String(r.levelMin).padEnd(16), String(r.hpPct).padEnd(16), String(r.potPerMin).padEnd(8), String(r.deaths).padEnd(5), r.mesoPerMin);
}

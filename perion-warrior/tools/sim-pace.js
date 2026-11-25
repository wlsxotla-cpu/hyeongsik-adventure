// 성장 속도 시뮬레이션(참고용, 테스트 아님): 단순 사냥 로봇이 맵을 올라가며 몇 분에 몇 레벨이 되는지
const E = require('../engine.js'), D = require('../data.js');
const G = E.newGame('bot', 5); const p = G.p; p.pet = { n: 'x' }; p.settings.auto = true; p.inv.hp1 = 30; p.inv.mp1 = 10;
const route = [['rock1', 1], ['rock2', 6], ['forest', 10], ['ant1', 14], ['ant2', 18], ['quarry', 22], ['lava', 30]];
let mapIdx = -1, tsec = 0, lastLv = 1; const log = [];
function setMap(i) { mapIdx = i; E.loadMap(G, route[i][0], null); }
setMap(0);
function bestBuy() { // 상점에서 살 수 있는 가장 좋은 장비를 부위별로 구매·착용
  for (const id of D.SHOPS.smith.items) { const it = D.ITEMS[id]; if (it.t !== 'equip') continue; if (!E.canWear(G, it).ok || p.meso < it.price) continue; const cur = p.equip[it.slot] && D.ITEMS[p.equip[it.slot]]; const sc = (x) => (x.atk || 0) * 3 + (x.def || 0) * 2 + (x.hp || 0) / 10; if (cur && sc(cur) >= sc(it)) continue; if (E.buy(G, id, 1).ok) E.equip(G, id); }
}
for (let i = 0; i < 60 * 60 * 90; i++) { // 90분
  if (p.dead) { p.dead = false; p.hp = E.stats(G).maxHp; p.mp = E.stats(G).maxMp; E.loadMap(G, route[mapIdx][0], null); }
  if (i % 60 === 0) {
    tsec++; if (p.ap > 0) { const need = p.dex < 12 ? 'dex' : 'str'; E.addStat(G, need, p.ap); }
    for (const s of D.SKILL_ORDER) { if (D.SKILLS[s].kind !== 'passive' || true) for (let k = 0; k < 2; k++) E.learn(G, s); }
    if (tsec % 30 === 0) bestBuy(); p.inv.hp1 = Math.max(p.inv.hp1 || 0, 5); p.mp = Math.max(p.mp, 5);
    if (p.lv > lastLv) { lastLv = p.lv; log.push(`${(tsec / 60).toFixed(1)}분 Lv${p.lv} (${route[mapIdx][0]}) 메소 ${p.meso}`); }
    const next = route.findIndex((r, k) => k > mapIdx && p.lv >= r[1] + 3 && k === mapIdx + 1); if (next >= 0) setMap(next);
    // 가장 가까운 지상 몬스터 쪽으로
    const gy = G.map.plats[0].y; let best = null; for (const m of G.mons) if (!m.dead && Math.abs(m.y - gy) < 6 && (!best || Math.abs(m.x - p.x) < Math.abs(best.x - p.x))) best = m; G._tgt = best;
    // 주문서는 안 씀. 스킬은 쿨마다
  }
  const t = G._tgt; G.input.left = G.input.right = false; if (t && !t.dead) { const dx = t.x - p.x; if (Math.abs(dx) > 40) { G.input.right = dx > 0; G.input.left = dx < 0; } else { p.face = dx >= 0 ? 1 : -1; G.input.attack = true; } } else G.input.attack = false;
  if (t && !t.dead && Math.abs(t.x - p.x) < 80 && i % 20 === 0) { for (const s of ['quake', 'slash', 'power', 'rblow', 'charge', 'crusher']) if ((p.skills[s] || 0) > 0 && (p.skCd[s] || 0) <= 0 && D.SKILLS[s].kind === 'atk') { E.skill(G, s); break; } }
  E.step(G, 1 / 60); G.events.length = 0;
}
console.log(log.filter((_, k) => k % 3 === 2 || log.length < 12).join('\n')); console.log('최종', 'Lv', p.lv, '메소', p.meso, '맵', route[mapIdx][0]);

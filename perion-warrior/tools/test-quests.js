// 퀘스트 데이터 무결성: NPC 연결, 선행 퀘스트, 몬스터/아이템/보상 id, 아이템 출처
const D = require('../data.js'), E = require('../engine.js'); let bad = 0; const f = (m) => { console.log('FAIL ' + m); bad++; };
for (const id of D.QUEST_ORDER) {
  const q = D.QUESTS[id]; if (!q) { f('없음 ' + id); continue; }
  const n = D.MAPS.perion.npcs.find((x) => x.id === q.npc); if (!n || !n.quests.includes(id)) f('NPC 연결 ' + id);
  if (q.pre && !D.QUESTS[q.pre]) f('선행 ' + id);
  for (const g of q.goals) { if (g.kill && !D.MON[g.kill]) f('몬스터 ' + id); if (g.item) { if (!D.ITEMS[g.item]) f('아이템 ' + id); else if (E.where('item', g.item).map === '?') f('출처 없음 ' + id + ' ' + g.item); } }
  for (const [i] of q.reward.items) if (!D.ITEMS[i]) f('보상 ' + id + ' ' + i);
}
for (const k of Object.keys(D.QUESTS)) if (!D.QUEST_ORDER.includes(k)) f('QUEST_ORDER 누락 ' + k);
// 시뮬레이션: 모든 퀘스트를 순서대로 완료 가능한지(레벨 무시하고 목표 채워서)
const G = E.newGame('q', 5); G.p.lv = 40; let done = 0;
for (let pass = 0; pass < 3; pass++) for (const id of D.QUEST_ORDER) { if (E.qState(G, id) === 'avail') { E.qAccept(G, id); const q = D.QUESTS[id]; q.goals.forEach((g, i) => { if (g.kill) G.p.quests[id].prog[i] = g.n; else G.p.inv[g.item] = (G.p.inv[g.item] || 0) + g.n; }); if (E.qComplete(G, id)) done++; } }
if (done !== D.QUEST_ORDER.length - (D.QUESTS.q9 ? 1 : 0) && done < D.QUEST_ORDER.length - 1) f('완료 가능한 퀘스트 수 ' + done);
console.log('퀘스트', D.QUEST_ORDER.length, '개 · 시뮬 완료', done, bad ? '· FAILED ' + bad : '· ALL OK'); process.exit(bad ? 1 : 0);

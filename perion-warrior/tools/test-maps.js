// 맵 데이터 무결성: 포탈 연결(왕복), 포탈 겹침, 스폰 발판/몬스터, 사다리 범위
const D = require('../data.js'); let bad = 0; const f = (m) => { console.log('FAIL ' + m); bad++; };
for (const id in D.MAPS) {
  const m = D.MAPS[id];
  m.portals.forEach((p, i) => {
    const t = D.MAPS[p.to]; if (!t) { f(id + ' 포탈 목적지 없음 ' + p.id + '→' + p.to); return; }
    if (!t.portals.find((q) => q.id === p.tx) && p.tx) f(id + ' 포탈 ' + p.id + ' → ' + p.to + ' 도착 포탈 "' + p.tx + '" 없음');
    m.portals.forEach((q, j) => { if (j > i && Math.abs(q.x - p.x) < 60) f(id + ' 포탈 겹침 ' + p.id + '/' + q.id + ' x=' + p.x + ',' + q.x); });
    if (p.x < 0 || p.x > m.w) f(id + ' 포탈 범위 밖 ' + p.id);
    if (p.y !== undefined && !m.plats.some((q) => q.y === p.y && p.x >= q.x + 20 && p.x <= q.x + q.w - 20)) f(id + ' 포탈 ' + p.id + ' 이(가) 발판 위에 있지 않음');
  });
  (m.spawns || []).forEach((s) => { if (!D.MON[s.m]) f(id + ' 스폰 몬스터 없음 ' + s.m); if (!m.plats[s.p]) f(id + ' 스폰 발판 없음 ' + s.p); });
  (m.ladders || []).forEach((l) => { if (l.y2 < l.y1 || l.x < 0 || l.x > m.w) f(id + ' 사다리 이상'); });
  if (m.boss && !D.MON[m.boss]) f(id + ' 보스 없음');
  for (const p of m.plats) if (p.x + p.w > m.w + 1 || p.y > m.h) f(id + ' 발판 범위 ' + JSON.stringify(p));
}
// 히든 포탈: 실제로 들어갔다 나올 수 있는지
{ const E = require('../engine.js'); const G = E.newGame('h', 1); for (const [from, to] of [['ant2', 'hiddenA'], ['lava', 'hiddenB']]) { E.loadMap(G, from, null); const pt = G.map.portals.find((q) => q.hidden); G.p.x = pt.x; G.p.y = pt.y; G.p.onGround = true; const nb = E.nearby(G); if (!nb || nb.portal !== pt) f(from + ' 숨은 포탈에 서도 인식 안 됨'); E.usePortal(G, pt); for (let i = 0; i < 120 && G.mapId !== to; i++) E.step(G, 1 / 30); if (G.mapId !== to) f(from + '→' + to + ' 이동 실패'); const back = G.map.portals[0]; E.usePortal(G, back); for (let i = 0; i < 120 && G.mapId !== from; i++) E.step(G, 1 / 30); if (G.mapId !== from || Math.abs(G.p.y - pt.y) > 1) f(to + ' → ' + from + ' 복귀 위치 이상 y=' + G.p.y); } }
console.log('맵', Object.keys(D.MAPS).length, bad ? 'FAILED ' + bad : 'ALL OK'); process.exit(bad ? 1 : 0);

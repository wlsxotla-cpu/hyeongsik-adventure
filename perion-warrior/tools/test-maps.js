// 맵 데이터 무결성: 포탈 연결(왕복), 포탈 겹침, 스폰 발판/몬스터, 사다리 범위
const D = require('../data.js'); let bad = 0; const f = (m) => { console.log('FAIL ' + m); bad++; };
for (const id in D.MAPS) {
  const m = D.MAPS[id];
  m.portals.forEach((p, i) => {
    const t = D.MAPS[p.to]; if (!t) { f(id + ' 포탈 목적지 없음 ' + p.id + '→' + p.to); return; }
    if (!t.portals.find((q) => q.id === p.tx) && p.tx) f(id + ' 포탈 ' + p.id + ' → ' + p.to + ' 도착 포탈 "' + p.tx + '" 없음');
    m.portals.forEach((q, j) => { if (j > i && Math.abs(q.x - p.x) < 60) f(id + ' 포탈 겹침 ' + p.id + '/' + q.id + ' x=' + p.x + ',' + q.x); });
    if (p.x < 0 || p.x > m.w) f(id + ' 포탈 범위 밖 ' + p.id);
  });
  (m.spawns || []).forEach((s) => { if (!D.MON[s.m]) f(id + ' 스폰 몬스터 없음 ' + s.m); if (!m.plats[s.p]) f(id + ' 스폰 발판 없음 ' + s.p); });
  (m.ladders || []).forEach((l) => { if (l.y2 < l.y1 || l.x < 0 || l.x > m.w) f(id + ' 사다리 이상'); });
  if (m.boss && !D.MON[m.boss]) f(id + ' 보스 없음');
  for (const p of m.plats) if (p.x + p.w > m.w + 1 || p.y > m.h) f(id + ' 발판 범위 ' + JSON.stringify(p));
}
console.log('맵', Object.keys(D.MAPS).length, bad ? 'FAILED ' + bad : 'ALL OK'); process.exit(bad ? 1 : 0);

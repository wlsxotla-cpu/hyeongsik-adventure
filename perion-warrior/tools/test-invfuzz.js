// 인벤토리 퍼즈: 착용/벗기/판매/구매/강화/스탯초기화/전직을 무작위로 섞어도 개수·강화기록이 어긋나지 않는지
const E = require('../engine.js'), D = require('../data.js');
let seed = 99; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const equips = Object.keys(D.ITEMS).filter((i) => D.ITEMS[i].t === 'equip'); const scrolls = Object.keys(D.ITEMS).filter((i) => /^sc/.test(i) && D.ITEMS[i].t !== 'equip');
let fails = 0; const bad = (m) => { if (fails++ < 10) console.log('FAIL ' + m); };
for (let run = 0; run < 6; run++) {
  const G = E.newGame('i', 100 + run); const p = G.p; p.lv = 40; p.str = 200; p.dex = 100; p.meso = 99999999; p.quests.q9 = { st: 'done', prog: [] };
  if (run % 2) E.advance(G, pick(['fighter', 'page', 'spearman']));
  for (let i = 0; i < 4000; i++) {
    const r = rnd(), id = pick(equips);
    try {
      if (r < 0.2) E.buy(G, id, 1);
      else if (r < 0.4) E.equip(G, id, rnd() < 0.5 ? null : Math.floor(rnd() * 3));
      else if (r < 0.5) E.unequip(G, pick(['helmet', 'armor', 'gloves', 'shoes', 'weapon']));
      else if (r < 0.62 && (p.inv[id] || 0) > 0) E.sell(G, id, 1 + Math.floor(rnd() * 2));
      else if (r < 0.8) { const s = pick(scrolls); E.addItem(G, s, 1); const tg = E.scrollTargets(G, s); if (tg.length) E.enhance(G, s, pick(tg).key); }
      else if (r < 0.84) { p.str = 5 + Math.floor(rnd() * 60); p.dex = 3 + Math.floor(rnd() * 40); E.checkGear(G); }
      else if (r < 0.88) E.resetStats(G);
      else if (r < 0.92) { p.str = 200; p.dex = 100; }
      // 불변 조건
      for (const k in p.inv) { if (!(p.inv[k] >= 0)) bad('음수 개수 ' + k + p.inv[k]); const it = D.ITEMS[k]; if (it && it.t === 'equip') { const n = E.bagRecs(G, k).length; if (n !== p.inv[k]) bad('사본 수 불일치 ' + k + ' inv=' + p.inv[k] + ' recs=' + n); } }
      for (const sl in p.equip) { const w = p.equip[sl]; if (w && !D.ITEMS[w]) bad('없는 장비 ' + w); if (w && D.ITEMS[w].slot !== sl) bad('슬롯 불일치 ' + w); }
      if (!p.equip.weapon) bad('무기 없음'); if (!(p.meso >= 0)) bad('메소 음수');
      if (p.job && p.equip.weapon && !D.JOBS[p.job].wts.includes(D.ITEMS[p.equip.weapon].wt) && E.canWear(G, D.ITEMS[p.equip.weapon]).ok) bad('직업 무기 위반');
    } catch (e) { bad('예외 ' + e.message + ' ' + (e.stack || '').split('\n')[1]); break; }
  }
}
console.log(fails ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);

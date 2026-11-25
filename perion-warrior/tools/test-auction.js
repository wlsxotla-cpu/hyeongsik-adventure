// 경매장: 매물 생성, 구매, 내놓기, 시세별 판매 시간, 정산, 만료 반환, 저장
const E = require('../engine.js'), D = require('../data.js');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const G = E.newGame('a', 5); const p = G.p; p.lv = 60; p.str = 99; p.dex = 99; p.meso = 5e7;
const now = Date.now(); E.auctionRefresh(G, now); const A = E.auction(G);
ok(A.market.length >= 9 && A.market.every((l) => D.ITEMS[l.id] && l.price > 0), '매물 ' + A.market.length + '개 생성');
ok(A.market.every((l) => { const it = D.ITEMS[l.id]; return it.t !== 'equip' || (it.lv >= 35 && it.lv <= 68); }), '내 레벨 근처 장비 위주');
ok(!E.auctionRefresh(G, now + 60000), '같은 30분 안에는 매물이 그대로'); ok(E.auctionRefresh(G, now + 31 * 60 * 1000), '30분이 지나면 매물 교체');
// 구매
const L = A.market[0], m0 = p.meso; const r = E.auctionBuy(G, L.uid); ok(r.ok && p.meso === m0 - L.price && p.inv[L.id] >= 1, '구매: 메소 차감, 가방에 들어옴'); ok(!E.auctionBuy(G, L.uid).ok, '같은 매물을 두 번 살 수 없다');
const poor = E.newGame('p', 6); poor.p.lv = 60; poor.p.meso = 1; E.auctionRefresh(poor, now); ok(!E.auctionBuy(poor, E.auction(poor).market[0].uid).ok, '메소가 모자라면 못 산다');
if (D.ITEMS[L.id].t === 'equip') ok(E.bagRecs(G, L.id).length === p.inv[L.id], '산 장비의 강화 기록도 함께');
// 내놓기
G.p.inv = { sw5: 1, shell: 5 }; E.equip(G, 'sw5'); G.p.inv.sw5 = 2; E.bagRecs(G, 'sw5')[0].ok = 3; E.bagRecs(G, 'sw5')[0].atk = 12; const mv = E.marketValue(D.ITEMS.sw5, E.bagRecs(G, 'sw5')[0]);
ok(mv > E.marketValue(D.ITEMS.sw5, { ok: 0 }), '강화된 장비는 시세가 더 높다');
const lr = E.auctionList(G, 'sw5', 0, 1); ok(lr.ok && G.p.inv.sw5 === 1 && A.mine.length === 1, '내놓으면 가방에서 빠진다'); ok(!E.auctionList(G, 'sw5', 5, 1).ok, '없는 번호는 못 올림');
// 시세별 판매 시간 통계
let fast = 0, mid = 0, slow = 0; const N = 400; for (let i = 0; i < N; i++) { const g = E.newGame('s' + i, 100 + i); g.p.lv = 60; g.p.inv = { shell: 3 }; for (const [mult, k] of [[0.8, 'f'], [1, 'm'], [2, 's']]) { const lx = E.auctionList(g, 'shell', null, mult); if (lx.ok) { const hrs = (lx.listing.soldAt - lx.listing.t0) / 3600000; if (k === 'f') fast += hrs; else if (k === 'm') mid += hrs; else slow += hrs; } } }
ok(fast < mid && mid < slow, `싸게 올릴수록 빨리 팔린다 (평균 ${(fast / N).toFixed(1)}h < ${(mid / N).toFixed(1)}h < ${(slow / N).toFixed(1)}h)`);
// 정산: 판매 완료 → 대금(수수료 5% 제외), 만료 → 반환
const g3 = E.newGame('t', 9); g3.p.lv = 60; g3.p.inv = { shell: 2 }; const a1 = E.auctionList(g3, 'shell', null, 1), a2 = E.auctionList(g3, 'shell', null, 1); a1.listing.soldAt = Date.now() - 1000; a2.listing.soldAt = Date.now() + 99 * 3600 * 1000; a2.listing.exp = Date.now() - 1000;
const st = E.auctionSettle(g3); ok(st.sold === 1 && st.back === 1 && g3.p.inv.shell === 1, '정산: 1개 팔림, 1개 기간 만료로 반환'); ok(E.auction(g3).gold === Math.floor(a1.listing.price * 0.95), '수수료 5%를 뗀 대금'); const mm = g3.p.meso; E.auctionCollect(g3); ok(g3.p.meso === mm + Math.floor(a1.listing.price * 0.95) && E.auction(g3).gold === 0, '대금 받기');
// 취소 + 저장
g3.p.inv.shell = 1; const a3 = E.auctionList(g3, 'shell', null, 1); ok(E.auctionCancel(g3, a3.listing.uid) && g3.p.inv.shell === 1, '취소하면 되돌아온다'); E.auctionList(g3, 'shell', null, 1.5); E.auctionRefresh(g3, Date.now());
const sv = JSON.parse(JSON.stringify(E.serialize(g3))); const g4 = E.newGame('t', 10, sv); ok(E.auction(g4).mine.length === 1 && E.auction(g4).market.length > 0, '저장·불러오기 후에도 경매 상태 유지');
// 퀘스트 아이템은 못 올림
const g5 = E.newGame('q', 11); g5.p.lv = 30; g5.p.quests.qm3 = { st: 'active', prog: [0] }; g5.p.inv = { stonefrag: 12 }; ok(!E.auctionList(g5, 'stonefrag', null, 1).ok, '진행 중 퀘스트 재료는 못 올린다');
console.log(fails ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);

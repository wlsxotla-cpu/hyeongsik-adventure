// 같은 장비가 여러 개일 때 강화 기록이 사본마다 따로인지 확인
const E = require('../engine.js'), D = require('../data.js');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const hm = Object.keys(D.ITEMS).find((id) => D.ITEMS[id].t === 'equip' && D.ITEMS[id].slot === 'helmet');
const G = E.newGame('c', 11); const p = G.p; p.lv = 99; p.inv = { [hm]: 2, scA100: 20, scA60: 20 };
E.equip(G, hm); // 하나는 착용, 하나는 가방
ok(p.inv[hm] === 1 && p.equip.helmet === hm, '투구 2개 중 1개 착용, 1개 가방');

// 착용한 사본에만 강화
let r = E.enhance(G, 'scA100', 'helmet'); ok(r.ok && r.success, '착용 사본 강화 성공');
ok(E.enhInfo(G, hm).used === 1 && E.enhInfo(G, hm, 0).used === 0, '가방 사본은 강화 횟수 그대로(0)');

// 가방 사본에 따로 강화 (대상 목록에 가방 사본이 보임)
const tg = E.scrollTargets(G, 'scA100'); const bagT = tg.find((t) => t.bag);
ok(!!bagT && bagT.key === hm + '~0', '대상 목록에 가방 속 사본이 있음');
r = E.enhance(G, 'scA100', bagT.key); ok(r.ok, '가방 사본 강화됨');
r = E.enhance(G, 'scA100', bagT.key);
ok(E.enhInfo(G, hm, 0).used === 2 && E.enhInfo(G, hm).used === 1, '가방 사본 2회·착용 사본 1회 (따로 계산)');

// 바꿔 입으면 강화 기록이 따라간다
const wornBefore = E.enhInfo(G, hm).used, bagBefore = E.enhInfo(G, hm, 0).used;
E.equip(G, hm, 0);
ok(E.enhInfo(G, hm).used === bagBefore && E.enhInfo(G, hm, 0).used === wornBefore, '교체하면 기록이 서로 바뀜');

// 벗었다가 다시 입어도 유지
E.unequip(G, 'helmet'); ok(p.inv[hm] === 2 && !p.equip.helmet, '벗으면 가방 2개');
const used = E.bagRecs(G, hm).map((x) => x.n).sort().join(',');
ok(used === [wornBefore, bagBefore].sort().join(','), '벗어도 두 사본 기록 보존 ' + used);

// 저장·불러오기
E.equip(G, hm); const s = JSON.parse(JSON.stringify(E.serialize(G))); const g2 = E.newGame('c', 12, s);
ok(g2.p.inv[hm] === 1 && E.enhInfo(g2, hm).used === E.enhInfo(G, hm).used && E.enhInfo(g2, hm, 0).used === E.enhInfo(G, hm, 0).used, '저장 후 불러와도 사본별 기록 유지');

// 판매는 약한 사본부터
const g3 = E.newGame('s', 13); g3.p.lv = 99; g3.p.inv = { [hm]: 3, scA100: 5 }; E.equip(g3, hm);
E.enhance(g3, 'scA100', hm + '~0'); // 가방 0번 강화
const best = E.enhInfo(g3, hm, 0).ok; E.sell(g3, hm, 1);
ok(E.bagRecs(g3, hm).length === 1 && E.enhInfo(g3, hm, 0).ok === best, '판매는 강화 안 된 사본부터, 강화된 사본은 남음');

// 옛 저장(착용 안 한 id 의 enh)은 가방으로 이전
const old = E.serialize(E.newGame('o', 14)); old.inv = { [hm]: 1 }; old.equip = Object.assign({}, old.equip, { helmet: null }); old.enh = { [hm]: { n: 2, atk: 0, def: 3, ok: 1 } };
const g4 = E.newGame('o', 15, JSON.parse(JSON.stringify(old)));
ok(!g4.p.enh[hm] && E.enhInfo(g4, hm, 0).used === 2, '옛 저장의 가방 장비 강화 기록이 가방 사본으로 이전됨');

console.log(fails ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);

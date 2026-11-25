// 배(오르비스행): 승선료, 항해 타이머, 크림슨 발록 습격, 도착, 발록 격파 보상, 저장 위치
const E = require('../engine.js'), D = require('../data.js');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
let G = E.newGame('s', 3); const p = G.p; p.lv = 50; p.meso = 100; E.loadMap(G, 'port', 'back');
ok(!E.boardShip(G, 'orbis').ok && G.mapId === 'port', '승선료가 모자라면 못 탄다');
p.meso = 10000; ok(E.boardShip(G, 'orbis').ok && G.mapId === 'ship' && p.meso === 7000, '승선료 3,000 메소를 내고 탑승');
ok(E.serialize(G).mapId === 'port', '배 위에서 저장하면 출발지(항구)로 저장');
ok(/도착까지/.test(E.objective(G).txt), '배 위에서 목표 표시줄에 남은 시간');
G.ship.bal = false; for (let i = 0; i < 60 * 80; i++) { E.step(G, 1 / 60); G.events.length = 0; if (G.mapId !== 'ship') break; }
ok(G.mapId === 'orbis' && Math.abs(G.p.x - 450) < 2, '75초 후 오르비스 도착 (x=' + Math.round(G.p.x) + ')'); ok(!G.ship, '항해 정보 정리');
// 발록 습격
G = E.newGame('s', 4); G.p.lv = 50; G.p.meso = 10000; G.p.baseHp = 99999; G.p.hp = 99999; E.loadMap(G, 'port', 'back'); E.boardShip(G, 'orbis'); G.ship.bal = true; G.ship.balAt = 70;
let seen = false, kinds = new Set(); for (let i = 0; i < 60 * 20; i++) { G.p.hp = 99999; E.step(G, 1 / 60); if (G.boss && G.boss.def.id === 'balrog') { seen = true; if (G.boss.atkn) kinds.add(G.boss.atkn); } G.events.length = 0; }
ok(seen, '크림슨 발록이 나타난다'); ok(G.boss && G.boss.def.boss, '발록은 보스'); 
// 발록을 잡으면 손톱 드랍 + 다시 안 나옴
G.boss.hp = 1; G.p.x = G.boss.x - 40; G.p.face = 1; G.input.attack = true; for (let i = 0; i < 60 * 6; i++) { G.p.hp = 99999; G.p.inv_t = 99; E.step(G, 1 / 60); G.events.length = 0; }
ok(G.drops.some((d) => d.id === 'balrogclaw') || G.p.inv.balrogclaw > 0, '발록을 잡으면 손톱 드랍'); for (let i = 0; i < 60 * 100; i++) { E.step(G, 1 / 60); G.events.length = 0; if (G.mapId !== 'ship') break; }
ok(G.mapId === 'orbis', '발록을 잡고도 도착');
// 발록 미처치로 도착하면 도망
G = E.newGame('s', 5); G.p.lv = 50; G.p.meso = 10000; G.p.baseHp = 99999; E.loadMap(G, 'port', 'back'); E.boardShip(G, 'orbis'); G.ship.bal = true; G.ship.balAt = 70; for (let i = 0; i < 60 * 80; i++) { G.p.hp = 99999; G.p.inv_t = 99; E.step(G, 1 / 60); if (G.mapId !== 'ship') break; G.events.length = 0; }
ok(G.mapId === 'orbis' && !G.boss, '발록을 못 잡아도 정시에 도착(발록 사라짐)');
console.log(fails ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);

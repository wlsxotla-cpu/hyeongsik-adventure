const E = require('../engine.js');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
function drop(pet) { const G = E.newGame('l', 1); E.loadMap(G, 'rock1', null); const p = G.p; p.pet = pet ? { n: 'x' } : null; G.mons = []; G.slots = []; G.drops.push({ x: p.x + 100, y: p.y, vx: 0, vy: 0, t: 1, life: 70, onG: true, ph: 0, id: 'hp1', n: 1 }); G.drops.push({ x: p.x + 20, y: p.y, vx: 0, vy: 0, t: 1, life: 70, onG: true, ph: 0, meso: 50 }); for (let i = 0; i < 30; i++) E.step(G, 1 / 60); return G; }
let G = drop(false); ok(G.drops.length === 1 && G.drops[0].id === 'hp1', '펫 없으면 발밑(30px) 것만 줍는다');
G = drop(true); ok(G.drops.length === 0, '펫이 있으면 150px 안의 아이템을 대신 줍는다');
console.log(fails ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);

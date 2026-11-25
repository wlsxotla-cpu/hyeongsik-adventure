// 모든 몬스터·보스·NPC·아이콘 그림이 예외 없이 그려지는지 (node 용 캔버스 흉내로 호출만 확인)
const fs = require('fs'); const vm = require('vm');
const stub = () => { const h = { get(t, k) { if (k === 'canvas') return { width: 300, height: 300 }; if (k in t) return t[k]; return typeof k === 'string' && /^(fillStyle|strokeStyle|lineWidth|globalAlpha|font|textAlign|lineJoin|lineCap|shadowBlur|shadowColor|globalCompositeOperation)$/.test(k) ? '' : (() => new Proxy({ addColorStop() {} }, h)); }, set(t, k, v) { t[k] = v; return true; } }; return new Proxy({}, h); };
const el = () => ({ getContext: () => stub(), width: 0, height: 0, style: {}, toDataURL: () => '', appendChild() {}, addEventListener() {} });
const win = { document: { createElement: el, addEventListener() {}, body: { appendChild() {} }, head: { appendChild() {} } }, performance: { now: () => 1000 }, addEventListener() {} }; win.window = win; win.globalThis = win;
const ctx = vm.createContext(win);
for (const f of ['data.js', 'art.js', 'vis.js', 'vis2.js']) vm.runInContext(fs.readFileSync(__dirname + '/../' + f, 'utf8'), ctx, { filename: f });
const D = win.DATA, A = win.Art; let bad = 0, n = 0; const c = stub();
for (const id in D.MON) { const def = D.MON[id]; const m = { def, x: 0, y: 0, py: 0, st: 'wind', face: 1, seed: 1, walk: 1, flash: 0, dead: false, deadT: 0, spawnT: 0, hp: 1, maxhp: 2, p2: true, t: 0 }; for (const st of ['walk', 'wind', 'dash']) { m.st = st; try { A.drawMon(c, m, 1.3); n++; } catch (e) { console.log('FAIL 몬스터', id, st, e.message); bad++; } } }
for (const id in D.MAPS) { const mp = D.MAPS[id]; try { const L = A.buildBg(mp, 600, 310); A.drawBg(c, L, 100, 50, 560, 310, 2.2); A.buildFore(mp); if (A.drawAtmos) A.drawAtmos(c, { map: mp }, 0, 0, 560, 310, 1.5); n++; } catch (e) { console.log('FAIL 맵', id, e.message, (e.stack || '').split('\n')[1]); bad++; } }
console.log('그리기', n, '건', bad ? 'FAILED ' + bad : 'ALL OK'); process.exit(bad ? 1 : 0);

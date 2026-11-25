// 친구와 함께(P2P) 메시지 처리 로직 (실제 연결은 브라우저에서 PeerJS 로): 상태 수신, 채팅, 호스트 중계, 만료 정리
const fs = require('fs'); const vm = require('vm'); let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const win = { document: { createElement: () => ({}), head: { appendChild() {} } } }; win.window = win; win.globalThis = win; const ctx = vm.createContext(win); vm.runInContext(fs.readFileSync(__dirname + '/../net.js', 'utf8'), ctx);
const N = win.Net; N.myId = 'me'; N.status = 'on';
N.recv({ k: 's', id: 'f1', n: '철수', m: 'rock1', x: 100, y: 400, f: 1, lv: 20, eq: {} }); ok(N.list().length === 1 && N.others.f1.n === '철수', '친구 상태 수신 → 친구 목록에 추가');
N.recv({ k: 's', id: 'f1', n: '철수', m: 'rock1', x: 160, y: 400, f: -1, lv: 20, eq: {} }); ok(N.others.f1.tx === 160 && N.others.f1.x === 100, '새 위치는 목표값으로 받고 화면에서 부드럽게 따라감');
N.recv({ k: 's', id: 'me', n: '나', m: 'x', x: 1, y: 1 }); ok(N.list().length === 1, '내 메시지가 되돌아와도 무시');
let chat = null; N.onChat = (n, t) => { chat = [n, t]; }; N.recv({ k: 'c', id: 'f1', n: '철수', text: '안녕!' }); ok(chat && chat[1] === '안녕!' && N.bubbles.f1, '채팅 수신 + 말풍선');
N.recv({ k: 'c', id: 'f1', n: '철수', text: 'x'.repeat(200) }); ok(N.bubbles.f1.text.length === 60, '채팅은 60자까지');
N.recv({ k: 'bye', id: 'f1' }); ok(N.list().length === 0, '나가면 목록에서 제거');
// 호스트 중계: 한 친구의 메시지를 다른 친구들에게만 전달
N.role = 'host'; const sent = []; const mk = (name) => ({ open: true, name, send(m) { sent.push([name, m.k]); } }); const c1 = mk('A'), c2 = mk('B'); N.conns = [c1, c2]; N.recv({ k: 'c', id: 'fa', n: 'A', text: 'hi' }, c1); ok(sent.length === 1 && sent[0][0] === 'B', '호스트가 보낸 사람 빼고 중계');
// 만료 정리
N.role = 'guest'; N.others = { z: { id: 'z', seen: Date.now() - 10000 } }; N.conns = [mk('H')]; N.tick({ p: { name: 't', x: 0, y: 0, face: 1, lv: 1, equip: {}, walkT: 0, vx: 0, onGround: true, climb: false, atk: null }, mapId: 'rock1' }, 0.2); ok(!N.others.z, '6초 이상 소식 없는 친구는 정리');
console.log(fails ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);

/* 페리온 전사 — 게임 엔진 (물리·전투·드랍·퀘스트). DOM 금지. node/브라우저 공용 */
(function (root) {
  'use strict';
  const D = root.DATA || require('./data.js');
  const E = {};
  const GRAV = 1500, JUMP = 520, HW = 9, PH = 34, CLIMB = 115, STEP = 1 / 60;

  const rand = (G) => G.rng();
  const rr = (G, a, b) => a + (b - a) * G.rng();
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const ev = (G, e) => { if (G.events.length < 400) G.events.push(e); };

  /* ───────── 새 게임 / 저장 ───────── */
  const PERSIST = ['name', 'lv', 'exp', 'str', 'dex', 'int', 'luk', 'ap', 'sp', 'skills', 'baseHp', 'baseMp', 'equip', 'inv', 'meso', 'quests', 'settings', 'hp', 'mp', 'play', 'kills', 'tut', 'pet', 'enh', 'bag', 'job', 'tier3', 'tier4', 'slots', 'auction'];
  E.newPlayer = function (name) {
    return { name: name || '전사', lv: 1, exp: 0, str: 12, dex: 5, int: 4, luk: 4, ap: 0, sp: 0, skills: { power: 1 }, baseHp: 55, baseMp: 14,
      equip: { weapon: 'sw0', armor: 'ar0', helmet: null, gloves: null, shoes: null }, inv: { hp1: 10, mp1: 3 }, meso: 50, quests: {}, kills: {},
      settings: { auto: true, autoT: 0.35, autoMp: true, autoMpT: 0.2, sound: true, music: true, shake: false, shakeV2: true }, pet: null, enh: {}, hp: 55, mp: 14, play: 0, tut: {} };
  };
  E.newGame = function (name, seed, save) {
    const G = { rng: mulberry32(seed || (Date.now() & 0xffffffff)), t: 0, acc: 0, events: [], mons: [], drops: [], proj: [], zones: [], slots: [], map: null, mapId: null,
      input: { left: false, right: false, up: false, down: false, attack: false, jump: 0, up_e: 0, skills: [], pot: null }, p: null, boss: null, shake: 0, potCd: 0, inTown: false, bgTime: 0 };
    const base = E.newPlayer(name);
    if (save) { for (const k of PERSIST) if (save[k] !== undefined) base[k] = JSON.parse(JSON.stringify(save[k])); if (base.inv && base.inv.scRe) { base.meso += 2000 * base.inv.scRe; delete base.inv.scRe; } for (const id of Object.keys(base.inv || {})) if (!D.ITEMS[id]) delete base.inv[id]; for (const id of Object.keys(base.enh || {})) if (!D.ITEMS[id]) delete base.enh[id]; if (!base.bag) base.bag = {}; for (const id of Object.keys(base.bag)) if (!D.ITEMS[id]) delete base.bag[id]; for (const id of Object.keys(base.enh || {})) { const wornHere = Object.keys(base.equip || {}).some((sl) => base.equip[sl] === id); if (!wornHere) { (base.bag[id] = base.bag[id] || []).unshift(base.enh[id]); delete base.enh[id]; } } for (const sl in base.equip || {}) if (base.equip[sl] && !D.ITEMS[base.equip[sl]]) base.equip[sl] = sl === 'weapon' ? 'sw0' : null; base.settings = Object.assign({ auto: true, autoT: 0.35, autoMp: true, autoMpT: 0.2, sound: true, music: true, shake: false }, base.settings); if (!base.settings.shakeV2) { base.settings.shake = false; base.settings.shakeV2 = true; } }
    Object.assign(base, { x: 100, y: 400, vx: 0, vy: 0, face: 1, onGround: true, plat: null, climb: null, ladderCd: 0, coyote: 0, jumpBuf: 0, dropT: 0, dropPlat: null, inv_t: 0, atkCd: 0, atk: null, knock: 0, dead: false, buffs: {}, skCd: {}, combo: 0, comboT: 0, regenT: 0, walkT: 0, hitFlash: 0 });
    G.p = base;
    E.loadMap(G, (save && save.mapId) || 'perion', save ? { x: 520 } : { x: 330 });
    const st = E.stats(G); base.hp = clamp(base.hp, 1, st.maxHp); base.mp = clamp(base.mp, 0, st.maxMp);
    return G;
  };
  E.serialize = function (G) { const o = {}; for (const k of PERSIST) o[k] = G.p[k]; o.mapId = G.mapId === 'ship' ? ((G.ship && G.ship.from) || 'port') : (G.map.boss ? 'perion' : G.mapId); o.v = 1; return o; };

  /* ───────── 능력치 ───────── */
  E.sk = (G, sid) => G.p.skills[sid] || 0;
  E.stats = function (G) {
    const p = G.p; const b = { atk: 0, def: 0, str: 0, dex: 0, hp: 0 };
    const inactive = []; // 능력치(STR/DEX)·직업이 안 맞아 꺼진 장비: 낀 채로 두되 효과만 없다 (스탯을 올리면 다시 켜짐)
    for (const slot in p.equip) { const it = D.ITEMS[p.equip[slot]]; if (!it) continue; if (!E.canWear(G, it).ok) { inactive.push(slot); continue; } b.atk += it.atk || 0; b.def += it.def || 0; b.str += it.str || 0; b.dex += it.dex || 0; b.hp += it.hp || 0; const en = p.enh && p.enh[it.id]; if (en) { b.atk += en.atk || 0; b.def += en.def || 0; b.str += en.str || 0; b.dex += en.dex || 0; b.hp += en.hp || 0; } }
    const w = (D.ITEMS[p.equip.weapon] && !inactive.includes('weapon')) ? D.ITEMS[p.equip.weapon] : (p.equip.weapon ? { atk: 6, spd: 0.5, rng: 50, wt: 'sword' } : D.ITEMS.sw0); // 무기가 꺼지면 맨손
    const str = p.str + b.str, dex = p.dex + b.dex;
    const tough = p.skills.toughness || 0, mast = p.skills.mastery || 0;
    const job = p.job, fm = job === 'fighter' ? (p.skills.fmastery || 0) : 0, pm = job === 'page' ? (p.skills.pmastery || 0) : 0, sm = job === 'spearman' ? (p.skills.smastery || 0) : 0;
    const t4 = !!p.tier4, hw = !t4 ? 0 : (job === 'fighter' ? (p.skills.herowill || 0) : job === 'page' ? (p.skills.paladinwill || 0) : (p.skills.dkwill || 0)); const f4 = t4 && job === 'fighter' ? hw : 0, p4 = t4 && job === 'page' ? hw : 0, s4 = t4 && job === 'spearman' ? hw : 0;
    const t3 = !!p.tier3, fm3 = t3 && job === 'fighter' ? (p.skills.fmaster3 || 0) : 0, pm3 = t3 && job === 'page' ? (p.skills.pmaster3 || 0) : 0, sm3 = t3 && job === 'spearman' ? (p.skills.smaster3 || 0) : 0;
    let rageMul = 1, defBuff = 0; for (const k in p.buffs) { if (/^atk/.test(k)) rageMul *= 1 + p.buffs[k].val; else if (/^def/.test(k)) defBuff += p.buffs[k].val; }
    rageMul *= (job === 'page' ? 1.15 : 1) * (job === 'fighter' ? 1.08 + fm * 0.02 : 1) * (1 + fm3 * 0.015) * (t3 ? 1.06 : 1) * (1 + f4 * 0.02) * (t4 ? 1.08 : 1);
    const wAtk = (w.atk || 10) + (w.slot === 'weapon' ? b.atk - (w.atk || 0) : 0);
    const maxDmg = Math.max(1, (str * 4 + dex) * wAtk / 100 * rageMul);
    const minRatio = clamp(0.2 + mast * 0.05 + fm * 0.01 + sm * 0.02 + sm3 * 0.02 + s4 * 0.02, 0.2, 0.9);
    const def = b.def + defBuff + Math.floor(dex / 6) + (job === 'page' ? 8 + pm * 3 : 0) + pm3 * 4 + (t3 ? 10 : 0) + p4 * 6 + (t4 ? 20 : 0);
    const maxHp = Math.round((p.baseHp + b.hp) * (1 + 0.04 * tough + (job === 'page' ? 0.08 + pm * 0.02 : 0) + (job === 'spearman' ? 0.1 : 0) + pm3 * 0.02 + (t3 ? 0.08 : 0) + p4 * 0.03 + (t4 ? 0.08 : 0)) * (1 + (p.buffs.hp2 ? p.buffs.hp2.val : 0)));
    const maxMp = Math.round(p.baseMp + p.int * 2);
    return { maxDmg, minDmg: maxDmg * minRatio, def, maxHp, maxMp, crit: 0.06 + p.luk * 0.004 + (job === 'spearman' ? 0.03 + sm * 0.015 : 0) + fm3 * 0.01 + sm3 * 0.012 + f4 * 0.01 + s4 * 0.015, speed: 142, spd: w.spd || 0.45, rng: w.rng || 58, wt: w.wt || 'sword', str, dex, wAtk, bonus: b, inactive };
  };
  E.calcMon = (id) => D.MON[id];

  /* ───────── 맵 ───────── */
  E.loadMap = function (G, id, arrive) {
    const m = D.MAPS[id]; if (!m) return;
    G.map = m; G.mapId = id; G.mons = []; G.drops = []; G.proj = []; G.zones = []; G.slots = []; G.boss = null; G.inTown = !!m.town;
    const p = G.p; p.climb = null; p.vx = p.vy = 0; p.atk = null; p.dropT = 0;
    let ax = 100;
    if (arrive && typeof arrive === 'object') ax = arrive.x;
    else if (arrive) { const pt = m.portals.find((q) => q.id === arrive); if (pt) ax = pt.x + (pt.x < m.w / 2 ? 50 : -50); }
    const apt = (arrive && typeof arrive !== 'object') ? m.portals.find((q) => q.id === arrive) : null; const ay = apt && apt.y !== undefined ? apt.y : m.plats[0].y; if (apt && apt.y !== undefined) ax = apt.x;
    p.x = clamp(ax, 30, m.w - 30); p.y = ay; p.onGround = true; p.plat = m.plats.find((q) => q.y === ay && p.x >= q.x && p.x <= q.x + q.w) || m.plats[0]; p.face = p.x < m.w / 2 ? 1 : -1;
    m.spawns.forEach((s) => {
      const pl = m.plats[s.p];
      for (let k = 0; k < s.n; k++) { const x = pl.x + 36 + (pl.w - 72) * ((k + 0.5) / s.n); const sl = { m: s.m, p: s.p, x, mon: null, respT: 0 }; G.slots.push(sl); spawnMon(G, sl); }
    });
    if (m.boss) { const pl = m.plats[0]; const sl = { m: m.boss, p: 0, x: m.bossX, mon: null, respT: 0, boss: true }; G.slots.push(sl); spawnMon(G, sl); }
    ev(G, { t: 'map', id });
  };
  function spawnMon(G, sl) {
    const def = D.MON[sl.m], pl = G.map.plats[sl.p];
    const m = { id: sl.m, def, x: sl.x, y: pl.y, py: pl.y, vx: 0, vy: 0, face: rand(G) < 0.5 ? -1 : 1, hp: def.hp, maxhp: def.hp, x0: pl.x + def.w * 0.5 + 6, x1: pl.x + pl.w - def.w * 0.5 - 6, st: 'walk', t: rr(G, 0.5, 2.5), stunT: 0, flash: 0, prov: 0, dead: false, deadT: 0, slot: sl, cd: 2, atkT: 0, born: 0, hopT: 0, hit: 0, spawnT: 0.4, seed: rand(G) * 10 };
    if (def.boss) { m.x0 = 90; m.x1 = G.map.w - 90; m.cd = 2.2; G.boss = m; }
    sl.mon = m; G.mons.push(m);
  }

  /* ───────── 입력 ───────── */
  E.press = (G, k) => { G.input[k] = true; };
  E.release = (G, k) => { G.input[k] = false; };
  E.tapJump = (G) => { G.input.jump = 0.14; };
  E.tapUp = (G) => { G.input.up_e = 0.12; };
  E.skill = (G, sid) => { G.input.skills.push(sid); };
  // 배운 버프를 한 번에 전부 켠다 (스킬이 많아져도 버튼 하나로)
  E.buffAll = (G) => { G.input.buffAll = true; };
  E.usableBuffs = (G) => { const p = G.p; return D.SKILL_ORDER.filter((sid) => { const s = D.SKILLS[sid]; return s.kind === 'buff' && (p.skills[sid] || 0) > 0 && p.lv >= s.reqLv && (!s.job || s.job === p.job) && !(s.tier === 3 && !p.tier3) && !(s.tier === 4 && !p.tier4); }); };
  function castAllBuffs(G) {
    const p = G.p; let n = 0, lack = false, last = null;
    for (const sid of E.usableBuffs(G)) { const s = D.SKILLS[sid], l = p.skills[sid], cost = s.mp(l); if (p.mp < cost) { lack = true; continue; } p.mp -= cost; p.buffs[s.buff] = { t: s.dur(l), val: s.val(l), sid, max: s.dur(l) }; n++; last = sid; }
    if (n) { ev(G, { t: 'buff', sid: last }); ev(G, { t: 'sfx', n: 'buff' }); p.atkCd = Math.max(p.atkCd, 0.3); } else if (lack) { ev(G, { t: 'msg', text: 'MP가 부족해요!' }); ev(G, { t: 'sfx', n: 'deny' }); }
  }
  E.potion = (G, kind) => { G.input.pot = kind; };

  /* ───────── 아이템 ───────── */
  const inv = (p, id) => p.inv[id] || 0;
  E.addItem = function (G, id, n) { const p = G.p; p.inv[id] = (p.inv[id] || 0) + (n || 1); if (p.inv[id] <= 0) delete p.inv[id]; };
  E.sellPrice = (it) => it.t === 'etc' ? it.price : Math.floor(it.price * 0.4);
  E.useItem = function (G, id) {
    const p = G.p, it = D.ITEMS[id]; if (!it || it.t !== 'use' || inv(p, id) < 1 || p.dead) return false;
    const st = E.stats(G);
    if (it.town) { E.addItem(G, id, -1); ev(G, { t: 'sfx', n: 'portal' }); E.loadMap(G, 'perion', { x: 560 }); ev(G, { t: 'msg', text: '마을로 돌아왔어요.' }); return true; }
    if (G.potCd > 0) return false;
    if (it.heal && p.hp >= st.maxHp) return false;
    if (it.mana && p.mp >= st.maxMp) return false;
    if (!it.heal && !it.mana) return false;
    if (it.heal) { const a = Math.min(it.heal, st.maxHp - p.hp); p.hp += a; ev(G, { t: 'heal', x: p.x, y: p.y - 40, amt: a, mp: false }); }
    if (it.mana) { const a = Math.min(it.mana, st.maxMp - p.mp); p.mp += a; ev(G, { t: 'heal', x: p.x, y: p.y - 40, amt: a, mp: true }); }
    E.addItem(G, id, -1); G.potCd = 0.5; ev(G, { t: 'sfx', n: 'potion' });
    return true;
  };
  E.autoPotion = function (G, kind) {
    const p = G.p, st = E.stats(G); const key = kind === 'hp' ? 'heal' : 'mana';
    const miss = kind === 'hp' ? st.maxHp - p.hp : st.maxMp - p.mp; if (miss <= 0) return false;
    const list = Object.keys(p.inv).map((i) => D.ITEMS[i]).filter((it) => it && it.t === 'use' && it[key] && inv(p, it.id) > 0).sort((a, b) => a[key] - b[key]);
    if (!list.length) { return false; }
    let pick = list.find((it) => it[key] >= miss * 0.8) || list[list.length - 1];
    return E.useItem(G, pick.id);
  };
  /* ───── 장비 사본별 강화 기록: 착용 중인 장비는 p.enh[id], 가방 속 같은 장비는 p.bag[id][] (사본마다 따로) ───── */
  const freshRec = () => ({ n: 0, atk: 0, def: 0, ok: 0, str: 0, dex: 0, hp: 0, hm: 0 });
  const recVal = (r) => r.ok * 1000 + (r.atk || 0) + (r.def || 0) + (r.str || 0) * 2 + (r.dex || 0) * 2 + (r.hp || 0) / 10;
  E.bagRecs = function (G, id) {
    const p = G.p; if (!p.bag) p.bag = {}; const n = inv(p, id); const a = p.bag[id] || (p.bag[id] = []);
    while (a.length < n) a.push(freshRec()); if (a.length > n) a.length = n; return a;
  };
  function pushBag(G, id, rec) { const p = G.p; if (!p.bag) p.bag = {}; const n = inv(p, id); const a = p.bag[id] || (p.bag[id] = []); while (a.length < n - 1) a.push(freshRec()); if (a.length > n - 1) a.length = n - 1; a.push(rec); }
  E.bestIdx = (list) => { let b = 0; for (let k = 1; k < list.length; k++) if (recVal(list[k]) > recVal(list[b])) b = k; return b; };
  E.worstIdx = (list) => { let b = 0; for (let k = 1; k < list.length; k++) if (recVal(list[k]) < recVal(list[b])) b = k; return b; };
  // 장비 착용 조건: 레벨 + 기본 STR/DEX (메이플처럼). 아이템에 reqStr/reqDex 가 있으면 그 값, 없으면 레벨로 계산
  E.req = (it) => { const sl = it.slot; return { lv: it.lv, str: it.reqStr != null ? it.reqStr : Math.round(it.lv * (sl === 'weapon' ? 1.25 : 1.0)), dex: it.reqDex != null ? it.reqDex : Math.round(it.lv * (sl === 'weapon' ? 0.4 : 0.3)) }; };
  E.canWear = function (G, it) {
    const p = G.p, r = E.req(it);
    if (p.lv < r.lv) return { ok: false, msg: `Lv ${r.lv} 이상부터 착용할 수 있어요` };
    if (it.slot === 'weapon' && p.job && !D.JOBS[p.job].wts.includes(it.wt)) return { ok: false, msg: `${D.JOBS[p.job].n}은(는) ${D.JOBS[p.job].wtn}만 쓸 수 있어요` };
    if (p.str < r.str) return { ok: false, msg: `STR ${r.str} 이상 필요해요 (지금 ${p.str})` };
    if (p.dex < r.dex) return { ok: false, msg: `DEX ${r.dex} 이상 필요해요 (지금 ${p.dex})` };
    return { ok: true };
  };
  E.equip = function (G, id, idx) {
    const p = G.p, it = D.ITEMS[id]; if (!it || it.t !== 'equip' || inv(p, id) < 1) return { ok: false, msg: '장비가 없어요' };
    const cw = E.canWear(G, it); if (!cw.ok) return cw;
    const list = E.bagRecs(G, id); if (idx == null || idx < 0 || idx >= list.length) idx = E.bestIdx(list); const rec = list.splice(idx, 1)[0];
    const old = p.equip[it.slot]; if (!p.enh) p.enh = {}; const oldRec = old ? (p.enh[old] || freshRec()) : null; if (old) delete p.enh[old];
    E.addItem(G, id, -1); if (old) { E.addItem(G, old, 1); pushBag(G, old, oldRec); }
    p.enh[id] = rec; p.equip[it.slot] = id; ev(G, { t: 'sfx', n: 'equip' });
    const st = E.stats(G); p.hp = Math.min(p.hp, st.maxHp); return { ok: true };
  };
  E.unequip = function (G, slot) { const p = G.p; const id = p.equip[slot]; if (!id) return; if (slot === 'weapon') return; const rec = (p.enh && p.enh[id]) || freshRec(); if (p.enh) delete p.enh[id]; p.equip[slot] = null; E.addItem(G, id, 1); pushBag(G, id, rec); const st = E.stats(G); p.hp = Math.min(p.hp, st.maxHp); };
  E.buy = function (G, id, n) {
    const p = G.p, it = D.ITEMS[id]; n = n || 1; const cost = it.price * n;
    if (p.meso < cost) return { ok: false, msg: '메소가 부족해요' };
    p.meso -= cost; E.addItem(G, id, n); ev(G, { t: 'sfx', n: 'buy' }); return { ok: true };
  };
  /* ───── 장비 강화(주문서) ───── */
  E.ENH_SLOTS = { weapon: 7, armor: 10, helmet: 5, gloves: 5, shoes: 5 }; // 메이플처럼 부위별 고정 (무기 7, 한벌옷 10, 모자·장갑·신발 5)
  E.enhSlots = (it) => it.slots || E.ENH_SLOTS[it.slot] || 5;
  const infoOf = (it, r) => { const slots = E.enhSlots(it) + (r.hm || 0); return { slots, used: r.n, left: slots - r.n, atk: r.atk, def: r.def, ok: r.ok, str: r.str || 0, dex: r.dex || 0, hp: r.hp || 0, hm: r.hm || 0 }; };
  // idx 가 없으면 착용 중인 사본, 숫자면 가방 속 idx 번째 사본
  E.recOf = function (G, id, idx) { const p = G.p; if (idx == null) return (p.enh && p.enh[id]) || freshRec(); return E.bagRecs(G, id)[idx] || freshRec(); };
  E.enhInfo = function (G, id, idx) { return infoOf(D.ITEMS[id], E.recOf(G, id, idx)); };
  // 대상 키: 착용 칸 이름('helmet' 등) 또는 가방 사본 'id~번호'
  E.resolveTarget = function (G, key) {
    const p = G.p; key = String(key);
    if (key.indexOf('~') >= 0) { const [id, k] = key.split('~'); const idx = +k; const list = D.ITEMS[id] && E.bagRecs(G, id); if (!list || !(idx >= 0 && idx < list.length)) return null; return { id, idx, rec: list[idx], bag: true }; }
    const id = p.equip[key]; if (!id) return null; if (!p.enh) p.enh = {}; return { id, idx: null, rec: p.enh[id] || (p.enh[id] = freshRec()), bag: false, slot: key };
  };
  E.scrollTargets = function (G, sid) {
    const sc = D.ITEMS[sid], out = [], p = G.p; const fits = (it) => !(sc.kind === 'weapon' && it.slot !== 'weapon') && !(sc.kind === 'armor' && it.slot === 'weapon'); // 능력치·망치·혼돈 주문서는 모든 장비
    for (const slot of ['weapon', 'helmet', 'armor', 'gloves', 'shoes']) { const id = p.equip[slot]; if (!id) continue; if (!fits(D.ITEMS[id])) continue; const inf = E.enhInfo(G, id); out.push({ key: slot, slot, id, idx: null, left: inf.left, slots: inf.slots, ok: inf.ok, used: inf.used }); }
    for (const id of Object.keys(p.inv)) { const it = D.ITEMS[id]; if (!it || it.t !== 'equip' || !fits(it)) continue; E.bagRecs(G, id).forEach((r, k) => { const inf = infoOf(it, r); out.push({ key: id + '~' + k, slot: it.slot, id, idx: k, bag: true, left: inf.left, slots: inf.slots, ok: inf.ok, used: inf.used }); }); }
    return out;
  };
  E.enhance = function (G, sid, key) {
    const p = G.p, sc = D.ITEMS[sid]; if (!sc || sc.t !== 'scroll' || inv(p, sid) < 1) return { ok: false, success: false, msg: '주문서가 없어요' };
    const tg = E.resolveTarget(G, key); if (!tg) return { ok: false, success: false, msg: '착용 중인 장비가 아니에요' };
    const id = tg.id, it = D.ITEMS[id], r = tg.rec, inf = infoOf(it, r);
    if (sc.kind === 'weapon' && it.slot !== 'weapon') return { ok: false, success: false, msg: '무기에만 쓸 수 있어요' };
    if (sc.kind === 'armor' && it.slot === 'weapon') return { ok: false, success: false, msg: '방어구에만 쓸 수 있어요' };
    if (sc.kind === 'restore') {
      if (r.n <= 0) return { ok: false, success: false, msg: '복구할 강화 횟수가 없어요' };
      E.addItem(G, sid, -1); const win = rand(G) < sc.rate; if (win) r.n -= 1;
      ev(G, { t: 'scroll', ok: win, x: p.x, y: p.y }); ev(G, { t: 'sfx', n: win ? 'questdone' : 'deny' });
      return { ok: true, success: win, msg: win ? `${it.n}의 강화 가능 횟수가 1 늘었어요!` : '복구에 실패했어요…' };
    }
    if (sc.kind === 'hammer') { if ((r.hm || 0) >= 2) return { ok: false, success: false, msg: '황금 망치는 장비 하나에 2번까지만 쓸 수 있어요' }; E.addItem(G, sid, -1); r.hm = (r.hm || 0) + 1; ev(G, { t: 'scroll', ok: true, x: p.x, y: p.y }); ev(G, { t: 'sfx', n: 'questdone' }); return { ok: true, success: true, hammer: true, bonus: 1, msg: `${it.n}의 강화 가능 횟수가 1 늘었어요!` }; }
    if (inf.left <= 0) return { ok: false, success: false, msg: `${it.n}은(는) 더 이상 강화할 수 없어요 (횟수 소진)` };
    E.addItem(G, sid, -1); r.n += 1; const win = rand(G) < sc.rate; let bonus = 0, res0 = null;
    if (win) {
      r.ok += 1;
      if (sc.kind === 'weapon') { bonus = sc.rate >= 0.99 ? Math.max(1, Math.round(it.atk * 0.03)) : sc.rate >= 0.5 ? Math.max(2, Math.round(it.atk * 0.06)) : Math.max(5, Math.round(it.atk * 0.16)); r.atk += bonus; }
      else if (sc.kind === 'armor') { bonus = sc.rate >= 0.99 ? Math.max(1, Math.round((it.def || 0) * 0.05)) : sc.rate >= 0.5 ? Math.max(1, Math.round((it.def || 0) * 0.1 + 1)) : Math.max(3, Math.round((it.def || 0) * 0.25 + 2)); r.def += bonus; }
      else if (sc.kind === 'str' || sc.kind === 'dex') { const t0 = sc.rate >= 0.99 ? 1 : sc.rate >= 0.5 ? 2 : sc.rate >= 0.25 ? 3 : 5; bonus = t0 + Math.floor((it.lv || 0) / 50); r[sc.kind] = (r[sc.kind] || 0) + bonus; }
      else if (sc.kind === 'hp') { const m0 = sc.rate >= 0.99 ? 1 : sc.rate >= 0.5 ? 2 : sc.rate >= 0.25 ? 3.5 : 6; bonus = Math.round(m0 * (10 + (it.lv || 0))); r.hp = (r.hp || 0) + bonus; }
      else if (sc.kind === 'chaos') { const rn = (a, b) => Math.round(a + (b - a) * rand(G)); const baseA = it.slot === 'weapon' ? (it.atk || 0) : (it.def || 0); const dA = rn(-0.04 * baseA - 1, 0.1 * baseA + 2), top = 5 + Math.floor((it.lv || 0) / 50), dS = rn(-3, top), dD = rn(-3, top), dH = rn(-(10 + (it.lv || 0)), 4 * (10 + (it.lv || 0))); if (it.slot === 'weapon') r.atk += dA; else r.def += dA; r.str = (r.str || 0) + dS; r.dex = (r.dex || 0) + dD; r.hp = (r.hp || 0) + dH; bonus = dA; res0 = { a: dA, s: dS, d: dD, h: dH, w: it.slot === 'weapon' }; }
    }
    ev(G, { t: 'scroll', ok: win, x: p.x, y: p.y }); ev(G, { t: 'sfx', n: win ? 'questdone' : 'deny' });
    return { ok: true, success: win, bonus, chaos: res0, msg: win ? `강화 성공! ${it.n} ${({ weapon: '공격력', armor: '방어력', str: 'STR', dex: 'DEX', hp: 'HP', chaos: '혼돈' })[sc.kind]} ${sc.kind === 'chaos' ? '변화' : '+' + bonus}` : `강화 실패… (${it.n}, 남은 횟수 ${inf.left - 1})` };
  };
  // 진행 중인 퀘스트가 요구하는 개수만큼은 못 팔고, 남는 건 팔 수 있다 (퀘스트 아이템도 포함)
  E.lockedQty = (G, id) => { let n = 0; for (const qid in G.p.quests) { if (G.p.quests[qid].st !== 'active') continue; for (const g of D.QUESTS[qid].goals) if (g.item === id) n += g.n; } return n; };
  E.sellable = (G, id) => Math.max(0, inv(G.p, id) - E.lockedQty(G, id));
  // 장비는 사본마다 강화가 달라서, 사본 번호(idx)를 정해 하나씩 판다. 강화된 사본은 값을 더 쳐 준다 (+1당 +10%)
  E.sellPriceOf = (G, id, idx) => { const it = D.ITEMS[id]; const base = E.sellPrice(it); if (it.t !== 'equip' || idx == null) return base; const r = E.bagRecs(G, id)[idx]; return Math.floor(base * (1 + 0.1 * ((r && r.ok) || 0))); };
  E.sell = function (G, id, n, idx) {
    const p = G.p, it = D.ITEMS[id]; const can = E.sellable(G, id); n = Math.min(n || 1, can); if (n < 1) return { ok: false, msg: it && E.lockedQty(G, id) > 0 ? '진행 중인 퀘스트에 필요한 물건이에요' : '팔 수 없어요' };
    if (it.t === 'equip' && idx != null) { if (idx < 0 || idx >= E.bagRecs(G, id).length) return { ok: false, msg: '그 장비가 없어요' }; n = 1; p.meso += E.sellPriceOf(G, id, idx); E.bagRecs(G, id).splice(idx, 1); E.addItem(G, id, -1); if (inv(p, id) < 1 && p.bag) delete p.bag[id]; ev(G, { t: 'sfx', n: 'buy' }); return { ok: true }; }
    p.meso += E.sellPrice(it) * n; if (it.t === 'equip') { const l = E.bagRecs(G, id); for (let k = 0; k < n; k++) l.splice(E.worstIdx(l), 1); } E.addItem(G, id, -n); if (inv(p, id) < 1 && p.bag) delete p.bag[id]; ev(G, { t: 'sfx', n: 'buy' }); return { ok: true };
  };
  /* ───────── 경매장 (오프라인 시장: 30분마다 바뀌는 매물 + NPC 구매자) ───────── */
  const AUC_FEE = 0.05, AUC_MAX = 10, AUC_SLOT_MS = 30 * 60 * 1000, AUC_HOURS = 24;
  E.AUC = { FEE: AUC_FEE, MAX: AUC_MAX, SLOT_MS: AUC_SLOT_MS, HOURS: AUC_HOURS };
  E.marketValue = (it, rec) => { if (it.t === 'equip') return Math.max(20, Math.round(it.price * 0.7 * (1 + 0.12 * ((rec && rec.ok) || 0)))); if (it.t === 'scroll') return Math.round(it.price * 2.2); return Math.max(1, Math.round((it.price || 10) * 1.5)); };
  const lcg = (seed) => { let s = (seed >>> 0) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
  E.auction = (G) => { const p = G.p; if (!p.auction) p.auction = { slot: -1, market: [], mine: [], gold: 0, uid: 1 }; return p.auction; };
  E.auctionRefresh = function (G, now) {
    const p = G.p, A = E.auction(G); now = now || Date.now(); const slot = Math.floor(now / AUC_SLOT_MS); if (A.slot === slot && A.market.length) return false;
    const r = lcg(slot * 9973 + Math.floor(p.lv / 10) * 131 + 7), lo = Math.max(1, p.lv - 25), hi = p.lv + 8;
    const eq = Object.keys(D.ITEMS).filter((id) => { const it = D.ITEMS[id]; return it.t === 'equip' && it.lv >= lo && it.lv <= hi && it.price > 100; }), sc = Object.keys(D.ITEMS).filter((id) => D.ITEMS[id].t === 'scroll');
    const list = [], pick = (a) => a[Math.floor(r() * a.length)];
    for (let i = 0; i < 9 && eq.length; i++) { const id = pick(eq), it = D.ITEMS[id], ok = Math.floor(r() * 4), rec = { n: ok + (r() < 0.4 ? 1 : 0), atk: it.slot === 'weapon' ? Math.round((it.atk || 0) * 0.05 * ok) : 0, def: it.slot !== 'weapon' ? Math.round((it.def || 0) * 0.07 * ok) : 0, ok, str: 0, dex: 0, hp: 0, hm: 0 }; list.push({ id, rec, price: Math.round(E.marketValue(it, rec) * (0.9 + r() * 0.6)) }); }
    for (let i = 0; i < 3 && sc.length; i++) { const id = pick(sc), it = D.ITEMS[id]; list.push({ id, rec: null, price: Math.round(E.marketValue(it) * (0.9 + r() * 0.5)) }); }
    list.forEach((l, i) => { l.uid = slot * 100 + i; }); A.market = list; A.slot = slot; return true;
  };
  E.auctionList = function (G, id, idx, mult) {
    const p = G.p, A = E.auction(G), it = D.ITEMS[id]; if (!it) return { ok: false, msg: '없는 물건이에요' }; if (A.mine.length >= AUC_MAX) return { ok: false, msg: `경매에는 최대 ${AUC_MAX}개까지 올릴 수 있어요` };
    if (it.t === 'equip') { const l = E.bagRecs(G, id); if (idx == null || idx < 0 || idx >= l.length) return { ok: false, msg: '그 장비가 없어요' }; } else if (E.sellable(G, id) < 1) return { ok: false, msg: E.lockedQty(G, id) > 0 ? '진행 중인 퀘스트에 필요한 물건이에요' : '올릴 수 없어요' };
    let rec = null; if (it.t === 'equip') rec = E.bagRecs(G, id).splice(idx, 1)[0]; E.addItem(G, id, -1); if (inv(p, id) < 1 && p.bag) delete p.bag[id];
    const mv = E.marketValue(it, rec), price = Math.max(1, Math.round(mv * mult)), ratio = price / mv, pHour = Math.max(0.02, Math.min(0.6, 0.55 * Math.exp(-(ratio - 0.8) * 2.2)));
    let h = 0; while (h < 200 && Math.random() > pHour) h++; const now = Date.now();
    const L = { uid: A.uid++, id, rec, price, t0: now, soldAt: now + (h + Math.random()) * 3600 * 1000, exp: now + AUC_HOURS * 3600 * 1000 }; A.mine.push(L); return { ok: true, listing: L, hours: h };
  };
  E.auctionSettle = function (G, now) {
    const A = E.auction(G); now = now || Date.now(); let sold = 0, gold = 0, back = 0; const keep = [];
    for (const L of A.mine) { if (L.soldAt <= now && L.soldAt <= L.exp) { const g = Math.floor(L.price * (1 - AUC_FEE)); A.gold += g; gold += g; sold++; } else if (L.exp <= now) { E.addItem(G, L.id, 1); if (D.ITEMS[L.id].t === 'equip') pushBag(G, L.id, L.rec || freshRec()); back++; } else keep.push(L); }
    A.mine = keep; return { sold, gold, back };
  };
  E.auctionCollect = (G) => { const A = E.auction(G), g = A.gold; A.gold = 0; G.p.meso += g; if (g) ev(G, { t: 'sfx', n: 'buy' }); return g; };
  E.auctionCancel = (G, uid) => { const A = E.auction(G), i = A.mine.findIndex((l) => l.uid === uid); if (i < 0) return false; const L = A.mine.splice(i, 1)[0]; E.addItem(G, L.id, 1); if (D.ITEMS[L.id].t === 'equip') pushBag(G, L.id, L.rec || freshRec()); return true; };
  E.auctionBuy = function (G, uid) { const p = G.p, A = E.auction(G), i = A.market.findIndex((l) => l.uid === uid); if (i < 0) return { ok: false, msg: '이미 팔린 물건이에요' }; const L = A.market[i]; if (p.meso < L.price) return { ok: false, msg: '메소가 부족해요' }; p.meso -= L.price; E.addItem(G, L.id, 1); if (D.ITEMS[L.id].t === 'equip') pushBag(G, L.id, JSON.parse(JSON.stringify(L.rec))); A.market.splice(i, 1); ev(G, { t: 'sfx', n: 'buy' }); return { ok: true }; };
  E.sellAllEtc = function (G) { let gain = 0; const p = G.p; for (const id of Object.keys(p.inv)) { const it = D.ITEMS[id]; if (it.t === 'etc') { const k = E.sellable(G, id); if (k > 0 && it.price > 0) { gain += it.price * k; p.inv[id] -= k; if (p.inv[id] <= 0) delete p.inv[id]; } } } p.meso += gain; if (gain) ev(G, { t: 'sfx', n: 'buy' }); return gain; };
  function questNeeds(G, id) { for (const qid in G.p.quests) { if (G.p.quests[qid].st !== 'active') continue; for (const g of D.QUESTS[qid].goals) if (g.item === id) return true; } return false; }

  /* ───────── 스탯·스킬 ───────── */
  E.addStat = function (G, k, n) { const p = G.p; n = Math.min(n || 1, p.ap); if (n < 1 || !(k in { str: 1, dex: 1, int: 1, luk: 1 })) return false; p[k] += n; p.ap -= n; return true; };
  E.autoStat = function (G) { const p = G.p; p.str += p.ap; p.ap = 0; };
  E.resetStats = function (G) { const p = G.p; const used = (p.str - 12) + (p.dex - 5) + (p.int - 4) + (p.luk - 4); p.str = 12; p.dex = 5; p.int = 4; p.luk = 4; p.ap += used; const n = E.stats(G).inactive.length; if (n) ev(G, { t: 'msg', text: `능력치가 모자라 장비 ${n}개가 비활성화됐어요 (STR/DEX를 올리면 다시 켜져요)` }); const st = E.stats(G); p.hp = Math.min(p.hp, st.maxHp); };
  // 능력치가 모자라 못 입는 장비는 자동으로 벗는다 (스탯 초기화·옛 저장 대비). 무기는 낡은 검으로 교체
  E.checkGear = function (G) {
    const p = G.p, out = [];
    const wid = p.equip.weapon, w = wid && D.ITEMS[wid];
    if (w && p.job && wid !== (D.JOBS[p.job].start || 'sw0') && !D.JOBS[p.job].wts.includes(w.wt)) {
      const fb = (p.job && D.JOBS[p.job].start) || 'sw0'; if (!(p.inv[fb] > 0)) E.addItem(G, fb, 1); const r = E.bagRecs(G, fb); E.equip(G, fb, r.length - 1); out.push(w.n); // 교체되며 원래 무기는 강화 기록과 함께 가방으로
    }
    if (out.length) ev(G, { t: 'msg', text: `능력치가 모자라 장비를 벗었어요: ${out.join(', ')}` });
    const st = E.stats(G); p.hp = Math.min(p.hp, st.maxHp); return out;
  };
  // 3차 전직: Lv50 + 오르비스 시험 퀘스트(qt3) 완료. 직업을 바꾸면 3차는 다시 해야 한다(무료)
  E.canAdvance3 = (G) => { const p = G.p; if (!p.job) return { ok: false, msg: '먼저 2차 전직을 해야 해요' }; if (p.tier3) return { ok: false, msg: '이미 3차 전직을 했어요' }; if (p.lv < D.JOB3_LV) return { ok: false, msg: `Lv ${D.JOB3_LV} 이상부터 3차 전직을 할 수 있어요` }; if (E.qState(G, 'qt3') !== 'done') return { ok: false, msg: '「3차 전직의 시험」을 먼저 완료해야 해요' }; return { ok: true }; };
  E.advance3 = function (G) { const p = G.p, c = E.canAdvance3(G); if (!c.ok) return c; p.tier3 = true; p.sp += 5; p.ap += 5; E.checkGear(G); const st = E.stats(G); p.hp = st.maxHp; p.mp = st.maxMp; ev(G, { t: 'levelup', lv: p.lv }); ev(G, { t: 'sfx', n: 'levelup' }); ev(G, { t: 'msg', text: `3차 전직! ${D.JOBS[p.job].n3}이(가) 되었어요` }); return { ok: true }; };
  // 4차 전직: Lv120 + 마가티아 시험(qt4) 완료
  E.canAdvance4 = (G) => { const p = G.p; if (!p.tier3) return { ok: false, msg: '먼저 3차 전직을 해야 해요' }; if (p.tier4) return { ok: false, msg: '이미 4차 전직을 했어요' }; if (p.lv < D.JOB4_LV) return { ok: false, msg: `Lv ${D.JOB4_LV} 이상부터 4차 전직을 할 수 있어요` }; if (E.qState(G, 'qt4') !== 'done') return { ok: false, msg: '「4차 전직의 시험」을 먼저 완료해야 해요' }; return { ok: true }; };
  E.advance4 = function (G) { const p = G.p, c = E.canAdvance4(G); if (!c.ok) return c; p.tier4 = true; p.sp += 5; p.ap += 5; const st = E.stats(G); p.hp = st.maxHp; p.mp = st.maxMp; ev(G, { t: 'levelup', lv: p.lv }); ev(G, { t: 'sfx', n: 'levelup' }); ev(G, { t: 'msg', text: `4차 전직! ${D.JOBS[p.job].n4}이(가) 되었어요` }); return { ok: true }; };
  E.jobName = (p) => (p.job ? (p.tier4 ? D.JOBS[p.job].n4 : p.tier3 ? D.JOBS[p.job].n3 : D.JOBS[p.job].n) : '전사');
  E.canAdvance = (G) => { const p = G.p; if (p.job) return { ok: false, msg: '이미 전직했어요' }; if (p.lv < D.JOB_LV) return { ok: false, msg: `Lv ${D.JOB_LV} 이상부터 전직할 수 있어요` }; if (E.qState(G, 'q9') !== 'done') return { ok: false, msg: '「고대 골렘의 시련」을 먼저 완료해야 해요' }; return { ok: true }; };
  E.advance = function (G, jid) {
    const p = G.p, j = D.JOBS[jid]; const c = E.canAdvance(G); if (!j || !c.ok) return c.ok ? { ok: false, msg: '없는 직업이에요' } : c;
    p.job = jid; p.sp += 3; p.ap += 5; E.checkGear(G); const st = E.stats(G); p.hp = st.maxHp; p.mp = st.maxMp; ev(G, { t: 'levelup', lv: p.lv }); ev(G, { t: 'sfx', n: 'levelup' }); ev(G, { t: 'msg', text: `2차 전직! ${j.n}이(가) 되었어요` }); return { ok: true };
  };
  // 스킬 레벨 상한: 캐릭터 레벨이 오를수록 천천히 열린다 (스킬 요구 레벨 +12~13 에서 만렙)
  E.skillCap = (G, s) => Math.min(s.maxLv, 3 + Math.floor(Math.max(0, G.p.lv - s.reqLv) * 0.8));
  // 스킬 포인트 총량을 스킬 필요량에 딱 맞춤: Lv2~30 합계 69(1차 스킬 7종 만렙, 파워 스트라이크 1레벨은 기본) + 전직 3 + Lv31~39 레벨당 3 = 직업 스킬 30
  E.spEarned = (lv) => (lv <= 30 ? Math.floor((Math.max(1, lv) - 1) * 69 / 29) : 69 + 3 * Math.min(lv - 30, 9)) + (lv > 70 ? 5 * Math.min(lv - 70, 9) : 0) + (lv > 120 ? 5 * Math.min(lv - 120, 9) : 0); // 2차 31~39 레벨당 3, 3차 71~79 레벨당 5, 4차 121~129 레벨당 5
  E.spSpent = (p) => { let n = 0; for (const sid in p.skills) n += Math.max(0, (p.skills[sid] || 0) - (sid === 'power' ? 1 : 0)); return n; };
  // 옛 저장 보정: 받은 포인트 총량이 새 기준보다 많으면 스킬을 초기화하고 기준량만 돌려준다
  E.fixSp = function (G) { const p = G.p; if (p.tier3 && p.lv < D.JOB3_LV) p.tier3 = false; if (p.tier4 && (p.lv < D.JOB4_LV || !p.tier3)) p.tier4 = false; const earned = E.spEarned(p.lv) + (p.job ? 3 : 0) + (p.tier3 ? 5 : 0) + (p.tier4 ? 5 : 0), spent = E.spSpent(p); if (spent + p.sp <= earned) return false; E.resetSkills(G); p.sp = earned; ev(G, { t: 'msg', text: '스킬 포인트 총량이 새 기준으로 조정되어 스킬이 초기화됐어요. 다시 찍어 주세요!' }); return true; };
  E.resetSkills = function (G) { const p = G.p; let back = 0; for (const sid in p.skills) { const l = p.skills[sid] || 0; const keep = sid === 'power' ? 1 : 0; back += Math.max(0, l - keep); if (keep) p.skills[sid] = keep; else delete p.skills[sid]; } p.sp += back; p.buffs = {}; return back; };
  // 직업 변경: 다른 직업을 체험해 볼 수 있게 언제든 가능. 스킬은 전부 초기화(포인트는 그대로 돌려받음), 못 쓰는 무기는 직업 기본 무기로 교체
  E.changeJob = function (G, jid) {
    const p = G.p; if (!p.job) return { ok: false, msg: '아직 2차 전직 전이에요' }; if (!D.JOBS[jid] || jid === p.job) return { ok: false, msg: '지금과 다른 직업을 골라 주세요' };
    E.resetSkills(G); p.job = jid; p.tier3 = false; p.tier4 = false; p.skCd = {}; E.checkGear(G); const st = E.stats(G); p.hp = Math.min(p.hp, st.maxHp); ev(G, { t: 'sfx', n: 'levelup' }); ev(G, { t: 'msg', text: `${D.JOBS[jid].n}(으)로 직업을 바꿨어요. 스킬 포인트를 다시 찍어 주세요!` }); return { ok: true };
  };
  E.learn = function (G, sid) {
    const p = G.p, s = D.SKILLS[sid]; const l = p.skills[sid] || 0;
    if (!s || p.sp < 1 || l >= s.maxLv || p.lv < s.reqLv || (s.job && s.job !== p.job) || (s.tier === 3 && !p.tier3) || (s.tier === 4 && !p.tier4) || l >= E.skillCap(G, s)) return false;
    p.skills[sid] = l + 1; p.sp -= 1; ev(G, { t: 'sfx', n: 'equip' }); return true;
  };

  /* ───────── 전투 ───────── */
  function mitig(def, lv) { return def / (def + 20 + lv * 3.5); }
  function playerHurt(G, rawAtk, srcX, mlv, kb) {
    const p = G.p; if (p.dead || p.inv_t > 0) return false;
    const st = E.stats(G);
    let drv = 0; for (const k in p.buffs) if (/^dr/.test(k)) drv += p.buffs[k].val; drv = Math.min(0.7, drv); // 피해 감소 버프
    let dmg = rawAtk * rr(G, 0.88, 1.12) * (1 - mitig(st.def, mlv)) * (1 - drv);
    dmg = Math.max(1, Math.round(dmg));
    p.hp -= dmg; p.inv_t = 1.0; p.hitFlash = 0.25; p.atkCd = 0;
    if (kb !== 0) { const dir = p.x < srcX ? -1 : 1; p.vx = dir * 170; p.vy = -200; p.knock = 0.22; p.onGround = false; p.climb = null; p.atk = null; }
    ev(G, { t: 'dmg', x: p.x, y: p.y - 40, amt: dmg, who: 'player' }); ev(G, { t: 'sfx', n: 'hurt' }); G.shake = Math.max(G.shake, 6);
    if (p.hp <= 0) { p.hp = 0; p.dead = true; p.atk = null; ev(G, { t: 'death' }); }
    return true;
  }
  function rollDamage(G, mult, mon) {
    const st = E.stats(G), p = G.p;
    let d = rr(G, st.minDmg, st.maxDmg) * mult;
    let crit = false; if (rand(G) < st.crit) { d *= 1.6; crit = true; }
    const def = mon.def.def; let f = 100 / (100 + def * 1.1);
    const gap = mon.def.lv - p.lv; if (gap > 4) f *= Math.max(0.35, 1 - (gap - 4) * 0.07);
    return { dmg: Math.max(1, Math.round(d * f)), crit };
  }
  function hitMonster(G, m, mult, kbDir, fx) {
    if (m.dead) return;
    const r = rollDamage(G, mult, m); m.hp -= r.dmg; m.flash = 0.12; m.prov = 6; m.hit++;
    if (!m.def.boss) { m.stunT = 0.32; m.vx = kbDir * 150; m.st = 'walk'; }
    ev(G, { t: 'dmg', x: m.x, y: m.y - m.def.h, amt: r.dmg, crit: r.crit, who: 'mon', fx });
    ev(G, { t: 'hit', x: m.x, y: m.y - m.def.h * 0.55, crit: r.crit, fx, big: mult >= 2 });
    ev(G, { t: 'sfx', n: r.crit ? 'crit' : 'hit' });
    if (m.hp <= 0) killMon(G, m);
  }
  function killMon(G, m) {
    m.dead = true; m.deadT = 0.0; m.hp = 0; const def = m.def, p = G.p;
    ev(G, { t: 'kill', x: m.x, y: m.y, id: m.id, boss: def.boss });
    ev(G, { t: 'sfx', n: def.boss ? 'bossdie' : 'kill' });
    // 경험치
    let e = def.exp * (G.map.expMul || 1); const diff = def.lv - p.lv;
    if (diff < -6) e *= Math.max(0.2, 1 + (diff + 6) * 0.12); else if (diff > 0) e *= 1 + 0.05 * Math.min(6, diff);
    e = Math.max(1, Math.round(e)); gainExp(G, e, m.x, m.y - def.h);
    // 드랍
    const mesos = Math.round(rr(G, def.mesos[0], def.mesos[1]) * (rand(G) < 0.3 ? 0 : 1));
    if (mesos > 0) dropLoot(G, m.x, m.y - 14, { meso: mesos });
    const dm = G.map.dropMul || 1;
    for (const [id, pr] of def.drops) if (rand(G) < pr * dm * (1 + p.luk * 0.002)) dropLoot(G, m.x, m.y - 14, { id, n: 1 });
    for (const [id, pr] of def.eq) if (rand(G) < pr * dm * (1 + p.luk * 0.002)) dropLoot(G, m.x, m.y - 14, { id, n: 1 });
    p.kills[m.id] = (p.kills[m.id] || 0) + 1;
    for (const qid in p.quests) { const q = p.quests[qid]; if (q.st !== 'active') continue; D.QUESTS[qid].goals.forEach((g, i) => { if (g.kill === m.id && q.prog[i] < g.n) { q.prog[i]++; ev(G, { t: 'qprog', q: qid }); } }); }
    m.slot.respT = m.slot.once ? 1e9 : (def.boss ? 90 : rr(G, 7, 12));
    if (def.ai === 'bossbalrog') ev(G, { t: 'bgm', n: 'ship' });
    if (def.boss) { G.shake = 18; ev(G, { t: 'msg', text: `${def.n}을(를) 쓰러뜨렸어요!` }); for (const mm of G.mons) if (mm !== m && !mm.dead && mm.minion) { mm.dead = true; mm.hp = 0; } G.proj.length = 0; G.zones.length = 0; }
  }
  function dropLoot(G, x, y, o) { G.drops.push(Object.assign({ x: x + rr(G, -16, 16), y, vx: rr(G, -50, 50), vy: -rr(G, 200, 300), t: 0, life: 70, onG: false, ph: rand(G) * 6 }, o)); }
  function gainExp(G, e, x, y) {
    const p = G.p; ev(G, { t: 'exp', x, y, amt: e });
    if (p.lv >= D.MAX_LV) { p.exp = 0; return; }
    p.exp += e;
    while (p.lv < D.MAX_LV && p.exp >= D.expToNext(p.lv)) { p.exp -= D.expToNext(p.lv); levelUp(G); }
    if (p.lv >= D.MAX_LV) p.exp = 0;
  }
  function levelUp(G) {
    const p = G.p; p.lv++; p.ap += 5; p.sp += E.spEarned(p.lv) - E.spEarned(p.lv - 1); p.baseHp += 16 + Math.floor(p.lv * 0.9); p.baseMp += 3;
    const st = E.stats(G); p.hp = st.maxHp; p.mp = st.maxMp;
    ev(G, { t: 'levelup', lv: p.lv }); ev(G, { t: 'sfx', n: 'levelup' });
    for (const sid of D.SKILL_ORDER) if (D.SKILLS[sid].reqLv === p.lv) ev(G, { t: 'msg', text: `새 스킬 사용 가능: ${D.SKILLS[sid].n}` });
  }
  E.gainExp = gainExp;

  // 스킬/공격 시작
  function startAttack(G, sid) {
    const p = G.p, st = E.stats(G);
    if (p.dead || p.climb || p.atk || p.atkCd > 0) return false;
    let a;
    if (!sid) {
      p.comboT > 0 ? p.combo = (p.combo + 1) % 3 : p.combo = 0; p.comboT = 0.9;
      a = { kind: 'basic', t: 0, dur: st.spd, hit: st.spd * 0.42, done: false, face: p.face, combo: p.combo, mult: 1, targets: (st.wt === 'great' || st.wt === 'spear') ? 2 : 1, rng: st.rng };
      if (st.wt === 'great') a.rng = st.rng;
    } else {
      const s = D.SKILLS[sid], l = p.skills[sid] || 0; if (!l || p.lv < s.reqLv) return false;
      if ((p.skCd[sid] || 0) > 0) return false;
      const cost = s.mp(l); if (p.mp < cost) { ev(G, { t: 'msg', text: 'MP가 부족해요!' }); ev(G, { t: 'sfx', n: 'deny' }); return false; }
      if (s.kind === 'buff') {
        p.mp -= cost; p.skCd[sid] = 1; p.buffs[s.buff] = { t: s.dur(l), val: s.val(l), sid, max: s.dur(l) };
        ev(G, { t: 'buff', sid }); ev(G, { t: 'sfx', n: 'buff' }); p.atkCd = 0.25; return true;
      }
      p.mp -= cost; p.skCd[sid] = s.cd;
      const dur = sid === 'quake' ? 0.8 : sid === 'slash' ? Math.max(0.5, st.spd * 1.1) : Math.max(0.5, st.spd * 1.15);
      const hits = s.hits || 1; a = { kind: sid, t: 0, dur: dur + 0.13 * (hits - 1), hit: dur * (sid === 'quake' ? 0.55 : 0.42), done: false, face: p.face, mult: s.mult(l), targets: s.targets, rng: s.rng + (st.rng - 58) * 0.6, combo: 0, hits, n: 0, fx: s.fx };
    }
    p.atk = a; p.atkCd = a.dur * 0.92; p.vx *= 0.3; if (p.onGround && !sid) p.vx += p.face * 50;
    ev(G, { t: 'swing', kind: a.kind, face: p.face, combo: a.combo, fx: a.fx }); ev(G, { t: 'sfx', n: sid ? 'skill' : 'swing' });
    return true;
  }
  function resolveAttack(G) {
    const p = G.p, a = p.atk; a.done = true; a.n = (a.n || 0) + 1; if (a.n < (a.hits || 1)) { a.done = false; a.hit += 0.13; } // 다단히트: 0.13초 간격으로 다시 판정
    const mid = a.kind === 'quake';
    const x0 = mid ? p.x - a.rng : (a.face > 0 ? p.x - 10 : p.x - a.rng), x1 = mid ? p.x + a.rng : (a.face > 0 ? p.x + a.rng : p.x + 10);
    const y0 = p.y - 58, y1 = p.y + 12;
    const hits = [];
    for (const m of G.mons) { if (m.dead || m.spawnT > 0.2) continue; const mx0 = m.x - m.def.w * 0.5, mx1 = m.x + m.def.w * 0.5, my0 = m.y - m.def.h, my1 = m.y; if (mx1 >= x0 && mx0 <= x1 && my1 >= y0 && my0 <= y1) hits.push(m); }
    hits.sort((u, v) => Math.abs(u.x - p.x) - Math.abs(v.x - p.x));
    const n = Math.min(a.targets, hits.length);
    for (let i = 0; i < n; i++) {
      const m = hits[i]; const dir = m.x >= p.x ? 1 : -1; hitMonster(G, m, a.mult, dir, a.kind);
      if (a.kind === 'basic' && (E.stats(G).wt !== 'great' && E.stats(G).wt !== 'spear')) break;
    }
    if (a.kind === 'quake') { G.shake = Math.max(G.shake, 9); ev(G, { t: 'quake', x: p.x, y: p.y, r: a.rng }); }
    if (a.kind === 'power' || a.kind === 'slash') G.shake = Math.max(G.shake, a.kind === 'power' ? 3 : 2);
    if (!n) ev(G, { t: 'sfx', n: 'whiff' });
  }

  /* ───────── 보스·몬스터 투사체 ───────── */
  function addProj(G, o) { G.proj.push(Object.assign({ life: 4, w: 14, h: 14, vx: 0, vy: 0, grav: 0, dmg: 10, lv: 10, hit: false, t: 0 }, o)); }
  function addZone(G, o) { G.zones.push(Object.assign({ t: 0, dur: 0.9, r: 40, dmg: 10, lv: 10, fired: false }, o)); }
  // 플레이어 위치로 조준해서 쏘는 투사체 (발판 높이와 상관없이 닿는다)
  function aimShot(G, m, kind, off, speed, dmg, w) { const p = G.p, x0 = m.x + m.face * 20, y0 = m.y - m.def.h * 0.6; const base = Math.atan2(p.y - 24 - y0, p.x - x0) + off; addProj(G, { kind, x: x0, y: y0, vx: Math.cos(base) * speed, vy: Math.sin(base) * speed, w, h: w, dmg, lv: m.def.lv, life: 3.6 }); }
  function bossAI(G, m, dt) {
    const p = G.p, def = m.def, tree = def.ai === 'bosstree', bal = def.ai === 'bossbalrog', frost = def.ai === 'bossfrost', zak = def.ai === 'bosszakum' || bal || frost; const shot = frost ? 'ice' : 'fire';
    const phase2 = m.hp < m.maxhp * (tree ? 0.5 : 0.45);
    if (phase2 && !m.p2) { m.p2 = true; ev(G, { t: 'msg', text: `${def.n}이(가) 분노했다!` }); G.shake = 12; ev(G, { t: 'sfx', n: 'roar' }); }
    const sp = def.speed * (phase2 ? 1.5 : 1);
    // 보스 템포: 평소엔 1.25배, 분노하면 1.6배, 체력 25% 이하 폭주 시 2배 빠르게 움직인다 (공격 간격·예고가 짧아짐)
    const enr = m.hp < m.maxhp * 0.25; const tempo = enr ? 2.0 : phase2 ? 1.6 : 1.25; if (enr && !m.p3) { m.p3 = true; ev(G, { t: 'msg', text: `${def.n}이(가) 폭주한다!` }); G.shake = 14; ev(G, { t: 'sfx', n: 'roar' }); }
    m.t -= dt * tempo;
    if (m.st === 'walk' || m.st === 'idle') {
      const dx = p.x - m.x; m.face = dx >= 0 ? 1 : -1;
      if (Math.abs(dx) > 40 && !p.dead) m.vx = m.face * sp; else m.vx = 0;
      m.cd -= dt * tempo;
      if (m.cd <= 0 && !p.dead) {
        m.st = 'wind'; m.vx = 0;
        const r = rand(G);
        // 보스마다 패턴이 다르다. 바닥 공격(slam)만 있으면 발판에 올라가서 때리면 끝이라, 높이와 상관없이 닿는 공격과 바닥/발판을 번갈아 노리는 공격을 섞는다.
        const minions = G.mons.filter((x) => x.minion && !x.dead).length;
        if (tree) m.atkn = r < 0.22 ? 'slam' : r < 0.5 ? 'roots' : r < 0.78 ? 'seed' : (minions < 2 ? 'summon' : 'roots');
        else if (bal) m.atkn = (phase2 && r < 0.18 && minions < 2) ? 'summon' : r < 0.22 ? 'slam' : r < 0.52 ? 'fireball' : r < 0.7 ? 'flame' : r < 0.82 ? 'burng' : r < 0.92 ? 'burnp' : 'stomp';
        else if (frost) m.atkn = (phase2 && r < 0.15 && minions < 2) ? 'summon' : r < 0.12 ? 'slam' : r < 0.3 ? 'rocks' : r < 0.5 ? 'fireball' : r < 0.78 ? (rand(G) < 0.5 ? 'burng' : 'burnp') : r < 0.9 ? 'flame' : 'stomp';
        else if (zak) m.atkn = (phase2 && r < 0.2 && minions < 2) ? 'summon' : r < 0.12 ? 'slam' : r < 0.28 ? 'rocks' : r < 0.44 ? 'flame' : r < 0.6 ? 'fireball' : r < 0.82 ? (rand(G) < 0.5 ? 'burng' : 'burnp') : 'stomp';
        else m.atkn = r < 0.16 ? 'slam' : r < 0.36 ? 'rocks' : r < 0.52 ? 'stomp' : r < 0.76 ? 'quake' : 'throw';
        const FLOOR = { quake: 'g', burng: 'g', burnp: 'p' }; // 바닥 전체 / 발판 전체 공격: 예고 후 한꺼번에 터진다
        if (FLOOR[m.atkn]) addZone(G, { kind: 'floor', full: FLOOR[m.atkn], x: p.x, y: G.map.plats[0].y, r: 0, dur: 1.3, dmg: def.atk * 1.5, lv: def.lv, ice: frost });
        m.t = m.atkn === 'summon' ? 1.0 : m.atkn === 'stomp' ? 0.7 : FLOOR[m.atkn] ? 1.35 : 0.95; m.wind = m.t; ev(G, { t: 'bossWind', id: m.id, atk: m.atkn, x: m.x });
      }
    } else if (m.st === 'wind') {
      m.vx = 0;
      if (m.t <= 0) {
        const a = m.atkn;
        if (a === 'slam') {
          const n = phase2 ? 2 : 1; const spd = tree ? 230 : 260;
          for (let k = 0; k < n; k++) for (const d of [-1, 1]) addProj(G, { kind: 'wave', x: m.x + d * (def.w * 0.5 + 8), y: m.y, vx: d * (spd + k * 60), w: tree ? 34 : 44, h: tree ? 26 : 34, dmg: def.atk * 1.2, lv: def.lv, life: 3.4, ground: true, delay: k * 0.55 });
          G.shake = 14; ev(G, { t: 'sfx', n: 'slam' }); ev(G, { t: 'slam', x: m.x, y: m.y, w: def.w });
          m.st = 'rest'; m.t = 0.9;
        } else if (a === 'roots') {
          const n = phase2 ? 5 : 3;
          const ty = p.plat ? p.plat.y : m.py;
          for (let k = 0; k < n; k++) addZone(G, { kind: 'root', x: clamp(p.x + (k - (n - 1) / 2) * 90 + rr(G, -20, 20), 60, G.map.w - 60), y: (k % 2 === 0 || n === 3 && k === 1) ? ty : m.py, r: 36, dur: 0.9 + k * 0.15, dmg: def.atk * 1.4, lv: def.lv });
          ev(G, { t: 'sfx', n: 'roar' }); m.st = 'rest'; m.t = 1.0;
        } else if (a === 'summon') {
          for (const d of [-1, 1]) { const x = clamp(m.x + d * 120, 80, G.map.w - 80); const sl = { m: frost ? 'icemask' : bal ? 'skymask' : zak ? 'lavamask' : 'stump', p: 0, x, mon: null, respT: 0, minion: true }; spawnMon(G, sl); const mm = sl.mon; mm.minion = true; mm.hp = mm.maxhp = frost ? 2500 : bal ? 1500 : zak ? 700 : 120; mm.x0 = 60; mm.x1 = G.map.w - 60; mm.prov = 99; mm.stunT = 0; ev(G, { t: 'hit', x, y: mm.y - 20, fx: 'spawn' }); }
          m.st = 'rest'; m.t = 0.8;
        } else if (a === 'rocks') {
          const n = phase2 ? 7 : 5;
          const ty = p.plat ? p.plat.y : m.py;
          for (let k = 0; k < n; k++) addZone(G, { kind: 'rock', x: clamp(k === 0 ? p.x : p.x + rr(G, -280, 280), 60, G.map.w - 60), y: k % 2 === 0 ? ty : m.py, r: 38, dur: 0.85 + k * 0.17, dmg: def.atk * 1.3, lv: def.lv });
          ev(G, { t: 'sfx', n: 'roar' }); m.st = 'rest'; m.t = 1.0;
        } else if (a === 'seed') {
          const n = phase2 ? 5 : 3; for (let k = 0; k < n; k++) aimShot(G, m, 'seed', (k - (n - 1) / 2) * 0.28, 250, def.atk * 1.0, 18);
          ev(G, { t: 'sfx', n: 'swing' }); m.st = 'rest'; m.t = 1.0;
        } else if (a === 'fireball') {
          const n = phase2 ? 5 : 3; for (let k = 0; k < n; k++) aimShot(G, m, shot, (k - (n - 1) / 2) * 0.24, 290, def.atk * 1.0, 20);
          ev(G, { t: 'sfx', n: 'roar' }); m.st = 'rest'; m.t = 1.0;
        } else if (a === 'throw') {
          const n = phase2 ? 2 : 1; for (let k = 0; k < n; k++) { const x0 = m.x, y0 = m.y - def.h * 0.7, T = 0.95 + k * 0.25, tx = k === 0 ? p.x : p.x + rr(G, -160, 160), ty = p.y - 24; addProj(G, { kind: 'boulder', x: x0, y: y0, vx: (tx - x0) / T, vy: (ty - y0) / T - 0.5 * 900 * T, grav: 900, w: 28, h: 28, dmg: def.atk * 1.3, lv: def.lv, life: 4 }); }
          ev(G, { t: 'sfx', n: 'swing' }); m.st = 'rest'; m.t = 1.0;
        } else if (a === 'quake' || a === 'burng' || a === 'burnp') {
          G.shake = Math.max(G.shake, 6); m.st = 'rest'; m.t = 0.9;
        } else if (a === 'flame') {
          const n = phase2 ? 9 : 6; for (let k = 0; k < n; k++) addProj(G, { kind: shot, x: clamp(k === 0 ? p.x : p.x + rr(G, -340, 340), 60, G.map.w - 60), y: m.py - 420, vx: 0, vy: 60, grav: 900, w: 22, h: 22, dmg: def.atk * 1.1, lv: def.lv, life: 4, delay: k * 0.2, warn: true, gy: m.py });
          ev(G, { t: 'sfx', n: 'roar' }); m.st = 'rest'; m.t = 1.1;
        } else if (a === 'stomp') {
          m.vy = -620; m.vx = clamp((p.x - m.x) / 0.9, -330, 330); m.st = 'air'; m.stomp = true; ev(G, { t: 'sfx', n: 'swing' });
        }
      }
    } else if (m.st === 'rest') { m.vx = 0; if (m.t <= 0) { m.st = 'walk'; m.cd = phase2 ? rr(G, 0.8, 1.4) : rr(G, 1.4, 2.4); } }
    else if (m.st === 'air') { /* 착지는 물리에서 */ }
  }
  function monAI(G, m, dt) {
    const p = G.p, def = m.def;
    if (m.stunT > 0 && !def.boss) { m.stunT -= dt; m.vx *= Math.pow(0.02, dt); return; }
    if (def.boss) { bossAI(G, m, dt); return; }
    const dx = p.x - m.x, same = Math.abs(p.y - m.py) < 64 && !p.dead && m.y >= m.py - 3;
    m.prov -= dt;
    const inRange = def.aggro > 0 && same && Math.abs(dx) < def.aggro;
    const chase = same && (inRange || m.prov > 0 && Math.abs(dx) < 420);
    m.t -= dt; m.cd -= dt;
    if (def.ai === 'charge' && m.st === 'wind') { m.vx = 0; if (m.t <= 0) { m.st = 'dash'; m.t = 0.65; } return; }
    if (def.ai === 'charge' && m.st === 'dash') { m.vx = m.face * 330; if (m.t <= 0 || m.x <= m.x0 + 2 || m.x >= m.x1 - 2) { m.st = 'rest'; m.t = 0.9; m.vx = 0; } return; }
    if (m.st === 'rest') { m.vx = 0; if (m.t <= 0) m.st = 'walk'; return; }
    if (def.ai === 'shoot' && m.st === 'wind') { m.vx = 0; if (m.t <= 0) { addProj(G, { kind: 'fire', x: m.x + m.face * 24, y: m.y - def.h * 0.6, vx: m.face * 230, vy: -30, grav: 120, w: 20, h: 20, dmg: def.atk * 1.1, lv: def.lv, life: 3 }); m.st = 'walk'; m.cd = rr(G, 2.2, 3.2); ev(G, { t: 'sfx', n: 'fire' }); } return; }
    if (chase) {
      m.face = dx >= 0 ? 1 : -1;
      if (def.ai === 'charge' && m.cd <= 0 && Math.abs(dx) < 280 && Math.abs(dx) > 70) { m.st = 'wind'; m.t = 0.55; m.cd = rr(G, 2.5, 3.5); ev(G, { t: 'bossWind', id: m.id, atk: 'charge', x: m.x }); return; }
      if (def.ai === 'shoot' && m.cd <= 0 && Math.abs(dx) < 340 && Math.abs(dx) > 90) { m.st = 'wind'; m.t = 0.6; return; }
      if (Math.abs(dx) > 14) m.vx = m.face * def.speed * 1.25; else m.vx = 0;
      if (def.ai === 'hop' && m.y >= m.py - 1 && Math.abs(dx) < 170 && m.cd <= 0) { m.vy = -330; m.vx = m.face * def.speed * 2.1; m.cd = rr(G, 0.9, 1.6); }
    } else {
      if (m.t <= 0) { const r = rand(G); if (r < 0.35) { m.vx = 0; m.t = rr(G, 0.8, 2); } else { m.face = r < 0.68 ? -1 : 1; m.vx = m.face * def.speed * 0.6; m.t = rr(G, 1, 3); } }
    }
    if (m.x <= m.x0 && m.vx < 0) { m.vx = 0; m.face = 1; m.x = m.x0; }
    if (m.x >= m.x1 && m.vx > 0) { m.vx = 0; m.face = -1; m.x = m.x1; }
  }

  /* ───────── 메인 스텝 ───────── */
  E.step = function (G, dtReal) {
    G.acc += Math.min(dtReal, 0.1);
    let n = 0;
    while (G.acc >= STEP && n < 6) { tick(G, STEP); G.acc -= STEP; n++; }
    if (n === 6) G.acc = 0;
  };
  function findLadder(G, p, up) {
    for (const l of G.map.ladders) {
      if (Math.abs(p.x - l.x) > 15) continue;
      if (up) { if (p.y > l.y1 + 6 && p.y <= l.y2 + 3) return l; }
      else { if (p.y >= l.y1 - 4 && p.y < l.y2 - 4 && Math.abs(p.y - l.y1) < 6) return l; if (p.y > l.y1 + 6 && p.y < l.y2 - 4) return l; }
    }
    return null;
  }
  E.nearby = function (G) {
    const p = G.p;
    if (p.dead) return null;
    for (const n of G.map.npcs) if (Math.abs(p.x - n.x) < 46 && Math.abs(p.y - (n.y || G.map.plats[0].y)) < 30) return { type: 'npc', npc: n };
    for (const pt of G.map.portals) if (Math.abs(p.x - pt.x) < 38 && p.onGround && (pt.y === undefined || Math.abs(p.y - pt.y) < 10)) return { type: 'portal', portal: pt };
    return null;
  };
  // 도시 이동(비공정·택시): 레벨이 되면 어느 마을로든 요금을 내고 바로 이동
  E.travelFee = (tw) => (tw.min <= 38 ? 500 : Math.round(tw.min * 80));
  E.travel = function (G, id) {
    const p = G.p, tw = D.TOWNS.find((t) => t.id === id); if (!tw) return { ok: false, msg: '갈 수 없는 곳이에요' }; if (p.lv < tw.min) return { ok: false, msg: `Lv ${tw.min} 이상부터 갈 수 있어요` };
    const fee = E.travelFee(tw); if (p.meso < fee) return { ok: false, msg: `요금 ${fee} 메소가 부족해요` }; p.meso -= fee; ev(G, { t: 'sfx', n: 'portal' }); ev(G, { t: 'fade' }); E.loadMap(G, id, { x: tw.x }); return { ok: true };
  };
  // 배: 승선료를 내면 75초 항해. 항해 중 일정 확률(40%)로 크림슨 발록이 습격한다.
  E.boardShip = function (G, dest, fee) {
    const p = G.p; fee = fee == null ? 3000 : fee; if (!D.MAPS[dest]) return { ok: false, msg: '갈 수 없는 곳이에요' };
    if (p.meso < fee) return { ok: false, msg: `승선료 ${fee} 메소가 부족해요` };
    p.meso -= fee; const T = 75; G.ship = { dest, from: G.mapId, t: T, bal: rand(G) < 0.4, balAt: T - rr(G, 14, 45), rolled: false };
    ev(G, { t: 'sfx', n: 'portal' }); ev(G, { t: 'fade' }); E.loadMap(G, 'ship', null); return { ok: true };
  };
  function shipTick(G, dt) {
    const p = G.p, sh = G.ship; if (!sh) return; if (p.dead) return; sh.t -= dt;
    if (!sh.rolled && sh.t <= sh.balAt) { sh.rolled = true; if (sh.bal) { const sl = { m: 'balrog', p: 0, x: 1150, mon: null, respT: 0, boss: true, once: true }; G.slots.push(sl); spawnMon(G, sl); ev(G, { t: 'msg', text: '⚠️ 크림슨 발록이 배를 습격했다!' }); ev(G, { t: 'bgm', n: 'boss' }); ev(G, { t: 'sfx', n: 'roar' }); G.shake = 14; } }
    if (sh.t <= 0) { const dest = sh.dest, flee = G.boss && !G.boss.dead; G.ship = null; ev(G, { t: 'fade' }); ev(G, { t: 'sfx', n: 'portal' }); E.loadMap(G, dest, { x: dest === 'orbis' ? 450 : 500 }); ev(G, { t: 'msg', text: flee ? `${D.MAPS[dest].n}에 도착했어요! (발록은 도망쳤어요)` : `${D.MAPS[dest].n}에 도착했어요!` }); ev(G, { t: 'bgm', n: D.MAPS[dest].bgm }); }
  }
  E.usePortal = function (G, pt) { ev(G, { t: 'sfx', n: 'portal' }); ev(G, { t: 'fade' }); E.loadMap(G, pt.to, pt.tx); };

  function tick(G, dt) {
    G.t += dt; G.bgTime += dt; const p = G.p, inp = G.input, map = G.map;
    G.shake = Math.max(0, G.shake - dt * 22); G.potCd -= dt; p.play += dt;
    if (inp.jump > 0) inp.jump -= dt; if (inp.up_e > 0) inp.up_e -= dt;
    const st = E.stats(G);
    if (G.mapId === 'ship') shipTick(G, dt); else if (G.ship) G.ship = null;
    // 타이머
    p.inv_t -= dt; p.atkCd -= dt; p.dropT -= dt; p.ladderCd -= dt; p.knock -= dt; p.comboT -= dt; p.hitFlash -= dt;
    for (const k in p.skCd) if (p.skCd[k] > 0) p.skCd[k] -= dt;
    for (const k in p.buffs) { p.buffs[k].t -= dt; if (p.buffs[k].t <= 0) { delete p.buffs[k]; ev(G, { t: 'buffEnd', k }); if (k === 'hp2') p.hp = Math.min(p.hp, E.stats(G).maxHp); } }
    // 포션
    if (inp.pot) { E.autoPotion(G, inp.pot); inp.pot = null; }
    if (p.pet && p.settings.auto && !p.dead && G.potCd <= 0) {
      let did = false;
      if (p.hp < st.maxHp * (p.settings.autoT || 0.35)) did = E.autoPotion(G, 'hp');
      else if (p.settings.autoMp && p.mp < st.maxMp * (p.settings.autoMpT || 0.2)) did = E.autoPotion(G, 'mp');
      if (did) ev(G, { t: 'petDrink' });
    }
    // 스킬 큐
    if (inp.buffAll) { inp.buffAll = false; if (!p.dead) castAllBuffs(G); }
    // 스킬 입력은 0.7초 동안 보관: 공격 모션·피격 중에 눌러도 끝나는 즉시 나감
    while (inp.skills.length) { const s = inp.skills.shift(); if (!p.dead) p.skBuf = { sid: s, t: 0.7 }; }
    if (p.skBuf) { p.skBuf.t -= dt; const sb = p.skBuf; if (p.dead || sb.t <= 0) p.skBuf = null; else if (!p.atk && p.atkCd <= 0 && !p.climb) { p.skBuf = null; startAttack(G, sb.sid); } }
    if (!p.dead) {
      if (inp.attack && !p.atk) startAttack(G, null);
      if (p.atk) { p.atk.t += dt; if (!p.atk.done && p.atk.t >= p.atk.hit) resolveAttack(G); if (p.atk && p.atk.t >= p.atk.dur) p.atk = null; }
      // 이동
      const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
      if (p.climb) {
        const l = p.climb; p.vx = 0; p.vy = 0;
        if (inp.jump > 0) { inp.jump = 0; p.climb = null; p.vy = dir ? -JUMP * 0.75 : -120; p.vx = dir * st.speed; p.ladderCd = 0.3; if (dir) p.face = dir; }
        else {
          const vd = (inp.down ? 1 : 0) - (inp.up ? 1 : 0); p.y += vd * CLIMB * dt; p.climbT = (p.climbT || 0) + Math.abs(vd) * dt;
          if (p.y <= l.y1) { p.y = l.y1 - 1; p.climb = null; p.vy = 0; p.ladderCd = 0.25; p.onGround = false; }
          else if (p.y >= l.y2) { p.y = l.y2 - 1; p.climb = null; p.ladderCd = 0.25; p.onGround = false; }
        }
      } else {
        if (p.knock <= 0) {
          const target = dir * st.speed * (p.atk && p.onGround ? 0.25 : 1);
          const k = p.onGround ? 14 : 7; p.vx += (target - p.vx) * Math.min(1, k * dt);
          if (dir && !p.atk) p.face = dir;
        }
        if (inp.jump > 0) p.jumpBuf = 0.12; p.jumpBuf -= dt;
        if (p.onGround) p.coyote = 0.09; else p.coyote -= dt;
        if (p.jumpBuf > 0 && p.coyote > 0 && !p.atk) {
          if (inp.down && p.plat && !p.plat.solid) { p.dropT = 0.3; p.dropPlat = p.plat; p.y += 3; p.onGround = false; p.coyote = 0; }
          else { p.vy = -JUMP; p.onGround = false; p.coyote = 0; ev(G, { t: 'sfx', n: 'jump' }); ev(G, { t: 'dust', x: p.x, y: p.y }); }
          p.jumpBuf = 0; inp.jump = 0;
        }
        // 사다리 / 포탈
        if (p.ladderCd <= 0 && (inp.up || inp.down) && p.knock <= 0) {
          const l = findLadder(G, p, !!inp.up && !inp.down);
          if (l) { p.climb = l; p.x = l.x; p.vx = p.vy = 0; p.atk = null; if (!inp.up) p.y = Math.max(p.y, l.y1 + 3); }
        }
        if (inp.up_e > 0 && !p.climb) { const nb = E.nearby(G); if (nb && nb.type === 'portal') { inp.up_e = 0; E.usePortal(G, nb.portal); return; } }
        // 물리
        const prevY = p.y; p.vy = Math.min(p.vy + GRAV * dt, 900); p.x += p.vx * dt; p.y += p.vy * dt;
        const was = p.onGround; p.onGround = false;
        if (p.vy >= 0) for (const pl of map.plats) {
          if (pl === p.dropPlat && p.dropT > 0) continue;
          if (prevY <= pl.y + 1 && p.y >= pl.y && p.x + HW > pl.x && p.x - HW < pl.x + pl.w) { p.y = pl.y; p.vy = 0; p.onGround = true; p.plat = pl; if (!was && p.vy === 0) ev(G, { t: 'dust', x: p.x, y: p.y, land: true }); break; }
        }
        p.x = clamp(p.x, HW, map.w - HW);
        if (p.y > map.h + 300) { p.x = 100; p.y = map.plats[0].y; p.vy = 0; }
        p.walkT += Math.abs(p.vx) * dt * 0.06;
      }
      // 회복
      p.regenT += dt;
      if (p.regenT >= 1) { p.regenT -= 1; const m = G.inTown ? 6 : 1; const tough = 1 + (p.skills.toughness || 0) * 0.08; p.hp = Math.min(st.maxHp, p.hp + Math.max(1, st.maxHp * 0.002 * m * tough)); p.mp = Math.min(st.maxMp, p.mp + Math.max(1, st.maxMp * 0.008 * m)); }
    } else { p.vx *= 0.9; }
    // 몬스터
    for (let i = G.mons.length - 1; i >= 0; i--) {
      const m = G.mons[i];
      if (m.dead) { m.deadT += dt; if (m.deadT > (m.def.boss ? 1.6 : 0.55)) { G.mons.splice(i, 1); if (G.boss === m) G.boss = null; } continue; }
      m.spawnT -= dt; if (m.flash > 0) m.flash -= dt;
      monAI(G, m, dt);
      m.x += m.vx * dt;
      if (m.vy !== 0 || m.y < m.py) { m.vy += GRAV * 0.9 * dt; m.y += m.vy * dt; if (m.y >= m.py) { const was = m.st === 'air'; m.y = m.py; m.vy = 0; if (was) { m.st = 'rest'; m.t = 0.8; if (m.stomp) { m.stomp = false; for (const d of [-1, 1]) addProj(G, { kind: 'wave', x: m.x + d * 40, y: m.py, vx: d * 300, w: 46, h: 36, dmg: m.def.atk * 1.2, lv: m.def.lv, life: 3.2, ground: true }); G.shake = 16; ev(G, { t: 'sfx', n: 'slam' }); ev(G, { t: 'slam', x: m.x, y: m.y, w: m.def.w }); } } } }
      m.x = clamp(m.x, m.x0, m.x1);
      // 접촉 피해
      if (!p.dead && p.inv_t <= 0 && m.spawnT <= 0 && (m.stunT <= 0.1 || m.def.boss)) {
        const hw = m.def.w * 0.42 + HW - 2;
        if (Math.abs(p.x - m.x) < hw && p.y > m.y - m.def.h + 4 && p.y - PH < m.y) playerHurt(G, m.def.atk * (m.def.boss ? 0.7 : 1), m.x, m.def.lv, 1);
      }
    }
    // 리스폰
    for (const sl of G.slots) { if (sl.mon && sl.mon.dead && !G.mons.includes(sl.mon)) sl.mon = null; if (!sl.mon && !sl.minion) { sl.respT -= dt; if (sl.respT <= 0 && Math.abs(G.p.x - sl.x) > 120 || sl.respT < -6) spawnMon(G, sl); } }
    G.slots = G.slots.filter((s) => !s.minion);
    // 시련의 탑: 인내의 숲처럼 옆에서 공이 날아온다 (맞으면 밀려나 떨어짐, 점프로 피하기). 위로 갈수록 빠르고 자주
    if (G.mapId === 'trial' && !p.dead) {
      G.hz = (G.hz || 2) - dt;
      if (G.hz <= 0) {
        const pls = map.plats, gy = pls[0].y, top = pls[pls.length - 1].y, fr = clamp((gy - p.y) / (gy - top), 0, 1);
        const stg = fr < 0.3 ? 0 : fr < 0.66 ? 1 : 2; G.hz = [3.0, 2.1, 1.5][stg] * rr(G, 0.8, 1.2);
        if (p.y < gy - 40) {
          const cand = pls.filter((q, i) => i > 0 && q.y > p.y - 170 && q.y < p.y + 40); const pl = cand.length ? cand[Math.floor(rand(G) * cand.length)] : null;
          if (pl) { const dir = rand(G) < 0.5 ? 1 : -1; addProj(G, { kind: 'ball', x: dir > 0 ? -24 : map.w + 24, y: pl.y - 16, vx: dir * [130, 165, 205][stg], w: 18, h: 18, dmg: 4, lv: 1, life: 16 }); }
        }
      }
    }
    // 투사체
    for (let i = G.proj.length - 1; i >= 0; i--) {
      const q = G.proj[i];
      if (q.delay > 0) { q.delay -= dt; continue; }
      q.t += dt; q.life -= dt; q.vy += q.grav * dt; q.x += q.vx * dt; q.y += q.vy * dt;
      if ((q.kind === 'fire' || q.kind === 'ice' || q.kind === 'seed' || q.kind === 'boulder') && q.y > G.map.plats[0].y + 20) q.life = 0;
      if (!q.hit && !p.dead && p.inv_t <= 0 && Math.abs(p.x - q.x) < q.w * 0.5 + HW && p.y > q.y - q.h * 0.5 && p.y - PH < q.y + q.h * 0.5 + (q.ground ? q.h * 0.5 : 0)) { if (playerHurt(G, q.dmg, q.x, q.lv, 1)) q.hit = true; }
      if (q.life <= 0 || q.hit || q.x < -40 || q.x > G.map.w + 40) G.proj.splice(i, 1);
    }
    for (let i = G.zones.length - 1; i >= 0; i--) {
      const z = G.zones[i]; z.t += dt;
      if (!z.fired && z.t >= z.dur) {
        z.fired = true; let hit = false; const gy = G.map.plats[0].y;
        if (z.full) { hit = !p.dead && (z.full === 'g' ? p.y > gy - 30 : p.y < gy - 30); G.shake = Math.max(G.shake, 8); ev(G, { t: 'sfx', n: 'slam' }); }
        else { ev(G, { t: 'zone', kind: z.kind, x: z.x, y: z.y }); G.shake = Math.max(G.shake, 6); ev(G, { t: 'sfx', n: 'slam' }); hit = !p.dead && Math.abs(p.x - z.x) < z.r + HW && p.y > z.y - 46 && p.y < z.y + 14; }
        if (hit) playerHurt(G, z.dmg, z.x, z.lv, 1);
      }
      if (z.t >= z.dur + 0.35) G.zones.splice(i, 1);
    }
    // 드랍
    for (let i = G.drops.length - 1; i >= 0; i--) {
      const d = G.drops[i]; d.t += dt; d.life -= dt;
      if (!d.onG) { d.vy += GRAV * 0.8 * dt; const py = d.y; d.x += d.vx * dt; d.y += d.vy * dt; d.vx *= 0.99;
        if (d.vy > 0) for (const pl of map.plats) if (py <= pl.y + 1 && d.y >= pl.y && d.x > pl.x && d.x < pl.x + pl.w) { d.y = pl.y; d.onG = true; d.vx = 0; d.vy = 0; break; }
        if (d.y > map.h + 100) d.life = 0; }
      const near = p.pet ? (Math.abs(p.x - d.x) < 150 && Math.abs(p.y - d.y) < 80) : (Math.abs(p.x - d.x) < 34 && p.y > d.y - 6 && p.y - PH - 10 < d.y); // 펫이 있으면 근처 아이템을 대신 주워요
      if (!p.dead && d.t > 0.45 && near) {
        if (d.meso) { p.meso += d.meso; ev(G, { t: 'pickup', meso: d.meso, x: d.x, y: d.y }); }
        else { E.addItem(G, d.id, d.n); ev(G, { t: 'pickup', id: d.id, n: d.n, x: d.x, y: d.y }); }
        ev(G, { t: 'sfx', n: 'pickup' }); G.drops.splice(i, 1); continue;
      }
      if (d.life <= 0) G.drops.splice(i, 1);
    }
  }

  /* ───────── 퀘스트 ───────── */
  E.qState = function (G, qid) {
    const q = D.QUESTS[qid], p = G.p, s = p.quests[qid];
    if (s && s.st === 'done') return 'done';
    if (s && s.st === 'active') return E.qReady(G, qid) ? 'ready' : 'active';
    if (q.pre && !(p.quests[q.pre] && p.quests[q.pre].st === 'done')) return 'locked';
    if (p.lv < q.lv) return 'lowlv';
    return 'avail';
  };
  E.qProg = function (G, qid) {
    const q = D.QUESTS[qid], s = G.p.quests[qid];
    return q.goals.map((g, i) => g.kill ? { txt: `${D.MON[g.kill].n} 처치`, cur: s && s.st === 'active' ? s.prog[i] : (s && s.st === 'done' ? g.n : 0), n: g.n } : { txt: `${D.ITEMS[g.item].n} 모으기`, cur: Math.min(g.n, inv(G.p, g.item)), n: g.n });
  };
  E.qReady = (G, qid) => E.qProg(G, qid).every((g) => g.cur >= g.n);
  E.qAccept = function (G, qid) { if (E.qState(G, qid) !== 'avail') return false; G.p.quests[qid] = { st: 'active', prog: D.QUESTS[qid].goals.map(() => 0) }; ev(G, { t: 'sfx', n: 'quest' }); return true; };
  E.qComplete = function (G, qid) {
    if (E.qState(G, qid) !== 'ready') return false;
    const q = D.QUESTS[qid], p = G.p;
    for (const g of q.goals) if (g.item) E.addItem(G, g.item, -g.n);
    p.quests[qid].st = 'done';
    if (q.reward.pet && !p.pet) { p.pet = { n: q.reward.pet }; ev(G, { t: 'petGot', n: q.reward.pet }); }
    if (q.reward.meso) p.meso += q.reward.meso;
    for (const [id, n] of q.reward.items) E.addItem(G, id, n);
    if (q.reward.exp) gainExp(G, q.reward.exp, p.x, p.y - 50);
    ev(G, { t: 'sfx', n: 'questdone' }); ev(G, { t: 'questdone', q: qid }); return true;
  };
  E.where = function (kind, id) {
    if (id === 'relic') return { map: '시련의 탑 (점프맵)', mon: '고대 상자' };
    if (id === 'balrogclaw') return { map: '오르비스행 배 (무작위 출현)', mon: '크림슨 발록' };
    let mon = id;
    if (kind === 'item') { mon = Object.keys(D.MON).find((k) => D.MON[k].drops.some((d) => d[0] === id) && !D.MON[k].boss) || Object.keys(D.MON).find((k) => D.MON[k].drops.some((d) => d[0] === id)); }
    for (const mid in D.MAPS) { const mp = D.MAPS[mid]; if (mp.boss === mon || mp.spawns.some((s) => s.m === mon)) return { map: mp.n, mon: D.MON[mon].n }; }
    return { map: '?', mon: '?' };
  };
  E.objective = function (G) {
    const p = G.p;
    if (G.mapId === 'ship' && G.ship) { const s = Math.max(0, Math.ceil(G.ship.t)); return { txt: `🚢 ${D.MAPS[G.ship.dest].n} 도착까지 ${s}초`, sub: G.boss && !G.boss.dead ? '⚠️ 크림슨 발록 출현!' : '파도가 높으니 조심하세요' }; }
    for (const qid of D.QUEST_ORDER) {
      const s = E.qState(G, qid), q = D.QUESTS[qid];
      if (s === 'ready') return { txt: `[${q.n}] 완료! ${npcName(q.npc)}에게 돌아가세요`, q: qid, ready: true };
      if (s === 'active') { const pr = E.qProg(G, qid).filter((g) => g.cur < g.n)[0]; const g = q.goals.find((x, i) => (x.kill ? D.MON[x.kill].n + ' 처치' : D.ITEMS[x.item].n + ' 모으기') === pr.txt); const w = E.where(g.kill ? 'kill' : 'item', g.kill || g.item); return { txt: `[${q.n}] ${pr.txt} ${pr.cur}/${pr.n}`, sub: `${w.map}`, q: qid }; }
    }
    for (const qid of D.QUEST_ORDER) { const s = E.qState(G, qid), q = D.QUESTS[qid]; if (s === 'avail') return { txt: `${npcName(q.npc)}에게 말을 걸어 퀘스트를 받으세요`, sub: npcMap(q.npc), q: qid }; if (s === 'lowlv') return { txt: `Lv ${q.lv}이 되면 새 퀘스트! 사냥하며 레벨을 올리세요`, sub: '' }; }
    return { txt: '모든 퀘스트 완료! 자유롭게 사냥하세요', sub: '' };
  };
  function npcName(id) { for (const mid in D.MAPS) { const t = D.MAPS[mid].npcs.find((n) => n.id === id); if (t) return t.n; } return id; }
  E.npcName = npcName;
  // 레벨에 맞는 추천 사냥터 (맵 이름의 'Lv a~b' 표기로 계산)
  E.suggestMaps = (G) => { const lv = G.p.lv, out = []; for (const id in D.MAPS) { const m = D.MAPS[id]; if (m.town || m.boss || m.ship || m.sub === '히든 스트리트' || m.id === 'trial') continue; const r = /Lv (\d+)~(\d+)/.exec(m.lvTxt || ''); if (!r) continue; const a = +r[1], b = +r[2]; if (lv >= a - 2 && lv <= b + 2) out.push({ id, n: m.n, a, b, mid: Math.abs(lv - (a + b) / 2) }); } return out.sort((x, y) => x.mid - y.mid).slice(0, 3); };
  E.npcMap = (id) => { for (const mid in D.MAPS) if (D.MAPS[mid].npcs.some((n) => n.id === id)) return D.MAPS[mid].n; return ''; };
  function npcMap(id) { for (const mid in D.MAPS) if (D.MAPS[mid].npcs.some((n) => n.id === id)) return D.MAPS[mid].n; return ''; }

  E.takeRelic = function (G) {
    if (E.qState(G, 'q9') !== 'active' || (G.p.inv.relic || 0) > 0) return false;
    E.addItem(G, 'relic', 1); ev(G, { t: 'sfx', n: 'questdone' }); ev(G, { t: 'msg', text: '고대 골렘의 인장을 손에 넣었어요!' }); return true;
  };
  E.respawn = function (G) {
    const p = G.p; const lose = Math.floor(D.expToNext(p.lv) * 0.08); p.exp = Math.max(0, p.exp - lose);
    p.dead = false; p.buffs = {}; const st = E.stats(G); p.hp = Math.round(st.maxHp * 0.5); p.mp = Math.round(st.maxMp * 0.5); p.inv_t = 2; p.atk = null; p.vx = 0;
    E.loadMap(G, 'perion', { x: 520 }); return lose;
  };
  E.innHeal = function (G) { const st = E.stats(G), p = G.p; const cost = Math.round(p.lv * 4); if (p.hp >= st.maxHp && p.mp >= st.maxMp) return { ok: false, msg: '이미 건강해요!' }; if (p.meso < cost) return { ok: false, msg: `메소가 부족해요 (${cost} 메소)` }; p.meso -= cost; p.hp = st.maxHp; p.mp = st.maxMp; ev(G, { t: 'sfx', n: 'levelup' }); return { ok: true, cost }; };

  E.D = D; E.HW = HW; E.PH = PH;
  root.Engine = E;
  if (typeof module !== 'undefined' && module.exports) module.exports = E;
})(typeof window !== 'undefined' ? window : globalThis);

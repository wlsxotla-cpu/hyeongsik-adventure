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
  const PERSIST = ['name', 'lv', 'exp', 'str', 'dex', 'int', 'luk', 'ap', 'sp', 'skills', 'baseHp', 'baseMp', 'equip', 'inv', 'meso', 'quests', 'settings', 'hp', 'mp', 'play', 'kills', 'tut', 'pet'];
  E.newPlayer = function (name) {
    return { name: name || '전사', lv: 1, exp: 0, str: 12, dex: 5, int: 4, luk: 4, ap: 0, sp: 0, skills: { power: 1 }, baseHp: 55, baseMp: 14,
      equip: { weapon: 'sw0', armor: 'ar0', helmet: null, gloves: null, shoes: null }, inv: { hp1: 10, mp1: 3 }, meso: 50, quests: {}, kills: {},
      settings: { auto: true, autoT: 0.35, autoMp: true, autoMpT: 0.2, sound: true, music: true, shake: true }, pet: null, hp: 55, mp: 14, play: 0, tut: {} };
  };
  E.newGame = function (name, seed, save) {
    const G = { rng: mulberry32(seed || (Date.now() & 0xffffffff)), t: 0, acc: 0, events: [], mons: [], drops: [], proj: [], zones: [], slots: [], map: null, mapId: null,
      input: { left: false, right: false, up: false, down: false, attack: false, jump: 0, up_e: 0, skills: [], pot: null }, p: null, boss: null, shake: 0, potCd: 0, inTown: false, bgTime: 0 };
    const base = E.newPlayer(name);
    if (save) { for (const k of PERSIST) if (save[k] !== undefined) base[k] = JSON.parse(JSON.stringify(save[k])); base.settings = Object.assign({ auto: true, autoT: 0.35, autoMp: true, autoMpT: 0.2, sound: true, music: true, shake: true }, base.settings); }
    Object.assign(base, { x: 100, y: 400, vx: 0, vy: 0, face: 1, onGround: true, plat: null, climb: null, ladderCd: 0, coyote: 0, jumpBuf: 0, dropT: 0, dropPlat: null, inv_t: 0, atkCd: 0, atk: null, knock: 0, dead: false, buffs: {}, skCd: {}, combo: 0, comboT: 0, regenT: 0, walkT: 0, hitFlash: 0 });
    G.p = base;
    E.loadMap(G, (save && save.mapId) || 'perion', save ? { x: 520 } : { x: 330 });
    const st = E.stats(G); base.hp = clamp(base.hp, 1, st.maxHp); base.mp = clamp(base.mp, 0, st.maxMp);
    return G;
  };
  E.serialize = function (G) { const o = {}; for (const k of PERSIST) o[k] = G.p[k]; o.mapId = G.map.boss ? 'perion' : G.mapId; o.v = 1; return o; };

  /* ───────── 능력치 ───────── */
  E.sk = (G, sid) => G.p.skills[sid] || 0;
  E.stats = function (G) {
    const p = G.p; const b = { atk: 0, def: 0, str: 0, dex: 0, hp: 0 };
    for (const slot in p.equip) { const it = D.ITEMS[p.equip[slot]]; if (!it) continue; b.atk += it.atk || 0; b.def += it.def || 0; b.str += it.str || 0; b.dex += it.dex || 0; b.hp += it.hp || 0; }
    const w = D.ITEMS[p.equip.weapon] || D.ITEMS.sw0;
    const str = p.str + b.str, dex = p.dex + b.dex;
    const tough = p.skills.toughness || 0, mast = p.skills.mastery || 0;
    const rageMul = p.buffs.atk ? 1 + p.buffs.atk.val : 1;
    const wAtk = (w.atk || 10) + (w.slot === 'weapon' ? b.atk - (w.atk || 0) : 0);
    const maxDmg = Math.max(1, (str * 4 + dex) * wAtk / 100 * rageMul);
    const minRatio = clamp(0.2 + mast * 0.05, 0.2, 0.75);
    const def = b.def + (p.buffs.def ? p.buffs.def.val : 0) + Math.floor(dex / 6);
    const maxHp = Math.round((p.baseHp + b.hp) * (1 + 0.04 * tough));
    const maxMp = Math.round(p.baseMp + p.int * 2);
    return { maxDmg, minDmg: maxDmg * minRatio, def, maxHp, maxMp, crit: 0.06 + p.luk * 0.004, speed: 142, spd: w.spd || 0.45, rng: w.rng || 58, wt: w.wt || 'sword', str, dex, wAtk, bonus: b };
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
    p.x = clamp(ax, 30, m.w - 30); p.y = m.plats[0].y; p.onGround = true; p.plat = m.plats[0]; p.face = p.x < m.w / 2 ? 1 : -1;
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
  E.equip = function (G, id) {
    const p = G.p, it = D.ITEMS[id]; if (!it || it.t !== 'equip' || inv(p, id) < 1) return { ok: false, msg: '장비가 없어요' };
    if (p.lv < it.lv) return { ok: false, msg: `Lv ${it.lv} 이상부터 착용할 수 있어요` };
    const old = p.equip[it.slot]; E.addItem(G, id, -1); if (old) E.addItem(G, old, 1); p.equip[it.slot] = id; ev(G, { t: 'sfx', n: 'equip' });
    const st = E.stats(G); p.hp = Math.min(p.hp, st.maxHp); return { ok: true };
  };
  E.unequip = function (G, slot) { const p = G.p; const id = p.equip[slot]; if (!id) return; if (slot === 'weapon') return; p.equip[slot] = null; E.addItem(G, id, 1); const st = E.stats(G); p.hp = Math.min(p.hp, st.maxHp); };
  E.buy = function (G, id, n) {
    const p = G.p, it = D.ITEMS[id]; n = n || 1; const cost = it.price * n;
    if (p.meso < cost) return { ok: false, msg: '메소가 부족해요' };
    p.meso -= cost; E.addItem(G, id, n); ev(G, { t: 'sfx', n: 'buy' }); return { ok: true };
  };
  E.sell = function (G, id, n) {
    const p = G.p, it = D.ITEMS[id]; n = Math.min(n || 1, inv(p, id)); if (n < 1 || it.q) return { ok: false, msg: it && it.q ? '퀘스트에 필요한 물건이에요' : '팔 수 없어요' };
    p.meso += E.sellPrice(it) * n; E.addItem(G, id, -n); ev(G, { t: 'sfx', n: 'buy' }); return { ok: true };
  };
  E.sellAllEtc = function (G) { let gain = 0; const p = G.p; for (const id of Object.keys(p.inv)) { const it = D.ITEMS[id]; if (it.t === 'etc' && !it.q && !questNeeds(G, id)) { gain += it.price * p.inv[id]; delete p.inv[id]; } } p.meso += gain; if (gain) ev(G, { t: 'sfx', n: 'buy' }); return gain; };
  function questNeeds(G, id) { for (const qid in G.p.quests) { if (G.p.quests[qid].st !== 'active') continue; for (const g of D.QUESTS[qid].goals) if (g.item === id) return true; } return false; }

  /* ───────── 스탯·스킬 ───────── */
  E.addStat = function (G, k, n) { const p = G.p; n = Math.min(n || 1, p.ap); if (n < 1 || !(k in { str: 1, dex: 1, int: 1, luk: 1 })) return false; p[k] += n; p.ap -= n; return true; };
  E.autoStat = function (G) { const p = G.p; p.str += p.ap; p.ap = 0; };
  E.resetStats = function (G) { const p = G.p; const used = (p.str - 12) + (p.dex - 5) + (p.int - 4) + (p.luk - 4); p.str = 12; p.dex = 5; p.int = 4; p.luk = 4; p.ap += used; };
  E.learn = function (G, sid) {
    const p = G.p, s = D.SKILLS[sid]; const l = p.skills[sid] || 0;
    if (!s || p.sp < 1 || l >= s.maxLv || p.lv < s.reqLv) return false;
    p.skills[sid] = l + 1; p.sp -= 1; ev(G, { t: 'sfx', n: 'equip' }); return true;
  };

  /* ───────── 전투 ───────── */
  function mitig(def, lv) { return def / (def + 20 + lv * 3.5); }
  function playerHurt(G, rawAtk, srcX, mlv, kb) {
    const p = G.p; if (p.dead || p.inv_t > 0) return false;
    const st = E.stats(G);
    let dmg = rawAtk * rr(G, 0.88, 1.12) * (1 - mitig(st.def, mlv));
    dmg = Math.max(1, Math.round(dmg));
    p.hp -= dmg; p.inv_t = 1.0; p.hitFlash = 0.25;
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
    let e = def.exp; const diff = def.lv - p.lv;
    if (diff < -6) e *= Math.max(0.2, 1 + (diff + 6) * 0.12); else if (diff > 0) e *= 1 + 0.05 * Math.min(6, diff);
    e = Math.max(1, Math.round(e)); gainExp(G, e, m.x, m.y - def.h);
    // 드랍
    const mesos = Math.round(rr(G, def.mesos[0], def.mesos[1]) * (rand(G) < 0.3 ? 0 : 1));
    if (mesos > 0) dropLoot(G, m.x, m.y - 14, { meso: mesos });
    for (const [id, pr] of def.drops) if (rand(G) < pr * (1 + p.luk * 0.002)) dropLoot(G, m.x, m.y - 14, { id, n: 1 });
    for (const [id, pr] of def.eq) if (rand(G) < pr * (1 + p.luk * 0.002)) dropLoot(G, m.x, m.y - 14, { id, n: 1 });
    p.kills[m.id] = (p.kills[m.id] || 0) + 1;
    for (const qid in p.quests) { const q = p.quests[qid]; if (q.st !== 'active') continue; D.QUESTS[qid].goals.forEach((g, i) => { if (g.kill === m.id && q.prog[i] < g.n) { q.prog[i]++; ev(G, { t: 'qprog', q: qid }); } }); }
    m.slot.respT = def.boss ? 90 : rr(G, 7, 12);
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
    const p = G.p; p.lv++; p.ap += 5; p.sp += 3; p.baseHp += 16 + Math.floor(p.lv * 0.9); p.baseMp += 3;
    const st = E.stats(G); p.hp = st.maxHp; p.mp = st.maxMp;
    ev(G, { t: 'levelup', lv: p.lv }); ev(G, { t: 'sfx', n: 'levelup' });
    for (const sid of D.SKILL_ORDER) if (D.SKILLS[sid].reqLv === p.lv) ev(G, { t: 'msg', text: `새 스킬 사용 가능: ${D.SKILLS[sid].n}` });
  }
  E.gainExp = gainExp;

  // 스킬/공격 시작
  function startAttack(G, sid) {
    const p = G.p, st = E.stats(G);
    if (p.dead || p.climb || p.atk || p.atkCd > 0 || p.knock > 0) return false;
    let a;
    if (!sid) {
      p.comboT > 0 ? p.combo = (p.combo + 1) % 3 : p.combo = 0; p.comboT = 0.9;
      a = { kind: 'basic', t: 0, dur: st.spd, hit: st.spd * 0.42, done: false, face: p.face, combo: p.combo, mult: 1, targets: st.wt === 'great' ? 2 : 1, rng: st.rng };
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
      a = { kind: sid, t: 0, dur, hit: dur * (sid === 'quake' ? 0.55 : 0.42), done: false, face: p.face, mult: s.mult(l), targets: s.targets, rng: s.rng + (st.rng - 58) * 0.6, combo: 0 };
    }
    p.atk = a; p.atkCd = a.dur * 0.92; p.vx *= 0.3; if (p.onGround && !sid) p.vx += p.face * 50;
    ev(G, { t: 'swing', kind: a.kind, face: p.face, combo: a.combo }); ev(G, { t: 'sfx', n: sid ? 'skill' : 'swing' });
    return true;
  }
  function resolveAttack(G) {
    const p = G.p, a = p.atk; a.done = true;
    const mid = a.kind === 'quake';
    const x0 = mid ? p.x - a.rng : (a.face > 0 ? p.x - 10 : p.x - a.rng), x1 = mid ? p.x + a.rng : (a.face > 0 ? p.x + a.rng : p.x + 10);
    const y0 = p.y - 58, y1 = p.y + 12;
    const hits = [];
    for (const m of G.mons) { if (m.dead || m.spawnT > 0.2) continue; const mx0 = m.x - m.def.w * 0.5, mx1 = m.x + m.def.w * 0.5, my0 = m.y - m.def.h, my1 = m.y; if (mx1 >= x0 && mx0 <= x1 && my1 >= y0 && my0 <= y1) hits.push(m); }
    hits.sort((u, v) => Math.abs(u.x - p.x) - Math.abs(v.x - p.x));
    const n = Math.min(a.targets, hits.length);
    for (let i = 0; i < n; i++) {
      const m = hits[i]; const dir = m.x >= p.x ? 1 : -1; hitMonster(G, m, a.mult, dir, a.kind);
      if (a.kind === 'basic' && (E.stats(G).wt !== 'great')) break;
    }
    if (a.kind === 'quake') { G.shake = Math.max(G.shake, 9); ev(G, { t: 'quake', x: p.x, y: p.y, r: a.rng }); }
    if (a.kind === 'power' || a.kind === 'slash') G.shake = Math.max(G.shake, a.kind === 'power' ? 3 : 2);
    if (!n) ev(G, { t: 'sfx', n: 'whiff' });
  }

  /* ───────── 보스·몬스터 투사체 ───────── */
  function addProj(G, o) { G.proj.push(Object.assign({ life: 4, w: 14, h: 14, vx: 0, vy: 0, grav: 0, dmg: 10, lv: 10, hit: false, t: 0 }, o)); }
  function addZone(G, o) { G.zones.push(Object.assign({ t: 0, dur: 0.9, r: 40, dmg: 10, lv: 10, fired: false }, o)); }
  function bossAI(G, m, dt) {
    const p = G.p, def = m.def, tree = def.ai === 'bosstree';
    const phase2 = m.hp < m.maxhp * (tree ? 0.5 : 0.45);
    if (phase2 && !m.p2) { m.p2 = true; ev(G, { t: 'msg', text: `${def.n}이(가) 분노했다!` }); G.shake = 12; ev(G, { t: 'sfx', n: 'roar' }); }
    const sp = def.speed * (phase2 ? 1.5 : 1);
    m.t -= dt;
    if (m.st === 'walk' || m.st === 'idle') {
      const dx = p.x - m.x; m.face = dx >= 0 ? 1 : -1;
      if (Math.abs(dx) > 40 && !p.dead) m.vx = m.face * sp; else m.vx = 0;
      m.cd -= dt;
      if (m.cd <= 0 && !p.dead) {
        m.st = 'wind'; m.vx = 0;
        const r = rand(G);
        if (tree) m.atkn = r < 0.42 ? 'slam' : r < 0.8 ? 'roots' : (G.mons.filter((x) => x.minion && !x.dead).length < 2 ? 'summon' : 'slam');
        else m.atkn = r < 0.34 ? 'slam' : r < 0.7 ? 'rocks' : 'stomp';
        m.t = m.atkn === 'summon' ? 1.0 : m.atkn === 'stomp' ? 0.7 : 0.95; m.wind = m.t; ev(G, { t: 'bossWind', id: m.id, atk: m.atkn, x: m.x });
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
          for (let k = 0; k < n; k++) addZone(G, { kind: 'root', x: clamp(p.x + (k - (n - 1) / 2) * 90 + rr(G, -20, 20), 60, G.map.w - 60), y: m.py, r: 36, dur: 0.9 + k * 0.15, dmg: def.atk * 1.4, lv: def.lv });
          ev(G, { t: 'sfx', n: 'roar' }); m.st = 'rest'; m.t = 1.0;
        } else if (a === 'summon') {
          for (const d of [-1, 1]) { const x = clamp(m.x + d * 120, 80, G.map.w - 80); const sl = { m: 'stump', p: 0, x, mon: null, respT: 0, minion: true }; spawnMon(G, sl); const mm = sl.mon; mm.minion = true; mm.hp = mm.maxhp = 120; mm.x0 = 60; mm.x1 = G.map.w - 60; mm.prov = 99; mm.stunT = 0; ev(G, { t: 'hit', x, y: mm.y - 20, fx: 'spawn' }); }
          m.st = 'rest'; m.t = 0.8;
        } else if (a === 'rocks') {
          const n = phase2 ? 7 : 5;
          for (let k = 0; k < n; k++) addZone(G, { kind: 'rock', x: clamp(k === 0 ? p.x : p.x + rr(G, -280, 280), 60, G.map.w - 60), y: m.py, r: 38, dur: 0.85 + k * 0.17, dmg: def.atk * 1.3, lv: def.lv });
          ev(G, { t: 'sfx', n: 'roar' }); m.st = 'rest'; m.t = 1.0;
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
    for (const pt of G.map.portals) if (Math.abs(p.x - pt.x) < 38 && p.onGround) return { type: 'portal', portal: pt };
    return null;
  };
  E.usePortal = function (G, pt) { ev(G, { t: 'sfx', n: 'portal' }); ev(G, { t: 'fade' }); E.loadMap(G, pt.to, pt.tx); };

  function tick(G, dt) {
    G.t += dt; G.bgTime += dt; const p = G.p, inp = G.input, map = G.map;
    G.shake = Math.max(0, G.shake - dt * 22); G.potCd -= dt; p.play += dt;
    if (inp.jump > 0) inp.jump -= dt; if (inp.up_e > 0) inp.up_e -= dt;
    const st = E.stats(G);
    // 타이머
    p.inv_t -= dt; p.atkCd -= dt; p.dropT -= dt; p.ladderCd -= dt; p.knock -= dt; p.comboT -= dt; p.hitFlash -= dt;
    for (const k in p.skCd) if (p.skCd[k] > 0) p.skCd[k] -= dt;
    for (const k in p.buffs) { p.buffs[k].t -= dt; if (p.buffs[k].t <= 0) { delete p.buffs[k]; ev(G, { t: 'buffEnd', k }); } }
    // 포션
    if (inp.pot) { E.autoPotion(G, inp.pot); inp.pot = null; }
    if (p.pet && p.settings.auto && !p.dead && G.potCd <= 0) {
      let did = false;
      if (p.hp < st.maxHp * (p.settings.autoT || 0.35)) did = E.autoPotion(G, 'hp');
      else if (p.settings.autoMp && p.mp < st.maxMp * (p.settings.autoMpT || 0.2)) did = E.autoPotion(G, 'mp');
      if (did) ev(G, { t: 'petDrink' });
    }
    // 스킬 큐
    while (inp.skills.length) { const s = inp.skills.shift(); if (!p.dead) startAttack(G, s); }
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
    // 투사체
    for (let i = G.proj.length - 1; i >= 0; i--) {
      const q = G.proj[i];
      if (q.delay > 0) { q.delay -= dt; continue; }
      q.t += dt; q.life -= dt; q.vy += q.grav * dt; q.x += q.vx * dt; q.y += q.vy * dt;
      if (q.kind === 'fire' && q.y > G.map.plats[0].y + 20) q.life = 0;
      if (!q.hit && !p.dead && p.inv_t <= 0 && Math.abs(p.x - q.x) < q.w * 0.5 + HW && p.y > q.y - q.h * 0.5 && p.y - PH < q.y + q.h * 0.5 + (q.ground ? q.h * 0.5 : 0)) { if (playerHurt(G, q.dmg, q.x, q.lv, 1)) q.hit = true; }
      if (q.life <= 0 || q.hit || q.x < -40 || q.x > G.map.w + 40) G.proj.splice(i, 1);
    }
    for (let i = G.zones.length - 1; i >= 0; i--) {
      const z = G.zones[i]; z.t += dt;
      if (!z.fired && z.t >= z.dur) { z.fired = true; ev(G, { t: 'zone', kind: z.kind, x: z.x, y: z.y }); G.shake = Math.max(G.shake, 6); ev(G, { t: 'sfx', n: 'slam' }); if (!p.dead && Math.abs(p.x - z.x) < z.r + HW && p.y > z.y - 46) playerHurt(G, z.dmg, z.x, z.lv, 1); }
      if (z.t >= z.dur + 0.35) G.zones.splice(i, 1);
    }
    // 드랍
    for (let i = G.drops.length - 1; i >= 0; i--) {
      const d = G.drops[i]; d.t += dt; d.life -= dt;
      if (!d.onG) { d.vy += GRAV * 0.8 * dt; const py = d.y; d.x += d.vx * dt; d.y += d.vy * dt; d.vx *= 0.99;
        if (d.vy > 0) for (const pl of map.plats) if (py <= pl.y + 1 && d.y >= pl.y && d.x > pl.x && d.x < pl.x + pl.w) { d.y = pl.y; d.onG = true; d.vx = 0; d.vy = 0; break; }
        if (d.y > map.h + 100) d.life = 0; }
      if (!p.dead && d.t > 0.45 && Math.abs(p.x - d.x) < 30 && p.y > d.y - 6 && p.y - PH - 10 < d.y) {
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
    let mon = id;
    if (kind === 'item') { mon = Object.keys(D.MON).find((k) => D.MON[k].drops.some((d) => d[0] === id) && !D.MON[k].boss) || Object.keys(D.MON).find((k) => D.MON[k].drops.some((d) => d[0] === id)); }
    for (const mid in D.MAPS) { const mp = D.MAPS[mid]; if (mp.boss === mon || mp.spawns.some((s) => s.m === mon)) return { map: mp.n, mon: D.MON[mon].n }; }
    return { map: '?', mon: '?' };
  };
  E.objective = function (G) {
    const p = G.p;
    for (const qid of D.QUEST_ORDER) {
      const s = E.qState(G, qid), q = D.QUESTS[qid];
      if (s === 'ready') return { txt: `[${q.n}] 완료! ${npcName(q.npc)}에게 돌아가세요`, q: qid, ready: true };
      if (s === 'active') { const pr = E.qProg(G, qid).filter((g) => g.cur < g.n)[0]; const g = q.goals.find((x, i) => (x.kill ? D.MON[x.kill].n + ' 처치' : D.ITEMS[x.item].n + ' 모으기') === pr.txt); const w = E.where(g.kill ? 'kill' : 'item', g.kill || g.item); return { txt: `[${q.n}] ${pr.txt} ${pr.cur}/${pr.n}`, sub: `${w.map}`, q: qid }; }
    }
    for (const qid of D.QUEST_ORDER) { const s = E.qState(G, qid), q = D.QUESTS[qid]; if (s === 'avail') return { txt: `${npcName(q.npc)}에게 말을 걸어 퀘스트를 받으세요`, sub: '페리온 마을', q: qid }; if (s === 'lowlv') return { txt: `Lv ${q.lv}이 되면 새 퀘스트! 사냥하며 레벨을 올리세요`, sub: '' }; }
    return { txt: '모든 퀘스트 완료! 자유롭게 사냥하세요', sub: '' };
  };
  function npcName(id) { const t = D.MAPS.perion.npcs.find((n) => n.id === id); return t ? t.n : id; }
  E.npcName = npcName;

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

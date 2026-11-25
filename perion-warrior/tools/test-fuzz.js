// 무작위 조작 퍼즈: 모든 맵·모든 직업에서 몇 분간 마구 눌러도 예외/NaN 없이 돌아가는지
const E = require('../engine.js'), D = require('../data.js'); let bad = 0, runs = 0;
let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
for (const job of [null, 'fighter', 'page', 'spearman']) for (const mid of Object.keys(D.MAPS)) {
  try {
    const G = E.newGame('f', 7 + runs); const p = G.p; p.lv = job ? 36 : 20; p.str = 120; p.dex = 60; p.int = 30; p.sp = 200; p.ap = 0;
    if (job) { p.quests.q9 = { st: 'done', prog: [] }; E.advance(G, job); }
    for (const s of D.SKILL_ORDER) for (let i = 0; i < 12; i++) E.learn(G, s);
    p.inv = { hp4: 99, mp3: 99, sw4: 1, gs3: 1, ax4: 1, mc4: 1, sp4: 1, hmk: 1, scW100: 20 }; for (const w of ['sw4', 'gs3', 'ax4', 'mc4', 'sp4']) E.equip(G, w); E.equip(G, 'hmk');
    E.loadMap(G, mid, D.MAPS[mid].portals && D.MAPS[mid].portals[0] ? D.MAPS[mid].portals[0].id : null); p.settings.auto = true; p.pet = { n: 'x' };
    const skills = D.SKILL_ORDER.filter((s) => D.SKILLS[s].kind !== 'passive' && (p.skills[s] || 0) > 0);
    for (let i = 0; i < 60 * 90; i++) {
      if (i % 20 === 0) { G.input.left = rnd() < 0.4; G.input.right = rnd() < 0.5; G.input.attack = rnd() < 0.6; G.input.up = rnd() < 0.15; G.input.down = rnd() < 0.1; if (rnd() < 0.4) E.tapJump(G); if (rnd() < 0.5) E.skill(G, skills[Math.floor(rnd() * skills.length)]); }
      p.mp = Math.max(p.mp, 20); if (p.dead) { p.dead = false; p.hp = E.stats(G).maxHp; }
      E.step(G, 1 / 60); G.events.length = 0;
      if (!isFinite(p.x) || !isFinite(p.y) || !isFinite(p.hp) || !isFinite(p.mp)) throw new Error('NaN ' + p.x + ' ' + p.y + ' ' + p.hp);
    }
    runs++;
  } catch (e) { console.log('FAIL', job, mid, e.message, (e.stack || '').split('\n')[1]); bad++; }
}
console.log('퍼즈', runs + bad, '회', bad ? 'FAILED ' + bad : 'ALL OK'); process.exit(bad ? 1 : 0);

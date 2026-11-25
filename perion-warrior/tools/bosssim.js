// 보스 전투 시뮬레이션 (sim.js 의 봇 재사용 아님: 간단한 독립 봇)
const D=require('../data.js'),E=require('../engine.js');
function fight(L,map,potCount,seed){
  const G=E.newGame('b',seed); const p=G.p; p.lv=L; p.str=12+5*(L-1); p.baseHp=55; for(let l=2;l<=L;l++)p.baseHp+=16+Math.floor(l*.9); p.baseMp=14+3*(L-1);
  let sp=3*(L-1); const want={power:10,mastery:10,slash:10,quake:10,toughness:6,ironbody:5,rage:5}; p.skills={power:1}; sp-=0;
  for(let g=0;g<400&&sp>0;g++){let did=false;for(const s of ['power','mastery','slash','quake','toughness','ironbody','rage']){if(sp>0&&D.SKILLS[s].reqLv<=L&&(p.skills[s]||0)<want[s]){p.skills[s]=(p.skills[s]||0)+1;sp--;did=true}}if(!did)break}
  const best=(slot)=>{let b=null;for(const id of D.SHOPS.smith.items){const it=D.ITEMS[id];if(it.slot===slot&&it.lv<=L&&(!b||(it.atk||it.def)>(b.atk||b.def)))b=it}return b&&b.id};
  for(const s of ['weapon','helmet','armor','gloves','shoes']){const id=best(s);if(id)p.equip[s]=id}
  p.inv={}; E.loadMap(G,map,{x:200}); const st=E.stats(G); p.hp=st.maxHp; p.mp=st.maxMp; p.settings.auto=false;
  const heal=L<20?420:850; let pots=potCount,used=0,deaths=0; const boss=G.boss; const dt=1/60; let t=0;
  for(;t<600;t+=dt){ const inp=G.input; inp.left=inp.right=false; inp.attack=false;
    if(p.dead){deaths++;break}
    const dx=boss.x-p.x; const reach=E.stats(G).rng*0.8+boss.def.w*0.3;
    // 보스 근처에서 싸우되 충격파는 점프로 회피(간단 휴리스틱)
    if(Math.abs(dx)>reach){ if(dx>0)inp.right=true;else inp.left=true } else {p.face=dx>=0?1:-1;inp.attack=true}
    for(const q of G.proj){ if(Math.abs(q.x-p.x)<70&&p.onGround&&Math.sign(q.vx)===Math.sign(p.x-q.x)) {E.tapJump(G);break} }
    if(Math.abs(dx)<150&&p.onGround&&!p.atk){ if(p.skills.rage&&!p.buffs.atk&&p.mp>40)E.skill(G,'rage'); else if(p.skills.ironbody&&!p.buffs.def&&p.mp>40)E.skill(G,'ironbody'); else if(p.skills.quake&&p.mp>60&&!(p.skCd.quake>0))E.skill(G,'quake'); else if(p.skills.slash&&p.mp>20&&!(p.skCd.slash>0))E.skill(G,'slash'); else if(p.mp>10&&!(p.skCd.power>0))E.skill(G,'power')}
    if(p.hp<st.maxHp*0.45&&G.potCd<=0&&pots>0){p.hp=Math.min(st.maxHp,p.hp+heal);pots--;used++;G.potCd=.5}
    if(p.mp<15&&G.potCd<=0){p.mp=Math.min(st.maxMp,p.mp+150);G.potCd=.5}
    E.step(G,dt); G.events.length=0; if(boss.dead)break }
  return {killed:boss.dead,secs:Math.round(t),pots:used,deaths,hp:Math.round(boss.hp/boss.maxhp*100)};
}
for(const [L,map] of [[12,'bosstree'],[14,'bosstree'],[16,'bosstree'],[26,'bossgolem'],[28,'bossgolem'],[30,'bossgolem']]){
  const r=[1,2,3].map(s=>fight(L,map,40,s));
  console.log('Lv'+L,map,r.map(x=>`${x.killed?'승':'패'} ${x.secs}s 물약${x.pots} ${x.deaths?'사망':''}${x.killed?'':' 남은HP'+x.hp+'%'}`).join(' | '));
}

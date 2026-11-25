const E=require('../engine.js'),D=require('../data.js');
let bad=0;
for(const id of Object.keys(D.MAPS)){
  const G=E.newGame('s',77); const p=G.p; p.lv=25; p.baseHp=2500; p.baseMp=300; p.str=100; p.skills={power:5,slash:5,ironbody:3,rage:3,quake:3,mastery:5,toughness:3}; p.inv={hp3:999,mp2:999,hp1:50};
  E.loadMap(G,id,{x:300}); let r=1; const rnd=()=>{r=(r*1664525+1013904223)%4294967296;return r/4294967296};
  for(let i=0;i<60*120;i++){ const inp=G.input; if(i%20===0){inp.left=rnd()<0.4;inp.right=!inp.left&&rnd()<0.6;inp.up=rnd()<0.1;inp.down=rnd()<0.08;inp.attack=rnd()<0.7; if(rnd()<0.3)E.tapJump(G); if(rnd()<0.2)E.skill(G,['power','slash','quake','ironbody','rage'][(rnd()*5)|0]); if(rnd()<0.3){const nb=E.nearby(G); if(nb&&nb.type==='portal'&&rnd()<0.1){E.usePortal(G,nb.portal);}}}
    try{E.step(G,1/60)}catch(e){console.log('EXC',id,e.stack.split('\n').slice(0,3).join(' | '));bad++;break}
    G.events.length=0; if(p.dead){E.respawn(G);E.loadMap(G,id,{x:300});}
    if(!isFinite(p.x)||!isFinite(p.y)||!isFinite(p.hp)){console.log('NaN',id,i,p.x,p.y,p.hp);bad++;break}
    for(const m of G.mons) if(!isFinite(m.x)||!isFinite(m.y)){console.log('NaN mon',id,m.id);bad++;break}
    if(G.mapId!==id){E.loadMap(G,id,{x:300});}
  }
  console.log('soak ok',id,'kills',Object.values(p.kills).reduce((a,b)=>a+b,0));
}
console.log(bad?'FAIL':'ALL OK');

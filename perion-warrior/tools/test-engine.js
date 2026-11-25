const E=require('../engine.js'),D=require('../data.js');
const G=E.newGame('t',5); E.loadMap(G,'rock1',{x:1010}); const p=G.p; let fails=0; const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m); if(!c)fails++;};
const run=(s)=>{for(let i=0;i<s*60;i++)E.step(G,1/60); G.events.length=0;};
run(0.5); ok(p.onGround&&Math.abs(p.y-400)<1,'ground landing');
G.input.up=true; E.tapUp(G); run(0.3); ok(!!p.climb,'ladder grab'); run(1.5); G.input.up=false; run(0.5); ok(Math.abs(p.y-332)<2&&p.onGround&&!p.climb,'ladder top exit lands on plat y='+p.y.toFixed(1));
// 아래로 내려가기
G.input.down=true; run(0.3); ok(!!p.climb,'climb down start'); run(1.5); G.input.down=false; run(0.3); ok(Math.abs(p.y-400)<2,'back to ground y='+p.y.toFixed(1));
// 점프로 윗발판 올라가기
E.loadMap(G,'rock1',{x:300}); run(0.3); E.tapJump(G); run(0.8); ok(Math.abs(p.y-332)<2,'jump up to plat 332 y='+p.y.toFixed(1));
// 아래 점프로 내려가기
G.input.down=true; E.tapJump(G); run(0.6); G.input.down=false; ok(p.y>332+10,'drop through y='+p.y.toFixed(1));
// 포탈
E.loadMap(G,'perion',{x:70}); run(0.3); const nb=E.nearby(G); ok(nb&&nb.type==='portal','near portal'); E.tapUp(G); G.input.up=true; run(0.1); G.input.up=false; ok(G.mapId==='rock1'&&p.x>0,'portal -> rock1 x='+p.x.toFixed(0));
// 퀘스트
const g2=E.newGame('q',3); ok(E.qState(g2,'q1')==='avail','q1 avail'); E.qAccept(g2,'q1'); ok(E.qState(g2,'q1')==='active','q1 active'); g2.p.quests.q1.prog[0]=5; ok(E.qState(g2,'q1')==='ready','q1 ready'); E.qComplete(g2,'q1'); ok(E.qState(g2,'q2')==='lowlv'||E.qState(g2,'q2')==='avail','q2 next ('+E.qState(g2,'q2')+')'); ok(g2.p.inv.hp1===18,'reward potions='+g2.p.inv.hp1);
// 직렬화
const s=JSON.parse(JSON.stringify(E.serialize(g2))); const g3=E.newGame('x',1,s); ok(g3.p.quests.q1.st==='done'&&g3.p.lv===g2.p.lv,'save/load');
// 레벨업 & 스킬
const g4=E.newGame('l',9); E.gainExp(g4,D.expToNext(1)+1); ok(g4.p.lv===2&&g4.p.ap===5&&g4.p.sp===E.spEarned(2),'levelup ap/sp'); 
// 전체 퀘스트 연계 + 펫
const g5=E.newGame('c',11); g5.p.lv=30; let order=D.QUEST_ORDER; for(const q of order){ if(E.qState(g5,q)!=='avail'){ok(false,'quest '+q+' not avail: '+E.qState(g5,q));break;} E.qAccept(g5,q); D.QUESTS[q].goals.forEach((gl,i)=>{ if(gl.kill) g5.p.quests[q].prog[i]=gl.n; else E.addItem(g5,gl.item,gl.n); }); ok(E.qComplete(g5,q),'complete '+q); }
ok(!!g5.p.pet&&g5.p.pet.n==='멧돌이','pet granted');
g5.p.inv={hp1:3}; g5.p.hp=5; g5.p.settings.auto=true; for(let i=0;i<120;i++)E.step(g5,1/60); ok(g5.p.hp>5&&g5.p.inv.hp1<3,'pet auto potion');
const g6=E.newGame('n',2); g6.p.inv={hp1:3}; g6.p.hp=5; for(let i=0;i<120;i++)E.step(g6,1/60); ok(g6.p.inv.hp1===3,'no pet -> no auto potion');
console.log(fails?('FAILS '+fails):'ALL OK'); process.exit(fails?1:0);

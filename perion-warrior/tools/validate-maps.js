const D=require('../data.js');
let bad=0;
for(const id in D.MAPS){const m=D.MAPS[id];const P=m.plats;const reach=new Set([0]);let ch=true;
 while(ch){ch=false;P.forEach((pl,i)=>{if(reach.has(i))return;for(const j of reach){const pj=P[j];const dy=pj.y-pl.y;const ov=pj.x<pl.x+pl.w&&pl.x<pj.x+pj.w;if(dy>0&&dy<=78&&ov){reach.add(i);ch=true;return}}
  for(const l of m.ladders){ if(Math.abs(l.y1-pl.y)<2&&l.x>pl.x&&l.x<pl.x+pl.w){const lower=P.findIndex((q,k)=>reach.has(k)&&Math.abs(q.y-l.y2)<2&&l.x>q.x&&l.x<q.x+q.w); if(lower>=0){reach.add(i);ch=true;return}}}});}
 P.forEach((pl,i)=>{if(!reach.has(i)){console.log('UNREACHABLE',id,i,pl);bad++}});
 for(const s of m.spawns){if(!P[s.p]){console.log('bad spawn plat',id,s);bad++}}
 for(const pt of m.portals){const t=D.MAPS[pt.to];if(!t){console.log('bad portal',id,pt.id);bad++}else if(!t.portals.find(q=>q.id===pt.tx)){console.log('missing target portal',id,pt.id,'->',pt.to,pt.tx);bad++}}
 for(const l of m.ladders){const top=P.find(q=>Math.abs(q.y-l.y1)<2&&l.x>q.x&&l.x<q.x+q.w);if(!top){console.log('ladder top not on plat',id,l);bad++}}
}
console.log('problems:',bad);

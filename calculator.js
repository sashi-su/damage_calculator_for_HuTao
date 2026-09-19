(function(root){
'use strict';
const D=root.HUTAO_DATA||(typeof require==='function'?require('./data.js'):null);
function resistance(r){return r<0?1-r/2:r<.75?1-r:1/(4*r+1);}
function calculate(s){
 const has=id=>s.team.includes(id),base=D.levels[s.level],baseAtk=base.atk+D.weaponAtk,atkInputMode=s.atkInputMode==='buildCard'?'buildCard':s.atkInputMode==='skillPre'?'skillPre':'legacy',skillPreInput=atkInputMode==='skillPre',hpInputMode=s.hpInputMode==='field'?'field':'buildCard';
 const fixedBonus=46.6+33+22.5,customFlat=s.otherFlat*s.otherCount;
 const totals={hpPercent:s.customHp,atkPercent:s.customAtkPct,flatAtk:s.customAtkFlat,em:s.em+s.customEm,bonus:fixedBonus+s.bonus,shred:s.shred,ignore:s.ignore,external:customFlat};
 const contributions={},effects=[];
 // Each contribution feeds the total and the displayed breakdown together.
 const source=id=>contributions[id]||(contributions[id]={hpPercent:0,atkPercent:0,flatAtk:0,em:0,bonus:0,shred:0,ignore:0,external:0,flatPerHit:0,flatCount:0});
 function add(id,stat,value,name,unit){
  totals[stat]+=value;source(id)[stat]+=value;
  effects.push({name,value:stat==='shred'?-value:value,unit});
 }
 function addFlat(id,amount,count,name){
  const entry=source(id);entry.flatPerHit=amount;entry.flatCount=count;
  add(id,'external',amount*count,name,'');
 }
 // Resolve supporter reference stats, including buffs from earlier actions.
 const elegyEm=has('yelan')&&s.yWeapon?D.elegy.em[s.yR-1]:0,elegyAtk=has('yelan')&&s.yWeapon?D.elegy.atk[s.yR-1]:0;
 const yelanStacks=s.yStacks??4,yelanHpPercent=has('yelan')&&s.yC>=4?yelanStacks*10:0;
 const furinaBaseHp=D.furinaLevels[s.fLevel??90],fHpInputMode=s.fHpInputMode==='buildCard'?'buildCard':'field',keyHpParts=[{label:'入力値',value:s.fHp}];
 let keyHp=s.fHp;
 if(has('furina')&&has('yelan')&&fHpInputMode==='buildCard'){const value=furinaBaseHp*.25;keyHp+=value;keyHpParts.push({label:'水共鳴',value});}
 if(has('furina')&&s.customHpTeam){const value=furinaBaseHp*s.customHp/100;keyHp+=value;keyHpParts.push({label:'カスタムバフ',value});}
 if(has('furina')&&has('yelan')&&s.yC>=4&&s.fAfterYelan){const value=furinaBaseHp*yelanHpPercent/100;keyHp+=value;keyHpParts.push({label:'夜蘭4凸',value});}
 const keyEm=has('furina')&&s.fWeapon?keyHp*D.key[s.fR-1]:0;
 const nAtkInputMode=s.nAtkInputMode==='buildCard'?'buildCard':'field',nicoAtkParts=[{label:'入力値',value:s.nAtk}];
 let nicoAtk=s.nAtk;
 if(has('nico')&&nAtkInputMode==='buildCard'){const value=s.nBaseAtk*.25;nicoAtk+=value;nicoAtkParts.push({label:'炎共鳴',value});}
 if(has('nico')&&s.customAtkFlatTeam){nicoAtk+=s.customAtkFlat;nicoAtkParts.push({label:'カスタム固定値',value:s.customAtkFlat});}
 if(has('nico')&&s.customAtkPctTeam){const value=s.nBaseAtk*s.customAtkPct/100;nicoAtk+=value;nicoAtkParts.push({label:'カスタム攻撃力%',value});}
 if(has('nico')&&s.nAfterElegy){const value=s.nBaseAtk*elegyAtk/100;nicoAtk+=value;nicoAtkParts.push({label:'終焉',value});}
 const nTalent=s.nC>=3?13:10,nicoSkillRate=nTalent===13?.177:.15,nicoSkillCap=nTalent===13?708:600;
 const nicoSkillBuff=Math.min(nicoAtk*nicoSkillRate,nicoSkillCap)+300+(s.nC>=2?300:0),fTalent=s.fC>=3?13:10;
 const cEmInputMode=s.cEmInputMode==='buildCard'?'buildCard':'field',citEmParts=[{label:'入力値',value:s.cEm}];
 let citEm=s.cEm;
 if(cEmInputMode==='buildCard'&&s.cC>=2){citEm+=125;citEmParts.push({label:'2凸',value:125});}
 if(s.customEmTeam){citEm+=s.customEm;citEmParts.push({label:'カスタムバフ',value:s.customEm});}
 const resonance=source('resonance');
 if(has('yelan')&&has('furina')&&hpInputMode==='buildCard')add('resonance','hpPercent',25,'水元素共鳴','% HP（基礎HP参照）');
 if(has('nico')&&!skillPreInput)add('resonance','atkPercent',25,'炎元素共鳴','% 攻撃力（基礎攻撃力参照）');
 if(has('yelan')){
  add('yelan','bonus',s.yBuff,'夜蘭・平均与ダメージ','%');
  if(s.yC>=4)add('yelan','hpPercent',yelanHpPercent,'夜蘭4凸・'+yelanStacks+'層','% HP（基礎HP参照）');
  if(s.yWeapon){add('yelan','em',elegyEm,'終焉・熟知','');add('yelan','atkPercent',elegyAtk,'終焉・攻撃力','%');}
 }
 if(has('citlali')){
  if(s.cAfterElegy){citEm+=elegyEm;citEmParts.push({label:'終焉',value:elegyEm});}
  if(s.cAfterKey){citEm+=keyEm;citEmParts.push({label:'聖顕',value:keyEm});}
  add('citlali','shred',-(s.cC>=2?40:20),'シトラリ・炎耐性低下','%');
  if(s.cC>=2)add('citlali','em',250,'シトラリ2凸・熟知','');
  if(s.cC>=6)add('citlali','bonus',60,'シトラリ6凸・最大40カウント','% ダメージ');
  if(s.cWeapon)add('citlali','bonus',D.star[s.cR-1],'祭星者の眺め','% ダメージ');
  if(s.cSet==='scroll')add('citlali','bonus',40,'英雄の絵巻・炎を含む反応発動済み','% ダメージ');
  if(s.cSet==='instructor'){add('citlali','em',120,'教官4・胡桃の熟知','');citEm+=120;citEmParts.push({label:'教官4セット',value:120});}
 }
 const citFlatPerHit=citEm*2;
 if(has('citlali')&&s.cC>=1)addFlat('citlali',citFlatPerHit,s.cCount,'星の刃・実数加算合計');
 if(has('furina')){
  const fan=s.fC>=1?400:300;
  add('furina','bonus',fan*D.furinaRate[fTalent],'フリーナ・最大テンション '+fan,'% ダメージ');
  if(s.fWeapon)add('furina','em',keyEm,'聖顕の鍵・熟知','');
 }
 if(has('nico')){
  add('nico','flatAtk',nicoSkillBuff,'ニコ・Lv.'+nTalent+'スキル＋昇格＋命ノ星座',' 攻撃力');
  if(s.nC>=2)add('nico','shred',-25,'ニコ2凸・炎耐性低下','%');
  if(s.nC>=4)addFlat('nico',nicoAtk*.7,8,'導きの加護・実数加算（8回）');
  if(s.nC>=6)add('nico','ignore',40,'ニコ6凸・防御無視','%');
  if(s.nWeapon)add('nico','bonus',Math.min(nicoAtk/1000*D.nicoWeapon.rate[s.nR-1],D.nicoWeapon.cap[s.nR-1]),'塵と光の七つの誓約','% ダメージ');
  if(s.nSet)add('nico','bonus',20,'天からの贈り物・魔導秘儀なし','% ダメージ');
 }
 // Final stats and the intentionally different pre-support reference values.
 const {hpPercent,atkPercent,flatAtk,em,bonus,shred,external}=totals;
 const ignore=Math.min(100,totals.ignore),skillRate=D.talents[s.skill].skill;
 const hp=s.hp+base.hp*hpPercent/100,homaRate=D.homa[s.homa-1].atk,homaCardRate=D.homaAbove50[s.homa-1],homa=hp*homaRate,waterHp=base.hp*resonance.hpPercent/100,homaInputIncluded=skillPreInput?(s.hp+waterHp)*homaRate:atkInputMode==='buildCard'?s.hp*homaCardRate:s.hp*homaRate,homaDelta=homa-homaInputIncluded;
 const skillRaw=hp*skillRate,skillCap=4*baseAtk,skill=Math.min(skillRaw,skillCap);
 const attackBeforeBuffs=s.atk+homaDelta+skill;
 const pre=s.atk+homaDelta+baseAtk*atkPercent/100+flatAtk,atk=pre+skill,attackBeforeHoma=pre-homaDelta;
 const referenceHp=s.hp+waterHp,referenceSkill=Math.min(referenceHp*skillRate,skillCap),referenceHoma=referenceHp*homaRate-homaInputIncluded;
 const referenceAtk=s.atk+referenceHoma+baseAtk*resonance.atkPercent/100+referenceSkill;
 const baseCritRate=Math.min(100,Math.max(0,s.cr+s.customCr)),critDamage=s.cd+s.customCd,c6Rate=s.constellation===6?Math.min(100,Math.max(0,s.c6Rate||0)):0;
 const critRate=100*(c6Rate/100+(1-c6Rate/100)*baseCritRate/100),crit=1+critRate/100*critDamage/100;
 // Explanation intermediates are calculated here, never again in renderers.
 const reactionProbability=s.prob/100,reactionMastery=1+.15+s.reactionBonus/100+2.78*em/(em+1400);
 const reactionUnreacted=1-reactionProbability,reactionReacted=reactionProbability*s.amp*reactionMastery;
 const reaction=reactionReacted+1-reactionProbability;
 const def=(s.level+100)/((1-ignore/100)*(1+s.def/100)*(s.enemy+100)+s.level+100),resValue=(s.res+shred)/100,res=resistance(resValue);
 const buff=1+bonus/100,factor=buff*crit*reaction*def*res;
 // One rotation definition supplies both T and the per-attack breakdown.
 const bloodCount=2,bloodFlatPerHit=s.constellation>=2?hp*.10:0,bloodFlat=bloodFlatPerHit*bloodCount;
 const rotation=[{name:'通常1段目',rate:D.normal,count:10},{name:'重撃',rate:D.charged,count:10},{name:'血梅香',rate:D.talents[s.skill].blood,count:bloodCount},{name:'元素爆発',rate:D.talents[s.burst].burst,count:.5}];
 const T=rotation.reduce((sum,entry)=>sum+entry.rate*entry.count,0);
 const totalFlat=bloodFlat+external,basis=atk*T+totalFlat,total=basis*factor;
 const rows=rotation.map(entry=>{const basis=atk*entry.rate*entry.count+(entry.name==='血梅香'?bloodFlat:0);return {name:entry.name+' × '+entry.count,basis,damage:basis*factor};});
 rows.push({name:'外部の実数加算',basis:external,damage:external*factor});
 return {hp,hpInputMode,baseHp:base.hp,hpPercent,baseAtk,atkPercent,flatAtk,homa,homaRate,homaCardRate,homaDelta,homaInputIncluded,atkInputMode,referenceHp,referenceAtk,skillRaw,skillCap,skill,pre,atk,em,cEmInputMode,citEm,citEmParts,furinaBaseHp,fHpInputMode,keyHp,keyHpParts,keyEm,nAtkInputMode,nicoAtk,nicoAtkParts,nTalent,nicoSkillRate,nicoSkillCap,nicoSkillBuff,fTalent,baseCritRate,critDamage,c6Rate,critRate,crit,reaction,def,res,resValue,buff,bonus,ignore,T,external,bloodCount,bloodFlat,totalFlat,factor,total,rows,effects,
  contributions,fixedBonus,customFlat,skillRate,citFlatPerHit,attackBeforeHoma,attackBeforeBuffs,reactionProbability,reactionMastery,reactionUnreacted,reactionReacted,bloodFlatPerHit,rotation,basis};
}
root.HutaoCalculator={calculate,resistance};if(typeof module!=='undefined')module.exports=root.HutaoCalculator;
})(globalThis);

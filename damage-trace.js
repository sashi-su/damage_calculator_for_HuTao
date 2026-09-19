(function(root){
'use strict';
const D=(root.SITE_CONTENT||(typeof require!=='undefined'?require('./content.js'):{})).page.sections.verification.content.damage;
const n=v=>v.toLocaleString('ja-JP',{maximumSignificantDigits:6});
const exact=n;
const eq=v=>`${Math.abs(v-Number(v.toPrecision(6)))>Math.max(1,Math.abs(v))*1e-14?'≈':'＝'} ${n(v)}`;
function damageTrace(s,r){
 const {basis,reactionProbability:p,reactionMastery:mastery,reactionUnreacted:unreacted,reactionReacted:reacted}=r;
 const calc=(text,className='')=>`<div class="damage-equation${className?' '+className:''}">${text}</div>`;
 const factor=(id,title,value,brief,detail,detailClass='')=>`<details class="damage-factor${brief?'':' no-brief'}" id="damage-${id}"><summary><span class="factor-disclosure" aria-hidden="true" style="transform:none">▶</span><span class="factor-name">${title}</span>${brief?`<span class="factor-brief">${brief}</span>`:''}<strong>×${n(value)}</strong></summary><div class="factor-detail${detailClass?' '+detailClass:''}">${detail}</div></details>`;
 const simpleFactor=(id,title,value,brief)=>`<div class="damage-factor damage-factor-simple${brief?'':' no-brief'}" id="damage-${id}"><span class="factor-indent" aria-hidden="true"></span><span class="factor-name">${title}</span>${brief?`<span class="factor-brief">${brief}</span>`:''}<strong>×${n(value)}</strong></div>`;
 const basisTerm=(title,value)=>`<div class="damage-factor damage-factor-simple damage-basis-term no-brief"><span class="factor-indent" aria-hidden="true"></span><span class="factor-name">${title}</span><strong>${value}</strong></div>`;
 const talentFormula=r.rotation.map(entry=>`${n(entry.rate)} × ${n(entry.count)}`).join(' ＋ ');
 const basisFactors=basisTerm(D.finalAttack,`（${n(r.atk)}`)+factor('talent',D.talent,r.T,'',`${calc(`${D.talentFormula}<br>＝ ${talentFormula} ${eq(r.T)}`)}`,'card-result')+basisTerm(D.flat,`＋ ${n(r.totalFlat)}）`);
 const resistIndex=r.resValue<0?0:r.resValue<.75?1:2,resistCases=D.resistanceCases,resistSub=[`1 − (${exact(r.resValue)}) ÷ 2`,`1 − ${exact(r.resValue)}`,`1 ÷ (1 ＋ 4 × ${exact(r.resValue)})`][resistIndex];
 const factors=[
 simpleFactor('buff',D.buff,r.buff,''),
 factor('crit',D.crit,r.crit,'',`<div class="crit-table-wrap memory-style-table"><table class="crit-table"><thead><tr><th></th><th>${D.criticalAttack}</th><th>${D.normalAttack}</th></tr></thead><tbody><tr><th>${D.probability}</th><td>${n(r.critRate)}%</td><td>${n(100-r.critRate)}%</td></tr><tr><th>${D.critFactor}</th><td>${n(1+r.critDamage/100)}</td><td>1</td></tr></tbody></table></div>${calc(`${D.crit}<br>＝ ${exact(r.critRate/100)} × ${exact(1+r.critDamage/100)} ＋ ${exact(1-r.critRate/100)} × 1<br>＝ ${n(r.crit)}`,'card-result')}`,'detail-plain'),
 factor('reaction',D.reaction,r.reaction,'',`${calc(`${D.reactionCorrection}<br>＝ â × ［1 ＋ ${D.reactionBonus} ＋ 2.78 × ${D.mastery} ÷ (${D.mastery} ＋ 1,400)］<br>＝ ${exact(s.amp)} × ［1 ＋ ${n(15+s.reactionBonus)}% ＋ 2.78 × ${n(r.em)} ÷ (${n(r.em)} ＋ 1,400)］<br>＝ ${exact(s.amp)} × ${n(mastery)} ${eq(s.amp*mastery)}`,'card-result')}<div class="reaction-table-wrap memory-style-table"><table class="reaction-table"><thead><tr><th></th><th>${D.reacted}</th><th>${D.unreacted}</th></tr></thead><tbody><tr><th>${D.probability}</th><td>p̂ ＝ ${exact(p)}</td><td>1 − p̂ ＝ ${exact(unreacted)}</td></tr><tr><th>${D.reactionFactor.replace('の乗算','の<span class="reaction-factor-break"></span>乗算')}</th><td>${n(s.amp*mastery)}</td><td>1</td></tr></tbody></table></div>${calc(`${D.reaction}<br>＝ ${exact(p)} × ${n(s.amp*mastery)} ＋ ${exact(unreacted)} × 1<br>＝ ${n(r.reaction)}`,'card-result')}`,'detail-plain'),
 factor('defense',D.defense,r.def,'',`${calc(`${D.defenseCorrection}<br>＝ ${D.defenseFormula}<br>＝ (${s.level} ＋ 100) ÷ ［(${s.level} ＋ 100) ＋ (${s.enemy} ＋ 100) × (1 ＋ (${exact(s.def/100)})) × (1 − ${exact(r.ignore/100)})］<br>${eq(r.def)}`)}<p class="trace-note trace-defense-note">${D.defenseNote}</p>`,'card-result'),
 factor('resistance',D.resistance,r.res,'',`<div class="resistance-rules card-inner">${resistCases.map((item,index)=>`<div class="${index===resistIndex?'applied':''}"><span>${item.condition}${index===resistIndex?`（${D.current}）`:''}</span><strong>${item.formula}</strong></div>`).join('')}</div>${calc(`${D.currentCalculation}<br>＝ ${resistSub} ${eq(r.res)}`,'card-result')}`,'detail-plain')
 ];
 return `<section class="damage-trace" aria-labelledby="damage-trace-title"><div class="damage-title"><h3 id="damage-trace-title">${D.title}</h3></div>
 <section class="damage-stage" id="damage-factors">${D.caption?`<p class="damage-caption">${D.caption}</p>`:''}<div class="damage-factor-list">${basisFactors}${factors.join('')}</div></section>
 <section class="damage-answer" aria-label="${D.answerAria}"><span>${D.answerFormula}</span><p>≈（${n(r.atk)} × ${n(r.T)} ＋ ${n(r.totalFlat)}）× ${[r.buff,r.crit,r.reaction,r.def,r.res].map(n).join(' × ')}</p><strong>≈ ${Math.round(r.total).toLocaleString('ja-JP')}</strong><small>${D.answerNote}</small></section>
 ${D.roundingNote?`<p class="damage-caption">${D.roundingNote}</p>`:''}</section>`;
}
root.damageTrace=damageTrace;
if(typeof module!=='undefined')module.exports=damageTrace;
})(globalThis);

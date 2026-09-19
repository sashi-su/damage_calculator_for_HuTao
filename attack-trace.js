(function(root){
'use strict';
const A=(root.SITE_CONTENT||(typeof require!=='undefined'?require('./content.js'):{})).page.sections.verification.content.attack;
function attackCalculation(s,r){
 const number=v=>v.toLocaleString('ja-JP',{maximumSignificantDigits:6});
 const result=v=>`${Math.abs(v-Number(v.toPrecision(6)))>Math.max(1,Math.abs(v))*1e-14?'≈ ':'＝ '}${number(v)}`;
 const formula=text=>`<p class="calculation-formula card-result">${text}</p>`;
 return `<details class="attack-calculation"><summary>${A.title}</summary><div class="calculation-steps"><article>${
 formula(`<strong>${A.inputType}</strong><br>${r.atkInputMode==='skillPre'?A.inputTypes.skillPre:r.atkInputMode==='buildCard'?A.inputTypes.buildCard:A.inputTypes.legacy}<br><br><strong>${A.homa}</strong><br>${r.atkInputMode==='skillPre'?`${A.homaSkillPre}<br>＝ ${number(r.hp)} × ${number(r.homaRate*100)}% − ${number(r.homaInputIncluded)}`:r.atkInputMode==='buildCard'?`${A.homaBuildCard}<br>＝ ${number(r.hp)} × ${number(r.homaRate*100)}% − ${number(s.hp)} × ${number(r.homaCardRate*100)}%`:`${A.homaLegacy}<br>＝（${number(r.hp)} − ${number(s.hp)}）× ${number(r.homaRate*100)}%`} ${result(r.homaDelta)}<br><br><strong>${A.skill}</strong><br>${A.beforeCap}<br>＝ ${number(r.hp)} × ${number(r.skillRate*100)}% ${result(r.skillRaw)}<br>${A.cap}<br>＝ ${number(r.baseAtk)} × 400% ${result(r.skillCap)}<br><br><strong>${A.hutao}</strong><br>${A.hutaoFormula}<br>＝ ${number(s.atk)} ＋ ${number(r.homaDelta)} ＋ ${number(r.skill)} ${result(r.attackBeforeBuffs)}`)
 }</article></div></details>`;
}
root.attackCalculation=attackCalculation;
if(typeof module!=='undefined')module.exports=attackCalculation;
})(globalThis);

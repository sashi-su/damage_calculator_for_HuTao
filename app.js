'use strict';
const $=id=>document.getElementById(id),fmt=(v,d=1)=>v.toLocaleString('ja-JP',{maximumFractionDigits:d}),range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
const CONTENT=SITE_CONTENT;
const ANALYSIS_CONTENT=CONTENT.page.sections.analysis.content,REFERENCE_CONTENT=CONTENT.page.referenceValues;
const FORM_INTERFACE=CONTENT.forms.interface,VERIFICATION_CONTENT=CONTENT.page.sections.verification.content;
const definitions=[],defaults={};
const analysisDeltas={cr:3.89,cd:7.77,hp:5.83,atk:5.83,em:23.31};
const actualSettings={critical:true,reaction:'vaporize',includeFlat:true,nicoBlessing:'guidance'};
const dpsSettings={ratio:70,seconds:20};
let analysisIncludeAtk=false;
function field(parent,id,label,value,{unit='',hint='',min=0,max=10000000,step='any',options=null,check=false}={}){
 const slider=!!options&&options.every(o=>typeof (Array.isArray(o)?o[0]:o)==='number');
 defaults[id]=value;definitions.push({id,label,min,max,step,options,check,slider});
 const el=document.createElement('label');el.className='field'+(check?' checkbox':'');el.htmlFor=id;
 el.innerHTML=`<span class="label">${label}</span><span class="input-wrap">${check?`<input id="${id}" type="checkbox" ${value?'checked':''}>`:options?`<select id="${id}">${options.map(x=>{const [v,t]=Array.isArray(x)?x:[x,x];return `<option value="${v}" ${v===value?'selected':''}>${t}</option>`;}).join('')}</select>`:`<input id="${id}" type="number" inputmode="decimal" value="${value}" min="${min}" max="${max}" step="${step}" aria-describedby="${id}-hint"><span class="unit">${unit}</span>`}</span>${hint?`<small id="${id}-hint">${hint}</small>`:''}`;
 if(slider){
  el.classList.add('slider-field');
  const selected=options.findIndex(o=>(Array.isArray(o)?o[0]:o)===value);
  el.querySelector('.input-wrap').innerHTML=`<input id="${id}" type="range" min="0" max="${options.length-1}" step="1" value="${selected}" ${hint?`aria-describedby="${id}-hint"`:''}><output id="${id}-value" for="${id}"></output>`;
  const ticks=document.createElement('span');ticks.className='slider-ticks';ticks.setAttribute('aria-hidden','true');
  ticks.innerHTML=options.map(o=>`<span>${Array.isArray(o)?o[1]:o}</span>`).join('');
  el.querySelector('.input-wrap').append(ticks);
 }
 $(parent).append(el);
}
const f=(id,label,value,opts={})=>field('hutao-fields',id,label,value,opts);
for(const {id,label,value,...opts} of CONTENT.forms.hutao.fields)f(id,label,value,opts);
const teamOptions=CONTENT.forms.common.teamOptions;
['yelan','citlali','furina'].forEach((v,i)=>field('team-fields','slot'+i,'味方 '+(i+1),v,{options:teamOptions}));
function support(id,name){const s=document.createElement('div');s.className='support';s.id='support-'+id;s.innerHTML=`<h3>${name}</h3><div class="fields" id="fields-${id}"></div>`;$('support-fields').append(s);return (key,label,value,options)=>field('fields-'+id,key,label,value,options);}
const cons={options:range(0,6).map(n=>[n,n+'凸'])},refine={options:range(1,5)},checkbox={check:true};
for(const [id,section] of Object.entries(CONTENT.forms.supporters)){
 const add=support(id,section.name);
 for(const {id:fieldId,label,value,optionType,...opts} of section.fields)add(fieldId,label,value,{...opts,...(optionType==='constellation'?cons:optionType==='refine'?refine:{})});
}
for(const id of ['citlali','furina','nico']){
 const ref=document.createElement('section');ref.className='reference-values support-reference card-result';ref.innerHTML=`<h3>参考値</h3><div class="fields" id="reference-${id}"></div>`;$('support-'+id).append(ref);
}
const e=(id,label,value,opts={})=>field(['prob','amp'].includes(id)?'reaction-fields':'enemy-fields',id,label,value,opts);
for(const {id,label,value,...opts} of CONTENT.forms.enemy.fields)e(id,label,value,opts);
const x=(id,label,value,opts={})=>field('extra-fields',id,label,value,opts);
for(const {id,label,value,...opts} of CONTENT.forms.extra.fields)x(id,label,value,opts);
for(const id of ['customHp','customAtkFlat','customAtkPct','customEm']){
 const amount=$(id).closest('.field'),team=$(id+'Team').closest('.field');
 const pair=document.createElement('div');pair.className='custom-buff-pair';
 amount.before(pair);pair.append(amount,team);
}
// Keep the original controls and saved keys while grouping related settings.
function groupFields(parent,id,title,ids){
 const section=document.createElement('section');section.className='settings-group';section.id=id;
 section.innerHTML=`<h3>${title}</h3><div class="fields"></div>`;
 $(parent).append(section);for(const key of ids)section.lastElementChild.append($(key).closest('.field'));
 return section;
}
function addInputModeHelp(modeField,id,title,paragraphs){
 const legend=modeField.querySelector('legend');legend.classList.add('field-label-with-help');
 legend.insertAdjacentHTML('beforeend',`<button type="button" class="help-button" popovertarget="${id}" aria-label="${title}について">?</button>`);
 const splitParagraphs=paragraphs.flatMap(text=>text.split(/(?=どちらも|Enka\.Network)/).filter(Boolean));
 modeField.insertAdjacentHTML('beforeend',`<span id="${id}" class="help-popover" popover><strong>${title}</strong>${splitParagraphs.map(text=>`<p>${text}</p>`).join('')}</span>`);
}
$('hutao-fields').className='settings-groups';
groupFields('hutao-fields','hutao-equipment','キャラクター・装備',['level','constellation','homa']);
{
 const artifact=document.createElement('label');artifact.className='field fixed-field';
 artifact.innerHTML='<span class="label">聖遺物</span><span class="input-wrap"><input type="text" value="火魔女4" disabled aria-describedby="hutao-artifact-hint"></span><small id="hutao-artifact-hint">この計算機では変更できません</small>';
 $('hutao-equipment').querySelector('.fields').append(artifact);
}
groupFields('hutao-fields','hutao-stats','装備後ステータス',['hp','hpInputMode','atk','atkInputMode','cr','cd','em']);
{
 const atkRow=document.createElement('div'),atkField=$('atk').closest('.field'),select=$('atkInputMode'),oldField=select.closest('.field'),modeField=document.createElement('fieldset');
 const copy=FORM_INTERFACE.inputModes.hutaoAtk;atkRow.className='paired-input-row atk-input-row';modeField.className='paired-input-mode atk-input-mode';modeField.innerHTML=`<legend>${copy.title}</legend><div class="paired-mode-options atk-mode-options">${copy.choices.map(choice=>`<label><input type="radio" name="atk-input-mode-choice" value="${choice[0]}" data-atk-input-mode>${choice[1]}</label>`).join('')}</div>`;
 addInputModeHelp(modeField,'atk-input-mode-help',copy.title,copy.paragraphs);
 select.hidden=true;modeField.append(select);oldField.replaceWith(modeField);atkRow.append(atkField,modeField);$('hp').closest('.field').after(atkRow);
 modeField.addEventListener('change',event=>{if(!event.target.matches('[data-atk-input-mode]'))return;select.value=event.target.value;render();});
}
groupFields('hutao-fields','hutao-conditions','条件付き効果',['c6Rate']);
const supportGroups={
 yelan:[['yC'],['yWeapon','yR'],['yBuff','yStacks']],
 citlali:[['cC','cEm','cEmInputMode'],['cWeapon','cR','cSet'],['cCount','cAfterElegy','cAfterKey']],
 furina:[['fLevel','fC','fHp','fHpInputMode'],['fWeapon','fR'],['fAfterYelan']],
 nico:[['nC','nBaseAtk','nAtk','nAtkInputMode'],['nWeapon','nR','nSet'],['nAfterElegy']]
};
for(const [id,groups] of Object.entries(supportGroups)){
 $('fields-'+id).className='settings-groups';$('support-'+id).querySelector('h3').remove();
 groups.forEach((ids,i)=>groupFields('fields-'+id,id+'-group-'+i,FORM_INTERFACE.groups[i],ids));
}
{
 const emRow=document.createElement('div'),emField=$('cEm').closest('.field'),select=$('cEmInputMode'),oldField=select.closest('.field'),modeField=document.createElement('fieldset');
 const cEmHint=$('cEm-hint')?.textContent||'';$('cEm-hint')?.remove();$('cEm').setAttribute('aria-describedby','c-em-input-mode-help');
 const copy=FORM_INTERFACE.inputModes.citlaliEm;emRow.className='paired-input-row c-em-input-row';modeField.className='paired-input-mode c-em-input-mode';modeField.innerHTML=`<legend>${copy.title}</legend><div class="paired-mode-options c-em-mode-options">${copy.choices.map(choice=>`<label><input type="radio" name="c-em-input-mode-choice" value="${choice[0]}" data-c-em-input-mode>${choice[1]}</label>`).join('')}</div>`;
 addInputModeHelp(modeField,'c-em-input-mode-help',copy.title,[cEmHint,...copy.paragraphs].filter(Boolean));
 select.hidden=true;modeField.append(select);oldField.replaceWith(modeField);emRow.append(emField,modeField);$('cC').closest('.field').after(emRow);
 modeField.addEventListener('change',event=>{if(!event.target.matches('[data-c-em-input-mode]'))return;select.value=event.target.value;render();});
}
function pairedInputMode(inputId,selectId,rowClass,modeClass,optionsClass,dataAttribute,legend,choices,hint){
 const row=document.createElement('div'),inputField=$(inputId).closest('.field'),select=$(selectId),oldField=select.closest('.field'),modeField=document.createElement('fieldset');
 row.className=`paired-input-row ${rowClass}`;modeField.className=`paired-input-mode ${modeClass}`;modeField.innerHTML=`<legend>${legend}</legend><div class="paired-mode-options ${optionsClass}">${choices.map(choice=>`<label><input type="radio" name="${selectId}-choice" value="${choice[0]}" ${dataAttribute}>${choice[1]}</label>`).join('')}</div>`;
 addInputModeHelp(modeField,`${selectId}-help`,legend,[hint]);
 select.hidden=true;modeField.append(select);oldField.remove();inputField.replaceWith(row);row.append(inputField,modeField);
 modeField.addEventListener('change',event=>{if(!event.target.matches(`[${dataAttribute}]`))return;select.value=event.target.value;render();});
}
for(const [args,key] of [[['fHp','fHpInputMode','f-hp-input-row','f-hp-input-mode','f-hp-mode-options','data-f-hp-input-mode'],'furinaHp'],[['nAtk','nAtkInputMode','n-atk-input-row','n-atk-input-mode','n-atk-mode-options','data-n-atk-input-mode'],'nicoAtk'],[['hp','hpInputMode','hp-input-row','hp-input-mode','hp-mode-options','data-hp-input-mode'],'hutaoHp']]){const copy=FORM_INTERFACE.inputModes[key];pairedInputMode(...args,copy.title,copy.choices,copy.paragraphs.join(''))};
const supportVisuals={
 yelan:{character:['images/Yelan.png','夜蘭'],weapon:['images/Elegy_for_the_End.png','終焉を嘆く詩','終焉弓'],weaponKey:'yWeapon'},
 citlali:{character:['images/Citlali.png','シトラリ'],weapon:["images/Starcaller's_Watch.png",'祭星者の眺め','祭星者'],weaponKey:'cWeapon'},
 furina:{character:['images/Furina.png','フリーナ'],weapon:['images/Key_of_Khai_Nisut.png','聖顕の鍵','鍵'],weaponKey:'fWeapon'},
 nico:{character:['images/Nicole.png','ニコ'],weapon:["images/Angelos'_Heptades.png",'塵と光の七つの誓約','誓約'],weaponKey:'nWeapon'}
};
for(const id of ['yWeapon','cWeapon','fWeapon','nWeapon','nSet','cSet','yStacks'])$(id).closest('.field').classList.add('field-wide');
const cCountFieldLabel=$('cCount').closest('.field'),cCountField=document.createElement('div');cCountField.className=cCountFieldLabel.className;while(cCountFieldLabel.firstChild)cCountField.append(cCountFieldLabel.firstChild);cCountFieldLabel.replaceWith(cCountField);
const cCountLabel=cCountField.querySelector('.label'),cCountHeading=document.createElement('span');cCountLabel.id='cCount-label';$('cCount').setAttribute('aria-labelledby','cCount-label');
cCountHeading.className='field-label-with-help';cCountLabel.replaceWith(cCountHeading);cCountHeading.append(cCountLabel);
const cCountHelp=FORM_INTERFACE.cCountHelp;cCountHeading.insertAdjacentHTML('beforeend',`<button type="button" class="help-button" popovertarget="cCount-help" aria-label="${cCountHelp.button}">?</button><span id="cCount-help" class="help-popover" popover><strong>${cCountHelp.title}</strong><ul>${cCountHelp.items.map(x=>`<li>${x}</li>`).join('')}</ul></span>`);
function timing(id,title,before,after){
 const input=$(id),label=input.closest('.field');label.classList.add('field-wide','timing-field');label.classList.remove('checkbox');
 label.querySelector('.label').textContent=title;
 const select=document.createElement('select');select.id=id;select.innerHTML=`<option value="0">${before}</option><option value="1">${after}</option>`;
 select.value=input.checked?'1':'0';
 // Preserve the boolean input contract used by persistence and calculation.
 Object.defineProperty(select,'checked',{get(){return this.value==='1';},set(v){this.value=v?'1':'0';}});
 input.replaceWith(select);
}
timing('fAfterYelan','聖顕の鍵の発動タイミング','夜蘭4凸の効果発動前','夜蘭4凸の効果発動後');
timing('nAfterElegy','ニコの元素スキルの発動タイミング','終焉を嘆く詩の効果発動前','終焉を嘆く詩の効果発動後');
timing('cAfterElegy','シトラリ1凸の発動タイミング（終焉）','終焉を嘆く詩の効果発動前','終焉を嘆く詩の効果発動後');
timing('cAfterKey','シトラリ1凸の発動タイミング（聖顕）','聖顕の鍵の効果発動前','聖顕の鍵の効果発動後');
const supportNames={yelan:'夜蘭',citlali:'シトラリ',furina:'フリーナ',nico:'ニコ'};
const supportPrefixes={yelan:'y',citlali:'c',furina:'f',nico:'n'};
const supportCards=[];
for(let i=0;i<3;i++){
 const card=document.createElement('section');card.className='support-card';
 card.append($('slot'+i).closest('.field'));
 const loadout=document.createElement('div');loadout.className='loadout-strip support-card-loadout card-inner';loadout.hidden=true;card.append(loadout);
 const details=document.createElement('details');details.open=true;
 details.innerHTML=`<summary><span>詳細設定</span><span class="support-summary"></span></summary><div class="support-body"></div>`;
 card.append(details);$('team-fields').append(card);supportCards.push(card);
}
$('team-fields').className='support-cards';
const STORAGE='hutao-rotation-v1';
const DAMAGE_MEMORY='hutao-damage-memory-v1';
let storageAvailable=true;
let damageRecords=[],damageBaseline='current',damageMemoryLabel='';
try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(saved)for(const d of definitions){if(!(d.id in saved))continue;const el=$(d.id);if(d.check)el.checked=saved[d.id]===true;else if(!d.options||d.options.some(o=>String(Array.isArray(o)?o[0]:o)===String(saved[d.id])))el.value=d.slider?d.options.findIndex(o=>String(Array.isArray(o)?o[0]:o)===String(saved[d.id])):saved[d.id];}}catch{storageAvailable=false;}
try{const memory=JSON.parse(localStorage.getItem(DAMAGE_MEMORY)||'null');if(memory&&Array.isArray(memory.records)){damageRecords=memory.records.filter(record=>record&&typeof record.id==='string'&&typeof record.label==='string'&&Number.isFinite(record.total)).slice(-30);damageBaseline=memory.baseline==='current'||damageRecords.some(record=>record.id===memory.baseline)?memory.baseline:'current';damageMemoryLabel=typeof memory.draft==='string'?memory.draft.slice(0,60):'';}}catch{storageAvailable=false;}
function saveDamageMemory(){try{localStorage.setItem(DAMAGE_MEMORY,JSON.stringify({records:damageRecords,baseline:damageBaseline,draft:damageMemoryLabel}));}catch{storageAvailable=false;}}
function rememberCurrentDamage(label=''){
 if(!current)return;
 damageRecords.push({id:`damage-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,label:label.trim()||`${ANALYSIS_CONTENT.memory.defaultRecord} ${damageRecords.length+1}`,total:current.result.total});
 damageRecords=damageRecords.slice(-30);saveDamageMemory();
}
function enhanceDamageDisclosures(){
 for(const details of $('verification-content').querySelectorAll('.damage-factor')){
  const icon=details.querySelector('.factor-disclosure'),sync=()=>{if(icon)icon.textContent=details.open?'▼':'▶';};
  details.addEventListener('toggle',sync);sync();
 }
}
const resultMemoryField=document.createElement('label'),memoryContent=ANALYSIS_CONTENT.memory;resultMemoryField.className='result-memory-field';resultMemoryField.innerHTML=`<span>${memoryContent.resultFieldLabel}</span><input type="text" maxlength="60" value="${damageMemoryLabel.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')}" placeholder="${memoryContent.placeholder}" aria-label="${memoryContent.resultFieldAria}">`;
const resultMemoryButton=document.createElement('button');resultMemoryButton.type='button';resultMemoryButton.className='result-memory-button';resultMemoryButton.textContent=memoryContent.save;
const resultMemoryNote=document.createElement('p');resultMemoryNote.className='result-memory-note';resultMemoryNote.textContent=memoryContent.resultNote;$('error').before(resultMemoryField,resultMemoryButton,resultMemoryNote);
resultMemoryField.querySelector('input').addEventListener('input',event=>{damageMemoryLabel=event.target.value;saveDamageMemory();});
resultMemoryButton.addEventListener('click',()=>{rememberCurrentDamage(damageMemoryLabel);damageMemoryLabel='';resultMemoryField.querySelector('input').value='';saveDamageMemory();renderAnalysis();resultMemoryButton.textContent=memoryContent.saved;setTimeout(()=>resultMemoryButton.textContent=memoryContent.save,1200);});
function read(){const s={};for(const d of definitions){const el=$(d.id);const option=d.slider?d.options[Number(el.value)]:null;s[d.id]=d.slider?(Array.isArray(option)?option[0]:option):d.check?el.checked:(d.options&&isNaN(Number(el.value)))?el.value:Number(el.value);}s.skill=s.constellation>=3?13:10;s.burst=s.constellation>=5?13:10;s.team=[s.slot0,s.slot1,s.slot2].filter(v=>v!=='none');return s;}
function updateCardLoadout(card,id,s){
 const loadout=card.querySelector('.support-card-loadout'),previous=loadout.dataset.support;
 if(previous&&supportVisuals[previous])$(previous+'-group-1').querySelector('.fields').prepend($(supportVisuals[previous].weaponKey).closest('.field'));
 loadout.replaceChildren();loadout.dataset.support=id==='none'?'':id;loadout.hidden=id==='none';
 if(id==='none')return;
 const visual=supportVisuals[id],character=document.createElement('figure');
 character.innerHTML=`<img src="${visual.character[0]}" alt="${visual.character[1]}" width="256" height="256"><figcaption><span class="character-line"><strong>${visual.character[1]}</strong><span class="character-summary"></span></span></figcaption>`;
 const weaponField=$(visual.weaponKey).closest('.field');weaponField.classList.add('loadout-weapon-option');
 if(!weaponField.querySelector('.loadout-weapon-image'))weaponField.querySelector('.input-wrap').insertAdjacentHTML('afterend',`<img class="loadout-weapon-image" src="${visual.weapon[0]}" alt="" width="256" height="256">`);
 weaponField.querySelector('.label').innerHTML=`<span class="weapon-name-full">${visual.weapon[1]}</span><span class="weapon-name-short">${visual.weapon[2]}</span><span class="weapon-state"></span>`;
 loadout.classList.toggle('weapon-equipped',s[visual.weaponKey]);loadout.append(character,weaponField);
}
function updateVisibility(s){
 for(const id of ['yelan','citlali','furina','nico'])$('support-'+id).hidden=!s.team.includes(id);
 for(let i=0;i<3;i++){
 const id=s['slot'+i],card=supportCards[i],details=card.querySelector('details'),body=card.querySelector('.support-body');
  for(const child of [...body.children])if(child.id!=='support-'+id)$('support-fields').append(child);
  details.hidden=id==='none';
  updateCardLoadout(card,id,s);
  if(id!=='none'){
   const support=$('support-'+id);if(support.parentElement!==body)body.append(support);
   const p=supportPrefixes[id],summary=s[p+'Weapon']?`C${s[p+'C']}R${s[p+'R']}`:`C${s[p+'C']}`;
   card.querySelector('.character-summary').textContent=summary;card.querySelector('.support-summary').textContent='';
  }
 }
 $('hutao-conditions').hidden=s.constellation!==6;
 for(const [key,on] of [['yR',s.yWeapon],['cR',s.cWeapon],['fR',s.fWeapon],['fHp',s.fWeapon],['nR',s.nWeapon]]){$(key).closest('.field').hidden=!on;$(key).disabled=!on;}
 $('fLevel').closest('.field').hidden=!s.fWeapon;$('fLevel').disabled=!s.fWeapon;
 $('fHp').closest('.f-hp-input-row').hidden=!s.fWeapon;
 $('fAfterYelan').closest('.field').hidden=!s.fWeapon;
 $('reference-furina').closest('.support-reference').hidden=!s.fWeapon;
 for(let i=0;i<3;i++)for(const option of $('slot'+i).options)option.disabled=option.value!=='none'&&option.value!==s['slot'+i]&&s.team.includes(option.value);
 $('c6Rate').disabled=s.constellation!==6;
 $('cCount').disabled=s.cC<1;
 $('yStacks').disabled=s.yC<4;
 $('cAfterElegy').disabled=s.cC<1||!s.team.includes('yelan')||!s.yWeapon;
 $('cAfterKey').disabled=s.cC<1||!s.team.includes('furina')||!s.fWeapon;
 $('nAfterElegy').disabled=!s.team.includes('yelan')||!s.yWeapon;
 $('fAfterYelan').disabled=!s.team.includes('yelan')||s.yC<4||!s.fWeapon;
 const pyro=s.team.includes('nico'),hydro=s.team.includes('yelan')&&s.team.includes('furina');
 $('resonance').textContent=([pyro?'炎共鳴（攻撃力+25%）':'',hydro?'水共鳴（HP+25%）':''].filter(Boolean).join(' ／ ')||'元素共鳴なし');
}
function validate(s){const errors=[];
 for(const d of definitions){const el=$(d.id),hidden=el.closest('.support')?.hidden;if(d.options||d.check||hidden||el.disabled){el.removeAttribute('aria-invalid');continue;}
 const v=s[d.id],bad=el.value.trim()===''||!Number.isFinite(v)||v<d.min||v>d.max||(d.step===1&&!Number.isInteger(v));el.setAttribute('aria-invalid',String(bad));if(bad)errors.push(`${d.label}：${d.min}〜${fmt(d.max,0)}${d.step===1?'の整数':''}を入力してください。`);
 }
 if(new Set(s.team).size!==s.team.length)errors.push('同じキャラクターを複数枠に編成できません。');return errors;
}
const kv=(name,val)=>name?`<div class="kv"><span>${name}</span><strong>${val}</strong></div>`:'';
const fmtInt=v=>fmt(v,0),fmtBuff=v=>v.toLocaleString('ja-JP',{minimumFractionDigits:1,maximumFractionDigits:1});
const dash=v=>Math.abs(v)<1e-10?'—':`+${fmtInt(v)}`;
const delta=(v,unit='')=>Math.abs(v)<1e-10?'—':`+${fmtBuff(v)}${unit}`;
const pctDelta=v=>Math.abs(v)<1e-10?'—':`${v>0?'+':''}${fmtInt(v)}%`;
const statDelta=(fixed=0,percent=0)=>{
 const parts=[];if(Math.abs(fixed)>=1e-10)parts.push(`<span>${fixed>0?'+':''}${fmtInt(fixed)}</span>`);if(Math.abs(percent)>=1e-10)parts.push(`<span>${percent>0?'+':''}${fmtInt(percent)}%</span>`);return parts.length?parts.join(''):'—';
};
let matrixSelectedStat='hp';
function breakdownMatrix(s,r){
 const copy=VERIFICATION_CONTENT.matrix,names=Object.fromEntries(Object.entries(CONTENT.forms.supporters).map(([id,item])=>[id,item.name]));
 const flatTerm=(amount,count)=>amount&&count?`${fmtInt(amount)}×${fmtInt(count)}${copy.times}`:'—';
 const columns=Object.entries(copy.columns);
 const rows=[{name:copy.rows.hutao,values:{hp:fmtInt(s.hp),atk:fmtInt(r.attackBeforeBuffs),em:fmtInt(s.em),cr:fmtInt(r.critRate)+'%',cd:fmtInt(r.critDamage)+'%',bonus:delta(r.fixedBonus,'%'),reaction:'+15%',flat:flatTerm(r.bloodFlatPerHit,r.bloodCount)}}];
 for(const id of s.team){
  const c=r.contributions[id];
  rows.push({name:names[id],values:{hp:statDelta(0,c.hpPercent),atk:statDelta(c.flatAtk,c.atkPercent),em:dash(c.em),cr:'—',cd:'—',bonus:delta(c.bonus,'%'),reaction:'—',flat:flatTerm(c.flatPerHit,c.flatCount),def:'—',ignore:c.ignore?fmtInt(c.ignore)+'%':'—',res:c.shred?'−'+fmtInt(-c.shred)+'%':'—'}});
 }
 const {hpPercent:resonanceHp,atkPercent:resonanceAtk}=r.contributions.resonance;
 const hasCustomBuff=[s.customHp,s.customAtkFlat,s.customAtkPct,s.customEm,s.customCr,s.customCd,s.bonus,s.reactionBonus,s.def,s.ignore,s.shred,r.customFlat].some(value=>Math.abs(value)>1e-10);
 if(hasCustomBuff)rows.push({name:copy.rows.custom,values:{hp:statDelta(0,s.customHp),atk:statDelta(s.customAtkFlat,s.customAtkPct),em:dash(s.customEm),cr:pctDelta(s.customCr),cd:pctDelta(s.customCd),bonus:delta(s.bonus,'%'),reaction:delta(s.reactionBonus,'%'),flat:flatTerm(s.otherFlat,s.otherCount),def:s.def?fmtInt(s.def)+'%':'—',ignore:s.ignore?fmtInt(s.ignore)+'%':'—',res:s.shred?fmtInt(s.shred)+'%':'—'}});
 rows.push({name:copy.rows.other,values:{hp:statDelta(0,resonanceHp),atk:statDelta(0,resonanceAtk),res:fmtInt(s.res)+'%'}});
 rows.push({name:copy.rows.final,final:true,values:{hp:fmtInt(r.hp),atk:fmtInt(r.atk),em:fmtInt(r.em),cr:fmtInt(r.critRate)+'%',cd:fmtInt(r.critDamage)+'%',bonus:fmtBuff(r.bonus)+'%',reaction:fmtBuff(15+s.reactionBonus)+'%',flat:r.totalFlat?fmtInt(r.totalFlat):'—',def:s.def?fmtInt(s.def)+'%':'—',ignore:r.ignore?fmtInt(r.ignore)+'%':'—',res:fmtInt(r.resValue*100)+'%'}});
 const visible=columns.filter(([key])=>rows.some(item=>(item.values[key]??'—')!=='—'));
 const rowHtml=rows.map(item=>`<tr class="${item.final?'matrix-final':''}"><th scope="row">${item.name}</th>${visible.map(([key])=>`<td>${item.values[key]??'—'}</td>`).join('')}</tr>`).join('');
 if(!visible.some(([key])=>key===matrixSelectedStat))matrixSelectedStat=visible[0][0];
 const final=rows.find(item=>item.final);
 const mobileTabs=visible.map(([key,title])=>`<button type="button" role="tab" id="matrix-tab-${key}" aria-controls="matrix-panel-${key}" aria-selected="${key===matrixSelectedStat}" tabindex="${key===matrixSelectedStat?0:-1}" data-matrix-stat="${key}">${title}</button>`).join('');
 const mobilePanels=visible.map(([key,title])=>`<section class="matrix-mobile-panel" id="matrix-panel-${key}" role="tabpanel" aria-labelledby="matrix-tab-${key}" data-matrix-panel="${key}" ${key===matrixSelectedStat?'':'hidden'}><div class="matrix-mobile-final card-result"><span>${copy.mobileFinalLabel}</span><strong>${final.values[key]??'—'}</strong></div><div class="matrix-mobile-rows" aria-label="${title}${copy.firstColumn}">${rows.filter(item=>!item.final&&(item.values[key]??'—')!=='—').map(item=>`<div class="matrix-mobile-row"><span>${item.name}</span><strong>${item.values[key]}</strong></div>`).join('')}</div></section>`).join('');
 return `<div class="matrix-block"><h3>${copy.title}</h3><div class="table-wrap matrix-wrap"><table class="breakdown-matrix" style="--matrix-columns:${visible.length}"><thead><tr><th scope="col">${copy.firstColumn}</th>${visible.map(([,title])=>`<th scope="col">${title}</th>`).join('')}</tr></thead><tbody>${rowHtml}</tbody></table></div><div class="matrix-mobile"><div class="matrix-mobile-tabs" role="tablist" aria-label="${copy.title}">${mobileTabs}</div>${mobilePanels}</div>${copy.note?`<p class="note matrix-note">${copy.note}</p>`:''}</div>`;
}
let current=null,lastRenderedInputs=null;
function renderAnalysis(){
 if(!current)return;
 $('analysis-content').innerHTML=DamageAnalysis.renderDamageAnalysis(current.inputs,current.result,analysisDeltas,HutaoCalculator.calculate,damageRecords,damageBaseline,actualSettings,dpsSettings,typeof analysisIncludeAtk==='undefined'?false:analysisIncludeAtk);
}
function render(){
 // input and change can describe the same edit. Include raw values so an
 // empty or invalid number never reuses a valid calculation with value zero.
 document.querySelectorAll('[data-atk-input-mode]').forEach(input=>input.checked=input.value===$('atkInputMode').value);
 document.querySelectorAll('[data-c-em-input-mode]').forEach(input=>input.checked=input.value===$('cEmInputMode').value);
 document.querySelectorAll('[data-f-hp-input-mode]').forEach(input=>input.checked=input.value===$('fHpInputMode').value);
 document.querySelectorAll('[data-n-atk-input-mode]').forEach(input=>input.checked=input.value===$('nAtkInputMode').value);
 document.querySelectorAll('[data-hp-input-mode]').forEach(input=>input.checked=input.value===$('hpInputMode').value);
 const inputKey=JSON.stringify(definitions.map(d=>d.check?$(d.id).checked:$(d.id).value));
 if(inputKey===lastRenderedInputs)return;
 lastRenderedInputs=inputKey;
 for(const d of definitions){if(!d.slider)continue;const el=$(d.id),option=d.options[Number(el.value)],label=String(Array.isArray(option)?option[1]:option);$(d.id+'-value').value=label;el.setAttribute('aria-valuetext',label);}
 const s=read();updateVisibility(s);const errors=validate(s);if($('export'))$('export').disabled=errors.length>0;$('error').hidden=!errors.length;
 if(errors.length){current=null;$('total').textContent='—';$('compact-total-value').textContent='—';$('error').textContent=errors.join(' ');$('hutao-reference').textContent='';$('hutao-hp-cap-status').textContent='入力エラーを修正するとHP上限までの差を表示します。';for(const id of ['citlali','furina','nico'])$('reference-'+id).textContent='';$('verification-content').textContent=VERIFICATION_CONTENT.error;$('analysis-content').textContent=ANALYSIS_CONTENT.error;return;}
 const r=HutaoCalculator.calculate(s);current={inputs:s,result:r};
 try{localStorage.setItem(STORAGE,JSON.stringify(s));}catch{storageAvailable=false;}
 $('total').textContent=fmt(r.total,0);
 $('compact-total-value').textContent=$('total').textContent;
 const skillCapHp=r.skillCap/r.skillRate,skillHpDifference=(skillCapHp-r.hp)/r.baseHp*100;
 $('hutao-hp-cap-status').innerHTML=r.skillRaw<r.skillCap
  ?`元素スキルによる攻撃力上昇上限に達するまで、残りHP<strong>＋${fmt(Math.max(0,skillHpDifference),2)}%</strong>です。`
  :`元素スキルによる攻撃力上昇上限に達しています。HPを<strong>－${fmt(Math.max(0,-skillHpDifference),2)}%</strong>するとこの上限を下回ります。`;
 const refs=REFERENCE_CONTENT,h=refs.hutao;$('hutao-reference').innerHTML=kv(h.hp,fmtInt(r.referenceHp))+kv(h.atk,fmtInt(r.referenceAtk))+kv(h.baseHp,fmtInt(r.baseHp))+kv(h.baseAtk,`${fmtInt(HUTAO_DATA.levels[s.level].atk)} ＋ ${fmtInt(HUTAO_DATA.weaponAtk)} ＝ ${fmtInt(r.baseAtk)}`)+kv(h.homaAbove,fmtBuff(r.homaCardRate*100)+'%')+kv(h.homaBelow,fmtBuff(r.homaRate*100)+'%')+kv(h.skill,fmtBuff(r.skillRate*100)+'%')+kv(h.fixedBonus,'46.6＋33＋22.5＝'+fmtBuff(r.fixedBonus)+'%')+kv(h.effectiveCrit,`${fmt(r.c6Rate/100,6)} ＋ (1 − ${fmt(r.c6Rate/100,6)}) × ${fmt(r.baseCritRate/100,6)} ＝ ${fmt(r.critRate/100,6)}`);
 const citEmFormula=r.citEmParts.map(part=>fmtInt(part.value)).join(' ＋ ')+` ＝ ${fmtInt(r.citEm)}`;
 $('reference-citlali').innerHTML=kv(refs.citlali.em,citEmFormula)+kv(refs.citlali.flat,`${fmtInt(r.citEm)} × 2 ＝ ${fmtInt(r.citFlatPerHit)}`);
 const keyHpFormula=r.keyHpParts.map(part=>part.label==='夜蘭4凸'?`${fmtInt(r.furinaBaseHp)} × ${fmtBuff((s.yStacks??4)*10)}%`:part.label==='水共鳴'?`${fmtInt(r.furinaBaseHp)} × 25%`:part.label==='カスタムバフ'?`${fmtInt(r.furinaBaseHp)} × ${fmtBuff(s.customHp)}%`:fmtInt(part.value)).join(' ＋ ')+` ＝ ${fmtInt(r.keyHp)}`;
 $('reference-furina').innerHTML=kv(refs.furina.baseHp,fmtInt(r.furinaBaseHp))+kv(refs.furina.hp,keyHpFormula)+kv(refs.furina.emBuff,s.fWeapon?`${fmtInt(r.keyHp)} × ${fmtBuff(HUTAO_DATA.key[s.fR-1]*100)}% ＝ ${fmtInt(r.keyEm)}`:refs.furina.weaponMissing);
 const nicoAtkFormula=r.nicoAtkParts.map(part=>fmtInt(part.value)).join(' ＋ ')+` ＝ ${fmtInt(r.nicoAtk)}`;
 const nicoSkillRaw=r.nicoAtk*r.nicoSkillRate,nicoBaseFormula=`${fmtInt(r.nicoAtk)} × ${fmtBuff(r.nicoSkillRate*100)}% ＝ ${fmtInt(nicoSkillRaw)}`+(nicoSkillRaw>r.nicoSkillCap?` → ${fmtInt(r.nicoSkillCap)}`:'');
 $('reference-nico').innerHTML=kv(refs.nico.atk,nicoAtkFormula)+kv(`${refs.nico.gift}（${refs.nico.capPrefix}${fmtInt(r.nicoSkillCap)}）`,nicoBaseFormula)+kv(refs.nico.buff,fmtInt(r.nicoSkillBuff));
 $('verification-content').innerHTML=breakdownMatrix(s,r)+attackCalculation(s,r)+damageTrace(s,r);
 enhanceDamageDisclosures();
 renderAnalysis();
 $('save-status').textContent=storageAvailable?'入力はこのブラウザーに自動保存されます。':'ブラウザーへの自動保存は利用できません。「計算条件・結果を保存」で保存できます。';
}
function revealHeroMinimally(){
 if(window.matchMedia('(max-width:760px)').matches){
  const resultArea=document.querySelector('.layout>aside');
  const tabTop=resultArea.getBoundingClientRect().bottom+window.scrollY+parseFloat(getComputedStyle(resultArea).marginBottom);
  const target=Math.max(0,tabTop-64);
  if(window.scrollY>target)window.scrollTo({top:target,behavior:'instant'});
  return;
 }
 const hero=document.querySelector('.hero');
 if(!hero)return;
 const {bottom}=hero.getBoundingClientRect();
 if(bottom<=0)window.scrollBy({top:bottom-1,behavior:'instant'});
}
function openView(name,{focus=false}={}){
 revealHeroMinimally();
 document.querySelectorAll('[data-view-panel]').forEach(panel=>{panel.hidden=panel.dataset.viewPanel!==name;});
 document.querySelectorAll('[data-view-button]').forEach(button=>{const active=button.dataset.viewButton===name;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;if(active&&focus)button.focus();});
}
const viewButtons=[...document.querySelectorAll('[data-view-button]')];
viewButtons.forEach((button,index)=>{
 button.addEventListener('click',()=>openView(button.dataset.viewButton));
 button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();let next=event.key==='Home'?0:event.key==='End'?viewButtons.length-1:(index+(event.key==='ArrowRight'?1:-1)+viewButtons.length)%viewButtons.length;openView(viewButtons[next].dataset.viewButton,{focus:true});});
});
function selectMatrixStat(button,{focus=false}={}){
 matrixSelectedStat=button.dataset.matrixStat;
 const matrix=button.closest('.matrix-mobile');
 matrix.querySelectorAll('[data-matrix-stat]').forEach(item=>{const active=item===button;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;});
 matrix.querySelectorAll('[data-matrix-panel]').forEach(panel=>{panel.hidden=panel.dataset.matrixPanel!==matrixSelectedStat;});
 if(focus)button.focus();
}
$('verification-content').addEventListener('click',event=>{const button=event.target.closest('[data-matrix-stat]');if(button)selectMatrixStat(button);});
$('verification-content').addEventListener('keydown',event=>{const button=event.target.closest('[data-matrix-stat]');if(!button||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const buttons=[...button.closest('.matrix-mobile-tabs').querySelectorAll('[data-matrix-stat]')],index=buttons.indexOf(button),next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;selectMatrixStat(buttons[next],{focus:true});});
const compactTotal=document.createElement('button');compactTotal.type='button';compactTotal.id='compact-total';compactTotal.className='result-card result-card-compact';compactTotal.setAttribute('aria-hidden','true');compactTotal.tabIndex=-1;
const compactLabel=document.createElement('span'),compactValue=document.createElement('strong');compactLabel.textContent=CONTENT.page.result.title;compactValue.id='compact-total-value';compactTotal.append(compactLabel,compactValue);$('app').append(compactTotal);
const fullResult=document.querySelector('.layout>aside .result-card'),compactMedia=window.matchMedia('(max-width:760px)');let compactVisible=false,compactUpdateQueued=false;
function updateCompactTotal(){
 compactUpdateQueued=false;
 const fullBottom=fullResult.getBoundingClientRect().bottom;
 const visible=compactMedia.matches&&(compactVisible?fullBottom<72:fullBottom<56);
 if(visible===compactVisible)return;
 compactVisible=visible;compactTotal.classList.toggle('is-visible',visible);compactTotal.setAttribute('aria-hidden',String(!visible));compactTotal.tabIndex=visible?0:-1;
}
function queueCompactTotalUpdate(){if(compactUpdateQueued)return;compactUpdateQueued=true;requestAnimationFrame(updateCompactTotal);}
window.addEventListener('scroll',queueCompactTotalUpdate,{passive:true});window.addEventListener('resize',queueCompactTotalUpdate);
compactTotal.addEventListener('click',()=>{fullResult.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});const heading=fullResult.querySelector('h2');heading.tabIndex=-1;heading.focus({preventScroll:true});});
queueCompactTotalUpdate();
document.querySelectorAll('[data-open-view]').forEach(button=>button.addEventListener('click',()=>openView(button.dataset.openView)));
const handleFormEdit=event=>{if(!event.target.matches('[data-analysis-delta],[data-analysis-include-atk],[data-memory-control],[data-actual-control],[data-dps-control]'))render();};
const previousNumericValues=new WeakMap();
$('form').addEventListener('focusin',event=>{const input=event.target;if(input instanceof HTMLInputElement&&input.type==='number')previousNumericValues.set(input,input.value);});
$('form').addEventListener('change',event=>{
 const input=event.target;if(!(input instanceof HTMLInputElement)||input.type!=='number'||input.validity.badInput)return;
 if(input.value.trim()==='')input.value=previousNumericValues.get(input)??input.defaultValue;
 const value=Number(input.value);if(input.value.trim()===''||!Number.isFinite(value))return;
 const min=input.min===''?-Infinity:Number(input.min),max=input.max===''?Infinity:Number(input.max);
 const rounded=input.step==='1'?Math.round(value):value;
 input.value=String(Math.min(max,Math.max(min,rounded)));
 previousNumericValues.set(input,input.value);
},true);
$('form').addEventListener('input',handleFormEdit);$('form').addEventListener('change',handleFormEdit);$('form').addEventListener('submit',event=>event.preventDefault());
$('analysis-content').addEventListener('input',event=>{if(event.target.dataset.actualControl!=='yelanStep')return;const step=Math.min(15,Math.max(0,Number(event.target.value)||0)),value=step===0?0:1+3.5*(step-1),a=ANALYSIS_CONTENT.actual,shown=step===0?`0%（${a.inactive}）`:`${Number.isInteger(value)?value:value.toFixed(1)}%（${step-1}${a.secondsAfter}）`,output=event.target.closest('label')?.querySelector('[data-yelan-output]');if(output)output.textContent=shown;event.target.setAttribute('aria-valuetext',shown);});
$('analysis-content').addEventListener('change',event=>{if(!current||!event.target.matches('[data-analysis-include-atk]'))return;analysisIncludeAtk=event.target.checked;renderAnalysis();});
$('analysis-content').addEventListener('change',event=>{if(!current)return;const key=event.target.dataset.analysisDelta,actual=event.target.dataset.actualControl,dps=event.target.dataset.dpsControl;if(key)analysisDeltas[key]=Math.max(0,Number(event.target.value)||0);if(actual){if(actual==='critical'||actual==='includeFlat')actualSettings[actual]=event.target.value==='1';else if(actual==='yelanStep'){const step=Math.min(15,Math.max(0,Number(event.target.value)||0));actualSettings.yelanBuff=step===0?0:1+3.5*(step-1);}else actualSettings[actual]=event.target.value;}if(dps)dpsSettings[dps]=dps==='ratio'?Math.min(100,Math.max(.01,Number(event.target.value)||.01)):Math.max(.01,Number(event.target.value)||.01);if(event.target.dataset.memoryControl==='baseline')damageBaseline=event.target.value;if(event.target.dataset.memoryControl==='saved-label'){const record=damageRecords.find(item=>item.id===event.target.dataset.memoryId);if(record)record.label=event.target.value.trim()||ANALYSIS_CONTENT.memory.unnamed;}if(key||actual||dps||event.target.dataset.memoryControl){saveDamageMemory();renderAnalysis();}});
const rerenderDamageMemory=()=>{saveDamageMemory();renderAnalysis();};
const moveDamageRecord=(id,targetId,after=false)=>{const from=damageRecords.findIndex(record=>record.id===id),target=damageRecords.findIndex(record=>record.id===targetId);if(from<0||target<0||from===target)return false;const [record]=damageRecords.splice(from,1);let insert=damageRecords.findIndex(item=>item.id===targetId)+(after?1:0);damageRecords.splice(insert,0,record);return true;};
$('analysis-content').addEventListener('click',event=>{const button=event.target.closest('[data-memory-action]');if(!button||!current)return;const action=button.dataset.memoryAction;if(action==='save'){const label=$('analysis-content').querySelector('[data-memory-control="label"]').value.trim()||`${ANALYSIS_CONTENT.memory.defaultRecord} ${damageRecords.length+1}`;damageRecords.push({id:`damage-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,label,total:current.result.total});damageRecords=damageRecords.slice(-30);}if(action==='remove'){damageRecords=damageRecords.filter(record=>record.id!==button.dataset.memoryId);if(damageBaseline===button.dataset.memoryId)damageBaseline='current';}rerenderDamageMemory();});
let draggedDamageRecordId='';
$('analysis-content').addEventListener('dragstart',event=>{const handle=event.target.closest('[data-memory-drag]');if(!handle)return;draggedDamageRecordId=handle.dataset.memoryDrag;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',draggedDamageRecordId);handle.closest('.memory-row')?.classList.add('is-dragging');});
$('analysis-content').addEventListener('dragover',event=>{const row=event.target.closest('[data-memory-row]');if(!row||row.dataset.memoryRow===draggedDamageRecordId)return;event.preventDefault();event.dataTransfer.dropEffect='move';document.querySelectorAll('.memory-row.is-drag-over').forEach(item=>item.classList.remove('is-drag-over'));row.classList.add('is-drag-over');});
$('analysis-content').addEventListener('drop',event=>{const row=event.target.closest('[data-memory-row]');if(!row||!draggedDamageRecordId)return;event.preventDefault();const after=event.clientY>row.getBoundingClientRect().top+row.getBoundingClientRect().height/2;if(moveDamageRecord(draggedDamageRecordId,row.dataset.memoryRow,after))rerenderDamageMemory();draggedDamageRecordId='';});
$('analysis-content').addEventListener('dragend',()=>{draggedDamageRecordId='';document.querySelectorAll('.memory-row.is-dragging,.memory-row.is-drag-over').forEach(item=>item.classList.remove('is-dragging','is-drag-over'));});
let pointerDamageDrag=null;
$('analysis-content').addEventListener('pointerdown',event=>{const handle=event.target.closest('[data-memory-drag]');if(!handle)return;pointerDamageDrag={id:handle.dataset.memoryDrag,startY:event.clientY,targetId:'',after:false};handle.setPointerCapture?.(event.pointerId);});
$('analysis-content').addEventListener('pointermove',event=>{if(!pointerDamageDrag||Math.abs(event.clientY-pointerDamageDrag.startY)<5)return;event.preventDefault();const row=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-memory-row]');document.querySelectorAll('.memory-row.is-drag-over').forEach(item=>item.classList.remove('is-drag-over'));event.target.closest('.memory-row')?.classList.add('is-dragging');if(!row||row.dataset.memoryRow===pointerDamageDrag.id)return;const rect=row.getBoundingClientRect();pointerDamageDrag.targetId=row.dataset.memoryRow;pointerDamageDrag.after=event.clientY>rect.top+rect.height/2;row.classList.add('is-drag-over');});
$('analysis-content').addEventListener('pointerup',()=>{if(!pointerDamageDrag)return;const {id,targetId,after}=pointerDamageDrag;pointerDamageDrag=null;if(targetId&&moveDamageRecord(id,targetId,after)){rerenderDamageMemory();return;}document.querySelectorAll('.memory-row.is-dragging,.memory-row.is-drag-over').forEach(item=>item.classList.remove('is-dragging','is-drag-over'));});
$('analysis-content').addEventListener('keydown',event=>{const handle=event.target.closest('[data-memory-drag]');if(!handle||!['ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const index=damageRecords.findIndex(record=>record.id===handle.dataset.memoryDrag),target=index+(event.key==='ArrowUp'?-1:1);if(target<0||target>=damageRecords.length)return;const focusId=handle.dataset.memoryDrag;[damageRecords[index],damageRecords[target]]=[damageRecords[target],damageRecords[index]];rerenderDamageMemory();queueMicrotask(()=>$('analysis-content').querySelector(`[data-memory-drag="${focusId}"]`)?.focus());});
$('reset').addEventListener('click',()=>{if(!window.confirm('入力内容を入力例に戻します。本当によろしいですか？'))return;for(const d of definitions){if(d.check)$(d.id).checked=defaults[d.id];else $(d.id).value=d.slider?d.options.findIndex(o=>(Array.isArray(o)?o[0]:o)===defaults[d.id]):defaults[d.id];}render();});
document.querySelectorAll('.preset-buttons [data-prob]').forEach(button=>button.addEventListener('click',()=>{$('prob').value=button.dataset.prob;$('amp').value=button.dataset.amp;render();}));
$('export')?.addEventListener('click',()=>{if(!current)return;const {inputs:s,result:r}=current;const text=['胡桃 ローテーション計算結果','モデル：damage_formula.md / 通常1段目＋重撃×10、血梅香2回、爆発0.5回','会心期待ダメージ：'+fmt(r.total,4),'各バフ最大量・全期間有効、HP50%未満。入力値と未丸め結果を以下に保存。','',...definitions.filter(d=>!$(d.id).closest('.support')?.hidden).map(d=>d.label+' ['+d.id+']：'+s[d.id]),'','未丸め計算結果：',JSON.stringify(r,null,2)].join('\n');const blob=new Blob([text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='hutao-calculation.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('save-status').textContent='計算条件と結果をテキストファイルに書き出しました。';});
render();
// Feature-detected: the calculator also works in browsers without WebMCP.
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
 register({name:'read_hutao_calculation',description:'現在の入力条件と胡桃のローテーション期待ダメージを取得する。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(){if(!current)throw new Error('入力エラーを修正してください。');return {inputs:current.inputs,total:current.result.total,attack:current.result.atk,hp:current.result.hp,em:current.result.em};}});
 register({name:'set_hutao_reaction',description:'反応の加重割合（%）と倍率を設定し、表示中のダメージを再計算する。',inputSchema:{type:'object',properties:{probability:{type:'number',minimum:0,maximum:100},multiplier:{type:'number',minimum:1.5,maximum:2}},required:['probability','multiplier'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(!input||!Number.isFinite(input.probability)||input.probability<0||input.probability>100||!Number.isFinite(input.multiplier)||input.multiplier<1.5||input.multiplier>2||Object.keys(input).some(k=>!['probability','multiplier'].includes(k)))throw new Error('反応割合は0〜100%、倍率は1.5〜2で指定してください。');if(!current)throw new Error('先に画面の入力エラーを修正してください。');$('prob').value=input.probability;$('amp').value=input.multiplier;render();return {probability:input.probability,multiplier:input.multiplier,total:current.result.total};}});
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}

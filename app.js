'use strict';
const $=id=>document.getElementById(id),fmt=(v,d=1)=>v.toLocaleString('ja-JP',{maximumFractionDigits:d}),range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
const CONTENT=SITE_CONTENT;
const ANALYSIS_CONTENT=CONTENT.page.sections.analysis.content,REFERENCE_CONTENT=CONTENT.page.referenceValues;
const FORM_INTERFACE=CONTENT.forms.interface,VERIFICATION_CONTENT=CONTENT.page.sections.verification.content;
const definitions=[],defaults={};
const analysisDeltas={cr:3.89,cd:7.77,hp:5.83,atk:5.83,em:23.31};
const actualSettings={critical:true,reaction:'vaporize',includeFlat:true,nicoBlessing:'guidance'};
const dpsSettings={ratio:80,seconds:20};
let potentialIncludeAtk=false,scoreIncludeAtk=false;
const popoverHintIds=new Set(['cSet','xSet','xDef']);
function field(parent,id,label,value,{unit='',hint='',min=0,max=10000000,step='any',options=null,check=false}={}){
 const slider=!!options&&options.every(o=>typeof (Array.isArray(o)?o[0]:o)==='number');
 const timingLabel=FORM_INTERFACE.timingSegments.labels[id],booleanSelect=check&&(id==='nSet'||!!timingLabel);
 const booleanOptions=booleanSelect?(timingLabel?[['0',FORM_INTERFACE.timingSegments.before],['1',FORM_INTERFACE.timingSegments.after]]:[['1','天からの贈り物4'],['0','効果なし']]):null;
 const visibleHint=hint&&!popoverHintIds.has(id);
 const input=booleanSelect?`<select id="${id}" ${id==='nSet'?'aria-describedby="nSet-hint"':''}>${booleanOptions.map(([option,text])=>`<option value="${option}">${text}</option>`).join('')}</select>`
  :check?`<input id="${id}" type="checkbox" ${value?'checked':''}>`
  :slider?`<input id="${id}" type="range" min="0" max="${options.length-1}" step="1" value="${options.findIndex(option=>(Array.isArray(option)?option[0]:option)===value)}" ${visibleHint?`aria-describedby="${id}-hint"`:''}><output id="${id}-value" for="${id}"></output><span class="slider-ticks" aria-hidden="true">${options.map(option=>`<span class="text-meta">${Array.isArray(option)?option[1]:option}</span>`).join('')}</span>`
  :options?`<select id="${id}">${options.map(option=>{const [optionValue,text]=Array.isArray(option)?option:[option,option];return `<option value="${optionValue}" ${optionValue===value?'selected':''}>${text}</option>`;}).join('')}</select>`
  :`<input id="${id}" type="number" inputmode="decimal" value="${value}" min="${min}" max="${max}" step="${step}" ${id==='xDef'?'':`aria-describedby="${id}-hint"`}><span class="unit text-meta">${unit}</span>`;
 defaults[id]=value;definitions.push({id,label,min,max,step,options,check,slider});
 const el=document.createElement('div');el.className='field'+(check&&!booleanSelect?' checkbox':'')+(slider?' slider-field':'')+(timingLabel?' field-wide timing-field':'');
 el.innerHTML=`${timingLabel?`<span class="label text-standard" id="${id}-timing-label">${timingLabel}</span>`:`<label class="label text-standard" for="${id}">${label}</label>`}<span class="input-wrap">${input}</span>${visibleHint?`<small id="${id}-hint" class="text-meta">${hint}</small>`:''}`;
 if(booleanSelect){const select=el.querySelector('select');select.value=value?'1':'0';Object.defineProperty(select,'checked',{get(){return this.value==='1';},set(checked){this.value=checked?'1':'0';}});}
 $(parent).append(el);
}
const addHutaoField=(id,label,value,options={})=>field('hutao-fields',id,label,value,options);
for(const {id,label,value,...options} of CONTENT.forms.hutao.fields)addHutaoField(id,label,value,options);
const teamOptions=CONTENT.forms.common.teamOptions;
['yelan','citlali','nico'].forEach((supportId,index)=>field('team-fields',`supportSlot${index+1}`,`サポーター${index+1}`,supportId,{options:teamOptions}));
function createSupportSection(id){const section=document.createElement('div');section.className='support';section.id='support-'+id;section.innerHTML=`<div class="settings-groups" id="fields-${id}"></div>`;$('support-fields').append(section);return (key,label,value,options)=>field('fields-'+id,key,label,value,options);}
const constellationOptions={options:range(0,6).map(n=>[n,n+'凸'])},refinementOptions={options:range(1,5)};
for(const [id,section] of Object.entries(CONTENT.forms.supporters)){
 const addSupportField=createSupportSection(id);
 for(const {id:fieldId,label,value,optionType,...options} of section.fields)addSupportField(fieldId,label,value,{...options,...(optionType==='constellation'?constellationOptions:optionType==='refine'?refinementOptions:{})});
}
for(const id of ['citlali','furina','nico','xilonen']){
 const ref=document.createElement('section');ref.className='reference-values support-reference card-result';ref.innerHTML=`<h3>参考値</h3><div class="fields" id="reference-${id}"></div>`;$('support-'+id).append(ref);
}
const addBasicField=(id,label,value,options={})=>field(['prob','amp'].includes(id)?'reaction-fields':'enemy-fields',id,label,value,options);
for(const {id,label,value,...options} of CONTENT.forms.enemy.fields)addBasicField(id,label,value,options);
const addCustomBuffField=(id,label,value,options={})=>field('extra-fields',id,label,value,options);
for(const {id,label,value,...options} of CONTENT.forms.extra.fields)addCustomBuffField(id,label,value,options);
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
groupFields('hutao-fields','hutao-equipment','キャラクター・装備',['level','constellation','homa']);
{
 const artifact=document.createElement('div');artifact.className='field fixed-field';
 artifact.innerHTML='<label class="label text-standard" for="hutao-artifact">聖遺物</label><span class="input-wrap"><input id="hutao-artifact" type="text" value="火魔女4" disabled aria-describedby="hutao-artifact-hint"></span><small id="hutao-artifact-hint" class="text-meta">この計算機では変更できません</small>';
 $('hutao-equipment').querySelector('.fields').append(artifact);
}
groupFields('hutao-fields','hutao-stats','装備後ステータス',['hp','hpHydroResonanceIncluded','atk','atkHpCondition','atkHydroResonanceIncluded','atkPyroResonanceIncluded','cr','cd','em']);
function observedInput(inputId,conditionIds,copyKey){
 const copy=FORM_INTERFACE.inputModes[copyKey],common=FORM_INTERFACE.inputModes.common;
 const inputField=$(inputId).closest('.field'),statName=inputField.querySelector('.label').textContent,row=document.createElement('div'),details=document.createElement('details');
 row.className='paired-input-row stat-observed-row';details.className='stat-observed-conditions';
 const inputLabel=inputField.querySelector('.label');inputLabel.textContent=common.observed.replace('{stat}',statName);
 const converted=document.createElement('div');converted.className='stat-converted';converted.innerHTML=`<span class="text-secondary">${common.converted.replace('{stat}',statName)}</span><div class="stat-converted-value card-inner"><output id="${inputId}-converted"></output></div>`;
 const helpButton=document.createElement('button');helpButton.type='button';helpButton.className='help-button';helpButton.setAttribute('popovertarget',`${inputId}-condition-help`);helpButton.setAttribute('aria-label',common.helpLabel.replace('{title}',copy.title));helpButton.textContent='?';
 const inputHeading=document.createElement('span');inputHeading.className='field-label-with-help';inputLabel.replaceWith(inputHeading);inputHeading.append(inputLabel,helpButton);
 const help=document.createElement('span');help.id=`${inputId}-condition-help`;help.className='help-popover';help.setAttribute('popover','');help.innerHTML=`<strong class="text-primary-label">${copy.title}</strong>${copy.paragraphs.map(text=>`<p class="text-secondary">${text}</p>`).join('')}`;
 details.innerHTML=`<summary class="text-secondary-label">${common.settings.replace('{stat}',statName)}</summary>`;
 const entry=document.createElement('div');entry.className='stat-observed-entry'+(conditionIds.length===1?' stat-observed-entry-split':'');
 inputField.replaceWith(row);row.append(converted,details);details.append(entry);entry.append(inputField);
 const state=document.createElement('fieldset'),stateLabel=document.createElement('legend'),groups=document.createElement('div');
 state.className='stat-observed-state';stateLabel.className='text-standard';stateLabel.textContent=common.stateLabel.replace('{stat}',statName);
 groups.className='stat-condition-grid'+(conditionIds.length===1?' stat-condition-grid-single':'');groups.style.setProperty('--condition-count',conditionIds.length);
 state.append(stateLabel,groups);entry.append(state);
 for(const id of conditionIds){
  const select=$(id),originalField=select.closest('.field'),group=document.createElement('fieldset'),choices=document.createElement('div');
  originalField.classList.add('stat-original-condition');originalField.hidden=true;details.append(originalField);
  group.className='stat-condition-group';group.setAttribute('aria-label',common.conditionNames[id]);
  choices.className='stat-segment-choices';group.append(choices);groups.append(group);
  for(const option of select.options){
   const choice=document.createElement('label'),radio=document.createElement('input'),caption=document.createElement('span');
   choice.className='stat-segment-choice';radio.type='radio';radio.name=`${id}-segment`;radio.value=option.value;caption.className='text-muted-action';caption.textContent=option.textContent;
   radio.addEventListener('input',event=>event.stopPropagation());
   radio.addEventListener('change',event=>{event.stopPropagation();select.value=radio.value;select.dispatchEvent(new Event('change',{bubbles:true}));});
   choice.append(radio,caption);choices.append(choice);
  }
 }
 details.append(help);
}
function syncConditionSegments(){
 for(const radio of document.querySelectorAll('.stat-segment-choice input')){
  const select=$(radio.name.slice(0,-'-segment'.length));
  radio.checked=select.value===radio.value;
  radio.disabled=select.disabled;
 }
}
observedInput('atk',['atkHydroResonanceIncluded','atkPyroResonanceIncluded','atkHpCondition'],'hutaoAtk');
groupFields('hutao-fields','hutao-conditions','条件付き効果',['c6Rate']);
const supportGroups={
 yelan:[['yC'],['yWeapon','yR'],['yBuff','yStacks']],
 citlali:[['cC','cEm','cEmConstellation2Included'],['cWeapon','cR','cSet'],['cCount','cAfterElegy','cAfterKey']],
 furina:[['fLevel','fC','fHp','fHpHydroResonanceIncluded'],['fWeapon','fR'],['fAfterYelan','fAfterXilonen']],
 nico:[['nC','nBaseAtk','nAtk','nAtkPyroResonanceIncluded'],['nWeapon','nR','nSet'],['nAfterElegy','nAfterXilonen']],
 xilonen:[['xLevel','xC','xDef'],['xWeapon','xR','xSet']]
};
for(const [id,groups] of Object.entries(supportGroups)){
 groups.forEach((ids,i)=>groupFields('fields-'+id,id+'-group-'+i,FORM_INTERFACE.groups[i],ids));
}
observedInput('cEm',['cEmConstellation2Included'],'citlaliEm');
observedInput('fHp',['fHpHydroResonanceIncluded'],'furinaHp');
observedInput('nAtk',['nAtkPyroResonanceIncluded'],'nicoAtk');
observedInput('hp',['hpHydroResonanceIncluded'],'hutaoHp');
const mobileCompactInputIds=[
 'prob','amp','enemy','res',
 'customHp','customAtkFlat','customAtkPct','customEm','customCr','customCd','bonus','reactionBonus','otherFlat','otherCount','def','ignore','shred',
 'hp','atk','cr','cd','em','c6Rate',
 'yBuff','cEm','cCount','cSet','fHp','nBaseAtk','nAtk','nSet','xDef','xSet'
];
for(const id of mobileCompactInputIds)$(id)?.closest('.field')?.classList.add('mobile-compact-input');
const supportVisuals={
 yelan:{character:['images/Yelan.png','夜蘭'],weapon:['images/Elegy_for_the_End.png','終焉を嘆く詩','終焉弓'],weaponKey:'yWeapon'},
 citlali:{character:['images/Citlali.png','シトラリ'],weapon:["images/Starcaller's_Watch.png",'祭星者の眺め','祭星者'],weaponKey:'cWeapon'},
 furina:{character:['images/Furina.png','フリーナ'],weapon:['images/Key_of_Khai_Nisut.png','聖顕の鍵','鍵'],weaponKey:'fWeapon'},
 nico:{character:['images/Nicole.png','ニコ'],weapon:["images/Angelos'_Heptades.png",'塵と光の七つの誓約','誓約'],weaponKey:'nWeapon'},
 xilonen:{character:['images/Xilonen.png',CONTENT.forms.supporters.xilonen.name],weapon:['images/Peak_Patrol_Song.png',CONTENT.forms.supporters.xilonen.visual.weapon,CONTENT.forms.supporters.xilonen.visual.shortWeapon],weaponKey:'xWeapon'}
};
for(const id of ['yWeapon','cWeapon','fWeapon','nWeapon','xWeapon','yStacks'])$(id).closest('.field').classList.add('field-wide');
const cCountField=$('cCount').closest('.field');
const cCountLabel=cCountField.querySelector('.label'),cCountHeading=document.createElement('span');cCountLabel.id='cCount-label';$('cCount').setAttribute('aria-labelledby','cCount-label');
cCountHeading.className='field-label-with-help';cCountLabel.replaceWith(cCountHeading);cCountHeading.append(cCountLabel);
const cCountHelp=FORM_INTERFACE.cCountHelp;cCountHeading.insertAdjacentHTML('beforeend',`<button type="button" class="help-button" popovertarget="cCount-help" aria-label="${cCountHelp.button}">?</button><span id="cCount-help" class="help-popover" popover><strong>${cCountHelp.title}</strong><ul>${cCountHelp.items.map(x=>`<li>${x}</li>`).join('')}</ul></span>`);
const xDefField=$('xDef').closest('.field'),xDefLabel=xDefField.querySelector('.label'),xDefHeading=document.createElement('span');
xDefHeading.className='field-label-with-help';xDefLabel.replaceWith(xDefHeading);xDefHeading.append(xDefLabel);
const xDefHelp=FORM_INTERFACE.xDefHelp,xDefHelpText=CONTENT.forms.supporters.xilonen.fields.find(field=>field.id==='xDef').hint;
xDefHeading.insertAdjacentHTML('beforeend',`<button type="button" class="help-button" popovertarget="xDef-help" aria-label="${xDefHelp.button}">?</button><span id="xDef-help" class="help-popover" popover><strong>${xDefHelp.title}</strong>${xDefHelpText.split(/(?=Enka\.Network)/).map(part=>`<p class="text-secondary">${part}</p>`).join('')}</span>`);
for(const id of ['cSet','xSet']){
 const field=$(id).closest('.field'),label=field.querySelector('.label'),support=id==='cSet'?CONTENT.forms.supporters.citlali:CONTENT.forms.supporters.xilonen;
 const owner=support.name,hint=support.fields.find(item=>item.id===id).hint;
 const heading=document.createElement('span'),button=document.createElement('button'),popover=document.createElement('span'),title=document.createElement('strong');
 heading.className='field-label-with-help';label.replaceWith(heading);heading.append(label);
 button.type='button';button.className='help-button';button.setAttribute('popovertarget',`${id}-help`);button.setAttribute('aria-label',`${owner}の聖遺物について`);button.textContent='?';
 popover.id=`${id}-help`;popover.className='help-popover';popover.setAttribute('popover','');popover.setAttribute('aria-labelledby',`${id}-help-title`);
 title.id=`${id}-help-title`;title.className='text-primary-label';title.textContent=`${owner}の聖遺物について`;
 const paragraphs=hint.split(/(?=異なるサポーターに)/).filter(Boolean).map(text=>{const paragraph=document.createElement('p');paragraph.className='text-secondary';paragraph.textContent=text;return paragraph;});
 popover.append(title,...paragraphs);heading.append(button,popover);
}
function timing(id){
 const select=$(id),field=select.closest('.field'),heading=field.querySelector('.label');
 const choices=document.createElement('div');
 choices.className='stat-segment-choices timing-segment-choices';choices.setAttribute('role','radiogroup');choices.setAttribute('aria-labelledby',heading.id);
 for(const option of select.options){
  const choice=document.createElement('label'),radio=document.createElement('input'),caption=document.createElement('span');
  choice.className='stat-segment-choice';radio.type='radio';radio.name=`${id}-segment`;radio.value=option.value;caption.className='text-muted-action';caption.textContent=option.textContent;
  radio.addEventListener('input',event=>event.stopPropagation());
  radio.addEventListener('change',event=>{event.stopPropagation();select.value=radio.value;select.dispatchEvent(new Event('change',{bubbles:true}));});
  choice.append(radio,caption);choices.append(choice);
 }
 field.append(choices);
}
for(const id of Object.keys(FORM_INTERFACE.timingSegments.labels))timing(id);
const timingGroups={citlali:['cAfterElegy','cAfterKey'],furina:['fAfterYelan','fAfterXilonen'],nico:['nAfterElegy','nAfterXilonen']};
for(const [support,ids] of Object.entries(timingGroups)){
 const heading=document.createElement('div');heading.id=`${support}-timing-heading`;heading.className='timing-group-heading text-standard';heading.textContent=FORM_INTERFACE.timingSegments.groupHeadings[support];
 $(ids[0]).closest('.field').before(heading);
}
const supportNames={yelan:'夜蘭',citlali:'シトラリ',furina:'フリーナ',nico:'ニコ',xilonen:'シロネン'};
const supportPrefixes={yelan:'y',citlali:'c',furina:'f',nico:'n',xilonen:'x'};
const supportCards=[];
for(let i=0;i<3;i++){
 const card=document.createElement('section');card.className='support-card';
 card.append($(`supportSlot${i+1}`).closest('.field'));
 const loadout=document.createElement('div');loadout.className='loadout-strip support-card-loadout card-inner';loadout.hidden=true;card.append(loadout);
 const details=document.createElement('details');details.open=true;
 details.innerHTML=`<summary><span>詳細設定</span><span class="support-summary text-meta"></span></summary><div class="support-body"></div>`;
 card.append(details);$('team-fields').append(card);supportCards.push(card);
}
const INPUT_STORAGE_KEY='hutao-rotation-v1';
const ANALYSIS_STORAGE_KEY='hutao-damage-memory-v1';
let storageAvailable=true;
let damageRecords=[],damageBaselineId='current',damageRecordDraftLabel='';
let damageRecordFeedbackTimer=0;
try{
 const savedInputs=JSON.parse(localStorage.getItem(INPUT_STORAGE_KEY)||'null');
 if(savedInputs&&typeof savedInputs==='object'&&!Array.isArray(savedInputs)){
  // Keep browser-saved inputs when field names change; settings codes use only the current schema.
  for(let index=0;index<3;index++){
   const id=`supportSlot${index+1}`,previousId=`slot${index}`;
   if(!(id in savedInputs)&&previousId in savedInputs)savedInputs[id]=savedInputs[previousId];
  }
  for(const [id,previousId] of [
   ['hpHydroResonanceIncluded','hpInputMode'],['fHpHydroResonanceIncluded','fHpInputMode'],
   ['nAtkPyroResonanceIncluded','nAtkInputMode'],['cEmConstellation2Included','cEmInputMode']
  ])if(!(id in savedInputs)&&previousId in savedInputs)savedInputs[id]=savedInputs[previousId]==='field'?'yes':'no';
  if(!('atkHpCondition' in savedInputs)&&'atkInputMode' in savedInputs)savedInputs.atkHpCondition=savedInputs.atkInputMode==='skillPre'?'below50':'atLeast50';
  for(const [id,previousId] of [['atkHydroResonanceIncluded','atkWaterIncluded'],['atkPyroResonanceIncluded','atkFireIncluded']]){
   if(!(id in savedInputs)&&previousId in savedInputs)savedInputs[id]=savedInputs[previousId];
  }
  for(const definition of definitions){
   if(!(definition.id in savedInputs))continue;
   const input=$(definition.id),value=savedInputs[definition.id];
   if(definition.check)input.checked=value===true;
   else if(!definition.options||definition.options.some(option=>String(Array.isArray(option)?option[0]:option)===String(value)))input.value=definition.slider?definition.options.findIndex(option=>String(Array.isArray(option)?option[0]:option)===String(value)):value;
  }
  const team=[savedInputs.supportSlot1,savedInputs.supportSlot2,savedInputs.supportSlot3];
  if(!('atkHydroResonanceIncluded' in savedInputs))$('atkHydroResonanceIncluded').value=savedInputs.atkHpCondition==='below50'&&team.includes('yelan')&&team.includes('furina')?'yes':'no';
  if(!('atkPyroResonanceIncluded' in savedInputs))$('atkPyroResonanceIncluded').value=savedInputs.atkHpCondition==='below50'&&team.includes('nico')?'yes':'no';
 }
}catch{storageAvailable=false;}
try{
 const savedAnalysis=JSON.parse(localStorage.getItem(ANALYSIS_STORAGE_KEY)||'null');
 if(savedAnalysis&&Array.isArray(savedAnalysis.records)){
  damageRecords=savedAnalysis.records.filter(record=>record&&typeof record.id==='string'&&typeof record.label==='string'&&Number.isFinite(record.total)).slice(-30);
  damageBaselineId=savedAnalysis.baseline==='current'||damageRecords.some(record=>record.id===savedAnalysis.baseline)?savedAnalysis.baseline:'current';
  damageRecordDraftLabel=typeof savedAnalysis.draft==='string'?savedAnalysis.draft.slice(0,60):'';
  for(const key of Object.keys(analysisDeltas))if(Number.isFinite(savedAnalysis.analysisDeltas?.[key])&&savedAnalysis.analysisDeltas[key]>=0)analysisDeltas[key]=savedAnalysis.analysisDeltas[key];
  potentialIncludeAtk=savedAnalysis.potentialIncludeAtk===true;scoreIncludeAtk=savedAnalysis.scoreIncludeAtk===true;
  if(Number.isFinite(savedAnalysis.dpsSettings?.ratio)&&savedAnalysis.dpsSettings.ratio>=.01&&savedAnalysis.dpsSettings.ratio<=100)dpsSettings.ratio=savedAnalysis.dpsSettings.ratio;
  if(Number.isFinite(savedAnalysis.dpsSettings?.seconds)&&savedAnalysis.dpsSettings.seconds>=.01)dpsSettings.seconds=savedAnalysis.dpsSettings.seconds;
 }
}catch{storageAvailable=false;}
function saveAnalysisState(){try{localStorage.setItem(ANALYSIS_STORAGE_KEY,JSON.stringify({records:damageRecords,baseline:damageBaselineId,draft:damageRecordDraftLabel,analysisDeltas,potentialIncludeAtk,scoreIncludeAtk,dpsSettings}));}catch{storageAvailable=false;}}
function saveCurrentDamageRecord(label=''){
 if(!current)return;
 damageRecords.push({id:`damage-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,label:label.trim()||`${ANALYSIS_CONTENT.memory.defaultRecord} ${damageRecords.length+1}`,total:current.result.total});
 damageRecords=damageRecords.slice(-30);clearExportedSettingsCode();
}
const resultMemoryField=document.createElement('label'),memoryContent=ANALYSIS_CONTENT.memory;resultMemoryField.className='result-memory-field';resultMemoryField.innerHTML=`<span class="text-standard text-on-red">${memoryContent.resultFieldLabel}</span><input type="text" maxlength="60" value="${damageRecordDraftLabel.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')}" placeholder="${memoryContent.placeholder}" aria-label="${memoryContent.resultFieldAria}">`;
const resultMemoryButton=document.createElement('button');resultMemoryButton.type='button';resultMemoryButton.className='result-memory-button';resultMemoryButton.textContent=memoryContent.save;
const resultMemoryNote=document.createElement('p');resultMemoryNote.className='result-memory-note text-meta text-on-red-muted';resultMemoryNote.textContent=memoryContent.resultNote;$('input-error').before(resultMemoryField,resultMemoryButton,resultMemoryNote);
resultMemoryField.querySelector('input').addEventListener('input',event=>{damageRecordDraftLabel=event.target.value;saveAnalysisState();});
resultMemoryButton.addEventListener('click',()=>{saveCurrentDamageRecord(damageRecordDraftLabel);damageRecordDraftLabel='';resultMemoryField.querySelector('input').value='';saveAnalysisState();renderAnalysis();resultMemoryButton.textContent=memoryContent.saved;setTimeout(()=>resultMemoryButton.textContent=memoryContent.save,1200);});
function read(){const s={};for(const d of definitions){const el=$(d.id);const option=d.slider?d.options[Number(el.value)]:null;s[d.id]=d.slider?(Array.isArray(option)?option[0]:option):d.check?el.checked:(d.options&&isNaN(Number(el.value)))?el.value:Number(el.value);}s.skill=s.constellation>=3?13:10;s.burst=s.constellation>=5?13:10;s.team=[s.supportSlot1,s.supportSlot2,s.supportSlot3].filter(v=>v!=='none');return s;}
function updateCardLoadout(card,id,s){
 const loadout=card.querySelector('.support-card-loadout'),previous=loadout.dataset.support;
 if(previous&&supportVisuals[previous]){
  const previousWeapon=$(supportVisuals[previous].weaponKey).closest('.field');
  if(loadout.contains(previousWeapon))$(previous+'-group-1').querySelector('.fields').prepend(previousWeapon);
 }
 loadout.replaceChildren();loadout.dataset.support=id==='none'?'':id;loadout.hidden=id==='none';
 if(id==='none')return;
 const visual=supportVisuals[id],character=document.createElement('figure');
 character.innerHTML=`<img src="${visual.character[0]}" alt="${visual.character[1]}" width="256" height="256"><figcaption><span class="character-line"><span class="text-standard">${visual.character[1]}</span><span class="character-summary text-meta"></span></span></figcaption>`;
 const weaponField=$(visual.weaponKey).closest('.field');weaponField.classList.add('loadout-weapon-option');
 if(!weaponField.querySelector('.loadout-weapon-image'))weaponField.querySelector('.input-wrap').insertAdjacentHTML('afterend',`<img class="loadout-weapon-image" src="${visual.weapon[0]}" alt="" width="256" height="256">`);
 if(!weaponField.querySelector('.weapon-name-full'))weaponField.querySelector('.label').innerHTML=`<span class="weapon-name-full text-standard">${visual.weapon[1]}</span><span class="weapon-name-short text-standard">${visual.weapon[2]}</span><span class="weapon-state"></span>`;
 loadout.classList.toggle('weapon-equipped',s[visual.weaponKey]);const weaponState=weaponField.querySelector('.weapon-state');weaponState.classList.toggle('text-accent',s[visual.weaponKey]);weaponState.classList.toggle('text-meta',!s[visual.weaponKey]);loadout.append(character,weaponField);
}
function updateVisibility(s){
 for(const id of ['yelan','citlali','furina','nico','xilonen'])$('support-'+id).hidden=!s.team.includes(id);
 for(let i=0;i<3;i++){
 const id=s[`supportSlot${i+1}`],card=supportCards[i],details=card.querySelector('details'),body=card.querySelector('.support-body');
  for(const child of [...body.children])if(child.id!=='support-'+id)$('support-fields').append(child);
  details.hidden=id==='none';
  updateCardLoadout(card,id,s);
  if(id!=='none'){
   const support=$('support-'+id);if(support.parentElement!==body)body.append(support);
   const p=supportPrefixes[id],summary=s[p+'Weapon']?`C${s[p+'C']}R${s[p+'R']}`:`C${s[p+'C']}`;
   card.querySelector('.character-summary').textContent=summary;card.querySelector('.support-summary').textContent='';
  }
 }
 const dependentField=(id,visible,enabled=visible)=>{const input=$(id);input.closest('.field').hidden=!visible;input.disabled=!enabled;};
 for(const [id,equipped] of [['yR',s.yWeapon],['cR',s.cWeapon],['fR',s.fWeapon],['nR',s.nWeapon],['xR',s.xWeapon],['fLevel',s.fWeapon]])dependentField(id,equipped);
 $('fHp').closest('.stat-observed-row').hidden=!s.fWeapon;$('fHp').disabled=!s.fWeapon;$('fHpHydroResonanceIncluded').disabled=!s.fWeapon;
 $('reference-furina').closest('.support-reference').hidden=!s.fWeapon;
 $('c6Rate').disabled=s.constellation!==6;
 $('cCount').disabled=s.cC<1;
 $('yStacks').disabled=s.yC<4;
 $('cEmConstellation2Included').disabled=s.cC<2;
 const elegy=s.team.includes('yelan')&&s.yWeapon,key=s.team.includes('furina')&&s.fWeapon,xilonen=s.team.includes('xilonen');
 dependentField('cAfterElegy',elegy,elegy&&s.cC>=1);
 dependentField('cAfterKey',key,key&&s.cC>=1);
 dependentField('nAfterElegy',elegy);
 dependentField('fAfterYelan',key&&s.team.includes('yelan'),key&&s.team.includes('yelan')&&s.yC>=4);
 dependentField('fAfterXilonen',key&&xilonen,key&&xilonen&&s.xC>=2);
 dependentField('nAfterXilonen',xilonen,xilonen&&s.xC>=2);
 for(const [support,ids] of Object.entries(timingGroups)){
  const visible=ids.some(id=>!$(id).closest('.field').hidden);
  $(`${support}-timing-heading`).hidden=!visible;
  if(support!=='citlali')$(`${support}-group-2`).hidden=!visible;
 }
 const pyro=s.team.includes('nico'),hydro=s.team.includes('yelan')&&s.team.includes('furina');
 $('team-resonance').textContent='元素共鳴の判定：'+([pyro?'炎共鳴（攻撃力+25%）':'',hydro?'水共鳴（HP+25%）':''].filter(Boolean).join(' ／ ')||'元素共鳴なし');
 const duplicateSet=s.team.includes('citlali')&&s.team.includes('xilonen')&&s.cSet===s.xSet?s.cSet:'';
 const duplicateWarning=$('artifact-duplicate-warning');duplicateWarning.hidden=!['scroll','instructor'].includes(duplicateSet);duplicateWarning.textContent=FORM_INTERFACE.duplicateArtifacts[duplicateSet]||'';
}
function validate(s){const errors=[];
 for(const d of definitions){const el=$(d.id),hidden=el.closest('.support')?.hidden;if(d.options||d.check||hidden||el.disabled){el.removeAttribute('aria-invalid');continue;}
 const v=s[d.id],bad=el.value.trim()===''||!Number.isFinite(v)||v<d.min||v>d.max||(d.step===1&&!Number.isInteger(v));el.setAttribute('aria-invalid',String(bad));if(bad)errors.push(`${d.label}：${d.min}〜${fmt(d.max,0)}${d.step===1?'の整数':''}を入力してください。`);
 }
 if(new Set(s.team).size!==s.team.length)errors.push('同じキャラクターを複数枠に編成できません。');return errors;
}
const kv=(name,val,formula='')=>!name?'':formula&&formula!==val
 ?`<details class="kv reference-disclosure"><summary><span class="reference-label text-secondary">${name}</span><span class="reference-value text-secondary"><span class="reference-arrow disclosure-triangle" aria-hidden="true"></span>${val}</span></summary><div class="reference-formula text-secondary">${formula}</div></details>`
 :`<div class="kv"><span class="text-secondary">${name}</span><span class="reference-value text-secondary">${val}</span></div>`;
function setReference(id,html){
 const root=$(id),openLabels=new Set([...root.querySelectorAll('.reference-disclosure[open] .reference-label')].map(label=>label.textContent));
 root.innerHTML=html;
 for(const detail of root.querySelectorAll('.reference-disclosure'))detail.open=openLabels.has(detail.querySelector('.reference-label').textContent);
}
const fmtInt=v=>fmt(v,0),fmtBuff=v=>v.toLocaleString('ja-JP',{minimumFractionDigits:1,maximumFractionDigits:1});
const fmtReferencePercent=v=>fmt(v,2);
function referenceCapFormula(expression,raw,cap,format=fmtInt,unit=''){
 const capText=`${format(cap)}${unit}`;
 return `${expression} ＝ ${format(raw)}${unit}${raw>cap?` →上限${capText}`:`（上限${capText}）`}`;
}
function referenceStatFormula(parts,result,{base,percentLabels=new Set()}={}){
 const terms=[],rates=[];
 for(const part of parts){
  if(percentLabels.has(part.label)){
   const rate=part.value/base*100;
   if(fmtReferencePercent(rate)!=='0')rates.push(`${fmtReferencePercent(rate)}%`);
  }else if(Math.abs(part.value)>=.5)terms.push(fmtInt(part.value));
 }
 if(rates.length)terms.push(`${fmtInt(base)} × ${rates.length>1?`(${rates.join('＋')})`:rates[0]}`);
 if(terms.length===1&&!rates.length)return fmtInt(result);
 return `${terms.join(' ＋ ')||'0'} ＝ ${fmtInt(result)}`;
}
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
 const rows=[{name:copy.rows.hutao,values:{hp:fmtInt(r.convertedInputs.hp),atk:fmtInt(r.attackBeforeBuffs),em:fmtInt(s.em),cr:fmtInt(r.critRate)+'%',cd:fmtInt(r.critDamage)+'%',bonus:delta(r.fixedBonus,'%'),reaction:'+15%',flat:flatTerm(r.bloodFlatPerHit,r.bloodCount)}}];
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
 const rowHtml=rows.map(item=>`<tr class="${item.final?'matrix-final':''}"><th scope="row"${item.final?'':' class="text-secondary"'}>${item.name}</th>${visible.map(([key])=>`<td>${item.values[key]??'—'}</td>`).join('')}</tr>`).join('');
 if(!visible.some(([key])=>key===matrixSelectedStat))matrixSelectedStat=visible[0][0];
 const final=rows.find(item=>item.final);
 const mobileTabs=visible.map(([key,title])=>`<button type="button" role="tab" id="matrix-tab-${key}" aria-controls="matrix-panel-${key}" aria-selected="${key===matrixSelectedStat}" tabindex="${key===matrixSelectedStat?0:-1}" data-matrix-stat="${key}">${title}</button>`).join('');
 const mobilePanels=visible.map(([key,title])=>`<section class="matrix-mobile-panel" id="matrix-panel-${key}" role="tabpanel" aria-labelledby="matrix-tab-${key}" data-matrix-panel="${key}" ${key===matrixSelectedStat?'':'hidden'}><div class="matrix-mobile-final card-result"><span class="text-primary-label">${copy.mobileFinalLabel}</span><strong class="text-primary-label">${final.values[key]??'—'}</strong></div><div class="matrix-mobile-rows" aria-label="${title}${copy.firstColumn}">${rows.filter(item=>!item.final&&(item.values[key]??'—')!=='—').map(item=>`<div class="matrix-mobile-row"><span class="text-secondary">${item.name}</span><span class="matrix-mobile-value text-secondary">${item.values[key]}</span></div>`).join('')}</div></section>`).join('');
 return `<div class="matrix-block"><h3>${copy.title}</h3><div class="matrix-wrap table-standard"><table class="breakdown-matrix" style="--matrix-columns:${visible.length}"><thead><tr class="table-standard-header"><th scope="col"></th>${visible.map(([,title])=>`<th scope="col">${title}</th>`).join('')}</tr></thead><tbody>${rowHtml}</tbody></table></div><div class="matrix-mobile"><div class="matrix-mobile-tabs" role="tablist" aria-label="${copy.title}">${mobileTabs}</div>${mobilePanels}</div>${copy.note?`<p class="note matrix-note text-meta">${copy.note}</p>`:''}</div>`;
}
let current=null,lastRenderedInputs=null;
let selectedSupportSlots=[0,1,2].map(index=>$(`supportSlot${index+1}`).value);
const customBuffInputIds=CONTENT.forms.extra.fields.filter(item=>!item.check).map(item=>item.id);
function swapSelectedSupport(event){
 const match=/^supportSlot([1-3])$/.exec(event.target.id);if(!match)return;
 const index=Number(match[1])-1,selected=event.target.value,previous=selectedSupportSlots[index];
 if(selected===previous)return;
 const occupied=selected==='none'?-1:selectedSupportSlots.findIndex((value,other)=>other!==index&&value===selected);
 if(occupied!==-1)$(`supportSlot${occupied+1}`).value=previous;
 selectedSupportSlots=[0,1,2].map(index=>$(`supportSlot${index+1}`).value);
}
function renderAnalysis(){
 if(!current)return;
 $('analysis-content').innerHTML=DamageAnalysis.renderDamageAnalysis(current.inputs,current.result,analysisDeltas,HutaoCalculator.calculate,damageRecords,damageBaselineId,actualSettings,dpsSettings,potentialIncludeAtk,scoreIncludeAtk,damageRecordDraftLabel);
}
function render(refreshAnalysis=false){
 const customFilled=customBuffInputIds.some(id=>{const value=$(id).value.trim();return value!==''&&Number.isFinite(Number(value))&&Number(value)!==0;});
 document.querySelector('.basic-custom-details summary').textContent=CONTENT.page.sections.basic.custom.expand+(customFilled?CONTENT.page.sections.basic.custom.filledSuffix:'');
 selectedSupportSlots=[0,1,2].map(index=>$(`supportSlot${index+1}`).value);
 // input and change can describe the same edit. Include raw values so an
 // empty or invalid number never reuses a valid calculation with value zero.
 const inputKey=JSON.stringify(definitions.map(d=>d.check?$(d.id).checked:$(d.id).value));
 if(inputKey===lastRenderedInputs){if(refreshAnalysis)renderAnalysis();return;}
 lastRenderedInputs=inputKey;
 for(const d of definitions){if(!d.slider)continue;const el=$(d.id),option=d.options[Number(el.value)],label=String(Array.isArray(option)?option[1]:option);$(d.id+'-value').value=label;el.setAttribute('aria-valuetext',label);}
 const s=read();updateVisibility(s);syncConditionSegments();
 const errors=validate(s);if($('export-settings'))$('export-settings').disabled=errors.length>0;$('input-error').hidden=!errors.length;
 if(errors.length){current=null;for(const id of ['hp','atk','cEm','fHp','nAtk'])$(id+'-converted').value='—';$('rotation-total').textContent='—';$('compact-rotation-total-value').textContent='—';$('input-error').textContent=errors.join(' ');$('reference-hutao').textContent='';$('hutao-hp-cap-status').textContent='入力エラーを修正するとHP上限までの差を表示します。';for(const id of ['citlali','furina','nico','xilonen'])$('reference-'+id).textContent='';$('verification-content').textContent=VERIFICATION_CONTENT.error;$('analysis-content').textContent=ANALYSIS_CONTENT.error;return;}
 const r=HutaoCalculator.calculate(s);current={inputs:s,result:r};
 for(const id of ['hp','atk','cEm','fHp','nAtk'])$(id+'-converted').value=fmtInt(r.convertedInputs[id]);
 try{localStorage.setItem(INPUT_STORAGE_KEY,JSON.stringify(s));}catch{storageAvailable=false;}
 $('rotation-total').textContent=fmt(r.total,0);
 $('compact-rotation-total-value').textContent=$('rotation-total').textContent;
 const skillCapHp=r.skillCap/r.skillRate,skillHpDifference=(skillCapHp-r.hp)/r.baseHp*100;
 $('hutao-hp-cap-status').innerHTML=r.skillRaw<r.skillCap
  ?`元素スキルによる攻撃力上昇上限に達するまで、残りHP<strong>＋${fmt(Math.max(0,skillHpDifference),2)}%</strong>です。`
  :`元素スキルによる攻撃力上昇上限に達しています。HPを<strong>－${fmt(Math.max(0,-skillHpDifference),2)}%</strong>するとこの上限を下回ります。`;
 const refs=REFERENCE_CONTENT,h=refs.hutao;
 const baseAtkFormula=`${fmtInt(HUTAO_DATA.levels[s.level].atk)} ＋ ${fmtInt(HUTAO_DATA.weaponAtk)} ≈ ${fmtInt(r.baseAtk)}`;
 const critFormula=`${fmt(r.c6Rate/100,6)} ＋ (1 − ${fmt(r.c6Rate/100,6)}) × ${fmt(r.baseCritRate/100,6)} ＝ ${fmt(r.critRate/100,6)}`;
 setReference('reference-hutao',kv(h.baseHp,fmtInt(r.baseHp))+kv(h.baseAtk,fmtInt(r.baseAtk),baseAtkFormula)+kv(h.homaAbove,'HP上限の'+fmtReferencePercent(r.homaAtLeast50Rate*100)+'%')+kv(h.homaBelow,'HP上限の'+fmtReferencePercent(r.homaRate*100)+'%')+kv(h.skill,'HP上限の'+fmtReferencePercent(r.skillRate*100)+'%')+kv(h.fixedBonus,fmtReferencePercent(r.fixedBonus)+'%','46.6%＋33%＋22.5%＝'+fmtReferencePercent(r.fixedBonus)+'%')+kv(h.effectiveCrit,fmt(r.critRate/100,6),critFormula));
 const citEmFormula=referenceStatFormula(r.citEmParts,r.citEm);
 setReference('reference-citlali',kv(refs.citlali.em,fmtInt(r.citEm),citEmFormula)+kv(refs.citlali.flat,fmtInt(r.citFlatPerHit),`${fmtInt(r.citEm)} × 2 ＝ ${fmtInt(r.citFlatPerHit)}`));
 const keyHpFormula=referenceStatFormula(r.keyHpParts,r.keyHp,{base:r.furinaBaseHp,percentLabels:new Set(['夜蘭4凸','水共鳴','シロネン2凸','カスタムバフ'])});
 const keyEmFormula=`${fmtInt(r.keyHp)} × ${fmtReferencePercent(HUTAO_DATA.key[s.fR-1]*100)}% ＝ ${fmtInt(r.keyEm)}`;
 setReference('reference-furina',kv(refs.furina.baseHp,fmtInt(r.furinaBaseHp))+kv(refs.furina.hp,fmtInt(r.keyHp),keyHpFormula)+kv(refs.furina.emBuff,s.fWeapon?fmtInt(r.keyEm):refs.furina.weaponMissing,s.fWeapon?keyEmFormula:''));
 const nicoAtkFormula=referenceStatFormula(r.nicoAtkParts,r.nicoAtk,{base:s.nBaseAtk,percentLabels:new Set(['炎共鳴','カスタム攻撃力%','終焉','シロネン2凸'])});
 const nicoSkillRaw=r.nicoAtk*r.nicoSkillRate,nicoBaseFormula=referenceCapFormula(`${fmtInt(r.nicoAtk)} × ${fmtReferencePercent(r.nicoSkillRate*100)}%`,nicoSkillRaw,r.nicoSkillCap);
 const nicoBuffFormula=referenceStatFormula([{value:Math.min(nicoSkillRaw,r.nicoSkillCap)},{value:300},...(s.nC>=2?[{value:300}]:[])],r.nicoSkillBuff);
 const nicoFinalAtkFormula=referenceStatFormula([{value:r.nicoAtk},{value:r.nicoSkillBuff},{label:'終焉',value:r.nicoLateElegy},{label:'シロネン2凸',value:r.nicoLateXilonen}],r.nicoFinalAtk,{base:s.nBaseAtk,percentLabels:new Set(['終焉','シロネン2凸'])});
 setReference('reference-nico',kv(refs.nico.atk,fmtInt(r.nicoAtk),nicoAtkFormula)+kv(refs.nico.gift,fmtInt(Math.min(nicoSkillRaw,r.nicoSkillCap)),nicoBaseFormula)+kv(refs.nico.buff,fmtInt(r.nicoSkillBuff),nicoBuffFormula)+kv(refs.nico.finalAtk,fmtInt(r.nicoFinalAtk),nicoFinalAtkFormula)+(s.nC>=4?kv(refs.nico.guidance,fmtInt(r.nicoGuidancePerHit),`${fmtInt(r.nicoFinalAtk)} × 70% ＝ ${fmtInt(r.nicoGuidancePerHit)}`):''));
 if(s.team.includes('xilonen')){
  const xilonenDefFormula=referenceStatFormula([{value:s.xDef},{label:'武器',value:r.xilonenWeaponDef},{label:'天賦',value:r.xilonenTalentDef}],r.xilonenDef,{base:r.xilonenBaseDef,percentLabels:new Set(['武器','天賦'])});
  const weaponRate=HUTAO_DATA.xilonenWeapon.rate[s.xR-1],weaponCap=HUTAO_DATA.xilonenWeapon.cap[s.xR-1],weaponRaw=r.xilonenDef/1000*weaponRate;
  const weaponFormula=referenceCapFormula(`${fmtInt(r.xilonenDef)} ÷ 1,000 × ${fmtReferencePercent(weaponRate)}%`,weaponRaw,weaponCap,fmtReferencePercent,'%');
  setReference('reference-xilonen',kv(refs.xilonen.def,fmtInt(r.xilonenDef),xilonenDefFormula)+(s.xWeapon?kv(refs.xilonen.weaponBuff,fmtReferencePercent(Math.min(weaponRaw,weaponCap))+'%',weaponFormula):'')+(s.xC>=4?kv(refs.xilonen.flat,fmtInt(r.xilonenFlatPerHit),`${fmtInt(r.xilonenDef)} × 65% ＝ ${fmtInt(r.xilonenFlatPerHit)}`):''));
 }
 $('verification-content').innerHTML=breakdownMatrix(s,r)+attackCalculation(s,r)+damageTrace(s,r);
 renderAnalysis();
 $('input-save-status').textContent=storageAvailable?'入力はこのブラウザーに自動保存されます。':'ブラウザーへの自動保存は利用できません。「計算条件・結果を保存」で保存できます。';
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
const compactRotationTotal=document.createElement('button');compactRotationTotal.type='button';compactRotationTotal.id='compact-rotation-total';compactRotationTotal.className='result-card result-card-compact';compactRotationTotal.setAttribute('aria-hidden','true');compactRotationTotal.tabIndex=-1;
const compactLabel=document.createElement('span'),compactValue=document.createElement('strong');compactLabel.className='text-meta text-on-red-muted';compactValue.className='text-largest-result text-on-red';compactLabel.textContent=CONTENT.page.result.title;compactValue.id='compact-rotation-total-value';compactRotationTotal.append(compactLabel,compactValue);$('app').append(compactRotationTotal);
const fullResult=document.querySelector('.layout>aside .result-card'),compactMedia=window.matchMedia('(max-width:760px)');let compactVisible=false,compactUpdateQueued=false;
function updateCompactTotal(){
 compactUpdateQueued=false;
 const fullBottom=fullResult.getBoundingClientRect().bottom;
 const visible=compactMedia.matches&&(compactVisible?fullBottom<72:fullBottom<56);
 if(visible===compactVisible)return;
 compactVisible=visible;compactRotationTotal.classList.toggle('is-visible',visible);compactRotationTotal.setAttribute('aria-hidden',String(!visible));compactRotationTotal.tabIndex=visible?0:-1;
}
function queueCompactTotalUpdate(){if(compactUpdateQueued)return;compactUpdateQueued=true;requestAnimationFrame(updateCompactTotal);}
window.addEventListener('scroll',queueCompactTotalUpdate,{passive:true});window.addEventListener('resize',queueCompactTotalUpdate);
compactRotationTotal.addEventListener('click',()=>{fullResult.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});const heading=fullResult.querySelector('h2');heading.tabIndex=-1;heading.focus({preventScroll:true});});
queueCompactTotalUpdate();
document.querySelectorAll('[data-open-view]').forEach(button=>button.addEventListener('click',()=>openView(button.dataset.openView)));
function clearExportedSettingsCode(){const code=$('export-settings-code');if(!code||!code.value)return;code.value='';$('export-settings-status').textContent='';$('settings-transfer-status').textContent='';}
const handleFormEdit=event=>{if(event.target.matches('[data-analysis-delta],[data-analysis-include-atk],[data-memory-control],[data-actual-control],[data-dps-control]'))return;clearExportedSettingsCode();render();if(event.type==='input'&&!trackedSettings.has(event.target.id))previousSettings=read();};
const trackedSettings=new Set(['level','homa','cR','cSet','cWeapon','fLevel','fR','nR','nWeapon','xLevel','xSet','xWeapon']);
let previousSettings;
const STAT_UPDATE_PREFERENCES='hutao-stat-update-preferences-v1';
const statPreferences={automatic:'ask',reminder:'show'};
try{const saved=JSON.parse(localStorage.getItem(STAT_UPDATE_PREFERENCES)||'null');if(['ask','apply','keep'].includes(saved?.automatic))statPreferences.automatic=saved.automatic;if(['show','hide'].includes(saved?.reminder))statPreferences.reminder=saved.reminder;}catch{storageAvailable=false;}
function saveStatPreferences(){try{localStorage.setItem(STAT_UPDATE_PREFERENCES,JSON.stringify(statPreferences));}catch{storageAvailable=false;}}
function syncStatPreferences(){ $('stat-auto-preference').value=statPreferences.automatic;$('stat-reminder-preference').value=statPreferences.reminder;}
syncStatPreferences();
$('stat-auto-preference').addEventListener('change',event=>{statPreferences.automatic=event.target.value;saveStatPreferences();});
$('stat-reminder-preference').addEventListener('change',event=>{statPreferences.reminder=event.target.value;saveStatPreferences();});
const adjustmentDialog=document.createElement('dialog');adjustmentDialog.className='settings-dialog card-basic';adjustmentDialog.id='stat-adjustment-dialog';adjustmentDialog.setAttribute('aria-labelledby','stat-adjustment-title');
adjustmentDialog.innerHTML='<h3 id="stat-adjustment-title"></h3><p class="text-standard" id="stat-adjustment-message"></p><ul class="text-standard" id="stat-adjustment-list" hidden></ul><div class="settings-dialog-actions"><button type="button" data-adjust-yes>はい</button><button type="button" data-adjust-no class="text-muted-action">いいえ</button><button type="button" data-adjust-ok hidden>OK</button></div><label class="stat-adjustment-memory text-secondary"><input type="checkbox" id="stat-adjustment-remember"><span id="stat-adjustment-remember-label">今後もこの選択を維持する</span></label>';
document.body.append(adjustmentDialog);
adjustmentDialog.addEventListener('click',event=>{if(event.target.matches('[data-adjust-yes]'))adjustmentDialog.close('yes');else if(event.target.matches('[data-adjust-no]'))adjustmentDialog.close('no');else if(event.target.matches('[data-adjust-ok]'))adjustmentDialog.close('ok');});
function applyStatUpdates(updates){for(const [id,value] of updates)$(id).value=String(value);clearExportedSettingsCode();render();previousSettings=read();}
function showStatPrompt(title,message,automatic,updates=[],proposalTexts=[]){
 if(automatic&&statPreferences.automatic==='apply'){applyStatUpdates(updates);return;}
 if(automatic&&statPreferences.automatic==='keep'||!automatic&&statPreferences.reminder==='hide')return;
 $('stat-adjustment-title').textContent=title;
 $('stat-adjustment-message').textContent=message;
 const list=$('stat-adjustment-list');list.replaceChildren(...proposalTexts.map(item=>{const li=document.createElement('li');li.textContent=item;return li;}));list.hidden=!proposalTexts.length;
 adjustmentDialog.querySelector('[data-adjust-yes]').hidden=!automatic;
 adjustmentDialog.querySelector('[data-adjust-no]').hidden=!automatic;
 adjustmentDialog.querySelector('[data-adjust-ok]').hidden=automatic;
 $('stat-adjustment-remember').checked=false;
 $('stat-adjustment-remember-label').textContent=automatic?'今後もこの選択を維持する':'今後は表示しない';
 adjustmentDialog.returnValue='';adjustmentDialog.showModal();
 adjustmentDialog.addEventListener('close',()=>{
  const choice=adjustmentDialog.returnValue;
  if($('stat-adjustment-remember').checked){if(automatic&&['yes','no'].includes(choice))statPreferences.automatic=choice==='yes'?'apply':'keep';else if(!automatic&&choice==='ok')statPreferences.reminder='hide';saveStatPreferences();syncStatPreferences();}
  if(choice==='yes')applyStatUpdates(updates);
 },{once:true});
}
const statText=value=>new Intl.NumberFormat('ja-JP',{maximumFractionDigits:0}).format(value);
const formulaText=statText;
const formulaRate=value=>new Intl.NumberFormat('ja-JP',{maximumFractionDigits:3}).format(value);
const statOwners={hp:'胡桃',atk:'胡桃',fHp:'フリーナ',xDef:'シロネン',cEm:'シトラリ',nBaseAtk:'ニコ',nAtk:'ニコ'};
function statUpdateTitle(fields){const owner=statOwners[fields[0][0]],stats=fields.map(([,name])=>name.replace(`${owner}の`,''));return `${owner}の${stats.join('と')}の更新について`;}
const isInitialStat=id=>Number($(id).value)===Number(defaults[id]);
function statProposal(id,name,delta,formula){const current=Number($(id).value);if(isInitialStat(id)||!Number.isFinite(current)||!Number.isFinite(delta)||!delta)return null;const next=Math.round(current+delta);if(next<=0||next===current)return null;const difference=next-Math.round(current);if(!difference)return null;const expression=`${formula||formulaText(Math.abs(delta))}=${statText(Math.abs(difference))}`;const wording=`${name}を今より${expression}${difference>0?'高い':'低い'}${statText(next)}にする`;return {id,name,delta,formula:formula||formulaText(Math.abs(delta)),next,description:wording,text:`入力済みの${wording.replace(/にする$/,'に変更しますか？')}`};}
function settingChangeNotice(id,before,after){
 const refinement={homa:'護摩の杖の精錬ランク',cR:'祭星者の眺めの精錬ランク',fR:'聖顕の鍵の精錬ランク',nR:'塵と光の七つの誓約の精錬ランク'};
 let label=refinement[id],proposals=[],manual='';
 if(id==='homa'){
  const base=HUTAO_DATA.levels[after.level].hp,hpDelta=base*(HUTAO_DATA.homa[after.homa-1].hp-HUTAO_DATA.homa[before.homa-1].hp)/100;
  const hpOld=Number($('hp').value)-(after.hpHydroResonanceIncluded==='yes'?base*.25:0)+(after.atkHydroResonanceIncluded==='yes'?base*.25:0),hpNew=hpOld+(isInitialStat('hp')?0:hpDelta);
  const rate=state=>state.atkHpCondition==='atLeast50'?HUTAO_DATA.homaAbove50[state.homa-1]:HUTAO_DATA.homa[state.homa-1].atk;
  const oldHpRate=HUTAO_DATA.homa[before.homa-1].hp,newHpRate=HUTAO_DATA.homa[after.homa-1].hp;
  const oldHoma=hpOld*rate(before),newHoma=hpNew*rate(after);
  const hpFormula=`${formulaText(base)}×(${Math.max(oldHpRate,newHpRate)}%-${Math.min(oldHpRate,newHpRate)}%)`;
  const atkFormula=newHoma>=oldHoma?`${formulaText(hpNew)}×${formulaRate(rate(after)*100)}%-${formulaText(hpOld)}×${formulaRate(rate(before)*100)}%`:`${formulaText(hpOld)}×${formulaRate(rate(before)*100)}%-${formulaText(hpNew)}×${formulaRate(rate(after)*100)}%`;
  proposals=[statProposal('hp','胡桃のHP上限',hpDelta,hpFormula),statProposal('atk','胡桃の攻撃力',newHoma-oldHoma,atkFormula)].filter(Boolean);
 }else if(id==='cR'&&after.cWeapon)proposals=[statProposal('cEm','シトラリの元素熟知',(after.cR-before.cR)*25,`${Math.max(after.cR,before.cR)*25+75}-${Math.min(after.cR,before.cR)*25+75}`)].filter(Boolean);
 else if(id==='fR'&&after.fWeapon)proposals=[statProposal('fHp','フリーナのHP上限',HUTAO_DATA.furinaLevels[after.fLevel]*(after.fR-before.fR)*.05,`${formulaText(HUTAO_DATA.furinaLevels[after.fLevel])}×(${Math.max(after.fR,before.fR)*5+15}%-${Math.min(after.fR,before.fR)*5+15}%)`)].filter(Boolean);
 else if(id==='nR'&&after.nWeapon)proposals=[statProposal('nAtk','ニコの攻撃力',after.nBaseAtk*(after.nR-before.nR)*.03,`${formulaText(after.nBaseAtk)}×(${Math.max(after.nR,before.nR)*3+9}%-${Math.min(after.nR,before.nR)*3+9}%)`)].filter(Boolean);
 const reminders={level:['胡桃のレベル',[['hp','HP上限'],['atk','攻撃力']]],fLevel:['フリーナのレベル',[['fHp','HP上限']]],xLevel:['シロネンのレベル',[['xDef','防御力']]],cSet:['シトラリの聖遺物',[['cEm','元素熟知']]],xSet:['シロネンの聖遺物',[['xDef','防御力']]],cWeapon:['祭星者の眺めの装備',[['cEm','元素熟知']]],nWeapon:['塵と光の七つの誓約の装備',[['nBaseAtk','基礎攻撃力'],['nAtk','攻撃力']]],xWeapon:['岩峰を巡る歌の装備',[['xDef','防御力']]]};
 let manualFields=[];
 if(reminders[id]){const [name,fields]=reminders[id];manualFields=fields.filter(([key])=>!isInitialStat(key));if(manualFields.length)manual=`${name}を変更しました。入力済みの${manualFields.map(([,stat])=>stat).join('と')}も合わせて変更してください。`;}
 if(manual){showStatPrompt(statUpdateTitle(manualFields),manual,false);return;}
 if(!proposals.length)return;
 const lead=`${label}を${before[id]}から${after[id]}に変更しました。`;
 const updates=proposals.map(p=>[p.id,p.next]);
 const title=statUpdateTitle(proposals.map(p=>[p.id,p.name]));
 if(proposals.length>1)showStatPrompt(title,`${lead}ステータスを次のように変更しますか？`,true,updates,proposals.map(p=>p.description));
 else showStatPrompt(title,lead+proposals[0].text,true,updates);
}
function trackSettingChange(event){
 const target=event.target;
 const id=target.id;
 if(!trackedSettings.has(id)){previousSettings=read();return;}
 const before=previousSettings||read(),after=read();previousSettings=after;
 if(before[id]!==after[id])settingChangeNotice(id,before,after);
}
const previousNumericValues=new WeakMap();
$('calculator-form').addEventListener('focusin',event=>{const input=event.target;if(input instanceof HTMLInputElement&&input.type==='number')previousNumericValues.set(input,input.value);});
$('calculator-form').addEventListener('change',event=>{
 const input=event.target;if(!(input instanceof HTMLInputElement)||input.type!=='number'||input.validity.badInput)return;
 if(input.value.trim()==='')input.value=previousNumericValues.get(input)??input.defaultValue;
 const value=Number(input.value);if(input.value.trim()===''||!Number.isFinite(value))return;
 const min=input.min===''?-Infinity:Number(input.min),max=input.max===''?Infinity:Number(input.max);
 const rounded=input.step==='1'?Math.round(value):value;
 input.value=String(Math.min(max,Math.max(min,rounded)));
 previousNumericValues.set(input,input.value);
},true);
$('calculator-form').addEventListener('input',swapSelectedSupport,true);$('calculator-form').addEventListener('change',swapSelectedSupport,true);
$('calculator-form').addEventListener('input',handleFormEdit);$('calculator-form').addEventListener('change',trackSettingChange);$('calculator-form').addEventListener('change',handleFormEdit);$('calculator-form').addEventListener('submit',event=>event.preventDefault());
$('analysis-content').addEventListener('input',event=>{if(event.target.dataset.actualControl!=='yelanStep')return;const step=Math.min(15,Math.max(0,Number(event.target.value)||0)),value=step===0?0:1+3.5*(step-1),a=ANALYSIS_CONTENT.actual,shown=step===0?`0%（${a.inactive}）`:`${Number.isInteger(value)?value:value.toFixed(1)}%（${step-1}${a.secondsAfter}）`,output=event.target.closest('label')?.querySelector('[data-yelan-output]');if(output)output.textContent=shown;event.target.setAttribute('aria-valuetext',shown);});
$('analysis-content').addEventListener('change',event=>{if(!current||!event.target.matches('[data-analysis-include-atk]'))return;if(event.target.dataset.analysisIncludeAtk==='potential')potentialIncludeAtk=event.target.checked;else scoreIncludeAtk=event.target.checked;saveAnalysisState();renderAnalysis();});
$('analysis-content').addEventListener('input',event=>{if(event.target.dataset.memoryControl==='label')damageRecordDraftLabel=event.target.value.slice(0,60);else if(event.target.dataset.analysisDelta&&event.target.value.trim()!==''&&Number.isFinite(Number(event.target.value)))analysisDeltas[event.target.dataset.analysisDelta]=Math.max(0,Number(event.target.value));else return;saveAnalysisState();});
$('analysis-content').addEventListener('change',event=>{if(!current)return;const key=event.target.dataset.analysisDelta,actual=event.target.dataset.actualControl,dps=event.target.dataset.dpsControl;if(key)analysisDeltas[key]=Math.max(0,Number(event.target.value)||0);if(actual){if(actual==='critical'||actual==='includeFlat')actualSettings[actual]=event.target.value==='1';else if(actual==='yelanStep'){const step=Math.min(15,Math.max(0,Number(event.target.value)||0));actualSettings.yelanBuff=step===0?0:1+3.5*(step-1);}else actualSettings[actual]=event.target.value;}if(dps)dpsSettings[dps]=dps==='ratio'?Math.min(100,Math.max(.01,Number(event.target.value)||.01)):Math.max(.01,Number(event.target.value)||.01);if(event.target.dataset.memoryControl==='baseline')damageBaselineId=event.target.value;if(event.target.dataset.memoryControl==='saved-label'){const record=damageRecords.find(item=>item.id===event.target.dataset.memoryId);if(record){record.label=event.target.value.trim()||ANALYSIS_CONTENT.memory.unnamed;clearExportedSettingsCode();}}if(key||actual||dps||event.target.dataset.memoryControl){saveAnalysisState();renderAnalysis();}});
const refreshDamageRecords=()=>{clearExportedSettingsCode();saveAnalysisState();renderAnalysis();};
const moveDamageRecord=(id,targetId,after=false)=>{const from=damageRecords.findIndex(record=>record.id===id),target=damageRecords.findIndex(record=>record.id===targetId);if(from<0||target<0||from===target)return false;const [record]=damageRecords.splice(from,1);let insert=damageRecords.findIndex(item=>item.id===targetId)+(after?1:0);damageRecords.splice(insert,0,record);return true;};
$('analysis-content').addEventListener('click',event=>{const button=event.target.closest('[data-memory-action]');if(!button||!current)return;const action=button.dataset.memoryAction;if(action==='save'){const label=$('analysis-content').querySelector('[data-memory-control="label"]').value.trim()||`${ANALYSIS_CONTENT.memory.defaultRecord} ${damageRecords.length+1}`;damageRecords.push({id:`damage-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,label,total:current.result.total});damageRecords=damageRecords.slice(-30);damageRecordDraftLabel='';refreshDamageRecords();const savedButton=$('analysis-content').querySelector('[data-memory-action="save"]');if(savedButton)savedButton.textContent=memoryContent.saved;clearTimeout(damageRecordFeedbackTimer);damageRecordFeedbackTimer=setTimeout(()=>{const currentButton=$('analysis-content').querySelector('[data-memory-action="save"]');if(currentButton)currentButton.textContent=memoryContent.save;},1200);return;}if(action==='remove'){damageRecords=damageRecords.filter(record=>record.id!==button.dataset.memoryId);if(damageBaselineId===button.dataset.memoryId)damageBaselineId='current';}refreshDamageRecords();});
let draggedDamageRecordId='';
$('analysis-content').addEventListener('dragstart',event=>{const handle=event.target.closest('[data-memory-drag]');if(!handle)return;draggedDamageRecordId=handle.dataset.memoryDrag;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',draggedDamageRecordId);handle.closest('.memory-row')?.classList.add('is-dragging');});
$('analysis-content').addEventListener('dragover',event=>{const row=event.target.closest('[data-memory-row]');if(!row||row.dataset.memoryRow===draggedDamageRecordId)return;event.preventDefault();event.dataTransfer.dropEffect='move';document.querySelectorAll('.memory-row.is-drag-over').forEach(item=>item.classList.remove('is-drag-over'));row.classList.add('is-drag-over');});
$('analysis-content').addEventListener('drop',event=>{const row=event.target.closest('[data-memory-row]');if(!row||!draggedDamageRecordId)return;event.preventDefault();const after=event.clientY>row.getBoundingClientRect().top+row.getBoundingClientRect().height/2;if(moveDamageRecord(draggedDamageRecordId,row.dataset.memoryRow,after))refreshDamageRecords();draggedDamageRecordId='';});
$('analysis-content').addEventListener('dragend',()=>{draggedDamageRecordId='';document.querySelectorAll('.memory-row.is-dragging,.memory-row.is-drag-over').forEach(item=>item.classList.remove('is-dragging','is-drag-over'));});
let pointerDamageDrag=null;
$('analysis-content').addEventListener('pointerdown',event=>{const handle=event.target.closest('[data-memory-drag]');if(!handle)return;pointerDamageDrag={id:handle.dataset.memoryDrag,startY:event.clientY,targetId:'',after:false};handle.setPointerCapture?.(event.pointerId);});
$('analysis-content').addEventListener('pointermove',event=>{if(!pointerDamageDrag||Math.abs(event.clientY-pointerDamageDrag.startY)<5)return;event.preventDefault();const row=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-memory-row]');document.querySelectorAll('.memory-row.is-drag-over').forEach(item=>item.classList.remove('is-drag-over'));event.target.closest('.memory-row')?.classList.add('is-dragging');if(!row||row.dataset.memoryRow===pointerDamageDrag.id)return;const rect=row.getBoundingClientRect();pointerDamageDrag.targetId=row.dataset.memoryRow;pointerDamageDrag.after=event.clientY>rect.top+rect.height/2;row.classList.add('is-drag-over');});
$('analysis-content').addEventListener('pointerup',()=>{if(!pointerDamageDrag)return;const {id,targetId,after}=pointerDamageDrag;pointerDamageDrag=null;if(targetId&&moveDamageRecord(id,targetId,after)){refreshDamageRecords();return;}document.querySelectorAll('.memory-row.is-dragging,.memory-row.is-drag-over').forEach(item=>item.classList.remove('is-dragging','is-drag-over'));});
$('analysis-content').addEventListener('keydown',event=>{const handle=event.target.closest('[data-memory-drag]');if(!handle||!['ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const index=damageRecords.findIndex(record=>record.id===handle.dataset.memoryDrag),target=index+(event.key==='ArrowUp'?-1:1);if(target<0||target>=damageRecords.length)return;const focusId=handle.dataset.memoryDrag;[damageRecords[index],damageRecords[target]]=[damageRecords[target],damageRecords[index]];refreshDamageRecords();queueMicrotask(()=>$('analysis-content').querySelector(`[data-memory-drag="${focusId}"]`)?.focus());});
const confirmDialog=document.createElement('dialog');confirmDialog.className='settings-dialog card-basic';confirmDialog.id='action-confirm-dialog';confirmDialog.setAttribute('aria-labelledby','action-confirm-title');
confirmDialog.innerHTML=`<h3 id="action-confirm-title"></h3><p id="action-confirm-message" class="text-standard"></p><div class="settings-dialog-actions"><button type="button" data-confirm-action>${CONTENT.page.actions.confirmAction}</button><button type="button" data-cancel-action class="text-muted-action">${CONTENT.page.actions.cancelAction}</button></div>`;
document.body.append(confirmDialog);
confirmDialog.querySelector('[data-confirm-action]').addEventListener('click',()=>confirmDialog.close('confirm'));
confirmDialog.querySelector('[data-cancel-action]').addEventListener('click',()=>confirmDialog.close('cancel'));
function confirmAction(title,message){$('action-confirm-title').textContent=title;$('action-confirm-message').textContent=message;confirmDialog.returnValue='';confirmDialog.showModal();return new Promise(resolve=>confirmDialog.addEventListener('close',()=>resolve(confirmDialog.returnValue==='confirm'),{once:true}));}
$('reset-inputs').addEventListener('click',async()=>{if(!await confirmAction(CONTENT.page.actions.resetConfirmTitle,CONTENT.page.actions.resetConfirm))return;for(const d of definitions){if(d.check)$(d.id).checked=defaults[d.id];else $(d.id).value=d.slider?d.options.findIndex(o=>(Array.isArray(o)?o[0]:o)===defaults[d.id]):defaults[d.id];}dpsSettings.ratio=80;dpsSettings.seconds=20;saveAnalysisState();clearExportedSettingsCode();render(true);previousSettings=read();});
document.querySelectorAll('.preset-buttons [data-prob]').forEach(button=>button.addEventListener('click',()=>{$('prob').value=button.dataset.prob;$('amp').value=button.dataset.amp;clearExportedSettingsCode();render();}));
$('export-settings')?.addEventListener('click',()=>{
 if(!current)return;
 const inputs=Object.fromEntries(definitions.map(definition=>[definition.id,current.inputs[definition.id]]));
 $('export-settings-code').value=SettingsTransfer.createCode(inputs,damageRecords,dpsSettings);
 $('export-settings-status').textContent='';$('export-settings-dialog').showModal();$('export-settings-title').focus();
});
$('copy-settings-code')?.addEventListener('click',async()=>{
 const textarea=$('export-settings-code');if(!textarea.value.trim())return;
 const status=$('export-settings-status');try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(textarea.value);else{textarea.select();if(!document.execCommand('copy'))throw new Error();}status.textContent='設定コードをコピーしました。';}
 catch{textarea.select();status.textContent='自動でコピーできませんでした。選択された設定コードを手動でコピーしてください。';}
});
$('import-settings')?.addEventListener('click',()=>{$('import-settings-code').value='';$('import-settings-status').textContent='';$('import-settings-dialog').showModal();$('import-settings-code').focus();});
$('restore-settings')?.addEventListener('click',async()=>{
 const status=$('import-settings-status');let restored;
 try{restored=SettingsTransfer.parseCode($('import-settings-code').value,definitions);}catch(error){status.textContent=error.message;return;}
 if(!await confirmAction(CONTENT.page.actions.transfer.restoreConfirmTitle,CONTENT.page.actions.transfer.restoreConfirm.replace('{count}',restored.damageRecords.length)))return;
 for(const definition of definitions){const value=restored.inputs[definition.id],element=$(definition.id);if(definition.check)element.checked=value;else if(definition.slider)element.value=definition.options.findIndex(option=>(Array.isArray(option)?option[0]:option)===value);else element.value=value;}
 Object.assign(dpsSettings,restored.dpsSettings);
 damageRecords=restored.damageRecords.map((record,index)=>({id:`damage-${Date.now()}-${index}`,label:record.label.trim()||ANALYSIS_CONTENT.memory.unnamed,total:record.total}));
 damageBaselineId='current';saveAnalysisState();render(true);previousSettings=read();$('import-settings-code').value='';$('import-settings-dialog').close();$('settings-transfer-status').textContent=`入力内容、ダメージ比較記録${damageRecords.length}件、DPS設定を復元しました。`;
});
document.querySelectorAll('[data-close-settings-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
document.querySelectorAll('.settings-dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(dialog===adjustmentDialog||event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}));
render();
previousSettings=read();
// Feature-detected: the calculator also works in browsers without WebMCP.
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 const register=tool=>{try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
 register({name:'read_hutao_calculation',description:'現在の入力条件と胡桃のローテーション期待ダメージを取得する。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(){if(!current)throw new Error('入力エラーを修正してください。');return {inputs:current.inputs,total:current.result.total,attack:current.result.atk,hp:current.result.hp,em:current.result.em};}});
 register({name:'set_hutao_reaction',description:'反応の加重割合（%）と倍率を設定し、表示中のダメージを再計算する。',inputSchema:{type:'object',properties:{probability:{type:'number',minimum:0,maximum:100},multiplier:{type:'number',minimum:1.5,maximum:2}},required:['probability','multiplier'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(!input||!Number.isFinite(input.probability)||input.probability<0||input.probability>100||!Number.isFinite(input.multiplier)||input.multiplier<1.5||input.multiplier>2||Object.keys(input).some(k=>!['probability','multiplier'].includes(k)))throw new Error('反応割合は0〜100%、倍率は1.5〜2で指定してください。');if(!current)throw new Error('先に画面の入力エラーを修正してください。');$('prob').value=input.probability;$('amp').value=input.multiplier;render();return {probability:input.probability,multiplier:input.multiplier,total:current.result.total};}});
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}

'use strict';
(function(root){
const FORMAT='hutao-calculator-settings',VERSION=3,MAX_RECORDS=30,MAX_LABEL_LENGTH=60;
const optionValue=option=>Array.isArray(option)?option[0]:option;
const isValidDpsSettings=settings=>settings&&typeof settings==='object'&&!Array.isArray(settings)&&typeof settings.ratio==='number'&&Number.isFinite(settings.ratio)&&settings.ratio>=.01&&settings.ratio<=100&&typeof settings.seconds==='number'&&Number.isFinite(settings.seconds)&&settings.seconds>=.01;
function createCode(inputs,damageRecords,dpsSettings){
 if(!isValidDpsSettings(dpsSettings))throw new Error('DPS設定の値が不正です。');
 const compactRecords=damageRecords.slice(-MAX_RECORDS).map(record=>[String(record.label).slice(0,MAX_LABEL_LENGTH),Math.round(record.total)]);
 return JSON.stringify({format:FORMAT,version:VERSION,inputs,damageRecords:compactRecords,dpsSettings:{ratio:dpsSettings.ratio,seconds:dpsSettings.seconds}});
}
function parseCode(text,definitions){
 let code;
 try{code=JSON.parse(String(text).trim());}catch{throw new Error('設定コードを読み取れません。1行全体をコピーしてください。');}
 if(!code||code.format!==FORMAT||code.version!==VERSION||!code.inputs||typeof code.inputs!=='object'||Array.isArray(code.inputs)||!Array.isArray(code.damageRecords))throw new Error('この計算機に対応した設定コードではありません。');
 if(!isValidDpsSettings(code.dpsSettings))throw new Error('DPS設定の値が不正です。');
 const expectedIds=new Set(definitions.map(definition=>definition.id));
 if(Object.keys(code.inputs).length!==expectedIds.size||Object.keys(code.inputs).some(id=>!expectedIds.has(id)))throw new Error('設定コードの入力項目が現在の計算機と一致しません。');
 const inputs={};
 for(const definition of definitions){
  const {id,check,options,min,max,step}=definition;
  if(!Object.prototype.hasOwnProperty.call(code.inputs,id))throw new Error(`入力項目「${definition.label}」が設定コードにありません。`);
  const value=code.inputs[id];
  if(check){if(typeof value!=='boolean')throw new Error(`入力項目「${definition.label}」の値が不正です。`);}
  else if(options){if(!options.some(option=>optionValue(option)===value))throw new Error(`入力項目「${definition.label}」の値が不正です。`);}
  else if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max||(step===1&&!Number.isInteger(value)))throw new Error(`入力項目「${definition.label}」の値が不正です。`);
  inputs[id]=value;
 }
 if(code.damageRecords.length>MAX_RECORDS)throw new Error(`ダメージ比較記録は${MAX_RECORDS}件まで読み込めます。`);
 const damageRecords=code.damageRecords.map((record,index)=>{
  if(!Array.isArray(record)||record.length!==2||typeof record[0]!=='string'||record[0].length>MAX_LABEL_LENGTH||typeof record[1]!=='number'||!Number.isSafeInteger(record[1])||record[1]<0)throw new Error(`ダメージ比較記録${index+1}件目の内容が不正です。`);
  return {label:record[0],total:record[1]};
 });
 return {inputs,damageRecords,dpsSettings:{ratio:code.dpsSettings.ratio,seconds:code.dpsSettings.seconds}};
}
const api={FORMAT,VERSION,createCode,parseCode};
root.SettingsTransfer=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);

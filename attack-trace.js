(function (root) {
  'use strict';
  const A = (root.SITE_CONTENT || (typeof require !== 'undefined' ? require('./content.js') : {})).page
    .sections.verification.content.attack;
  function attackCalculation(s, r) {
    const number = (v) => v.toLocaleString('ja-JP', { maximumSignificantDigits: 7 });
    const result = (v) =>
      `${Math.abs(v - Number(v.toPrecision(7))) > Math.max(1, Math.abs(v)) * 1e-14 ? '≈ ' : '＝ '}${number(v)}`;
    const formula = (text) => `<p class="calculation-formula card-result text-secondary">${text}</p>`;
    if (r.inputConversion) {
      return `<details class="attack-calculation"><summary>${A.title}</summary><div class="calculation-steps"><article>${formula(`<strong class="text-secondary">${A.homa}</strong><br>${A.homaAtLeast50}<br>＝ ${number(r.hp)} × ${number(r.homaRate * 100)}% − ${number(r.convertedInputs.hp)} × ${number(r.homaAtLeast50Rate * 100)}% ${result(r.homaDelta)}<br><br><strong class="text-secondary">${A.skill}</strong><br>${A.beforeCap}<br>＝ ${number(r.hp)} × ${number(r.skillRate * 100)}% ${result(r.skillRaw)}<br>${A.cap}<br>＝ ${number(r.baseAtk)} × 400% ${result(r.skillCap)}<br><br><strong class="text-secondary">${A.hutao}</strong><br>${A.hutaoConvertedFormula}<br>＝ ${number(r.convertedInputs.atk)} ＋ ${number(r.homaDelta)} ＋ ${number(r.skill)} ${result(r.attackBeforeBuffs)}`)}</article></div></details>`;
    }
    return `<details class="attack-calculation"><summary>${A.title}</summary><div class="calculation-steps"><article>${formula(
      `<strong class="text-secondary">${A.inputType}</strong><br>${r.atkHpCondition === 'below50' ? A.inputTypes.below50 : r.atkHpCondition === 'atLeast50' ? A.inputTypes.atLeast50 : A.inputTypes.legacy}<br><br><strong class="text-secondary">${A.homa}</strong><br>${r.atkHpCondition === 'below50' ? `${A.homaBelow50}<br>＝ ${number(r.hp)} × ${number(r.homaRate * 100)}% − ${number(r.homaInputIncluded)}` : r.atkHpCondition === 'atLeast50' ? `${A.homaAtLeast50}<br>＝ ${number(r.hp)} × ${number(r.homaRate * 100)}% − ${number(s.hp)} × ${number(r.homaAtLeast50Rate * 100)}%` : `${A.homaLegacy}<br>＝（${number(r.hp)} − ${number(s.hp)}）× ${number(r.homaRate * 100)}%`} ${result(r.homaDelta)}<br><br><strong class="text-secondary">${A.skill}</strong><br>${A.beforeCap}<br>＝ ${number(r.hp)} × ${number(r.skillRate * 100)}% ${result(r.skillRaw)}<br>${A.cap}<br>＝ ${number(r.baseAtk)} × 400% ${result(r.skillCap)}<br><br><strong class="text-secondary">${A.hutao}</strong><br>${A.hutaoFormula}<br>＝ ${number(s.atk)} ＋ ${number(r.homaDelta)} ＋ ${number(r.skill)} ${result(r.attackBeforeBuffs)}`
    )}</article></div></details>`;
  }
  root.attackCalculation = attackCalculation;
  if (typeof module !== 'undefined') module.exports = attackCalculation;
})(globalThis);

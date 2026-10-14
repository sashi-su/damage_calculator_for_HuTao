'use strict';
(function (root) {
  // Stable group and field order for settings-code version 6.
  const GROUPS = Object.freeze(Object.fromEntries(Object.entries({
    custom: ['customHp', 'customHpTeam', 'customAtkFlat', 'customAtkFlatTeam', 'customAtkPct', 'customAtkPctTeam', 'customEm', 'customEmTeam', 'customCr', 'customCd', 'bonus', 'reactionBonus', 'otherFlat', 'otherCount', 'def', 'ignore', 'shred'],
    hutao: ['level', 'homa', 'constellation', 'c6Rate', 'hp', 'hpHydroResonanceIncluded', 'atk', 'atkHpCondition', 'atkHydroResonanceIncluded', 'atkPyroResonanceIncluded', 'em', 'cr', 'cd', 'gobletMain'],
    yelan: ['yC', 'yBuff', 'yWeapon', 'yR', 'yStacks'],
    citlali: ['cC', 'cEm', 'cEmConstellation2Included', 'cCount', 'cSet', 'cWeapon', 'cR', 'cAfterElegy', 'cAfterKey'],
    furina: ['fLevel', 'fC', 'fHp', 'fHpHydroResonanceIncluded', 'fR', 'fWeapon', 'fAfterYelan', 'fAfterXilonen'],
    nico: ['nLevel', 'nC', 'nWeaponBaseAtk', 'nAtk', 'nAtkPyroResonanceIncluded', 'nAfterElegy', 'nAfterXilonen', 'nWeapon', 'nR', 'nSet'],
    xilonen: ['xLevel', 'xC', 'xDef', 'xWeapon', 'xR', 'xSet']
  }).map(([group, ids]) => [group, Object.freeze(ids)])));
  const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  function migrateNicoInputs(source) {
    if (!object(source) || !own(source, 'nBaseAtk')) return source;
    if (typeof source.nBaseAtk !== 'number' || !Number.isFinite(source.nBaseAtk) || source.nBaseAtk < 1 || source.nBaseAtk > 10000000)
      throw new Error('旧設定のニコの基礎攻撃力が不正です。');
    const D = root.HUTAO_DATA || require('./data.js'), result = { ...source };
    const levels = own(result, 'nLevel') ? [result.nLevel] : Object.keys(D.nicoLevels).map(Number).sort((a, b) => a - b);
    const weapons = result.nWeapon === true ? ['741'] : own(result, 'nWeaponBaseAtk')
      ? [result.nWeaponBaseAtk] : Object.keys(D.nicoWeaponBaseAtk).sort((a, b) => Number(a) - Number(b));
    let best = null;
    for (const level of levels) for (const weapon of weapons) {
      const weaponAtk = result.nWeapon === true ? D.nicoWeapon.baseAtk : D.nicoWeaponBaseAtk[weapon];
      const difference = Math.abs(D.nicoLevels[level] + weaponAtk - result.nBaseAtk);
      // 1e-9以内の差は浮動小数点の誤差として扱い、低レベル・小さい武器選択肢を優先する。
      if (!best || difference < best.difference - 1e-9) best = { level, weapon, difference };
    }
    if (!own(result, 'nLevel')) result.nLevel = best.level;
    if (!own(result, 'nWeaponBaseAtk')) result.nWeaponBaseAtk = best.weapon;
    delete result.nBaseAtk;
    return result;
  }
  const pick = (inputs, ids) => Object.fromEntries(ids.map((id) => [id, inputs[id]]));
  const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('ja', { granularity: 'grapheme' }) : null;
  const characters = (name) => segmenter ? Array.from(segmenter.segment(name), (part) => part.segment) : Array.from(name);
  const defaultName = (index) =>
    (root.SITE_CONTENT || require('./content.js')).page.sections.other.presetNames.labels[index];
  const limitName = (name) => characters(name).slice(0, 10).join('');
  const normalizeName = (name, index) => limitName(name.trim()) || defaultName(index);
  function create(inputs, defaults) {
    return Object.fromEntries(Object.entries(GROUPS).map(([group, ids]) => [group, {
      selected: 0,
      names: [defaultName(0), defaultName(1)],
      values: [pick(inputs, ids), pick(defaults, ids)]
    }]));
  }
  function capture(state, inputs) {
    for (const [group, ids] of Object.entries(GROUPS))
      state[group].values[state[group].selected] = pick(inputs, ids);
  }
  function activeInputs(state, inputs) {
    const result = { ...inputs };
    for (const group of Object.keys(GROUPS)) Object.assign(result, state[group].values[state[group].selected]);
    return result;
  }
  function restoreLegacy(state, inputs) {
    for (const [group, ids] of Object.entries(GROUPS)) {
      state[group].selected = 0;
      state[group].values[0] = pick(inputs, ids);
    }
  }
  function validate(source, definitions) {
    const invalid = () => { throw new Error('プリセットの内容が不正です。'); };
    if (!object(source) || Object.keys(source).length !== Object.keys(GROUPS).length) invalid();
    const result = {};
    for (const [group, ids] of Object.entries(GROUPS)) {
      const entry = source[group];
      if (!object(entry) || Object.keys(entry).length !== 3 || !['selected', 'names', 'values'].every((key) => own(entry, key)) ||
          ![0, 1].includes(entry.selected) || !Array.isArray(entry.names) || entry.names.length !== 2 ||
          entry.names.some((name) => typeof name !== 'string' || characters(name).length > 10) ||
          !Array.isArray(entry.values) || entry.values.length !== 2) invalid();
      const values = entry.values.map((snapshot) => {
        if (group === 'nico') snapshot = migrateNicoInputs(snapshot);
        if (!object(snapshot) || Object.keys(snapshot).length !== ids.length || !ids.every((id) => own(snapshot, id))) invalid();
        for (const id of ids) {
          const definition = definitions.find((item) => item.id === id), value = snapshot[id];
          if (!definition) invalid();
          if (definition.check) {
            if (typeof value !== 'boolean') invalid();
          } else if (definition.options) {
            if (!definition.options.some((option) => (Array.isArray(option) ? option[0] : option) === value)) invalid();
          } else if (typeof value !== 'number' || !Number.isFinite(value) || value < (definition.min ?? 0) ||
                     value > (definition.max ?? 10000000) || (definition.step === 1 && !Number.isInteger(value))) invalid();
        }
        return { ...snapshot };
      });
      result[group] = { selected: entry.selected, names: entry.names.map(normalizeName), values };
    }
    return result;
  }
  const api = { GROUPS, create, capture, activeInputs, restoreLegacy, validate, defaultName, limitName, normalizeName, migrateNicoInputs };
  root.SettingsPresets = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

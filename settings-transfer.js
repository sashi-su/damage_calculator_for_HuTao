'use strict';
(function (root) {
  const FORMAT = 'hutao-calculator-settings',
    VERSION = 4,
    MAX_RECORDS = 30,
    MAX_LABEL_LENGTH = 60,
    MAX_CODE_LENGTH = 100000;
  // Version 4 is a permanent snapshot. Never reorder entries or change these defaults;
  // changing the form's defaults must not change the meaning of an existing code.
  const SCHEMA = Object.freeze(
    [
      ['level', 90],
      ['homa', 1],
      ['constellation', 1],
      ['c6Rate', 0],
      ['hp', 30000],
      ['hpHydroResonanceIncluded', 'no'],
      ['atk', 2000],
      ['atkHpCondition', 'atLeast50'],
      ['atkHydroResonanceIncluded', 'no'],
      ['atkPyroResonanceIncluded', 'no'],
      ['em', 250],
      ['cr', 70],
      ['cd', 240],
      ['gobletMain', 'pyro'],
      ['yC', 2],
      ['yBuff', 30],
      ['yWeapon', true],
      ['yR', 1],
      ['yStacks', 4],
      ['cC', 2],
      ['cEm', 1250],
      ['cEmConstellation2Included', 'no'],
      ['cCount', 10],
      ['cSet', 'scroll'],
      ['cWeapon', true],
      ['cR', 1],
      ['cAfterElegy', true],
      ['cAfterKey', true],
      ['fLevel', 90],
      ['fC', 2],
      ['fHp', 50000],
      ['fHpHydroResonanceIncluded', 'no'],
      ['fR', 1],
      ['fWeapon', true],
      ['fAfterYelan', true],
      ['fAfterXilonen', false],
      ['nC', 2],
      ['nBaseAtk', 1083],
      ['nAtk', 4000],
      ['nAtkPyroResonanceIncluded', 'no'],
      ['nAfterElegy', false],
      ['nAfterXilonen', false],
      ['nWeapon', true],
      ['nR', 1],
      ['nSet', true],
      ['xLevel', 90],
      ['xC', 2],
      ['xDef', 4000],
      ['xWeapon', true],
      ['xR', 1],
      ['xSet', 'scroll'],
      ['prob', 74.86],
      ['amp', 1.701],
      ['enemy', 100],
      ['res', 10],
      ['customHp', 0],
      ['customHpTeam', false],
      ['customAtkFlat', 0],
      ['customAtkFlatTeam', false],
      ['customAtkPct', 0],
      ['customAtkPctTeam', false],
      ['customEm', 0],
      ['customEmTeam', false],
      ['customCr', 0],
      ['customCd', 0],
      ['bonus', 0],
      ['reactionBonus', 0],
      ['otherFlat', 0],
      ['otherCount', 0],
      ['def', 0],
      ['ignore', 0],
      ['shred', 0],
      ['supportSlot1', 'yelan'],
      ['supportSlot2', 'citlali'],
      ['supportSlot3', 'nico'],
      ['dpsRatio', 80],
      ['dpsSeconds', 20]
    ].map((entry) => Object.freeze(entry))
  );
  const INPUT_SCHEMA = SCHEMA.slice(0, -2),
    DEFAULTS = Object.freeze(Object.fromEntries(INPUT_SCHEMA));
  const PARTS = Object.freeze(['flower', 'plume', 'sand', 'goblet', 'circlet']),
    PREFIXES = Object.freeze(['f', 'p', 's', 'g', 'c']);
  const MAINS = Object.freeze([
    'hp',
    'atk',
    'hpPct',
    'atkPct',
    'defPct',
    'em',
    'er',
    'pyro',
    'hydro',
    'cryo',
    'electro',
    'anemo',
    'geo',
    'dendro',
    'physical',
    'cr',
    'cd',
    'healing',
    'other'
  ]);
  const SUBS = Object.freeze(['', 'hp', 'hpPct', 'atk', 'atkPct', 'em', 'cr', 'cd']);
  const optionValue = (option) => (Array.isArray(option) ? option[0] : option);
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const optimizer = () =>
    root.ArtifactOptimizer || (typeof require === 'function' ? require('./artifact-optimizer.js') : null);
  const invalid = () => {
    throw new Error('この計算機に対応した設定コードではありません。');
  };
  const inventoryError = () => {
    throw new Error('設定コードの聖遺物一覧の内容が不正です。');
  };
  const isValidDpsSettings = (settings) =>
    object(settings) &&
    typeof settings.ratio === 'number' &&
    Number.isFinite(settings.ratio) &&
    settings.ratio >= 0.01 &&
    settings.ratio <= 100 &&
    typeof settings.seconds === 'number' &&
    Number.isFinite(settings.seconds) &&
    settings.seconds >= 0.01;
  function validateInputs(source, definitions) {
    const ids = new Set(definitions.map((definition) => definition.id));
    if (
      !object(source) ||
      Object.keys(source).length !== ids.size ||
      Object.keys(source).some((id) => !ids.has(id))
    )
      throw new Error('設定コードの入力項目が現在の計算機と一致しません。');
    const inputs = {};
    for (const definition of definitions) {
      const { id, check, options, min, max, step } = definition,
        value = source[id];
      if (!own(source, id)) throw new Error(`入力項目「${definition.label}」が設定コードにありません。`);
      if (check) {
        if (typeof value !== 'boolean') throw new Error(`入力項目「${definition.label}」の値が不正です。`);
      } else if (options) {
        if (!options.some((option) => optionValue(option) === value))
          throw new Error(`入力項目「${definition.label}」の値が不正です。`);
      } else if (
        typeof value !== 'number' ||
        !Number.isFinite(value) ||
        value < (min ?? 0) ||
        value > (max ?? 10000000) ||
        (step === 1 && !Number.isInteger(value))
      )
        throw new Error(`入力項目「${definition.label}」の値が不正です。`);
      inputs[id] = value;
    }
    return inputs;
  }
  function validateRecords(records) {
    if (!Array.isArray(records)) invalid();
    if (records.length > MAX_RECORDS) throw new Error(`ダメージ比較記録は${MAX_RECORDS}件まで読み込めます。`);
    return records.map((record, index) => {
      if (
        !Array.isArray(record) ||
        record.length !== 2 ||
        typeof record[0] !== 'string' ||
        record[0].length > MAX_LABEL_LENGTH ||
        !Number.isSafeInteger(record[1]) ||
        record[1] < 0
      )
        throw new Error(`ダメージ比較記録${index + 1}件目の内容が不正です。`);
      return { label: record[0], total: record[1] };
    });
  }
  function encode(value, initial) {
    if (typeof initial === 'boolean') {
      if (typeof value !== 'boolean') invalid();
      return Number(value);
    }
    if (initial === 'yes' || initial === 'no') {
      if (value !== 'yes' && value !== 'no') invalid();
      return value === 'yes' ? 1 : 0;
    }
    if (typeof value !== typeof initial || (typeof value === 'number' && !Number.isFinite(value))) invalid();
    return value;
  }
  function decode(value, initial) {
    if (typeof initial === 'boolean' || initial === 'yes' || initial === 'no') {
      if (value !== 0 && value !== 1) invalid();
      return typeof initial === 'boolean' ? value === 1 : value === 1 ? 'yes' : 'no';
    }
    if (typeof value !== typeof initial || (typeof value === 'number' && !Number.isFinite(value))) invalid();
    return value;
  }
  function packInventory(inventory) {
    const O = optimizer();
    if (!O || !object(inventory) || !object(inventory.items) || !object(inventory.next)) inventoryError();
    if (Object.keys(inventory.items).length !== 5 || Object.keys(inventory.next).length !== 5)
      inventoryError();
    return PARTS.map((part, index) => {
      const items = inventory.items[part],
        next = inventory.next[part],
        ids = new Set();
      let maxId = 0;
      if (!Array.isArray(items) || items.length > 10 || !Number.isSafeInteger(next) || next < 1)
        inventoryError();
      const rows = items.map((item) => {
        const match = new RegExp('^' + PREFIXES[index] + '([1-9][0-9]*)$').exec(item?.id),
          id = match ? Number(match[1]) : 0;
        if (
          !Number.isSafeInteger(id) ||
          id < 1 ||
          ids.has(id) ||
          item.part !== part ||
          O.validateArtifact(item).length ||
          !Array.isArray(item.subs)
        )
          inventoryError();
        ids.add(id);
        maxId = Math.max(maxId, id);
        const main = MAINS.indexOf(item.main);
        if (main < 0) inventoryError();
        return [
          id,
          item.set === 'other' ? 1 : 0,
          main,
          ...item.subs.flatMap((sub) => {
            const type = SUBS.indexOf(sub.type);
            if (type < 0) inventoryError();
            if (!type) {
              if (sub.value !== '') inventoryError();
              return [0, ''];
            }
            if (typeof sub.value !== 'number' || !Number.isFinite(sub.value) || sub.value < 0)
              inventoryError();
            return [type, sub.value];
          })
        ];
      });
      if (next <= maxId) inventoryError();
      return [next, ...rows];
    });
  }
  function unpackInventory(groups) {
    if (!Array.isArray(groups) || groups.length !== 5) inventoryError();
    const inventory = { items: {}, next: {} };
    PARTS.forEach((part, index) => {
      const group = groups[index];
      if (!Array.isArray(group) || group.length < 1 || group.length > 11) inventoryError();
      inventory.next[part] = group[0];
      inventory.items[part] = group.slice(1).map((row) => {
        if (
          !Array.isArray(row) ||
          row.length < 3 ||
          row.length > 11 ||
          row.length % 2 !== 1 ||
          !Number.isSafeInteger(row[0]) ||
          row[0] < 1 ||
          (row[1] !== 0 && row[1] !== 1) ||
          !Number.isInteger(row[2]) ||
          row[2] < 0 ||
          row[2] >= MAINS.length
        )
          inventoryError();
        const subs = [];
        for (let i = 3; i < row.length; i += 2) {
          if (!Number.isInteger(row[i]) || row[i] < 0 || row[i] >= SUBS.length) inventoryError();
          subs.push({ type: SUBS[row[i]], value: row[i + 1] });
        }
        return {
          id: PREFIXES[index] + row[0],
          part,
          set: row[1] === 1 ? 'other' : 'witch',
          main: MAINS[row[2]],
          subs
        };
      });
    });
    // Strict validation: damaged rows must never be silently discarded on import.
    packInventory(inventory);
    return inventory;
  }
  function createCode(inputs, damageRecords, dpsSettings, artifactInventory = optimizer().emptyInventory()) {
    if (
      !object(inputs) ||
      Object.keys(inputs).length !== INPUT_SCHEMA.length ||
      Object.keys(inputs).some((id) => !own(DEFAULTS, id))
    )
      throw new Error('設定コードの入力項目が現在の計算機と一致しません。');
    if (!isValidDpsSettings(dpsSettings)) throw new Error('DPS設定の値が不正です。');
    const indices = [],
      values = [];
    SCHEMA.forEach(([id, initial], index) => {
      const value =
        index < INPUT_SCHEMA.length
          ? inputs[id]
          : id === 'dpsRatio'
            ? dpsSettings.ratio
            : dpsSettings.seconds;
      const encoded = encode(value, initial);
      if (value !== initial) {
        indices.push(index);
        values.push(encoded);
      }
    });
    const records = damageRecords
      .slice(-MAX_RECORDS)
      .map((record) => [String(record.label).slice(0, MAX_LABEL_LENGTH), Math.round(record.total)]);
    validateRecords(records);
    return JSON.stringify({
      v: VERSION,
      s: [indices.length === SCHEMA.length ? 0 : indices, values],
      a: packInventory(artifactInventory),
      r: records
    });
  }
  function parseCompact(code, definitions) {
    if (Object.keys(code).length !== 4 || !['v', 's', 'a', 'r'].every((key) => own(code, key))) invalid();
    const settings = code.s;
    if (
      !Array.isArray(settings) ||
      settings.length !== 2 ||
      !Array.isArray(settings[1]) ||
      settings[1].length > SCHEMA.length
    )
      invalid();
    const indices = settings[0] === 0 ? SCHEMA.map((_, i) => i) : settings[0],
      values = SCHEMA.map(([, initial]) => initial);
    if (
      !Array.isArray(indices) ||
      indices.length !== settings[1].length ||
      indices.some(
        (index, i) =>
          !Number.isInteger(index) ||
          index < 0 ||
          index >= SCHEMA.length ||
          (i > 0 && index <= indices[i - 1])
      )
    )
      invalid();
    indices.forEach((index, i) => (values[index] = decode(settings[1][i], SCHEMA[index][1])));
    const inputs = validateInputs(
      Object.fromEntries(INPUT_SCHEMA.map(([id], index) => [id, values[index]])),
      definitions
    );
    const dpsSettings = { ratio: values[INPUT_SCHEMA.length], seconds: values[INPUT_SCHEMA.length + 1] };
    if (!isValidDpsSettings(dpsSettings)) throw new Error('DPS設定の値が不正です。');
    return {
      inputs,
      damageRecords: validateRecords(code.r),
      dpsSettings,
      artifactInventory: unpackInventory(code.a),
      version: VERSION
    };
  }
  function migrateLegacy(source, version, definitions) {
    const inputs = { ...source };
    const rename = (oldId, id, convert = (value) => value) => {
      if (!own(inputs, oldId)) return;
      const value = convert(inputs[oldId]);
      if (own(inputs, id) && inputs[id] !== value)
        throw new Error('設定コードの旧項目と現在の項目が一致しません。');
      inputs[id] = value;
      delete inputs[oldId];
    };
    if (version <= 2) {
      for (let i = 0; i < 3; i++) rename('slot' + i, 'supportSlot' + (i + 1));
      for (const [oldId, id] of [
        ['hpInputMode', 'hpHydroResonanceIncluded'],
        ['fHpInputMode', 'fHpHydroResonanceIncluded'],
        ['nAtkInputMode', 'nAtkPyroResonanceIncluded'],
        ['cEmInputMode', 'cEmConstellation2Included']
      ])
        rename(oldId, id, (value) => {
          if (!['field', 'buildCard'].includes(value)) invalid();
          return value === 'field' ? 'yes' : 'no';
        });
      rename('atkInputMode', 'atkHpCondition', (value) => {
        if (!['skillPre', 'buildCard'].includes(value)) invalid();
        return value === 'skillPre' ? 'below50' : 'atLeast50';
      });
      rename('atkWaterIncluded', 'atkHydroResonanceIncluded');
      rename('atkFireIncluded', 'atkPyroResonanceIncluded');
      const team = [inputs.supportSlot1, inputs.supportSlot2, inputs.supportSlot3];
      if (!own(inputs, 'atkHydroResonanceIncluded'))
        inputs.atkHydroResonanceIncluded =
          inputs.atkHpCondition === 'below50' && team.includes('yelan') && team.includes('furina')
            ? 'yes'
            : 'no';
      if (!own(inputs, 'atkPyroResonanceIncluded'))
        inputs.atkPyroResonanceIncluded =
          inputs.atkHpCondition === 'below50' && team.includes('nico') ? 'yes' : 'no';
      for (const id of ['xLevel', 'xC', 'xDef', 'xWeapon', 'xR', 'xSet', 'fAfterXilonen', 'nAfterXilonen'])
        if (definitions.some((definition) => definition.id === id) && !own(inputs, id))
          inputs[id] = DEFAULTS[id];
    }
    // Before this selector existed, every code implicitly used a pyro goblet.
    if (definitions.some((definition) => definition.id === 'gobletMain') && !own(inputs, 'gobletMain'))
      inputs.gobletMain = 'pyro';
    return validateInputs(inputs, definitions);
  }
  function parseCode(text, definitions) {
    const source = String(text).trim();
    if (source.length > MAX_CODE_LENGTH) throw new Error('設定コードが長すぎます。');
    let code;
    try {
      code = JSON.parse(source);
    } catch {
      throw new Error('設定コードを読み取れません。1行全体をコピーしてください。');
    }
    if (!object(code)) invalid();
    if (code.v === VERSION) return parseCompact(code, definitions);
    if (code.format !== FORMAT || ![1, 2, 3].includes(code.version) || !object(code.inputs)) invalid();
    const dpsSettings = code.dpsSettings ?? (code.version <= 2 ? { ratio: 80, seconds: 20 } : null);
    if (!isValidDpsSettings(dpsSettings)) throw new Error('DPS設定の値が不正です。');
    return {
      inputs: migrateLegacy(code.inputs, code.version, definitions),
      damageRecords: validateRecords(code.damageRecords ?? (code.version <= 2 ? [] : null)),
      dpsSettings: { ratio: dpsSettings.ratio, seconds: dpsSettings.seconds },
      artifactInventory: null,
      version: code.version
    };
  }
  const api = { FORMAT, VERSION, SCHEMA, DEFAULTS, createCode, parseCode };
  root.SettingsTransfer = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

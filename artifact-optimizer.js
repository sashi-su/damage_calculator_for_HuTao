(function (root) {
  'use strict';
  const D = root.HUTAO_DATA || (typeof require === 'function' ? require('./data.js') : null);
  const calculator =
    root.HutaoCalculator || (typeof require === 'function' ? require('./calculator.js') : null);
  const parts = ['flower', 'plume', 'sand', 'goblet', 'circlet'];
  const prefixes = { flower: 'f', plume: 'p', sand: 's', goblet: 'g', circlet: 'c' };
  const mains = {
    hp: 4780,
    atk: 311,
    hpPct: 46.6,
    atkPct: 46.6,
    defPct: 58.3,
    em: 187,
    er: 51.8,
    pyro: 46.6,
    hydro: 46.6,
    cryo: 46.6,
    electro: 46.6,
    anemo: 46.6,
    geo: 46.6,
    dendro: 46.6,
    physical: 58.3,
    cr: 31.1,
    cd: 62.2,
    healing: 35.9,
    other: 0
  };
  // Keep the former types valid when restoring existing saved artifacts.
  const legacyMainOptions = {
    flower: ['hp'],
    plume: ['atk'],
    sand: ['hpPct', 'atkPct', 'defPct', 'em', 'er'],
    goblet: [
      'hpPct',
      'atkPct',
      'defPct',
      'em',
      'pyro',
      'hydro',
      'cryo',
      'electro',
      'anemo',
      'geo',
      'dendro',
      'physical'
    ],
    circlet: ['hpPct', 'atkPct', 'defPct', 'em', 'cr', 'cd', 'healing']
  };
  const mainOptions = {
    flower: ['hp'],
    plume: ['atk'],
    sand: ['hpPct', 'atkPct', 'em', 'other'],
    goblet: ['hpPct', 'atkPct', 'em', 'pyro', 'other'],
    circlet: ['hpPct', 'atkPct', 'em', 'cr', 'cd', 'other']
  };
  function isOtherMain(type) {
    return [
      'other',
      'defPct',
      'er',
      'hydro',
      'cryo',
      'electro',
      'anemo',
      'geo',
      'dendro',
      'physical',
      'healing'
    ].includes(type);
  }
  const subOptions = ['hp', 'hpPct', 'atk', 'atkPct', 'em', 'cr', 'cd'];
  function validateArtifact(item) {
    const errors = [];
    if (!item || typeof item !== 'object') return [{ field: 'part', code: 'part' }];
    if (!parts.includes(item.part)) errors.push({ field: 'part', code: 'part' });
    if (!['witch', 'other'].includes(item.set)) errors.push({ field: 'set', code: 'set' });
    if (!mainOptions[item.part]?.includes(item.main) && !legacyMainOptions[item.part]?.includes(item.main))
      errors.push({ field: 'main', code: 'main' });
    const used = new Set(),
      subs = Array.isArray(item.subs) ? item.subs : [];
    if (subs.length > 4) errors.push({ field: 'subs', code: 'slots' });
    subs.forEach((sub, index) => {
      if (!sub || typeof sub !== 'object') {
        errors.push({ field: 'sub-' + index, code: 'sub' });
        return;
      }
      const field = 'sub-' + index,
        type = sub.type ?? '',
        raw = sub.value ?? '',
        blank = String(raw).trim() === '';
      if (!type && blank) return;
      if (!type || blank) {
        errors.push({ field, code: 'incomplete' });
        return;
      }
      if (!subOptions.includes(type)) errors.push({ field, code: 'sub' });
      if (!['number', 'string'].includes(typeof raw) || !Number.isFinite(Number(raw)) || Number(raw) < 0)
        errors.push({ field, code: 'value' });
      if (type === item.main) errors.push({ field, code: 'sameMain' });
      if (used.has(type)) errors.push({ field, code: 'duplicate' });
      used.add(type);
    });
    return errors;
  }
  function emptyInventory() {
    return {
      items: Object.fromEntries(parts.map((part) => [part, []])),
      next: Object.fromEntries(parts.map((part) => [part, 1]))
    };
  }
  function normalizeInventory(saved) {
    const result = emptyInventory();
    for (const part of parts) {
      const ids = new Set();
      for (const item of Array.isArray(saved?.items?.[part]) ? saved.items[part] : []) {
        const match = new RegExp('^' + prefixes[part] + '([1-9][0-9]*)$').exec(item?.id);
        if (
          result.items[part].length === 10 ||
          !match ||
          !Number.isSafeInteger(Number(match[1])) ||
          ids.has(item.id) ||
          item.part !== part ||
          validateArtifact(item).length
        )
          continue;
        ids.add(item.id);
        result.items[part].push({
          id: item.id,
          part,
          set: item.set,
          main: item.main,
          subs: (item.subs || []).map((sub) => ({
            type: sub.type || '',
            value: sub.type ? Number(sub.value) : ''
          }))
        });
        result.next[part] = Math.max(result.next[part], Number(match[1]) + 1);
      }
      if (Number.isSafeInteger(saved?.next?.[part]) && saved.next[part] > result.next[part])
        result.next[part] = saved.next[part];
    }
    return result;
  }
  function renumber(inventory) {
    for (const part of parts) {
      inventory.items[part].forEach((item, index) => (item.id = prefixes[part] + (index + 1)));
      inventory.next[part] = inventory.items[part].length + 1;
    }
  }
  function move(inventory, part, id, targetId, after = false) {
    const items = inventory.items[part],
      from = items.findIndex((item) => item.id === id),
      target = items.findIndex((item) => item.id === targetId);
    if (from < 0 || target < 0 || from === target) return false;
    const next = items.slice(),
      [item] = next.splice(from, 1),
      position = next.findIndex((entry) => entry.id === targetId) + (after ? 1 : 0);
    next.splice(position, 0, item);
    if (next.every((entry, index) => entry === items[index])) return false;
    inventory.items[part] = next;
    return true;
  }
  function equippedStats(settings, items) {
    const sum = { hp: 0, hpPct: 0, atk: 0, atkPct: 0, em: 0, cr: 0, cd: 0 };
    const add = (type, value) => {
      if (type in sum) sum[type] += value;
    };
    for (const item of items) {
      add(item.main, mains[item.main]);
      for (const sub of item.subs || []) if (sub.type) add(sub.type, Number(sub.value));
    }
    const base = D.levels[settings.level],
      baseAtk = base.atk + D.weaponAtk,
      hp = base.hp * (1 + (D.homa[settings.homa - 1].hp + sum.hpPct) / 100) + sum.hp;
    return {
      hp,
      atk: baseAtk * (1 + sum.atkPct / 100) + sum.atk + hp * D.homaAbove50[settings.homa - 1],
      em: sum.em,
      cr: 5 + sum.cr,
      cd: 50 + 66.2 + 38.4 + sum.cd,
      gobletMain: items[3].main === 'pyro' ? 'pyro' : 'other',
      hpHydroResonanceIncluded: 'no',
      atkHydroResonanceIncluded: 'no',
      atkPyroResonanceIncluded: 'no',
      atkHpCondition: 'atLeast50'
    };
  }
  function candidateInputs(settings, stats) {
    return {
      ...settings,
      ...stats,
      skill: settings.constellation >= 3 ? 13 : 10,
      burst: settings.constellation >= 5 ? 13 : 10
    };
  }
  function reflectionValues(stats) {
    const result = { ...stats };
    for (const key of ['hp', 'atk', 'em', 'cr', 'cd'])
      result[key] = Number(stats[key].toFixed(['cr', 'cd'].includes(key) ? 2 : 3));
    return result;
  }
  // Prune branches before calculation: no non-witch-4 candidate reaches calculate.
  function* combinations(inventory, index = 0, other = 0, items = []) {
    if (index === parts.length) {
      yield items;
      return;
    }
    for (const item of inventory.items[parts[index]]) {
      const count = other + (item.set === 'other' ? 1 : 0);
      if (count <= 1) yield* combinations(inventory, index + 1, count, [...items, item]);
    }
  }
  function search(settings, inventory, calculate) {
    const leaders = [];
    let calculated = 0;
    const missing = parts.filter((part) => !inventory.items[part].length);
    function accept(items) {
      const stats = equippedStats(settings, items),
        total = calculate(candidateInputs(settings, stats)).total;
      if (!Number.isFinite(total)) throw new Error('nonfinite');
      calculated++;
      // Inserting after equal values keeps the current list's lexicographic order.
      let position = leaders.findIndex((candidate) => candidate.total < total);
      if (position < 0) position = leaders.length;
      if (position < 11) {
        leaders.splice(position, 0, { items, stats, total });
        if (leaders.length > 11) leaders.pop();
      }
    }
    function finish() {
      let rank = 0,
        previous;
      const ranked = leaders.map((candidate, index) => {
        if (candidate.total !== previous) rank = index + 1;
        previous = candidate.total;
        return { ...candidate, rank };
      });
      const eligible = ranked.filter((candidate) => candidate.rank <= 3),
        best = ranked[0]?.total;
      return {
        candidates: eligible.slice(0, 10).map((candidate) => ({
          ...candidate,
          decrease: best === 0 ? 0 : (candidate.total / best - 1) * 100
        })),
        more: eligible.length > 10,
        calculated,
        missing,
        reason: missing.length ? 'missing' : calculated ? '' : 'set'
      };
    }
    return { accept, finish };
  }
  function optimize(settings, inventory, calculate = calculator.calculate) {
    const run = search(settings, inventory, calculate);
    for (const items of combinations(inventory)) run.accept(items);
    return run.finish();
  }
  async function optimizeAsync(
    settings,
    inventory,
    {
      calculate = calculator.calculate,
      yieldFrame = () => new Promise((resolve) => setTimeout(resolve, 0)),
      batchSize = 250
    } = {}
  ) {
    const run = search(settings, inventory, calculate);
    let count = 0;
    for (const items of combinations(inventory)) {
      run.accept(items);
      if (++count % batchSize === 0) await yieldFrame();
    }
    return run.finish();
  }
  const api = {
    parts,
    prefixes,
    mains,
    mainOptions,
    isOtherMain,
    subOptions,
    validateArtifact,
    emptyInventory,
    normalizeInventory,
    renumber,
    move,
    equippedStats,
    candidateInputs,
    reflectionValues,
    optimize,
    optimizeAsync
  };
  root.ArtifactOptimizer = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

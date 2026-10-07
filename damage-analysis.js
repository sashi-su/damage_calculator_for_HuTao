(function (root) {
  'use strict';
  const A = (root.SITE_CONTENT || (typeof require !== 'undefined' ? require('./content.js') : {})).page
    ?.sections?.analysis?.content;
  const colors = { critRate: '#923d47', critDamage: '#3f78a8', hp: '#d6a04b', atk: '#e67e22', em: '#4f8a68' };
  function critDerivatives(r) {
    const baseCritRate = r.baseCritRate / 100,
      critDamage = r.critDamage / 100,
      c6Rate = r.c6Rate / 100;
    const effectiveCritRate = c6Rate + (1 - c6Rate) * baseCritRate,
      critBase = 1 + effectiveCritRate * critDamage;
    return { rate: ((1 - c6Rate) * critDamage) / critBase, damage: effectiveCritRate / critBase };
  }
  function hpDerivative(s, r) {
    const hpRate = (r.skillRaw < r.skillCap ? r.skillRate : 0) + r.homaRate;
    const bloodRate = s.constellation >= 2 ? 0.1 : 0;
    return (r.baseHp * (hpRate * r.T + bloodRate * r.bloodCount)) / (r.atk * r.T + r.totalFlat);
  }
  function atkDerivative(r) {
    return (r.baseAtk * r.T) / (r.atk * r.T + r.totalFlat);
  }
  function damagePotential(s, r, includeAtk = false) {
    const critDerivative = critDerivatives(r);
    const scores = [
      { name: A.metrics.critRate, value: 2 * critDerivative.rate, color: colors.critRate },
      { name: A.metrics.critDamage, value: 4 * critDerivative.damage, color: colors.critDamage },
      { name: A.metrics.hp, value: 3 * hpDerivative(s, r), color: colors.hp },
      ...(includeAtk ? [{ name: A.metrics.atk, value: 3 * atkDerivative(r), color: colors.atk }] : []),
      {
        name: A.metrics.em,
        value: (12 * 100 * 2.78 * 1400 * s.amp * r.reactionProbability) / ((r.em + 1400) ** 2 * r.reaction),
        color: colors.em
      }
    ];
    const total = scores.reduce((sum, item) => sum + Math.max(0, item.value), 0);
    return scores.map((item) => ({ ...item, share: total ? (Math.max(0, item.value) / total) * 100 : 0 }));
  }
  function idealScore(s, r) {
    const { rate: dCritRate, damage: dCritDamage } = critDerivatives(r);
    const dHp = hpDerivative(s, r);
    const dEm = (2.78 * 1400 * s.amp * r.reactionProbability) / ((r.em + 1400) ** 2 * r.reaction);
    return {
      critRate: dCritRate / dCritDamage,
      critDamage: 1,
      hp: dHp / dCritDamage,
      atk: atkDerivative(r) / dCritDamage,
      em: (100 * dEm) / dCritDamage
    };
  }
  function exactDamageGains(s, r, deltas, calculate) {
    const hpIncrease = (r.baseHp * deltas.hp) / 100;
    const variants = {
      cr: { ...s, cr: s.cr + deltas.cr },
      cd: { ...s, cd: s.cd + deltas.cd },
      hp: {
        ...s,
        hp: s.hp + hpIncrease,
        atk: s.atk + hpIncrease * (s.atkHpCondition === 'atLeast50' ? r.homaAtLeast50Rate : r.homaRate)
      },
      atk: { ...s, atk: s.atk + (r.baseAtk * deltas.atk) / 100 },
      em: { ...s, em: s.em + deltas.em }
    };
    return Object.fromEntries(
      Object.entries(variants).map(([key, input]) => {
        const total = calculate(input).total;
        return [key, { total, increase: total - r.total, rate: (total / r.total - 1) * 100 }];
      })
    );
  }
  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]
    );
  const significant = (value, digits) =>
    Number(value).toLocaleString('ja-JP', { maximumSignificantDigits: digits });
  const formatRates = (html, className, digits) =>
    html.replace(
      new RegExp(`(<span class="${className}">[+−-]?)(-?[0-9]+(?:\\.[0-9]+)?)%`, 'g'),
      (_, prefix, value) => `${prefix}${significant(value, digits)}%`
    );
  function renderDamageMemory(currentTotal, records = [], baselineId = 'current', draft = '') {
    const baseline =
      baselineId === 'current'
        ? currentTotal
        : (records.find((record) => record.id === baselineId)?.total ?? currentTotal);
    const m = A.memory,
      rows = [{ id: 'current', label: m.current, total: currentTotal, current: true }, ...records];
    const n = (value) => value.toLocaleString('ja-JP', { maximumFractionDigits: 0 });
    const table = `<section class="memory-card"><h3>${m.title}</h3><p class="text-standard">${m.description}</p><div class="memory-save"><label><span class="text-standard">${m.label}</span><input type="text" maxlength="60" value="${escapeHtml(draft)}" placeholder="${m.placeholder}" data-memory-control="label"></label><strong class="text-standard">${n(currentTotal)}</strong><button type="button" data-memory-action="save">${m.save}</button></div><div class="memory-table table-standard" role="table" aria-label="${m.tableAria}"><div class="memory-head table-standard-header" role="row"><span aria-hidden="true"></span>${m.columns.map((x) => `<span>${x}</span>`).join('')}</div>${rows
      .map((row) => {
        const increase = row.total - baseline,
          rate = baseline ? (increase / baseline) * 100 : 0,
          sign = increase > 0 ? '+' : '';
        return `<div class="memory-row table-standard-row text-secondary${row.current ? ' current' : ''}" role="row"${row.current ? '' : ` data-memory-row="${row.id}"`} >${row.current ? '<span class="memory-drag-placeholder" aria-hidden="true"></span>' : `<button type="button" class="memory-drag-handle" data-memory-drag="${row.id}" aria-label="${escapeHtml(row.label + m.drag)}" title="${m.dragTitle}">⠿</button>`}<label class="memory-base text-secondary"><input type="radio" name="damage-memory-baseline" value="${row.id}" ${baselineId === row.id ? 'checked' : ''} data-memory-control="baseline" aria-label="${escapeHtml(`${row.label}を基準にする`)}"></label>${row.current ? `<strong>${m.current}</strong>` : `<input class="memory-label" type="text" maxlength="60" value="${escapeHtml(row.label)}" data-memory-control="saved-label" data-memory-id="${row.id}" aria-label="${m.savedLabelAria}">`}<span class="memory-total text-secondary">${n(row.total)}</span><span class="memory-increase text-secondary">${sign}${n(increase)}</span><span class="memory-rate text-primary-label">${sign}${rate.toFixed(3)}%</span>${row.current ? '<span></span>' : `<button type="button" class="memory-remove text-muted-action" data-memory-action="remove" data-memory-id="${row.id}" aria-label="${escapeHtml(row.label + m.removeSuffix)}">${m.remove}</button>`}</div>`;
      })
      .join(
        ''
      )}</div>${records.length ? '' : `<p class="memory-empty text-secondary">${m.empty}</p>`}</section>`;
    return formatRates(table, 'memory-rate', 4) + renderDamageMemoryChart(currentTotal, records);
  }
  function renderDamageMemoryChart(currentTotal, records = []) {
    const m = A.memory,
      rows = [{ label: m.current, total: currentTotal }, ...records],
      max = Math.max(...rows.map((row) => row.total), 1),
      n = (value) => value.toLocaleString('ja-JP', { maximumFractionDigits: 0 });
    return `<div class="memory-chart card-result" role="img" aria-label="${m.chartAria}"><h4>${m.chartTitle}</h4>${rows.map((row) => `<div class="memory-chart-row"><span class="text-secondary">${escapeHtml(row.label)}</span><div><i style="width:${Math.max(1, (row.total / max) * 100)}%"></i></div><strong class="text-chart-value">${n(row.total)}</strong></div>`).join('')}</div>`;
  }
  function actualDamages(s, r, settings = {}) {
    const critical = settings.critical !== false,
      reaction = settings.reaction || 'vaporize',
      includeFlat = settings.includeFlat !== false,
      nicoBlessing = settings.nicoBlessing || 'guidance';
    const hasYelan = s.team.includes('yelan'),
      hasCitlali = s.team.includes('citlali'),
      hasNico = s.team.includes('nico'),
      hasXilonen = s.team.includes('xilonen');
    const yelanBuff = hasYelan ? Math.min(50, Math.max(0, Number(settings.yelanBuff ?? s.yBuff))) : 0,
      guidance = !hasNico || nicoBlessing === 'guidance';
    const atk = r.atk - (hasNico && !guidance ? 300 : 0),
      ignore = Math.min(100, r.ignore - (hasNico && !guidance && s.nC >= 6 ? 40 : 0));
    const def = (s.level + 100) / ((1 - ignore / 100) * (1 + s.def / 100) * (s.enemy + 100) + s.level + 100),
      buff = 1 + (r.bonus - (hasYelan ? s.yBuff : 0) + yelanBuff) / 100,
      crit = critical ? 1 + r.critDamage / 100 : 1;
    const amps = { none: 1, vaporize: 1.5, melt: 2 },
      reactionFactor =
        reaction === 'none'
          ? 1
          : amps[reaction] * (1 + 0.15 + s.reactionBonus / 100 + (2.78 * r.em) / (r.em + 1400));
    const commonFlat = includeFlat
      ? s.otherFlat +
        (hasCitlali && s.cC >= 1 ? r.citFlatPerHit : 0) +
        (hasNico && guidance && s.nC >= 4 ? r.nicoAtk * 0.7 : 0)
      : 0;
    const attacks = r.rotation.map((entry) => {
      const xilonenFlat =
          includeFlat && hasXilonen && s.xC >= 4 && ['通常1段目', '重撃'].includes(entry.name)
            ? r.xilonenFlatPerHit
            : 0,
        flat = commonFlat + xilonenFlat + (includeFlat && entry.name === '血梅香' ? r.bloodFlatPerHit : 0),
        basis = atk * entry.rate + flat;
      return { name: entry.name, damage: basis * buff * crit * reactionFactor * def * r.res, basis, flat };
    });
    return { attacks, critical, reaction, includeFlat, nicoBlessing, yelanBuff };
  }
  function renderActualDamageCheck(s, r, settings = {}) {
    const a = A.actual,
      result = actualDamages(s, r, settings),
      n = (value) => value.toLocaleString('ja-JP', { maximumFractionDigits: 0 });
    const yelanStep =
        result.yelanBuff <= 0 ? 0 : Math.min(15, Math.max(1, Math.round((result.yelanBuff - 1) / 3.5) + 1)),
      yelanValue = yelanStep === 0 ? 0 : 1 + 3.5 * (yelanStep - 1),
      yelanShown =
        yelanStep === 0
          ? `0%（${a.inactive}）`
          : `${Number.isInteger(yelanValue) ? yelanValue : yelanValue.toFixed(1)}%（${yelanStep - 1}${a.secondsAfter}）`;
    const yelan = s.team.includes('yelan')
      ? `<label class="yelan-buff-slider"><span class="text-standard">${a.yelan}</span><span class="yelan-slider-value text-standard" data-yelan-output>${yelanShown}</span><input type="range" min="0" max="15" step="1" value="${yelanStep}" data-actual-control="yelanStep" aria-label="${a.yelan}" aria-valuetext="${yelanShown}"></label>`
      : '';
    const nico = s.team.includes('nico')
      ? `<label><span class="text-standard">${a.nico.label}</span><select data-actual-control="nicoBlessing"><option value="gift" ${result.nicoBlessing === 'gift' ? 'selected' : ''}>${a.nico.gift}</option><option value="guidance" ${result.nicoBlessing === 'guidance' ? 'selected' : ''}>${a.nico.guidance}</option></select></label>`
      : '';
    return `<section class="actual-damage-card analysis-section"><h3>${a.title}</h3><p class="text-standard">${a.description}</p><details class="actual-damage-help"><summary class="text-secondary">${a.help.title}</summary><ul class="text-secondary">${a.help.items.map((x) => `<li>${x}</li>`).join('')}</ul></details><div class="actual-controls"><label><span class="text-standard">${a.critical.label}</span><select data-actual-control="critical"><option value="1" ${result.critical ? 'selected' : ''}>${a.critical.options.critical}</option><option value="0" ${result.critical ? '' : 'selected'}>${a.critical.options.normal}</option></select></label><label><span class="text-standard">${a.reaction.label}</span><select data-actual-control="reaction"><option value="none" ${result.reaction === 'none' ? 'selected' : ''}>${a.reaction.options.none}</option><option value="vaporize" ${result.reaction === 'vaporize' ? 'selected' : ''}>${a.reaction.options.vaporize}</option><option value="melt" ${result.reaction === 'melt' ? 'selected' : ''}>${a.reaction.options.melt}</option></select></label><label><span class="text-standard">${a.flat.label}</span><select data-actual-control="includeFlat"><option value="1" ${result.includeFlat ? 'selected' : ''}>${a.flat.options.include}</option><option value="0" ${result.includeFlat ? '' : 'selected'}>${a.flat.options.exclude}</option></select></label>${yelan}${nico}</div><div class="actual-results card-result">${result.attacks.map((attack) => `<article><span class="text-standard">${a.attacks[attack.name] || attack.name}</span><strong class="text-medium-result">${n(attack.damage)}</strong></article>`).join('')}</div>${a.footnote ? `<p class="actual-footnote text-meta">${a.footnote}</p>` : ''}</section>`;
  }
  function simpleDps(total, settings = {}) {
    const ratio = Math.min(100, Math.max(0.01, Number(settings.ratio ?? 80))),
      seconds = Math.max(0.01, Number(settings.seconds ?? 20));
    return { ratio, seconds, dps: total / ((ratio / 100) * seconds) };
  }
  function renderSimpleDps(total, settings = {}) {
    const d = A.dps,
      result = simpleDps(total, settings),
      n = (value) => value.toLocaleString('ja-JP', { maximumFractionDigits: 0 });
    return `<section class="simple-dps-card analysis-section"><h3>${d.title}</h3><p class="text-standard">${d.description}</p><div class="simple-dps-controls"><label><span class="text-standard">${d.ratio}</span><span class="actual-number"><input type="number" min="0.01" max="100" step="any" value="${result.ratio}" data-dps-control="ratio"><span class="text-meta">%</span></span></label><label><span class="text-standard">${d.seconds}</span><span class="actual-number"><input type="number" min="0.01" step="any" value="${result.seconds}" data-dps-control="seconds"><span class="text-meta">${d.secondsUnit}</span></span></label></div><div class="simple-dps-result"><span class="text-standard">${d.result}</span><strong class="text-medium-result">${n(result.dps)}</strong><small class="text-meta">（${n(total)}÷${result.ratio / 100}）÷${result.seconds}</small></div></section>`;
  }
  function renderDamageAnalysis(
    s,
    r,
    deltas = { cr: 3.9, cd: 7.8, hp: 5.8, atk: 5.8, em: 23 },
    calculate = root.HutaoCalculator?.calculate,
    records = [],
    baselineId = 'current',
    actualSettings = {},
    dpsSettings = {},
    potentialIncludeAtk = false,
    scoreIncludeAtk = false,
    memoryDraft = ''
  ) {
    const items = damagePotential(s, r, potentialIncludeAtk);
    let cursor = 0;
    const score = idealScore(s, r),
      fmt = (value) =>
        value
          .toFixed(value >= 0.01 ? 4 : 6)
          .replace(/0+$/, '')
          .replace(/\.$/, '');
    const gains = exactDamageGains(s, r, deltas, calculate);
    const stops = items
      .map((item) => {
        const start = cursor;
        cursor += item.share;
        return `${item.color} ${start.toFixed(4)}% ${cursor.toFixed(4)}%`;
      })
      .join(',');
    const summary = items.map((item) => `${item.name} ${item.share.toFixed(1)}%`).join('、');
    const gainFields = [
      ['cr', A.metrics.critRate, '%'],
      ['cd', A.metrics.critDamage, '%'],
      ['hp', A.metrics.hp, '%'],
      ['atk', A.metrics.atk, '%'],
      ['em', A.metrics.em, '']
    ];
    const n = (value) => value.toLocaleString('ja-JP', { maximumFractionDigits: 0 });
    const p = A.potential,
      sc = A.score,
      g = A.gain,
      description = p.description.replace('{count}', potentialIncludeAtk ? 5 : 4);
    const potentialToggle = `<label class="analysis-atk-toggle text-standard"><input type="checkbox" data-analysis-include-atk="potential" ${potentialIncludeAtk ? 'checked' : ''}>${p.includeAtk}</label>`;
    const scoreToggle = `<label class="analysis-atk-toggle text-standard"><input type="checkbox" data-analysis-include-atk="score" ${scoreIncludeAtk ? 'checked' : ''}>${p.includeAtk}</label>`;
    const help = (id, content) =>
      `<button type="button" class="help-button" popovertarget="${id}" aria-label="${content.button}">?</button></h3><div id="${id}" class="help-popover" popover><strong class="text-primary-label">${content.title}</strong>${content.paragraphs.map((x) => `<p class="text-secondary">${x}</p>`).join('')}</div>`;
    const memory = renderDamageMemory(r.total, records, baselineId, memoryDraft);
    const actual = renderActualDamageCheck(s, r, actualSettings);
    const gain = formatRates(
      `<section class="gain-card analysis-section"><h3>${g.title}</h3><p class="text-standard">${g.description}</p><div class="gain-baseline"><span class="text-secondary">${g.baseline}</span><strong class="text-standard">${n(r.total)}</strong></div><div class="gain-table table-standard" role="table" aria-label="${g.tableAria}"><div class="gain-head table-standard-header" role="row">${g.columns.map((x) => `<span>${x}</span>`).join('')}</div>${gainFields.map(([key, name, unit]) => `<label class="gain-row table-standard-row" role="row"><span class="gain-name text-standard">${name}</span><span class="gain-input${unit ? ' gain-input-percent' : ''}"><input type="number" min="0" step="any" value="${deltas[key]}" data-analysis-delta="${key}" aria-label="${name}${g.increaseSuffix}${unit}">${unit ? `<span class="text-meta" aria-hidden="true">${unit}</span>` : ''}</span><span class="gain-total text-secondary">${n(gains[key].total)}</span><span class="gain-amount text-secondary">+${n(gains[key].increase)}</span><span class="gain-rate text-primary-label">+${gains[key].rate.toFixed(3)}%</span></label>`).join('')}</div>${g.note ? `<p class="gain-note text-meta">${g.note}</p>` : ''}</section>`,
      'gain-rate',
      4
    );
    const analysis = `<section class="analysis-card analysis-section"><div class="analysis-copy"><h3 class="heading-with-help">${p.title}${help('potential-help', p.help)}<p class="text-standard">${description}</p>${potentialToggle}</div><div class="analysis-visual"><div class="potential-pie" style="background:conic-gradient(${stops})" role="img" aria-label="${p.aria}${summary}"><span class="text-primary-label">${p.chartLabel}</span></div><ul class="potential-legend text-secondary">${items.map((item) => `<li><span class="potential-swatch" style="background:${item.color}"></span><span>${item.name}</span><strong class="text-chart-value">${item.share.toFixed(1)}%</strong></li>`).join('')}</ul></div></section>`;
    const scoreTerms = `<div class="score-formula text-standard"><span class="score-title text-standard">${sc.formulaTitle}</span><span>＝ <b class="text-primary-label">${fmt(score.critRate)}</b> × ${A.metrics.critRate}</span><span>＋ ${A.metrics.critDamage}</span><span>＋ <b class="text-primary-label">${fmt(score.hp)}</b> × ${A.metrics.hp}</span>${scoreIncludeAtk ? `<span>＋ <b class="text-primary-label">${fmt(score.atk)}</b> × ${A.metrics.atk}</span>` : ''}<span>＋ <b class="text-primary-label">${fmt(score.em)}</b> × ${A.metrics.em}</span></div>`;
    const scoreCard = `<section class="score-card analysis-section"><h3 class="heading-with-help">${sc.title}${help('score-help', sc.help)}<p class="score-description text-standard">${sc.description}</p>${scoreToggle}<div class="score-result">${scoreTerms}</div></section>`;
    return memory + actual + gain + analysis + scoreCard + renderSimpleDps(r.total, dpsSettings);
  }
  root.DamageAnalysis = {
    critDerivatives,
    hpDerivative,
    atkDerivative,
    damagePotential,
    idealScore,
    exactDamageGains,
    actualDamages,
    renderActualDamageCheck,
    simpleDps,
    renderSimpleDps,
    renderDamageMemoryChart,
    renderDamageMemory,
    renderDamageAnalysis
  };
  if (typeof module !== 'undefined') module.exports = root.DamageAnalysis;
})(globalThis);

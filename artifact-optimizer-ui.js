(function (root) {
  'use strict';
  const O = root.ArtifactOptimizer;
  const escape = (value) =>
    String(value).replace(
      /[&<>"]/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]
    );
  const percentTypes = new Set([
    'hpPct',
    'atkPct',
    'defPct',
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
    'healing'
  ]);
  const defaultMains = { flower: 'hp', plume: 'atk', sand: 'em', goblet: 'pyro', circlet: 'cr' };
  function mount({
    readInputs,
    readCurrentTotal,
    validateInputs,
    applyCandidate,
    confirmAction,
    onInventoryChange = () => {}
  }) {
    const copy = root.SITE_CONTENT.page.sections.optimizer,
      host = document.getElementById('optimizer-content'),
      key = 'hutao-artifact-inventory-v1';
    const text = (template, values) =>
      Object.entries(values).reduce(
        (result, [name, value]) => result.replaceAll('{' + name + '}', value),
        template
      );
    const number = (value, digits = 3) => value.toLocaleString('ja-JP', { maximumFractionDigits: digits });
    let inventory = O.emptyInventory(),
      editing = null,
      result = null,
      applied = -1,
      busy = false,
      deleting = false,
      drag = null;
    let saveFeedbackTimer = null;
    const subTypes = Array(4).fill('');
    const option = (value, label) => '<option value="' + escape(value) + '">' + escape(label) + '</option>';
    const errorSlot = (id) => '<p id="' + id + '-error" class="text-error" role="alert" hidden></p>';
    const inputField = (id, label, input, hint = '') =>
      '<div class="field"><label class="label text-standard" for="' +
      id +
      '">' +
      escape(label) +
      '</label><span class="input-wrap">' +
      input +
      '</span>' +
      errorSlot(id) +
      (hint ? '<small class="text-meta">' + escape(hint) + '</small>' : '') +
      '</div>';
    host.innerHTML =
      '<p class="text-standard">' +
      escape(copy.intro) +
      '</p><p class="text-standard">' +
      escape(copy.restriction) +
      '</p>' +
      '<details id="artifact-registration" class="artifact-section card-inner" open><summary class="text-primary-label">' +
      escape(copy.registration) +
      '</summary><div class="artifact-registration-body"><p id="artifact-editing" class="text-accent" hidden></p><div class="fields artifact-registration-fields">' +
      inputField(
        'artifact-part',
        copy.part,
        '<select id="artifact-part" aria-describedby="artifact-part-error">' +
          O.parts.map((part) => option(part, copy.parts[part])).join('') +
          '</select>'
      ) +
      inputField(
        'artifact-set',
        copy.set,
        '<select id="artifact-set" aria-describedby="artifact-set-error">' +
          Object.entries(copy.sets)
            .map(([value, label]) => option(value, label))
            .join('') +
          '</select>'
      ) +
      '<div class="field artifact-sub-field"><label class="label text-standard" for="artifact-main">' +
      escape(copy.main) +
      '</label><div class="artifact-sub-controls input-wrap"><select id="artifact-main" aria-describedby="artifact-main-error"></select><div class="stat-converted-value card-basic"><output id="artifact-main-value" for="artifact-main" aria-label="' +
      escape(copy.mainValueAria) +
      '"></output></div></div>' +
      errorSlot('artifact-main') +
      (copy.mainHint ? '<small class="text-meta">' + escape(copy.mainHint) + '</small>' : '') +
      '</div>' +
      '</div><h4 class="text-standard">' +
      escape(copy.subs) +
      '</h4><div class="artifact-sub-grid">' +
      Array.from({ length: 4 }, (_, index) => {
        const label = text(copy.sub, { n: index + 1 }),
          id = 'artifact-sub-' + index;
        return (
          '<div class="field artifact-sub-field"><label class="label text-standard" for="' +
          id +
          '">' +
          escape(label) +
          '</label><div class="artifact-sub-controls input-wrap"><select id="' +
          id +
          '" aria-describedby="' +
          id +
          '-error">' +
          option('', copy.choose) +
          O.subOptions.map((type) => option(type, copy.stats[type])).join('') +
          '</select><span class="artifact-sub-value input-wrap"><input id="' +
          id +
          '-value" type="number" inputmode="decimal" step="any" min="0" max="150" aria-label="' +
          escape(text(copy.subValue, { n: index + 1 })) +
          '" aria-describedby="' +
          id +
          '-error"><span class="unit" aria-hidden="true" hidden>' +
          escape(copy.percent) +
          '</span></span></div>' +
          errorSlot(id) +
          '</div>'
        );
      }).join('') +
      '</div><div class="artifact-actions"><button type="button" id="artifact-save">' +
      escape(copy.add) +
      '</button><button type="button" id="artifact-cancel" class="text-muted-action" hidden>' +
      escape(copy.cancel) +
      '</button></div><p class="text-meta">' +
      escape(copy.optional) +
      '</p></div></details>' +
      '<section class="artifact-section"><h3>' +
      escape(copy.lists) +
      '</h3><div id="artifact-lists"></div><p id="artifact-storage-status" class="text-meta" role="status">' +
      escape(copy.storageNote) +
      '</p></section>' +
      '<section id="artifact-ranking" class="artifact-section"><h3>' +
      escape(copy.ranking) +
      '</h3><div class="artifact-actions"><button type="button" id="artifact-calculate">' +
      escape(copy.calculate) +
      '</button></div><p id="artifact-calculation-status" class="text-standard" role="status"></p><div id="artifact-candidates"></div><p id="artifact-more" class="text-meta" hidden>' +
      escape(copy.more) +
      '</p></section>' +
      '<div class="artifact-section artifact-management-actions"><button type="button" id="artifact-renumber" class="text-muted-action">' +
      escape(copy.renumber) +
      '</button><button type="button" id="artifact-delete-all" class="text-muted-action">' +
      escape(copy.removeAll) +
      '</button></div>';
    const $ = (id) => document.getElementById(id);
    try {
      inventory = O.normalizeInventory(JSON.parse(localStorage.getItem(key) || 'null'));
    } catch {
      $('artifact-storage-status').textContent = copy.storageError;
    }
    function save() {
      try {
        localStorage.setItem(key, JSON.stringify(inventory));
        $('artifact-storage-status').textContent = copy.storageNote;
      } catch {
        $('artifact-storage-status').textContent = copy.storageError;
      }
    }
    function invalidate() {
      result = null;
      applied = -1;
      $('artifact-candidates').replaceChildren();
      $('artifact-more').hidden = true;
      $('artifact-calculation-status').textContent = '';
    }
    function changed() {
      save();
      invalidate();
      renderLists();
      onInventoryChange();
    }
    function stat(type, value, entered = false) {
      return text(escape(copy.statFormat), {
        stat: escape(copy.statDisplayNames[type] || copy.stats[type]),
        value: entered ? escape(String(value)) : number(value),
        unit: percentTypes.has(type) ? escape(copy.percent) : ''
      });
    }
    function table(items, { registered = false, part = '' } = {}) {
      const heads = [
        ...(registered ? [''] : []),
        ...(registered ? [] : [copy.part]),
        copy.id,
        copy.set,
        copy.mainOp,
        ...Array.from({ length: 4 }, (_, index) => text(copy.subOp, { n: index + 1 })),
        ...(registered ? [copy.actions] : [])
      ];
      return (
        '<div class="artifact-table-wrap table-standard" tabindex="0"><table class="artifact-table"><thead><tr class="table-standard-header">' +
        heads
          .map(
            (label, index) =>
              '<th scope="col"' +
              (index === 0
                ? ' class="' + (registered ? 'artifact-handle-cell' : 'artifact-part-cell') + '"'
                : '') +
              '>' +
              escape(label) +
              '</th>'
          )
          .join('') +
        '</tr></thead><tbody>' +
        items
          .map(
            (item) =>
              '<tr data-artifact-row="' +
              escape(item.id) +
              '" data-artifact-part="' +
              item.part +
              '">' +
              (registered
                ? '<td class="artifact-handle-cell"><button type="button" class="artifact-drag memory-drag-handle" data-artifact-drag="' +
                  escape(item.id) +
                  '" data-part="' +
                  part +
                  '" aria-label="' +
                  escape(text(copy.drag, { id: item.id })) +
                  '" title="' +
                  escape(copy.dragTitle) +
                  '">' +
                  escape(copy.dragSymbol) +
                  '</button></td>'
                : '<th scope="row" class="artifact-part-cell">' + escape(copy.parts[item.part]) + '</th>') +
              '<td>' +
              escape(item.id) +
              '</td><td>' +
              escape(copy.sets[item.set]) +
              '</td><td>' +
              (O.isOtherMain(item.main)
                ? escape(copy.otherMainDisplay)
                : stat(item.main, O.mains[item.main])) +
              '</td>' +
              Array.from(
                { length: 4 },
                (_, index) =>
                  '<td>' +
                  (item.subs[index]?.type
                    ? stat(item.subs[index].type, Number(item.subs[index].value), true)
                    : escape(copy.dash)) +
                  '</td>'
              ).join('') +
              (registered
                ? '<td class="artifact-row-actions"><button type="button" data-artifact-edit="' +
                  escape(item.id) +
                  '" data-part="' +
                  part +
                  '" class="text-muted-action">' +
                  escape(copy.edit) +
                  '</button><button type="button" data-artifact-delete="' +
                  escape(item.id) +
                  '" data-part="' +
                  part +
                  '" class="text-muted-action">' +
                  escape(copy.remove) +
                  '</button></td>'
                : '') +
              '</tr>'
          )
          .join('') +
        '</tbody></table></div>'
      );
    }
    function renderLists() {
      $('artifact-lists').innerHTML = O.parts
        .map(
          (part) =>
            '<section class="artifact-part-list"><h4 class="text-primary-label">' +
            escape(copy.parts[part]) +
            '</h4>' +
            (inventory.items[part].length
              ? table(inventory.items[part], { registered: true, part })
              : '<p class="text-meta">' + escape(copy.empty) + '</p>') +
            '</section>'
        )
        .join('');
    }
    function clearErrors() {
      host.querySelectorAll('.text-error').forEach((element) => {
        element.hidden = true;
        element.textContent = '';
      });
      host.querySelectorAll('[aria-invalid]').forEach((element) => element.removeAttribute('aria-invalid'));
    }
    function showError(field, message) {
      const id = 'artifact-' + field,
        element = $(id + '-error');
      element.hidden = false;
      element.textContent += (element.textContent ? ' ' : '') + message;
      $(id)?.setAttribute('aria-invalid', 'true');
      if (field.startsWith('sub-')) $(id + '-value').setAttribute('aria-invalid', 'true');
    }
    function updateSubControls() {
      const main = $('artifact-main').value;
      for (let index = 0; index < 4; index++) {
        const select = $('artifact-sub-' + index),
          wrap = $('artifact-sub-' + index + '-value').parentElement,
          percent = percentTypes.has(select.value);
        for (const option of select.options) option.disabled = option.value !== '' && option.value === main;
        wrap.classList.toggle('has-unit', percent);
        wrap.querySelector('.unit').hidden = !percent;
        subTypes[index] = select.value;
      }
    }
    function subChanged(index) {
      const select = $('artifact-sub-' + index),
        previous = subTypes[index],
        selected = select.value;
      const otherIndex = selected
        ? Array.from({ length: 4 }, (_, other) => other).find(
            (other) => other !== index && $('artifact-sub-' + other).value === selected
          )
        : undefined;
      if (otherIndex !== undefined) {
        const input = $('artifact-sub-' + index + '-value'),
          otherInput = $('artifact-sub-' + otherIndex + '-value'),
          previousValue = input.value;
        input.value = otherInput.value;
        $('artifact-sub-' + otherIndex).value = previous;
        otherInput.value = previousValue;
      }
      updateSubControls();
      clearErrors();
    }
    function resetSubs() {
      for (let index = 0; index < 4; index++) {
        $('artifact-sub-' + index).value = '';
        $('artifact-sub-' + index + '-value').value = '';
      }
      updateSubControls();
    }
    function mainChanged() {
      const main = $('artifact-main').value;
      $('artifact-main-value').value = O.isOtherMain(main)
        ? copy.otherMainDisplay
        : number(O.mains[main]) + (percentTypes.has(main) ? copy.percent : '');
      updateSubControls();
    }
    function partChanged(preferred) {
      const part = $('artifact-part').value,
        selected = O.isOtherMain(preferred) ? 'other' : preferred;
      $('artifact-main').innerHTML = O.mainOptions[part]
        .map((type) => option(type, copy.stats[type]))
        .join('');
      $('artifact-main').value = O.mainOptions[part].includes(selected) ? selected : defaultMains[part];
      $('artifact-main').disabled = O.mainOptions[part].length === 1;
      mainChanged();
    }
    function clearSaveFeedback() {
      clearTimeout(saveFeedbackTimer);
      saveFeedbackTimer = null;
      $('artifact-save').textContent = editing ? copy.update : copy.add;
    }
    function showSaveFeedback(message) {
      clearSaveFeedback();
      $('artifact-save').textContent = message;
      saveFeedbackTimer = setTimeout(clearSaveFeedback, 2000);
    }
    function resetForm() {
      editing = null;
      $('artifact-part').disabled = false;
      $('artifact-editing').hidden = true;
      clearSaveFeedback();
      $('artifact-cancel').hidden = true;
      resetSubs();
      clearErrors();
    }
    function edit(part, id) {
      const item = inventory.items[part].find((entry) => entry.id === id);
      if (!item) return;
      resetForm();
      editing = { part, id };
      $('artifact-part').value = part;
      $('artifact-part').disabled = true;
      $('artifact-set').value = item.set;
      partChanged(item.main);
      item.subs.forEach((sub, index) => {
        $('artifact-sub-' + index).value = sub.type;
        $('artifact-sub-' + index + '-value').value = sub.value;
      });
      updateSubControls();
      $('artifact-editing').textContent = text(copy.editing, { id });
      $('artifact-editing').hidden = false;
      $('artifact-save').textContent = copy.update;
      $('artifact-cancel').hidden = false;
      $('artifact-registration').open = true;
      $('artifact-registration').scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'start'
      });
    }
    $('artifact-part').addEventListener('change', () => {
      partChanged();
      resetSubs();
      clearErrors();
    });
    $('artifact-main').addEventListener('change', () => {
      mainChanged();
      resetSubs();
      clearErrors();
    });
    function normalizeSubValue(input) {
      if (input.validity.badInput || input.value === '' || !Number.isFinite(Number(input.value))) return;
      const value = Number(input.value),
        bounded = Math.min(150, Math.max(0, value));
      if (bounded === 0 || bounded !== value) {
        input.value = bounded === 0 ? '' : String(bounded);
        clearErrors();
      }
    }
    for (let index = 0; index < 4; index++) {
      $('artifact-sub-' + index).addEventListener('change', () => subChanged(index));
      const input = $('artifact-sub-' + index + '-value');
      // Wait for a committed value so typing decimals beginning with 0 remains possible.
      const commitValue = () => normalizeSubValue(input);
      input.addEventListener('change', commitValue);
      input.addEventListener('blur', commitValue);
    }
    $('artifact-cancel').addEventListener('click', resetForm);
    $('artifact-save').addEventListener('click', () => {
      if (busy) return;
      clearSaveFeedback();
      clearErrors();
      for (let index = 0; index < 4; index++) normalizeSubValue($('artifact-sub-' + index + '-value'));
      const item = {
        part: $('artifact-part').value,
        set: $('artifact-set').value,
        main: $('artifact-main').value,
        subs: Array.from({ length: 4 }, (_, index) => ({
          type: $('artifact-sub-' + index).value,
          value: $('artifact-sub-' + index + '-value').validity.badInput
            ? 'invalid'
            : $('artifact-sub-' + index + '-value').value
        }))
      };
      const errors = O.validateArtifact(item);
      if (!editing && inventory.items[item.part].length >= 10)
        errors.push({ field: 'part', message: copy.limit });
      if (errors.length) {
        for (const error of errors) showError(error.field, error.message || copy.errors[error.code]);
        return;
      }
      item.subs = item.subs.map((sub) => ({ type: sub.type, value: sub.type ? Number(sub.value) : '' }));
      const wasEditing = editing !== null;
      if (editing) {
        item.id = editing.id;
        const index = inventory.items[item.part].findIndex((entry) => entry.id === editing.id);
        inventory.items[item.part][index] = item;
      } else {
        item.id = O.prefixes[item.part] + inventory.next[item.part]++;
        inventory.items[item.part].push(item);
      }
      resetForm();
      changed();
      showSaveFeedback(wasEditing ? copy.updated : copy.added);
    });
    host.addEventListener('input', (event) => event.stopPropagation());
    host.addEventListener('change', (event) => event.stopPropagation());
    host.addEventListener('click', (event) => {
      if (busy) return;
      const button = event.target.closest('button');
      if (!button) return;
      if (button.dataset.artifactEdit) edit(button.dataset.part, button.dataset.artifactEdit);
      if (button.dataset.artifactDelete) {
        const { part, artifactDelete: id } = button.dataset;
        inventory.items[part] = inventory.items[part].filter((item) => item.id !== id);
        if (editing?.id === id) resetForm();
        changed();
      }
      if (button.dataset.artifactApply !== undefined) {
        const index = Number(button.dataset.artifactApply),
          candidate = result?.candidates[index];
        if (!candidate) return;
        applyCandidate(O.reflectionValues(candidate.stats));
        applied = index;
        host
          .querySelectorAll('[data-artifact-applied]')
          .forEach((element) => (element.hidden = Number(element.dataset.artifactApplied) !== applied));
      }
    });
    function clearDrag() {
      drag = null;
      host
        .querySelectorAll('.is-dragging,.is-drag-over')
        .forEach((element) => element.classList.remove('is-dragging', 'is-drag-over'));
    }
    host.addEventListener('pointerdown', (event) => {
      const handle = event.target.closest('[data-artifact-drag]');
      if (!handle || busy || event.button !== 0) return;
      drag = {
        part: handle.dataset.part,
        id: handle.dataset.artifactDrag,
        startY: event.clientY,
        targetId: '',
        after: false
      };
      handle.setPointerCapture?.(event.pointerId);
    });
    host.addEventListener('pointermove', (event) => {
      if (!drag || Math.abs(event.clientY - drag.startY) < 5) return;
      event.preventDefault();
      const row = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-artifact-row]');
      host.querySelectorAll('.is-drag-over').forEach((element) => element.classList.remove('is-drag-over'));
      event.target.closest('[data-artifact-row]')?.classList.add('is-dragging');
      drag.targetId = '';
      if (!row || row.dataset.artifactPart !== drag.part || row.dataset.artifactRow === drag.id) return;
      drag.targetId = row.dataset.artifactRow;
      const rect = row.getBoundingClientRect();
      drag.after = event.clientY > rect.top + rect.height / 2;
      row.classList.add('is-drag-over');
    });
    host.addEventListener('pointerup', () => {
      if (!drag) return;
      const { part, id, targetId, after } = drag;
      clearDrag();
      if (targetId && O.move(inventory, part, id, targetId, after)) changed();
    });
    host.addEventListener('pointercancel', clearDrag);
    host.addEventListener('keydown', (event) => {
      const handle = event.target.closest('[data-artifact-drag]');
      if (!handle || busy || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const { part, artifactDrag: id } = handle.dataset,
        items = inventory.items[part],
        index = items.findIndex((item) => item.id === id),
        target = index + (event.key === 'ArrowUp' ? -1 : 1);
      if (target < 0 || target >= items.length) return;
      if (O.move(inventory, part, id, items[target].id, event.key === 'ArrowDown')) {
        changed();
        host.querySelector('[data-artifact-drag="' + id + '"]')?.focus();
      }
    });
    $('artifact-renumber').addEventListener('click', () => {
      if (busy) return;
      resetForm();
      O.renumber(inventory);
      changed();
    });
    $('artifact-delete-all').addEventListener('click', async () => {
      if (busy || deleting) return;
      deleting = true;
      try {
        if (
          !(await confirmAction(copy.removeAllConfirmTitle, copy.removeAllConfirm, {
            confirm: copy.removeAllYes,
            cancel: copy.removeAllNo
          }))
        )
          return;
        resetForm();
        clearDrag();
        inventory = O.emptyInventory();
        changed();
      } finally {
        deleting = false;
      }
    });
    function renderResults() {
      $('artifact-more').hidden = !result.more;
      $('artifact-calculation-status').textContent =
        result.reason === 'missing'
          ? text(copy.missing, { parts: result.missing.map((part) => copy.parts[part]).join(copy.separator) })
          : result.reason === 'set'
            ? copy.noSet
            : '';
      $('artifact-candidates').innerHTML = result.candidates
        .map(
          (candidate, index) =>
            '<article class="artifact-candidate"><div class="artifact-rank-summary card-result"><strong class="text-primary-label">' +
            escape(text(copy.rank, { rank: candidate.rank })) +
            '</strong><div><span class="text-secondary">' +
            escape(copy.damage) +
            '</span><strong class="text-primary-label">' +
            number(candidate.total, 0) +
            '</strong></div>' +
            (candidate.rank === 1
              ? ''
              : '<div><span class="text-secondary">' +
                escape(copy.decrease) +
                '</span><strong class="text-primary-label">' +
                number(candidate.decrease, 3) +
                escape(copy.percent) +
                '</strong></div>') +
            '<div><span class="text-secondary">' +
            escape(copy.currentRatio) +
            '</span><strong class="text-primary-label" data-artifact-current-ratio="' +
            index +
            '"></strong></div></div>' +
            table(candidate.items) +
            '<section class="artifact-equipped-card card-inner"><h4>' +
            escape(copy.equipped) +
            '</h4><p class="text-meta">' +
            escape(copy.equippedNote) +
            '</p><dl class="artifact-equipped">' +
            ['cr', 'cd', 'hp', 'em']
              .map(
                (statKey) =>
                  '<div><dt class="text-secondary">' +
                  escape(copy.equippedLabels[statKey]) +
                  '</dt><dd class="text-secondary">' +
                  number(candidate.stats[statKey], ['cr', 'cd'].includes(statKey) ? 1 : 0) +
                  (['cr', 'cd'].includes(statKey) ? escape(copy.percent) : '') +
                  '</dd></div>'
              )
              .join('') +
            '</dl><button type="button" data-artifact-apply="' +
            index +
            '">' +
            escape(copy.apply) +
            '</button><p class="text-meta" role="status" data-artifact-applied="' +
            index +
            '" hidden>' +
            escape(copy.applied) +
            '</p></section></article>'
        )
        .join('');
      updateComparison();
    }
    function updateComparison() {
      if (!result) return;
      const currentTotal = readCurrentTotal();
      host.querySelectorAll('[data-artifact-current-ratio]').forEach((element) => {
        const candidate = result.candidates[Number(element.dataset.artifactCurrentRatio)];
        if (!Number.isFinite(currentTotal) || currentTotal <= 0) {
          element.textContent = copy.dash;
          return;
        }
        const ratio = Math.round((candidate.total / currentTotal - 1) * 100000) / 1000;
        element.textContent =
          (ratio > 0 ? '+' : ratio < 0 ? '−' : '') + number(Math.abs(ratio), 3) + copy.percent;
      });
    }
    $('artifact-calculate').addEventListener('click', async () => {
      if (busy) return;
      invalidate();
      const settings = readInputs();
      if (validateInputs(settings).length) {
        $('artifact-calculation-status').textContent = copy.conditionsError;
        return;
      }
      busy = true;
      $('artifact-calculate').textContent = copy.calculating;
      host.setAttribute('aria-busy', 'true');
      const controls = [...document.querySelectorAll('input,select,textarea,button')].map((element) => ({
        element,
        disabled: element.disabled
      }));
      controls.forEach(({ element }) => (element.disabled = true));
      try {
        // Two animation frames allow the busy state to paint before calculation.
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        result = await O.optimizeAsync(settings, inventory);
        renderResults();
      } catch {
        $('artifact-calculation-status').textContent = copy.calculationError;
      } finally {
        busy = false;
        controls.forEach(({ element, disabled }) => (element.disabled = disabled));
        $('artifact-calculate').textContent = copy.calculate;
        host.removeAttribute('aria-busy');
      }
    });
    partChanged();
    renderLists();
    return {
      invalidate,
      updateComparison,
      getInventory: () => JSON.parse(JSON.stringify(inventory)),
      restoreInventory(saved) {
        resetForm();
        clearDrag();
        inventory = JSON.parse(JSON.stringify(saved));
        changed();
      }
    };
  }
  root.ArtifactOptimizerUI = { mount };
})(globalThis);

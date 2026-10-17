/** Local-only pharmacy workspace: inventory CRUD and profile preferences. */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', init, { once: true });

  function init() {
    const session = window.MawjoodAuth?.getSession();
    if (!session) return; // auth-guard redirects to login.

    const table = document.querySelector('#inventory-rows');
    const search = document.querySelector('#inventory-search');
    const filter = document.querySelector('#inventory-filter');
    const empty = document.querySelector('#inventory-empty');
    const editor = document.querySelector('#medicine-dialog');
    const form = document.querySelector('#medicine-form');
    const profileForm = document.querySelector('#profile-form');
    if (!table || !search || !filter || !editor || !form || !profileForm) return;

    const fields = {
      name: document.querySelector('#profile-name'),
      location: document.querySelector('#profile-location'),
      phone: document.querySelector('#profile-phone'),
      closes: document.querySelector('#profile-closes')
    };
    const dataKey = 'mawjood:dashboard-data:' + session.email.toLowerCase();
    const localize = (en, ar) => document.documentElement.lang === 'ar' ? ar : en;
    const statuses = { in: 'In stock', low: 'Low stock', out: 'Out of stock' };
    let inventory = [...table.rows].map(row => ({
      name: row.querySelector('td b')?.textContent || '',
      details: row.querySelector('td small')?.textContent || '',
      stock: row.dataset.stock || 'in',
      price: parseFloat(row.cells[2].textContent) || 0,
      updated: row.cells[3].textContent
    }));
    let editingIndex = -1;

    function readProfile() {
      return Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input.value.trim()]));
    }

    function save() {
      try {
        localStorage.setItem(dataKey, JSON.stringify({ inventory, profile: readProfile() }));
        return true;
      } catch (error) {
        console.error('Could not save demo workspace:', error);
        return false;
      }
    }

    function load() {
      try {
        const stored = JSON.parse(localStorage.getItem(dataKey) || 'null');
        if (!stored || typeof stored !== 'object') return;
        if (Array.isArray(stored.inventory)) {
          inventory = stored.inventory.filter(item => item && typeof item.name === 'string')
            .map(item => ({
              name: item.name, details: String(item.details || ''),
              stock: statuses[item.stock] ? item.stock : 'in',
              price: Number.isFinite(Number(item.price)) ? Math.max(0, Number(item.price)) : 0,
              updated: String(item.updated || 'Saved')
            }));
        }
        if (stored.profile && typeof stored.profile === 'object') {
          Object.entries(fields).forEach(([key, input]) => {
            if (typeof stored.profile[key] === 'string') input.value = stored.profile[key];
          });
        }
      } catch (error) { console.warn('Ignoring invalid saved workspace data.', error); }
    }

    function element(tag, className, value) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (value != null) node.textContent = value;
      return node;
    }

    function createRow(item, index) {
      const row = document.createElement('tr');
      row.dataset.stock = item.stock;
      row.dataset.name = (item.name + ' ' + item.details).toLowerCase();
      const medicine = element('td');
      medicine.append(element('b', '', item.name), element('small', '', item.details));
      const stock = element('td');
      stock.append(element('span', 'stock ' + item.stock, statuses[item.stock]));
      const price = element('td', '', Number(item.price).toFixed(3) + ' JOD');
      const updated = element('td', '', item.updated);
      const actions = element('td');
      const edit = element('button', 'edit-row', localize('Edit', 'تعديل'));
      edit.type = 'button';
      edit.dataset.editIndex = String(index);
      actions.append(edit);
      row.append(medicine, stock, price, updated, actions);
      return row;
    }

    function render() {
      table.replaceChildren(...inventory.map(createRow));
      document.querySelector('#stat-count').textContent = String(inventory.length);
      document.querySelector('#nav-count').textContent = String(inventory.length);
      document.querySelector('#stat-stock').textContent = String(inventory.filter(item => item.stock === 'in').length);
      applyFilters();
    }

    function applyFilters() {
      const query = search.value.trim().toLowerCase();
      let visible = 0;
      [...table.rows].forEach(row => {
        const matches = row.dataset.name.includes(query) &&
          (filter.value === 'all' || row.dataset.stock === filter.value);
        row.hidden = !matches;
        if (matches) visible++;
      });
      empty.hidden = visible > 0;
    }

    function openEditor(index = -1) {
      editingIndex = index;
      form.reset();
      const item = inventory[index];
      document.querySelector('#dialog-heading').textContent = item
        ? localize('Edit medicine', 'تعديل الدواء')
        : localize('Add medicine', 'إضافة دواء');
      if (item) {
        document.querySelector('#medicine-name').value = item.name;
        document.querySelector('#medicine-price').value = item.price;
        document.querySelector('#medicine-stock').value = item.stock;
      }
      editor.showModal();
    }

    search.addEventListener('input', applyFilters);
    filter.addEventListener('change', applyFilters);
    document.querySelector('#add-medicine')?.addEventListener('click', () => openEditor());
    table.addEventListener('click', event => {
      const button = event.target.closest('[data-edit-index]');
      if (button) openEditor(Number(button.dataset.editIndex));
    });
    ['dialog-close', 'dialog-cancel'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', () => editor.close());
    });

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const name = document.querySelector('#medicine-name').value.trim();
      const price = Number(document.querySelector('#medicine-price').value);
      const stock = document.querySelector('#medicine-stock').value;
      if (!name || !Number.isFinite(price) || price < 0 || !statuses[stock]) return;
      const duplicate = inventory.some((item, index) =>
        index !== editingIndex && item.name.toLowerCase() === name.toLowerCase());
      if (duplicate) {
        document.querySelector('#medicine-name').setCustomValidity(
          localize('A medicine with this name already exists.', 'يوجد دواء بنفس الاسم بالفعل.')
        );
        form.reportValidity();
        return;
      }
      document.querySelector('#medicine-name').setCustomValidity('');
      const previous = inventory[editingIndex];
      const item = {
        name, price, stock,
        details: previous?.details || 'Added in this demo',
        updated: 'Just now'
      };
      if (editingIndex >= 0) inventory[editingIndex] = item;
      else inventory.push(item);
      save();
      render();
      editor.close();
    });
    document.querySelector('#medicine-name')?.addEventListener('input', event => {
      event.target.setCustomValidity('');
    });

    profileForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!profileForm.reportValidity()) return;
      const feedback = document.querySelector('#profile-feedback');
      const stored = save();
      feedback.hidden = false;
      feedback.textContent = stored
        ? localize('Saved in this browser only. Not published online.', 'تم الحفظ في هذا المتصفح فقط، ولم يُنشر على الإنترنت.')
        : localize('Storage is unavailable. Changes were not saved.', 'تعذّر التخزين، لم تُحفظ التغييرات.');
    });

    const replyDialog = document.querySelector('#reply-dialog');
    document.querySelectorAll('[data-person]').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelector('#reply-heading').textContent = localize('Enquiry from ', 'استفسار من ') + button.dataset.person;
        replyDialog?.showModal();
      });
    });
    ['reply-close', 'reply-ok'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', () => replyDialog?.close());
    });
    document.addEventListener('mawjood:languagechange', render);
    load();
    render();
  }
})();

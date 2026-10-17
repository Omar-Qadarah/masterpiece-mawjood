/** Public sample pharmacy profile; supports pharmacy and medicine deep links. */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', init, { once: true });

  function init() {
    const data = window.MawjoodData;
    const list = document.querySelector('#inventory-list');
    const reserveSelect = document.querySelector('#reserve-medicine-name');
    if (!data || !list) return;

    const params = new URLSearchParams(location.search);
    const requestedId = params.get('pharmacy');
    const selected = data.getPharmacyById(requestedId) || data.getPharmacyById('al-shifa-abdoun');
    if (!selected) return;
    const session = window.MawjoodAuth?.getSession();
    const ownProfile = !requestedId && Boolean(session);
    const key = ownProfile ? 'mawjood:dashboard-data:' + session.email.toLowerCase() : '';
    let saved = null;
    if (ownProfile) {
      try { saved = JSON.parse(localStorage.getItem(key) || 'null'); }
      catch { saved = null; }
    }
    const profile = ownProfile && saved?.profile || {};
    const pharmacy = {
      ...selected,
      name: profile.name || selected.name,
      address: profile.location || selected.address,
      phone: profile.phone || selected.phone
    };
    window.MawjoodCurrentPharmacy = pharmacy;
    document.dispatchEvent(new CustomEvent('mawjood:pharmacychange', { detail: pharmacy }));

    const setText = (selector, value) => {
      const node = document.querySelector(selector);
      if (node && value) node.textContent = value;
    };
    setText('#pharmacy-title', pharmacy.name);
    setText('.map-card__body p', pharmacy.address);
    setText('.pharmacy-quickfacts > div:nth-child(2) strong', pharmacy.address);
    setText('.map-label', [selected.area, selected.city].filter(Boolean).join(' · '));
    setText('.status-live', selected.isOpen ? 'Listed as open' : 'Listed as closed');
    setText('.pharmacy-status-row > span:last-child', 'Sample listing · confirm by phone');
    const locationNode = document.querySelector('.pharmacy-location');
    if (locationNode) {
      const icon = locationNode.querySelector('svg');
      locationNode.textContent = pharmacy.address;
      if (icon) locationNode.prepend(icon);
    }
    const phone = String(pharmacy.phone || '').replace(/[^+\d]/g, '');
    const phoneLink = document.querySelector('.pharmacy-hero__actions a[href^="tel:"]');
    if (phoneLink) {
      phoneLink.removeAttribute('href');
      phoneLink.setAttribute('aria-disabled', 'true');
      phoneLink.setAttribute('title', 'Sample phone number: not verified');
    }
    const directionsLink = document.querySelector('.map-card__body a[target="_blank"]');
    if (directionsLink) directionsLink.href = selected.mapsUrl;
    const reservationForm = document.querySelector('#reservation-form');
    if (reservationForm) {
      reservationForm.dataset.pharmacyName = pharmacy.name;
      // No verified WhatsApp numbers exist in the sample records.
      reservationForm.dataset.whatsappNumber = '';
    }

    const stocks = data.getInventoryForPharmacy(selected.id);
    let medicines = stocks.filter(row => row.medicine).map(row => ({
      id: row.medicine.id,
      name: row.medicine.name,
      details: [row.medicine.activeIngredients.join(' + '), row.medicine.packSize].join(' · '),
      stock: row.status,
      price: row.priceJod,
      updated: `Updated ${row.updatedMinutesAgo} min ago`
    }));
    if (Array.isArray(saved?.inventory) && ownProfile) {
      medicines = saved.inventory.map(item => ({ ...item, id: data.medicines.find(medicine => medicine.name === item.name)?.id }));
    }

    const statusLabels = { in: 'In stock', low: 'Low stock', out: 'Out of stock' };
    const stockClasses = { in: 'badge--in', low: 'badge--low', out: 'badge--out' };
    const create = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text != null) node.textContent = String(text);
      return node;
    };

    function renderInventory() {
      list.replaceChildren();
      reserveSelect?.replaceChildren(new Option('Choose a medicine', ''));
      medicines.forEach((item, index) => {
        const name = String(item.name || 'Unnamed medicine');
        const card = create('article', 'inventory-card card');
        card.dataset.medicine = (name + ' ' + (item.details || '')).toLowerCase();
        const pack = create('div', 'medicine-mini-pack' +
          (index % 3 === 1 ? ' medicine-mini-pack--generic' : index % 3 === 2 ? ' medicine-mini-pack--orange' : ''));
        pack.setAttribute('aria-hidden', 'true');
        pack.append(create('span', '', name.slice(0, 2).toUpperCase()));
        const info = create('div', 'inventory-card__details');
        const title = create('h3');
        const detailsLink = create('a', '', name);
        detailsLink.href = item.id ? 'medicine.html?id=' + encodeURIComponent(item.id) : '#reserve-medicine';
        title.append(detailsLink);
        info.append(title, create('p', '', item.details || 'Listed by this pharmacy'),
          create('small', '', item.updated || 'Recently updated'));
        const availability = create('div', 'inventory-card__stock');
        availability.append(create('span', 'badge ' + (stockClasses[item.stock] || 'badge--unknown'), statusLabels[item.stock] || 'Unconfirmed'),
          create('strong', '', Number(item.price || 0).toFixed(3) + ' JOD'),
          create('small', '', 'Sample price'));
        const request = create('a', 'btn btn--secondary btn--sm', item.stock === 'out' ? 'Ask' : 'Request');
        request.href = '#reserve-medicine';
        request.dataset.reserve = name;
        card.append(pack, info, availability, request);
        list.append(card);
        reserveSelect?.add(new Option(name, name));
      });
      filterInventory();
    }

    const search = document.querySelector('#inventory-q');
    const empty = document.querySelector('#inventory-empty');
    function filterInventory() {
      const query = (search?.value || '').trim().toLowerCase();
      let shown = 0;
      list.querySelectorAll('.inventory-card').forEach(card => {
        const matched = card.dataset.medicine.includes(query);
        card.hidden = !matched;
        if (matched) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    }
    document.querySelector('#inventory-search')?.addEventListener('submit', event => {
      event.preventDefault();
      filterInventory();
    });
    search?.addEventListener('input', filterInventory);
    list.addEventListener('click', event => {
      const button = event.target.closest('[data-reserve]');
      if (button && reserveSelect) reserveSelect.value = button.dataset.reserve;
    });
    renderInventory();
    const requestedMedicine = data.getMedicineById(params.get('medicine'));
    if (requestedMedicine && reserveSelect) reserveSelect.value = requestedMedicine.name;
  }
})();

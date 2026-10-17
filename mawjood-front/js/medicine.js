/** Medicine detail page driven by the selected catalogue ID in the URL. */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const data = window.MawjoodData;
  if (!data) return;
  const params = new URLSearchParams(location.search);
  const medicine = data.getMedicineById(params.get('id')) || data.getMedicineById('panadol-extra-500');
  if (!medicine) return;

  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  };
  document.title = medicine.name + ' · Mawjood';
  setText('#medicine-title', medicine.name);
  setText('.medicine-pack__brand', medicine.brand);
  setText('.medicine-pack__extra', medicine.form);
  setText('.medicine-pack__strength', medicine.strength);
  setText('.medicine-pack__detail', medicine.activeIngredients.join(' + '));
  setText('.medicine-subtitle', [medicine.activeIngredients.join(' + '), medicine.form, medicine.packSize].join(' · '));
  setText('.medicine-tags .badge', medicine.requiresPrescription
    ? 'Prescription required — confirm with pharmacist'
    : 'Confirm prescription requirements with a pharmacist');
  setText('.medicine-price span', 'Sample price');

  const inventory = data.getInventoryForMedicine(medicine.id);
  const prices = inventory.map(item => Number(item.priceJod)).filter(Number.isFinite);
  const priceNode = document.querySelector('.medicine-price');
  if (priceNode) {
    const amount = prices.length ? prices[0].toFixed(3) : '—';
    priceNode.replaceChildren(document.createTextNode(amount + ' '));
    const currency = document.createElement('small');
    currency.textContent = 'JOD';
    const sample = document.createElement('span');
    sample.textContent = 'Sample price';
    priceNode.append(currency, sample);
  }
  setText('#nearby-heading .count-pill', String(inventory.length));

  const container = document.querySelector('.medicine-pharmacies');
  const stockText = { in: 'In stock', low: 'Low stock', out: 'Out of stock' };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
  if (container) {
    container.innerHTML = inventory.map(row => {
      const pharmacy = row.pharmacy;
      if (!pharmacy) return '';
      const link = 'pharmacy.html?pharmacy=' + encodeURIComponent(pharmacy.id) + '&medicine=' + encodeURIComponent(medicine.id);
      const phone = String(pharmacy.phone || '').replace(/[^+\d]/g, '');
      return `<article class="pharmacy-card card">
        <div class="pharmacy-card__body"><div class="pharmacy-card__heading">
          <h3><a href="${escape(link)}">${escape(pharmacy.name)}</a></h3>
          <span class="badge badge--${row.status === 'out' ? 'out' : row.status === 'low' ? 'low' : 'in'}">${stockText[row.status] || 'Unconfirmed'}</span>
        </div><p class="pharmacy-card__meta">${escape(pharmacy.address)} · ${escape(pharmacy.distanceKm)} km</p>
        <p class="pharmacy-card__updated">Sample update: ${escape(row.updatedMinutesAgo)} minutes ago · ${escape(pharmacy.hoursText)}</p></div>
        <div class="pharmacy-card__actions"><a class="btn btn--primary btn--sm" href="${escape(link)}">Ask pharmacy</a>
          ${phone ? `<span class="action-link action-link--disabled">Call unavailable (demo)</span>` : ''}
          <a class="action-link" href="${escape(pharmacy.mapsUrl)}" target="_blank" rel="noopener noreferrer">Directions</a></div>
      </article>`;
    }).join('');
  }

  // Only equal ingredient sets may be presented as potential generic equivalents.
  // A paracetamol-only medicine is not equivalent to paracetamol + caffeine.
  const signature = item => [...item.activeIngredients].map(part => part.toLowerCase()).sort().join('|');
  const candidates = data.medicines.filter(item => item.id !== medicine.id && signature(item) === signature(medicine));
  const equivalents = document.querySelector('.equivalent-grid');
  const heading = document.querySelector('#equivalents-heading');
  if (equivalents) {
    equivalents.innerHTML = candidates.map(item => `<article class="equivalent-card card">
      <div class="equivalent-card__icon">Rx</div><div><h3>${escape(item.name)}</h3>
      <p>${escape(item.packSize)} · Confirm suitability with your pharmacist</p></div>
      <a href="medicine.html?id=${encodeURIComponent(item.id)}" aria-label="View ${escape(item.name)}">→</a>
    </article>`).join('');
  }
  if (heading) {
    heading.firstChild.textContent = 'Medicines with the same active ingredients ';
    const count = heading.querySelector('.count-pill');
    if (count) count.textContent = String(candidates.length);
  }
  if (!candidates.length) setText('.equivalents .section-note',
    'No verified equivalents in this demo catalogue. Ask your pharmacist about alternatives; do not substitute medicines based only on a name.');
});

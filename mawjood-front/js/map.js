/** Optional Leaflet map; accessible list fallback if the CDN is unavailable. */
(function (window, document) {
  'use strict';

  const CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  const SCRIPT_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  const DEFAULT_CENTER = [31.9539, 35.9106];
  const instances = new WeakMap();
  const generation = new WeakMap();
  let leafletPromise;

  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const hasCoordinates = item => item && Number.isFinite(Number(item.latitude)) &&
    Number.isFinite(Number(item.longitude));
  const directions = pharmacy => pharmacy.mapsUrl ||
    'https://www.openstreetmap.org/search?query=' + encodeURIComponent(pharmacy.address || pharmacy.name);

  function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    if (leafletPromise) return leafletPromise;
    leafletPromise = new Promise((resolve, reject) => {
      if (!document.querySelector('[data-leaflet-css]')) {
        const stylesheet = document.createElement('link');
        stylesheet.rel = 'stylesheet';
        stylesheet.href = CSS_URL;
        stylesheet.dataset.leafletCss = '';
        document.head.appendChild(stylesheet);
      }
      const script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => window.L ? resolve(window.L) : reject(new Error('Leaflet unavailable'));
      script.onerror = () => reject(new Error('Cannot load Leaflet'));
      document.head.appendChild(script);
    }).catch(error => {
      leafletPromise = null; // Allow retries after a temporary network failure.
      throw error;
    });
    return leafletPromise;
  }

  function fallback(container, pharmacies) {
    const items = pharmacies.map(pharmacy => `<li class="mawjood-map-fallback__item">
      <div><strong>${escape(pharmacy.name)}</strong><span>${escape(pharmacy.address)}</span></div>
      <a href="${escape(directions(pharmacy))}" target="_blank" rel="noopener noreferrer">Directions ↗</a>
    </li>`).join('');
    container.innerHTML = `<div class="mawjood-map-fallback">
      <p class="mawjood-map-fallback__message">Map unavailable. Pharmacy addresses are listed below.</p>
      <ul>${items || '<li>No pharmacy locations match the current filters.</li>'}</ul>
      <small>Demo coordinates, hours and stock are not verified.</small></div>`;
  }

  async function showPharmacies(container, pharmacies = []) {
    if (!container) return false;
    const list = (Array.isArray(pharmacies) ? pharmacies : []).filter(Boolean);
    const requestId = (generation.get(container) || 0) + 1;
    generation.set(container, requestId);
    const previous = instances.get(container);
    if (previous) { previous.remove(); instances.delete(container); }
    container.classList.add('mawjood-map-container');
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Pharmacy locations');
    if (!list.length) { fallback(container, []); return false; }
    container.innerHTML = '<div class="mawjood-leaflet-map"></div><p class="mawjood-map-loading">Loading map…</p>';

    try {
      const L = await loadLeaflet();
      // Navigation may have replaced the map element during an asynchronous load.
      const node = container.querySelector('.mawjood-leaflet-map');
      if (!node || generation.get(container) !== requestId) return false;
      container.querySelector('.mawjood-map-loading')?.remove();
      const map = L.map(node, { scrollWheelZoom: false });
      instances.set(container, map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      const points = [];
      list.filter(hasCoordinates).forEach(pharmacy => {
        const coordinates = [Number(pharmacy.latitude), Number(pharmacy.longitude)];
        points.push(coordinates);
        L.marker(coordinates).addTo(map).bindPopup(
          `<strong>${escape(pharmacy.name)}</strong><p>${escape(pharmacy.address)}</p>
          <a href="${escape(directions(pharmacy))}" target="_blank" rel="noopener noreferrer">Directions</a>`
        );
      });
      if (points.length > 1) map.fitBounds(points, { padding: [30, 30], maxZoom: 14 });
      else map.setView(points[0] || DEFAULT_CENTER, 13);
      window.setTimeout(() => map.invalidateSize(), 100);
      return true;
    } catch (error) {
      if (generation.get(container) !== requestId) return false;
      fallback(container, list);
      return false;
    }
  }

  const uniquePharmacies = rows => [...new Map(rows.filter(row => row.pharmacy)
    .map(row => [row.pharmacy.id, row.pharmacy])).values()];

  function initSearchMap() {
    const results = document.querySelector('#pharmacy-results');
    const section = document.querySelector('.results-main');
    if (!results || !section) return;
    const container = document.createElement('div');
    container.id = 'pharmacy-map';
    container.className = 'results-map mawjood-map-container';
    container.hidden = true;
    results.insertAdjacentElement('afterend', container);
    let activeRows = window.MawjoodSearch?.getResults() || [];
    let dirty = true;

    function synchronize() {
      const showMap = section.classList.contains('is-map-view');
      container.hidden = !showMap;
      if (!showMap) return;
      if (dirty) {
        dirty = false;
        showPharmacies(container, uniquePharmacies(activeRows));
      } else instances.get(container)?.invalidateSize();
    }
    document.addEventListener('mawjood:resultschange', event => {
      activeRows = event.detail.rows || [];
      dirty = true;
      synchronize();
    });
    new MutationObserver(synchronize).observe(section, { attributes: true, attributeFilter: ['class'] });
    synchronize();
  }

  function initPharmacyMap() {
    const container = document.querySelector('.map-card__canvas');
    if (!container) return;
    const refresh = () => {
      const pharmacy = window.MawjoodCurrentPharmacy ||
        window.MawjoodData?.getPharmacyById('al-shifa-abdoun');
      if (pharmacy) showPharmacies(container, [pharmacy]);
    };
    document.addEventListener('mawjood:pharmacychange', refresh);
    refresh();
  }

  window.MawjoodMap = {
    showPharmacies,
    showPharmacy: (container, pharmacy) => showPharmacies(container, pharmacy ? [pharmacy] : []),
    invalidate: container => instances.get(container)?.invalidateSize()
  };
  document.addEventListener('DOMContentLoaded', () => { initSearchMap(); initPharmacyMap(); }, { once: true });
})(window, document);

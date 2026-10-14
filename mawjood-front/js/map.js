/*
 * Mawjood map integration
 * -----------------------
 * Uses Leaflet with OpenStreetMap tiles when an internet connection is available.
 * No API key is required. If Leaflet or map tiles cannot load, a useful list of
 * pharmacy locations and external directions links are shown instead.
 *
 * Public API: window.MawjoodMap
 *   .showPharmacies(container, pharmacies)
 *   .showPharmacy(container, pharmacy)
 *   .invalidate(container)
 */
(function (window, document) {
  'use strict';

  var LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  var LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  var leafletPromise = null;
  var maps = new WeakMap();
  var AMMAN = [31.9539, 35.9106];

  function safeText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character];
    });
  }

  function hasCoordinates(pharmacy) {
    return pharmacy && Number.isFinite(Number(pharmacy.latitude)) &&
      Number.isFinite(Number(pharmacy.longitude));
  }

  function directionsUrl(pharmacy) {
    if (pharmacy && pharmacy.mapsUrl) return pharmacy.mapsUrl;
    var place = pharmacy && (pharmacy.address || pharmacy.name) || 'Pharmacy, Amman, Jordan';
    return 'https://www.openstreetmap.org/search?query=' + encodeURIComponent(place);
  }

  function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    if (leafletPromise) return leafletPromise;

    leafletPromise = new Promise(function (resolve, reject) {
      var existingCss = document.querySelector('link[data-mawjood-leaflet]');
      if (!existingCss) {
        var css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = LEAFLET_CSS;
        css.dataset.mawjoodLeaflet = 'true';
        document.head.appendChild(css);
      }

      var script = document.querySelector('script[data-mawjood-leaflet]');
      if (script) {
        script.addEventListener('load', function () { window.L ? resolve(window.L) : reject(new Error('Leaflet unavailable')); }, { once: true });
        script.addEventListener('error', reject, { once: true });
        return;
      }

      script = document.createElement('script');
      script.src = LEAFLET_JS;
      script.async = true;
      script.dataset.mawjoodLeaflet = 'true';
      script.onload = function () { window.L ? resolve(window.L) : reject(new Error('Leaflet unavailable')); };
      script.onerror = function () { reject(new Error('Could not load Leaflet')); };
      document.head.appendChild(script);
    });

    return leafletPromise;
  }

  function renderFallback(container, pharmacies) {
    var rows = pharmacies.filter(Boolean).map(function (pharmacy) {
      return '<li class="mawjood-map-fallback__item"><div><strong>' + safeText(pharmacy.name || 'Pharmacy') +
        '</strong><span>' + safeText(pharmacy.address || [pharmacy.area, pharmacy.city].filter(Boolean).join(', ')) +
        '</span></div><a href="' + safeText(directionsUrl(pharmacy)) + '" target="_blank" rel="noopener noreferrer">Directions ↗</a></li>';
    }).join('');
    container.innerHTML = '<div class="mawjood-map-fallback"><p class="mawjood-map-fallback__message">Interactive map could not load. You can still open directions for each pharmacy.</p><ul>' +
      (rows || '<li>No pharmacy locations are available.</li>') + '</ul><small>Locations and stock details are sample data; confirm with the pharmacy.</small></div>';
  }

  function addMarkers(map, pharmacies, L) {
    var bounds = [];
    pharmacies.filter(hasCoordinates).forEach(function (pharmacy) {
      var point = [Number(pharmacy.latitude), Number(pharmacy.longitude)];
      bounds.push(point);
      var marker = L.marker(point).addTo(map);
      var popup = '<strong>' + safeText(pharmacy.name) + '</strong><br>' +
        safeText(pharmacy.address || [pharmacy.area, pharmacy.city].filter(Boolean).join(', ')) + '<br>' +
        (pharmacy.isOpen ? 'Listed as open' : 'Listed as closed') + '<br>' +
        '<a href="' + safeText(directionsUrl(pharmacy)) + '" target="_blank" rel="noopener noreferrer">Open directions</a>';
      marker.bindPopup(popup);
    });

    if (bounds.length > 1) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 });
    else if (bounds.length === 1) map.setView(bounds[0], 14);
    else map.setView(AMMAN, 12);
  }

  function showPharmacies(container, pharmacies) {
    if (!container) return Promise.resolve(false);
    var list = Array.isArray(pharmacies) ? pharmacies : [];
    container.classList.add('mawjood-map-container');
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Pharmacy map');
    container.innerHTML = '<div class="mawjood-leaflet-map"></div><p class="mawjood-map-loading">Loading map…</p>';
    var mapElement = container.querySelector('.mawjood-leaflet-map');

    return loadLeaflet().then(function (L) {
      var loading = container.querySelector('.mawjood-map-loading');
      if (loading) loading.remove();
      var oldMap = maps.get(container);
      if (oldMap) oldMap.remove();
      var map = L.map(mapElement, { scrollWheelZoom: false, attributionControl: true });
      maps.set(container, map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      addMarkers(map, list, L);
      window.setTimeout(function () { map.invalidateSize(); }, 80);
      return true;
    }).catch(function () {
      renderFallback(container, list);
      return false;
    });
  }

  function showPharmacy(container, pharmacy) {
    return showPharmacies(container, pharmacy ? [pharmacy] : []);
  }

  function invalidate(container) {
    var map = container && maps.get(container);
    if (map) map.invalidateSize();
  }

  window.MawjoodMap = {
    showPharmacies: showPharmacies,
    showPharmacy: showPharmacy,
    invalidate: invalidate
  };

  function initSearchMap() {
    var resultsMain = document.querySelector('.results-main');
    if (!resultsMain) return;
    var mapContainer = document.createElement('div');
    mapContainer.className = 'results-map mawjood-map-container';
    mapContainer.id = 'pharmacy-map';
    mapContainer.hidden = true;
    mapContainer.setAttribute('aria-label', 'Map of pharmacy results');
    var results = document.getElementById('pharmacy-results');
    if (results) results.insertAdjacentElement('afterend', mapContainer);

    var hasRendered = false;
    function syncView() {
      var isMap = resultsMain.classList.contains('is-map-view');
      mapContainer.hidden = !isMap;
      if (isMap) {
        if (!hasRendered) {
          var data = window.MawjoodData;
          var pharmacies = data && Array.isArray(data.pharmacies) ? data.pharmacies : [];
          showPharmacies(mapContainer, pharmacies);
          hasRendered = true;
        } else {
          invalidate(mapContainer);
        }
      }
    }
    new MutationObserver(syncView).observe(resultsMain, { attributes: true, attributeFilter: ['class'] });
    syncView();
  }

  function initPharmacyMap() {
    var canvas = document.querySelector('.map-card__canvas');
    if (!canvas) return;
    var data = window.MawjoodData;
    if (!data || !Array.isArray(data.pharmacies)) return;
    var pharmacy = data.getPharmacyById ? data.getPharmacyById('al-shifa-abdoun') : data.pharmacies[0];
    if (pharmacy) showPharmacy(canvas, pharmacy);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSearchMap();
    initPharmacyMap();
  });
})(window, document);

/*
 * Mawjood medicine search page.
 * Reads the demo catalogue from data.js, renders pharmacy stock results,
 * and applies the search form, city, stock, opening-hours, distance and sort filters.
 * All records are illustrative demo data; this file does not connect to a live API.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var data = window.MawjoodData;
    var params = new URLSearchParams(window.location.search);
    var form = document.querySelector('.results-search');
    var queryInput = document.querySelector('#results-q');
    var cityFilter = document.querySelector('#city-filter');
    var stockFilter = document.querySelector('#in-stock');
    var openFilter = document.querySelector('#open-now');
    var distanceFilter = document.querySelector('#distance-filter');
    var distanceValue = document.querySelector('#distance-value');
    var clearButton = document.querySelector('#clear-filters');
    var resultsContainer = document.querySelector('#pharmacy-results');
    var resultsHeading = document.querySelector('#results-heading');
    var resultsSummary = document.querySelector('.results-toolbar > div:first-child p');
    var emptyState = document.querySelector('#empty-state');
    var moreButton = document.querySelector('#show-more');
    var sortInputs = document.querySelectorAll('input[name="sort"]');
    var viewButtons = document.querySelectorAll('[data-view]');
    var resultsMain = document.querySelector('.results-main');
    var pageSize = 4;
    var visibleLimit = pageSize;
    var currentRows = [];

    if (!data || !resultsContainer) {
      if (resultsContainer) {
        resultsContainer.innerHTML = '<p class="empty-state">Search data could not be loaded. Please refresh the page.</p>';
      }
      return;
    }

    // Make an All cities option available so the user can clear the city filter.
    if (cityFilter && !Array.from(cityFilter.options).some(function (option) { return option.value === ''; })) {
      var allCities = document.createElement('option');
      allCities.value = '';
      allCities.textContent = 'All cities';
      cityFilter.insertBefore(allCities, cityFilter.firstChild);
    }

    // Use the URL query when present; otherwise keep the search box's demo default.
    if (queryInput && params.has('q')) queryInput.value = params.get('q') || '';

    function escapeHtml(value) {
      return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[character];
      });
    }

    function formatPrice(price) {
      if (price == null || !Number.isFinite(Number(price))) return 'Price not listed';
      return Number(price).toFixed(2) + ' JOD';
    }

    function formatUpdated(minutes) {
      var value = Number(minutes);
      if (!Number.isFinite(value) || value < 0) return 'Update time not provided';
      if (value < 60) return 'Updated ' + value + ' min ago';
      if (value < 1440) return 'Updated ' + Math.floor(value / 60) + ' h ago';
      var days = Math.floor(value / 1440);
      return 'Updated ' + days + (days === 1 ? ' day ago' : ' days ago');
    }

    function getStatus(status) {
      if (status === 'in') return { label: 'In stock', className: 'badge--in' };
      if (status === 'low') return { label: 'Low stock', className: 'badge--low' };
      if (status === 'out') return { label: 'Out of stock', className: 'badge--unknown' };
      return { label: 'Unconfirmed', className: 'badge--unknown' };
    }

    function getSortValue() {
      var selected = document.querySelector('input[name="sort"]:checked');
      return selected ? selected.value : 'distance';
    }

    function getFilteredRows() {
      var query = queryInput ? queryInput.value.trim() : '';
      var city = cityFilter ? cityFilter.value : '';
      var maxDistance = distanceFilter ? Number(distanceFilter.value) : 20;
      var rows = data.searchInventory(query, {
        area: '',
        inStockOnly: false,
        openNowOnly: false,
        maxDistanceKm: ''
      });

      rows = rows.filter(function (row) {
        var pharmacy = row.pharmacy;
        if (!pharmacy) return false;
        if (city && pharmacy.city.toLowerCase() !== city.toLowerCase()) return false;
        if (stockFilter && stockFilter.checked && row.status !== 'in') return false;
        if (openFilter && openFilter.checked && !pharmacy.isOpen) return false;
        if (Number.isFinite(maxDistance) && pharmacy.distanceKm > maxDistance) return false;
        return true;
      });

      if (getSortValue() === 'availability') {
        var priority = { in: 0, low: 1, out: 2 };
        rows.sort(function (a, b) {
          var difference = (priority[a.status] == null ? 3 : priority[a.status]) -
            (priority[b.status] == null ? 3 : priority[b.status]);
          return difference || a.pharmacy.distanceKm - b.pharmacy.distanceKm;
        });
      } else {
        rows.sort(function (a, b) {
          return a.pharmacy.distanceKm - b.pharmacy.distanceKm;
        });
      }
      return rows;
    }

    function createCard(row) {
      var pharmacy = row.pharmacy;
      var medicine = row.medicine;
      var status = getStatus(row.status);
      var distance = Number(pharmacy.distanceKm);
      var distanceText = Number.isFinite(distance) ? distance.toFixed(1) + ' km' : 'Distance unavailable';
      var areaText = [pharmacy.area, pharmacy.city].filter(Boolean).join(', ');
      var openText = pharmacy.isOpen ? pharmacy.hoursText : 'Closed';
      var medicineName = medicine ? medicine.name : 'Medicine';
      var pharmacyUrl = 'pharmacy.html?pharmacy=' + encodeURIComponent(pharmacy.id) +
        '&medicine=' + encodeURIComponent(medicine ? medicine.id : '');
      var medicineUrl = 'medicine.html?id=' + encodeURIComponent(medicine ? medicine.id : '');
      var phone = String(pharmacy.phone || '').replace(/[^+\d]/g, '');
      var mapsUrl = pharmacy.mapsUrl || ('https://maps.google.com/?q=' + encodeURIComponent(pharmacy.address || pharmacy.name));
      var requestLabel = row.status === 'out' ? 'Ask pharmacy' : 'Request reservation';

      return '<article class="pharmacy-card card" data-stock="' + escapeHtml(row.status) + '"' +
        ' data-open="' + (pharmacy.isOpen ? 'yes' : 'no') + '" data-distance="' + escapeHtml(distance) + '">' +
        '<div class="pharmacy-card__body">' +
          '<div class="pharmacy-card__heading"><h3><a href="' + escapeHtml(pharmacyUrl) + '">' + escapeHtml(pharmacy.name) + '</a></h3>' +
          '<span class="badge ' + status.className + '">' + status.label + '</span></div>' +
          '<p class="pharmacy-card__meta"><svg class="icon icon--16" aria-hidden="true"><use href="#i-pin"/></svg> ' +
          escapeHtml(areaText) + ' <span>·</span> ' + escapeHtml(distanceText) + '</p>' +
          '<p class="pharmacy-card__updated">' + escapeHtml(formatUpdated(row.updatedMinutesAgo)) +
          ' <span>·</span> ' + escapeHtml(openText) + '</p>' +
          '<p class="pharmacy-card__updated">' + escapeHtml(medicineName) + ' <span>·</span> ' + escapeHtml(formatPrice(row.priceJod)) + '</p>' +
        '</div>' +
        '<div class="pharmacy-card__actions">' +
          '<a class="btn ' + (row.status === 'out' ? 'btn--secondary' : 'btn--primary') + ' btn--sm" href="' + escapeHtml(pharmacyUrl) + '">' + requestLabel + '</a>' +
          (phone ? '<a class="action-link" href="tel:' + escapeHtml(phone) + '">Call</a>' : '') +
          '<a class="action-link" href="' + escapeHtml(mapsUrl) + '" target="_blank" rel="noopener noreferrer">Route</a>' +
          '<a class="action-link" href="' + escapeHtml(medicineUrl) + '">Medicine details</a>' +
        '</div>' +
      '</article>';
    }

    function render() {
      currentRows = getFilteredRows();
      var count = currentRows.length;
      var shownRows = currentRows.slice(0, visibleLimit);
      resultsContainer.innerHTML = shownRows.map(createCard).join('');

      if (emptyState) {
        emptyState.hidden = count > 0;
        if (!count) {
          emptyState.textContent = 'No pharmacy stock records match your search and filters. Try another medicine, city, or a wider distance.';
        }
      }

      var cityName = cityFilter && cityFilter.value ? cityFilter.options[cityFilter.selectedIndex].text : 'all cities';
      if (resultsHeading) {
        resultsHeading.textContent = count + (count === 1 ? ' result' : ' results') + ' · ' + cityName;
      }
      if (resultsSummary) {
        resultsSummary.textContent = 'Sorted by ' + (getSortValue() === 'availability' ? 'availability' : 'distance') +
          ' · Sample pharmacy data';
      }
      if (distanceValue && distanceFilter) distanceValue.textContent = distanceFilter.value + ' km';

      if (moreButton) {
        moreButton.hidden = count <= pageSize || visibleLimit >= count;
        moreButton.textContent = 'Show ' + Math.max(0, count - visibleLimit) + ' more results';
      }
    }

    // A new search starts at the first page of results.
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        visibleLimit = pageSize;
        var url = new URL(window.location.href);
        var value = queryInput ? queryInput.value.trim() : '';
        if (value) url.searchParams.set('q', value);
        else url.searchParams.delete('q');
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
        render();
      });
    }

    [cityFilter, stockFilter, openFilter, distanceFilter].forEach(function (control) {
      if (!control) return;
      control.addEventListener('change', function () {
        visibleLimit = pageSize;
        render();
      });
      control.addEventListener('input', function () {
        if (control === distanceFilter) {
          visibleLimit = pageSize;
          render();
        }
      });
    });

    sortInputs.forEach(function (input) {
      input.addEventListener('change', function () {
        visibleLimit = pageSize;
        render();
      });
    });

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        if (cityFilter) cityFilter.value = '';
        if (stockFilter) stockFilter.checked = false;
        if (openFilter) openFilter.checked = false;
        if (distanceFilter) distanceFilter.value = distanceFilter.max || '20';
        var nearest = document.querySelector('input[name="sort"][value="distance"]');
        if (nearest) nearest.checked = true;
        visibleLimit = pageSize;
        render();
      });
    }

    if (moreButton) {
      moreButton.addEventListener('click', function () {
        visibleLimit = Math.min(currentRows.length, visibleLimit + pageSize);
        render();
      });
    }

    viewButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        viewButtons.forEach(function (item) {
          var active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        if (resultsMain) resultsMain.classList.toggle('is-map-view', button.dataset.view === 'map');
      });
    });

    render();
  });
})();

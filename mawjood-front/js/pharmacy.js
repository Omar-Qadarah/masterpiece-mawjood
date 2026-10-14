/* Pharmacy page interactions. Demonstration only: no reservation is sent to a backend. */
document.addEventListener('DOMContentLoaded', function () {
  var searchForm = document.querySelector('#inventory-search');
  var searchInput = document.querySelector('#inventory-q');
  var cards = Array.from(document.querySelectorAll('#inventory-list .inventory-card'));
  var empty = document.querySelector('#inventory-empty');

  function filterInventory() {
    var query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    var count = 0;
    cards.forEach(function (card) {
      var match = (card.dataset.medicine || '').toLowerCase().includes(query);
      card.hidden = !match;
      if (match) count++;
    });
    if (empty) empty.hidden = count > 0;
  }
  if (searchForm) searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    filterInventory();
  });
  if (searchInput) searchInput.addEventListener('input', filterInventory);

  document.querySelectorAll('[data-reserve]').forEach(function (button) {
    button.addEventListener('click', function () {
      var select = document.querySelector('#reserve-medicine-name');
      if (select) select.value = button.dataset.reserve;
    });
  });


});

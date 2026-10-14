/* About page small enhancements. Shared navigation is handled by the common header script. */
document.addEventListener('DOMContentLoaded', function () {
  var year = document.querySelector('[data-current-year]');
  if (year) year.textContent = String(new Date().getFullYear());
});

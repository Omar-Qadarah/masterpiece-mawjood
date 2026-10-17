/** Block unauthenticated access to the pharmacy's demo workspace. */
(function () {
  'use strict';
  const auth = window.MawjoodAuth;
  const session = auth?.getSession();
  if (!session) {
    window.location.replace('login.html?next=dashboard');
    return;
  }
  document.addEventListener('DOMContentLoaded', () => {
    const name = document.querySelector('#account-name');
    const email = document.querySelector('#account-email');
    if (name) name.textContent = session.name || 'Demo Pharmacy';
    if (email) email.textContent = session.email;
  }, { once: true });
})();

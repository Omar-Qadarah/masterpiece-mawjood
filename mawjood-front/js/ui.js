/** Shared navigation, account menu, and mobile dashboard sidebar. */
(function () {
  'use strict';
  const header = document.querySelector('.site-header');
  const navButton = document.querySelector('.nav-toggle');
  const profileButton = document.querySelector('#profile-trigger');
  const profileMenu = document.querySelector('#profile-menu');
  const sidebar = document.querySelector('#dash-sidebar');
  const sidebarButton = document.querySelector('#dash-sidebar-toggle');
  const auth = window.MawjoodAuth;

  function setNavigation(open) {
    header?.classList.toggle('is-nav-open', open);
    navButton?.setAttribute('aria-expanded', String(open));
  }

  function setProfile(open) {
    if (!profileMenu) return;
    profileMenu.hidden = !open;
    profileButton?.setAttribute('aria-expanded', String(open));
  }

  function setSidebar(open) {
    sidebar?.classList.toggle('open', open);
    sidebarButton?.setAttribute('aria-expanded', String(open));
  }

  navButton?.addEventListener('click', () => {
    setProfile(false);
    setNavigation(!header.classList.contains('is-nav-open'));
  });
  profileButton?.addEventListener('click', () => {
    setNavigation(false);
    setProfile(profileMenu.hidden);
  });
  sidebarButton?.addEventListener('click', () => setSidebar(!sidebar.classList.contains('open')));

  header?.querySelectorAll('.site-nav a').forEach(link => {
    link.addEventListener('click', () => setNavigation(false));
  });
  sidebar?.querySelectorAll('.dash-nav a').forEach(link => {
    link.addEventListener('click', () => {
      sidebar.querySelectorAll('.dash-nav a').forEach(item => item.classList.remove('active'));
      link.classList.add('active');
      if (window.innerWidth <= 760) setSidebar(false);
    });
  });

  document.addEventListener('click', event => {
    if (header && !header.contains(event.target)) setNavigation(false);
    if (profileButton && !profileButton.parentElement.contains(event.target)) setProfile(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    setNavigation(false);
    setProfile(false);
    setSidebar(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1190) setNavigation(false);
    if (window.innerWidth > 760) setSidebar(false);
  });

  const session = auth?.getSession();
  const accountName = document.querySelector('#account-name');
  const accountEmail = document.querySelector('#account-email');
  if (accountName) accountName.textContent = session?.name || 'Guest';
  if (accountEmail) accountEmail.textContent = session?.email || 'Sign in to manage your pharmacy';

  // Display sign-in to guests, sign-out to authenticated users only.
  profileMenu?.querySelectorAll('a[href="login.html"]').forEach(link => { link.hidden = Boolean(session); });
  profileMenu?.querySelectorAll('a[href="dashboard.html"]').forEach(link => { link.hidden = !session; });
  const logout = document.querySelector('#logout-button');
  if (logout) {
    logout.hidden = !session;
    logout.addEventListener('click', () => {
      auth.signOut();
      window.location.replace('login.html?loggedOut=1');
    });
  }
})();

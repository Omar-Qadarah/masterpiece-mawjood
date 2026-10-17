/**
 * English / Arabic content translation using the project's static phrase dictionary.
 * Works on existing markup and text inserted later by page scripts. User inputs,
 * URLs, SVG artwork and account data are never rewritten by the translator.
 */
(function () {
  'use strict';

  const dictionary = window.MAWJOOD_TRANSLATIONS || {};
  const keyFallback = {
    'nav.home': 'Home', 'nav.search': 'Search', 'nav.medicine': 'Medicine',
    'nav.pharmacy': 'Pharmacy', 'nav.forPharmacies': 'For pharmacies',
    'nav.dashboard': 'Dashboard', 'nav.about': 'About', 'nav.login': 'Pharmacy login',
    'footer.tagline': 'Find the pharmacy that has your medicine, before you go.',
    'footer.product': 'Product', 'footer.company': 'Company',
    'footer.searchMedicines': 'Search medicines',
    'footer.dashboardDemo': 'Dashboard demo',
    'footer.aboutTrust': 'About and trust', 'footer.privacy': 'Privacy',
    'footer.contact': 'Contact',
    'footer.notice': 'Availability is reported by pharmacies and may change. Please confirm with your pharmacist. Mawjood does not sell or dispense medicine.',
    'footer.copyright': '© 2026 Mawjood · Sample content',
    'footer.copyrightSuffix': 'for design purposes',
    'a11y.skip': 'Skip to content', 'auth.logout': 'Log out'
  };
  const originals = new WeakMap();
  const lastWritten = new WeakMap();
  const originalAttributes = new WeakMap();
  const attributes = ['placeholder', 'aria-label', 'title', 'alt'];
  const SKIP = 'script, style, svg, symbol, defs, textarea, option[data-no-translate], [data-no-translate]';
  let language = 'en';
  try { language = localStorage.getItem('mawjood:language') === 'ar' ? 'ar' : 'en'; }
  catch { /* Use English if local storage is blocked. */ }

  function translate(text, lang = language) {
    return lang === 'ar' && Object.hasOwn(dictionary, text) ? dictionary[text] : text;
  }

  function applyText(node, lang) {
    const current = node.nodeValue;
    if (lastWritten.has(node) && current !== lastWritten.get(node)) {
      originals.set(node, current); // A page script changed this text since translation.
    }
    if (!originals.has(node)) originals.set(node, current);
    const initial = originals.get(node);
    const trimmed = initial.trim();
    if (!trimmed || !/[A-Za-z]/.test(trimmed)) return;
    const parentKey = node.parentElement?.getAttribute('data-i18n');
    const base = parentKey && keyFallback[parentKey] || trimmed;
    const output = translate(base, lang);
    const leading = initial.match(/^\s*/)?.[0] || '';
    const trailing = initial.match(/\s*$/)?.[0] || '';
    const next = leading + output + trailing;
    lastWritten.set(node, next);
    if (current !== next) node.nodeValue = next;
  }

  function applyAttributes(element, lang) {
    if (!originalAttributes.has(element)) {
      const values = {};
      for (const name of attributes) {
        if (element.hasAttribute(name)) values[name] = element.getAttribute(name);
      }
      originalAttributes.set(element, values);
    }
    for (const [name, original] of Object.entries(originalAttributes.get(element))) {
      const expected = translate(original, lang);
      if (element.getAttribute(name) !== expected) element.setAttribute(name, expected);
    }
  }

  function applyElement(element, lang) {
    if (element.matches(SKIP)) return;
    applyAttributes(element, lang);

    if (element.hasAttribute('data-en') && element.hasAttribute('data-ar')) {
      const value = element.getAttribute('data-' + lang);
      if (element.tagName === 'H1' && value.includes('<em>')) {
        const current = element.innerHTML;
        if (current !== value) element.innerHTML = value;
      } else if (element.textContent !== value) element.textContent = value;
      return;
    }
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) applyText(node, lang);
      else if (node.nodeType === Node.ELEMENT_NODE) applyElement(node, lang);
    }
  }

  function applyLanguage(next, { persist = true } = {}) {
    language = next === 'ar' ? 'ar' : 'en';
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    applyElement(document.body, language);
    document.querySelectorAll('[data-lang-toggle]').forEach(button => {
      const label = button.querySelector('.lang-toggle__label');
      if (label) label.textContent = language === 'ar' ? 'English' : 'عربي';
      button.setAttribute('aria-label', language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    });
    if (persist) {
      try { localStorage.setItem('mawjood:language', language); }
      catch { /* Preference remains active until next navigation. */ }
    }
    document.dispatchEvent(new CustomEvent('mawjood:languagechange', {
      detail: { language, direction: document.documentElement.dir }
    }));
  }

  document.querySelectorAll('[data-lang-toggle]').forEach(button => {
    button.addEventListener('click', () => applyLanguage(language === 'ar' ? 'en' : 'ar'));
  });
  // Scripts are loaded with defer; this file runs after parsing the document.
  applyLanguage(language, { persist: false });

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        const node = mutation.target;
        if (node.parentElement?.closest(SKIP)) continue;
        if (node.nodeValue !== lastWritten.get(node)) applyText(node, language);
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE && !node.parentElement?.closest(SKIP)) applyText(node, language);
        else if (node.nodeType === Node.ELEMENT_NODE) applyElement(node, language);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });

  window.MawjoodLanguage = {
    set: applyLanguage,
    get: () => language,
    translate: text => translate(text),
    refresh: () => applyElement(document.body, language)
  };
})();

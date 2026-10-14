/*
 * Mawjood internationalization (i18n).
 * Supports English and Arabic, saves the chosen language, translates elements
 * marked with data-i18n, and switches the page direction for Arabic.
 * Add translations by using the same key in both dictionaries below.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'mawjood:language';
  var DEFAULT_LANGUAGE = 'en';

  // English strings are fallbacks and also document the meaning of each key.
  var translations = {
    en: {
      'a11y.skip': 'Skip to content',
      'brand.name': 'Mawjood',
      'nav.home': 'Home',
      'nav.medicine': 'Medicine',
      'nav.pharmacy': 'Pharmacy',
      'nav.dashboard': 'Dashboard',
      'nav.search': 'Search',
      'nav.forPharmacies': 'For pharmacies',
      'nav.about': 'About',
      'nav.login': 'Pharmacy login',
      'nav.menu': 'Menu',
      'hero.badge': 'Live stock · Amman & Zarqa',
      'hero.title1': 'Find the pharmacy',
      'hero.title2': 'that has your medicine.',
      'hero.lede1': 'Check which nearby pharmacies have your medicine in stock,',
      'hero.lede2': 'then send a reservation request on WhatsApp.',
      'hero.lede2Short': 'then request on WhatsApp.',
      'search.label': 'Search for a medicine',
      'search.placeholder': 'Search a medicine, e.g. Panadol Extra',
      'search.placeholderShort': 'Search a medicine…',
      'search.submit': 'Search',
      'search.useLocation': 'Use my location',
      'search.cityLabel': 'City',
      'city.amman': 'Amman',
      'city.zarqa': 'Zarqa',
      'search.popular': 'Popular',
      'popular.panadol': 'Panadol',
      'popular.augmentin': 'Augmentin',
      'popular.ventolin': 'Ventolin',
      'popular.insulin': 'Insulin',
      'map.medicine': 'Panadol Extra 500 mg',
      'map.nearby': '9 pharmacies nearby',
      'sample.pharmacy': 'Al-Shifa Pharmacy',
      'sample.location': 'Abdoun, Amman · 0.8 km',
      'status.in': 'In stock',
      'sample.updated': 'Updated 12 min ago',
      'sample.request': 'Request',
      'sample.aria': 'Example pharmacy result',
      'how.title': 'How it works',
      'how.sub': 'Three steps from “do you have it?” to “see you soon”.',
      'how.s1.title': 'Search',
      'how.s1.desc': 'Type the medicine name or scan its barcode.',
      'how.s2.title': 'See who has it',
      'how.s2.desc': 'Compare nearby pharmacies by stock, distance and hours.',
      'how.s2.descShort': 'Compare nearby pharmacies by stock and distance.',
      'how.s3.title': 'Request on WhatsApp',
      'how.s3.desc': 'Send a reservation request. The pharmacist confirms.',
      'how.s3.descShort': 'The pharmacist confirms your request.',
      'trust.aria': 'Why people trust Mawjood',
      'trust.licensed': 'Reported by licensed pharmacies',
      'trust.noSale': 'We never sell medicine',
      'trust.updated': 'Stock updates are provided by pharmacies',
      'footer.tagline': 'Find the pharmacy that has your medicine, before you go.',
      'footer.product': 'Product',
      'footer.searchMedicines': 'Search medicines',
      'footer.dashboardDemo': 'Dashboard demo',
      'footer.company': 'Company',
      'footer.aboutTrust': 'About and trust',
      'footer.privacy': 'Privacy',
      'footer.contact': 'Contact',
      'footer.noticeAria': 'Availability notice',
      'footer.notice': 'Availability is reported by pharmacies and may change. Please confirm with your pharmacist. Mawjood does not sell or dispense medicine.',
      'footer.copyright': '© 2026 Mawjood · Sample content',
      'footer.copyrightSuffix': ' for design purposes'
    },
    ar: {
      'a11y.skip': 'انتقل إلى المحتوى',
      'brand.name': 'موجود',
      'nav.home': 'الرئيسية',
      'nav.medicine': 'الدواء',
      'nav.pharmacy': 'الصيدلية',
      'nav.dashboard': 'لوحة التحكم',
      'nav.search': 'ابحث عن دواء',
      'nav.forPharmacies': 'للصيدليات',
      'nav.about': 'عن موجود',
      'nav.login': 'دخول الصيدلية',
      'nav.menu': 'القائمة',
      'hero.badge': 'توفر الأدوية · عمّان والزرقاء',
      'hero.title1': 'اعثر على الصيدلية',
      'hero.title2': 'التي يتوفر لديها دواؤك.',
      'hero.lede1': 'تحقق من الصيدليات القريبة التي يتوفر لديها دواؤك،',
      'hero.lede2': 'ثم أرسل طلب حجز عبر واتساب.',
      'hero.lede2Short': 'ثم أرسل طلبًا عبر واتساب.',
      'search.label': 'ابحث عن دواء',
      'search.placeholder': 'ابحث عن دواء، مثل بانادول إكسترا',
      'search.placeholderShort': 'ابحث عن دواء…',
      'search.submit': 'بحث',
      'search.useLocation': 'استخدم موقعي',
      'search.cityLabel': 'المدينة',
      'city.amman': 'عمّان',
      'city.zarqa': 'الزرقاء',
      'search.popular': 'الأكثر بحثًا',
      'popular.panadol': 'بانادول',
      'popular.augmentin': 'أوجمنتين',
      'popular.ventolin': 'فنتولين',
      'popular.insulin': 'إنسولين',
      'map.medicine': 'بانادول إكسترا 500 ملغ',
      'map.nearby': '9 صيدليات قريبة',
      'sample.pharmacy': 'صيدلية الشفاء',
      'sample.location': 'عبدون، عمّان · 0.8 كم',
      'status.in': 'متوفر',
      'sample.updated': 'آخر تحديث قبل 12 دقيقة',
      'sample.request': 'اطلب',
      'sample.aria': 'مثال على نتيجة صيدلية',
      'how.title': 'كيف يعمل الموقع',
      'how.sub': 'ثلاث خطوات من السؤال عن الدواء إلى تأكيد الطلب.',
      'how.s1.title': 'ابحث',
      'how.s1.desc': 'اكتب اسم الدواء أو امسح الرمز الشريطي.',
      'how.s2.title': 'اعرف مكان توفره',
      'how.s2.desc': 'قارن الصيدليات القريبة حسب التوفر والمسافة وساعات العمل.',
      'how.s2.descShort': 'قارن الصيدليات القريبة حسب التوفر والمسافة.',
      'how.s3.title': 'أرسل الطلب عبر واتساب',
      'how.s3.desc': 'أرسل طلب حجز، ثم تنتظر تأكيد الصيدلي.',
      'how.s3.descShort': 'يؤكد الصيدلي طلبك.',
      'trust.aria': 'لماذا يثق الناس بموجود',
      'trust.licensed': 'معلومات من صيدليات مرخصة',
      'trust.noSale': 'نحن لا نبيع الأدوية',
      'trust.updated': 'تحدّث الصيدليات معلومات التوفر',
      'footer.tagline': 'اعرف الصيدلية التي يتوفر لديها دواؤك قبل أن تذهب.',
      'footer.product': 'الخدمات',
      'footer.searchMedicines': 'البحث عن الأدوية',
      'footer.dashboardDemo': 'تجربة لوحة التحكم',
      'footer.company': 'الشركة',
      'footer.aboutTrust': 'عن موجود والثقة',
      'footer.privacy': 'الخصوصية',
      'footer.contact': 'تواصل معنا',
      'footer.noticeAria': 'تنبيه حول توفر الأدوية',
      'footer.notice': 'تُقدّم الصيدليات معلومات التوفر وقد تتغير. يرجى التأكد من الصيدلي. لا يبيع موجود الأدوية ولا يصرفها.',
      'footer.copyright': '© 2026 موجود · محتوى تجريبي',
      'footer.copyrightSuffix': ' لأغراض التصميم'
    }
  };

  // Read the saved language safely; localStorage may be unavailable in some modes.
  function getSavedLanguage() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      return saved === 'ar' || saved === 'en' ? saved : DEFAULT_LANGUAGE;
    } catch (error) {
      return DEFAULT_LANGUAGE;
    }
  }

  // Translate text and selected accessible attributes without using HTML injection.
  function applyTranslations(language) {
    var dictionary = translations[language] || translations[DEFAULT_LANGUAGE];
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.classList.toggle('is-arabic', language === 'ar');

    document.querySelectorAll('[data-i18n]').forEach(function (element) {
      var key = element.getAttribute('data-i18n');
      if (Object.prototype.hasOwnProperty.call(dictionary, key)) {
        element.textContent = dictionary[key];
      }
    });

    // Translate placeholders, labels and other useful accessibility attributes.
    ['placeholder', 'aria-label', 'title', 'alt'].forEach(function (attribute) {
      var selector = '[data-i18n-' + attribute + ']';
      document.querySelectorAll(selector).forEach(function (element) {
        var key = element.getAttribute('data-i18n-' + attribute);
        if (Object.prototype.hasOwnProperty.call(dictionary, key)) {
          element.setAttribute(attribute, dictionary[key]);
        }
      });
    });

    // Update language buttons so assistive technology can identify the action.
    document.querySelectorAll('[data-lang-toggle]').forEach(function (button) {
      var nextLanguage = language === 'ar' ? 'English' : 'العربية';
      button.setAttribute('aria-label', language === 'ar' ? 'Switch language to English' : 'تغيير اللغة إلى العربية');
      button.setAttribute('title', nextLanguage);
      var label = button.querySelector('.lang-toggle__label');
      if (label) label.textContent = language === 'ar' ? 'عربي | EN' : 'EN | عربي';
    });

    // Let page-specific scripts react to a language change if needed.
    document.dispatchEvent(new CustomEvent('mawjood:languagechange', {
      detail: { language: language, direction: language === 'ar' ? 'rtl' : 'ltr' }
    }));
  }

  function setLanguage(language) {
    if (language !== 'ar' && language !== 'en') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch (error) {
      // The language still changes for the current page if storage is blocked.
    }
    applyTranslations(language);
  }

  // Expose a small API for other scripts and tests.
  window.MawjoodI18n = {
    setLanguage: setLanguage,
    getLanguage: getSavedLanguage,
    translate: function (key) {
      var language = getSavedLanguage();
      return (translations[language] && translations[language][key]) || translations.en[key] || key;
    },
    dictionaries: translations
  };

  // Wire every language toggle and apply the user's saved preference on startup.
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-lang-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        setLanguage(getSavedLanguage() === 'ar' ? 'en' : 'ar');
      });
    });
    applyTranslations(getSavedLanguage());
  });
})();

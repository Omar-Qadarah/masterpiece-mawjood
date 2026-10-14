/* Mawjood WhatsApp request helper.
   Demo only: this opens WhatsApp with a prefilled message; it does not send or store the request.
   Before launch, replace the demo number below with the pharmacy's verified WhatsApp number. */
(function (window, document) {
  'use strict';

  var DEFAULT_PHARMACY_NAME = 'Al-Shifa Pharmacy';
  // WhatsApp numbers must be international digits only: country code + number, without +, spaces, or dashes.
  var DEFAULT_WHATSAPP_NUMBER = '96260000001'; // DEMO NUMBER — replace before production.

  function cleanText(value) {
    return String(value == null ? '' : value).trim();
  }

  function getLanguage() {
    return document.documentElement.lang === 'ar' ? 'ar' : 'en';
  }

  function buildMessage(details) {
    var isArabic = getLanguage() === 'ar';
    var pharmacy = cleanText(details.pharmacyName) || DEFAULT_PHARMACY_NAME;
    var medicine = cleanText(details.medicine);
    var name = cleanText(details.name);
    var phone = cleanText(details.phone);
    var note = cleanText(details.note);

    if (isArabic) {
      return 'مرحباً ' + pharmacy + '، أود الاستفسار عن حجز الدواء التالي.' +
        '\nالدواء: ' + medicine +
        '\nالاسم: ' + name +
        '\nرقم الهاتف: ' + phone +
        (note ? '\nملاحظات: ' + note : '') +
        '\nيرجى تأكيد التوفر وأي متطلبات للوصفة الطبية.';
    }

    return 'Hello ' + pharmacy + ', I would like to ask about reserving this medicine.' +
      '\nMedicine: ' + medicine +
      '\nName: ' + name +
      '\nPhone: ' + phone +
      (note ? '\nNote: ' + note : '') +
      '\nPlease confirm availability and any prescription requirements.';
  }

  function normalizeNumber(number) {
    // Keep digits only; the wa.me endpoint requires an international number without punctuation.
    return cleanText(number).replace(/\D/g, '');
  }

  function createUrl(number, message) {
    var normalized = normalizeNumber(number);
    if (!normalized) {
      throw new Error('A valid pharmacy WhatsApp number is required.');
    }
    return 'https://wa.me/' + normalized + '?text=' + encodeURIComponent(message);
  }

  function showFeedback(form, message) {
    var feedback = form.querySelector('#reservation-feedback') ||
      form.querySelector('[data-whatsapp-feedback]');
    if (!feedback) return;
    feedback.hidden = false;
    feedback.textContent = message;
  }

  function handleReservationForm(form) {
    if (form.dataset.whatsappBound === 'true') return;
    form.dataset.whatsappBound = 'true';

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var pharmacyName = form.dataset.pharmacyName || DEFAULT_PHARMACY_NAME;
      var whatsappNumber = form.dataset.whatsappNumber || DEFAULT_WHATSAPP_NUMBER;
      var message = buildMessage({
        pharmacyName: pharmacyName,
        medicine: data.get('medicine'),
        name: data.get('name'),
        phone: data.get('phone'),
        note: data.get('note')
      });

      try {
        var url = createUrl(whatsappNumber, message);
        // Open directly from the submit gesture to reduce popup-blocking risk.
        var whatsappWindow = window.open(url, '_blank');
        if (whatsappWindow) whatsappWindow.opener = null;
        showFeedback(form, getLanguage() === 'ar'
          ? 'تم تجهيز الطلب. راجع الرسالة في واتساب ثم أرسلها إلى الصيدلية.'
          : 'Your request is ready. Review the message in WhatsApp, then send it to the pharmacy.');
      } catch (error) {
        showFeedback(form, getLanguage() === 'ar'
          ? 'تعذر فتح واتساب. يرجى التحقق من رقم واتساب الخاص بالصيدلية.'
          : 'WhatsApp could not be opened. Please check the pharmacy WhatsApp number.');
      }
    });
  }

  function init() {
    document.querySelectorAll('#reservation-form, [data-whatsapp-reservation-form]').forEach(handleReservationForm);
  }

  window.MawjoodWhatsApp = {
    buildMessage: buildMessage,
    createUrl: createUrl,
    init: init
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);

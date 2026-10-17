/** Reservation preview; never sends an enquiry to an unverified demo number. */
(function (window, document) {
  'use strict';
  const isArabic = () => document.documentElement.lang === 'ar';
  const clean = value => String(value ?? '').trim();

  function buildMessage(details) {
    const pharmacy = clean(details.pharmacyName) || 'Pharmacy';
    const medicine = clean(details.medicine);
    const customer = clean(details.name);
    const phone = clean(details.phone);
    const note = clean(details.note);
    return isArabic()
      ? `مرحباً ${pharmacy}، أرغب في الاستفسار عن حجز الدواء التالي.\nالدواء: ${medicine}\nالاسم: ${customer}\nرقم الهاتف: ${phone}${note ? '\nملاحظات: ' + note : ''}\nيرجى تأكيد التوفر ومتطلبات الوصفة الطبية.`
      : `Hello ${pharmacy}, I would like to ask about reserving a medicine.\nMedicine: ${medicine}\nName: ${customer}\nPhone: ${phone}${note ? '\nNote: ' + note : ''}\nPlease confirm availability and any prescription requirements.`;
  }

  function createUrl(number, text) {
    const digits = clean(number).replace(/\D/g, '');
    if (!/^\d{8,15}$/.test(digits)) throw new Error('Verified WhatsApp number required.');
    return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(text);
  }

  function init(form) {
    if (form.dataset.whatsappBound) return;
    form.dataset.whatsappBound = 'true';
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const fields = new FormData(form);
      const message = buildMessage({
        pharmacyName: form.dataset.pharmacyName,
        medicine: fields.get('medicine'),
        name: fields.get('name'),
        phone: fields.get('phone'),
        note: fields.get('note')
      });
      const feedback = form.querySelector('#reservation-feedback');
      if (!feedback) return;
      feedback.hidden = false;

      // This project contains fabricated phone numbers. Requiring a separately
      // verified number prevents accidental WhatsApp requests to real strangers.
      if (form.dataset.whatsappVerified !== 'true') {
        feedback.textContent = isArabic()
          ? 'طلب تجريبي فقط: لا يوجد رقم واتساب موثّق لهذه الصيدلية. يمكنك مراجعة نص الرسالة أدناه دون إرسالها.'
          : 'Demo preview only: this pharmacy has no verified WhatsApp number. Review the draft below; nothing has been sent.';
        let preview = form.querySelector('#whatsapp-preview');
        if (!preview) {
          preview = document.createElement('textarea');
          preview.id = 'whatsapp-preview';
          preview.className = 'whatsapp-preview';
          preview.rows = 7;
          preview.readOnly = true;
          preview.setAttribute('aria-label', 'Reservation message preview');
          feedback.insertAdjacentElement('afterend', preview);
        }
        preview.value = message;
        return;
      }
      try {
        const url = createUrl(form.dataset.whatsappNumber, message);
        const popup = window.open(url, '_blank', 'noopener,noreferrer');
        feedback.textContent = popup === null
          ? (isArabic() ? 'المتصفح منع النافذة الجديدة؛ حاول السماح بالنوافذ المنبثقة.' : 'Popup blocked. Allow popups to open WhatsApp.')
          : (isArabic() ? 'راجع الرسالة في واتساب قبل إرسالها.' : 'Review the WhatsApp message before sending.');
      } catch (error) { feedback.textContent = error.message; }
    });
  }

  const ready = () => document.querySelectorAll('#reservation-form, [data-whatsapp-reservation-form]').forEach(init);
  window.MawjoodWhatsApp = { buildMessage, createUrl, init: ready };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
})(window, document);

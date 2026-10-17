/** Pharmacy partnership form: opens a local email draft, with no fake recipient. */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const form = document.querySelector('#partner-form');
  if (!form) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form).entries());
    const subject = 'Mawjood pharmacy partnership enquiry - ' + (values.pharmacy || '');
    const body = [
      'Hello Mawjood team,', '',
      'I would like to enquire about pharmacy onboarding.', '',
      'Contact: ' + (values.name || ''),
      'Pharmacy: ' + (values.pharmacy || ''),
      'Phone: ' + (values.phone || ''),
      'City: ' + (values.city || ''),
      ...(values.email ? ['Email: ' + values.email] : []), '',
      'Please contact me about the next steps.'
    ].join('\n');
    const feedback = document.querySelector('#partner-feedback');
    if (feedback) {
      feedback.hidden = false;
      feedback.textContent = document.documentElement.lang === 'ar'
        ? 'ستفتح مسودة بريد بدون عنوان مستلم. أضف البريد الرسمي بعد التأكد منه؛ لم تُرسل أي بيانات تلقائياً.'
        : 'An email draft will open without a recipient. Enter a verified Mawjood contact address; nothing is sent automatically.';
    }
    window.location.href = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
}, { once: true });

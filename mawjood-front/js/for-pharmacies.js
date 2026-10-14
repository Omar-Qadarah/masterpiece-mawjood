/* Partner enquiry form. This demo creates a prefilled email draft; it does not submit to a server. */
document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('#partner-form');
  if (!form) return;
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    var data = new FormData(form);
    var name = String(data.get('name') || '');
    var pharmacy = String(data.get('pharmacy') || '');
    var phone = String(data.get('phone') || '');
    var city = String(data.get('city') || '');
    var email = String(data.get('email') || '');
    var subject = 'Mawjood pharmacy partnership enquiry - ' + pharmacy;
    var body = 'Hello Mawjood team,\\n\\nI am interested in learning about joining Mawjood.\\n\\nContact person: ' + name + '\\nPharmacy: ' + pharmacy + '\\nPhone: ' + phone + '\\nCity: ' + city + (email ? '\\nWork email: ' + email : '') + '\\n\\nPlease contact me about the next steps.\\n';
    var feedback = document.querySelector('#partner-feedback');
    if (feedback) {
      feedback.hidden = false;
      feedback.textContent = 'Your email draft is ready. Review it before sending. No details have been saved by this demo page.';
    }
    /* Replace with the verified partnership inbox before production. */
    window.location.href = 'mailto:partnerships@mawjood.example?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
});

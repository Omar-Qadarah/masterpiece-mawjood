/** Pharmacy login / registration flow for the local demo. */
(function () {
  'use strict';

  const auth = window.MawjoodAuth;
  const loginForm = document.querySelector('#login-form');
  const signupForm = document.querySelector('#signup-form');
  if (!auth || !loginForm || !signupForm) return;

  const loginTab = document.querySelector('#show-login');
  const signupTab = document.querySelector('#show-signup');
  const title = document.querySelector('#login-title');
  const lead = document.querySelector('.login-card__lead');
  const isArabic = () => document.documentElement.lang === 'ar';
  const message = (en, ar) => isArabic() ? ar : en;

  function showMessage(form, text, type = 'error') {
    const node = form.querySelector('.login-message');
    if (!node) return;
    node.textContent = text;
    node.dataset.type = type;
  }

  function changeMode(mode) {
    const signup = mode === 'signup';
    loginForm.hidden = signup;
    signupForm.hidden = !signup;
    loginTab.classList.toggle('is-active', !signup);
    signupTab.classList.toggle('is-active', signup);
    loginTab.setAttribute('aria-selected', String(!signup));
    signupTab.setAttribute('aria-selected', String(signup));
    if (title) title.textContent = signup ? message('Create account', 'إنشاء حساب') : message('Sign in', 'تسجيل الدخول');
    if (lead) lead.textContent = signup
      ? message('Create a local demo account for this browser.', 'أنشئ حساباً تجريبياً محلياً في هذا المتصفح.')
      : message('Enter your account details to continue.', 'أدخل بيانات حسابك للمتابعة.');
    showMessage(loginForm, '');
    showMessage(signupForm, '');
  }

  loginTab?.addEventListener('click', () => changeMode('login'));
  signupTab?.addEventListener('click', () => changeMode('signup'));
  document.addEventListener('mawjood:languagechange', () => changeMode(signupForm.hidden ? 'login' : 'signup'));

  document.querySelectorAll('[data-password-toggle], #toggle-password').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.passwordToggle || 'login-password');
      if (!input) return;
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      button.textContent = visible ? message('Hide', 'إخفاء') : message('Show', 'إظهار');
      button.setAttribute('aria-label', button.textContent + ' password');
    });
  });

  document.querySelector('#forgot-link')?.addEventListener('click', event => {
    event.preventDefault();
    showMessage(loginForm, message(
      'Password recovery requires a real server and is unavailable in this demo.',
      'استعادة كلمة المرور تحتاج إلى خادم حقيقي وهي غير متاحة في النسخة التجريبية.'
    ));
  });

  async function handleSubmission(form, submit) {
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    try { await submit(); }
    catch (error) {
      console.error('Demo authentication failed:', error);
      showMessage(form, message(
        'Could not complete the request. Use localhost/HTTPS and enable browser storage.',
        'تعذّر إكمال العملية. شغّل الموقع عبر localhost أو HTTPS وفعّل تخزين المتصفح.'
      ));
    } finally { button.disabled = false; }
  }

  loginForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!loginForm.reportValidity()) return;
    handleSubmission(loginForm, async () => {
      const email = document.querySelector('#login-email').value;
      const password = document.querySelector('#login-password').value;
      const remember = document.querySelector('#remember-me').checked;
      const result = await auth.signIn(email, password, remember);
      if (result.ok) { window.location.assign('dashboard.html'); return; }
      showMessage(loginForm, result.reason === 'not-found'
        ? message('No account found. Please create one first.', 'لم يُعثر على حساب. أنشئ حساباً أولاً.')
        : message('Incorrect password. Try again.', 'كلمة المرور غير صحيحة. حاول مجدداً.'));
    });
  });

  signupForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!signupForm.reportValidity()) return;
    const name = document.querySelector('#signup-name').value.trim();
    const password = document.querySelector('#signup-password').value;
    const confirmation = document.querySelector('#signup-confirm').value;
    if (name.length < 2 || password.length < 8 || password !== confirmation) {
      showMessage(signupForm, message(
        'Check the name, password length (8+), and password confirmation.',
        'تحقق من الاسم وطول كلمة المرور (8 أحرف على الأقل) وتطابق كلمتي المرور.'
      ));
      return;
    }
    handleSubmission(signupForm, async () => {
      const email = document.querySelector('#signup-email').value;
      const result = await auth.register(name, email, password);
      if (result.ok) { window.location.assign('dashboard.html'); return; }
      showMessage(signupForm, message(
        'This email already has an account. Try signing in.',
        'هذا البريد مسجل بالفعل. جرّب تسجيل الدخول.'
      ));
    });
  });
})();

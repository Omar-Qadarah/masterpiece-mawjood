/**
 * Browser-only demo authentication. Not a substitute for a server-side session.
 * New passwords are PBKDF2-derived with a per-user random salt; existing demo
 * accounts are migrated after a successful legacy sign-in.
 */
(function (window) {
  'use strict';

  const USERS_KEY = 'mawjood:demo-users';
  const SESSION_KEY = 'mawjood:demo-session';
  const ITERATIONS = 120000;
  const encoder = new TextEncoder();
  const safeParse = (value, fallback) => {
    try { return JSON.parse(value) ?? fallback; } catch { return fallback; }
  };

  function users() {
    let raw;
    try { raw = localStorage.getItem(USERS_KEY); } catch { return []; }
    const value = safeParse(raw, []);
    return Array.isArray(value) ? value : [];
  }

  function getSession() {
    let raw = null;
    try { raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY); }
    catch { return null; }
    const value = safeParse(raw, null);
    return value && typeof value.email === 'string' && value.email.includes('@') ? value : null;
  }

  function signOut() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Storage disabled. */ }
    try { localStorage.removeItem(SESSION_KEY); } catch { /* Storage disabled. */ }
  }

  function startSession(user, remember = false) {
    const session = {
      name: user.name,
      email: user.email,
      signedInAt: new Date().toISOString()
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    if (remember) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
    return session;
  }

  const encode = bytes => btoa(String.fromCharCode(...bytes));
  const decode = value => Uint8Array.from(atob(value), char => char.charCodeAt(0));

  async function derivePassword(password, salt, iterations = ITERATIONS) {
    if (!window.crypto?.subtle) {
      throw new Error('Secure browser crypto is unavailable. Run via localhost or HTTPS.');
    }
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256
    );
    return encode(new Uint8Array(bits));
  }

  async function passwordRecord(password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return { salt: encode(salt), hash: await derivePassword(password, salt), iterations: ITERATIONS };
  }

  async function verify(user, password) {
    if (user.credentials?.hash && user.credentials?.salt) {
      const { salt, hash, iterations } = user.credentials;
      const actual = await derivePassword(password, decode(salt), Number(iterations) || ITERATIONS);
      // Compare full fixed-size derived password encodings.
      if (actual.length !== hash.length) return false;
      let difference = 0;
      for (let index = 0; index < actual.length; index++) {
        difference |= actual.charCodeAt(index) ^ hash.charCodeAt(index);
      }
      return difference === 0;
    }
    return typeof user.password === 'string' && user.password === password;
  }

  async function signIn(email, password, remember = false) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const accounts = users();
    const user = accounts.find(item => item.email?.toLowerCase() === normalizedEmail);
    if (!user) return { ok: false, reason: 'not-found' };
    if (!(await verify(user, password))) return { ok: false, reason: 'incorrect-password' };

    // Upgrade the earlier plaintext demo records without losing existing accounts.
    if (Object.hasOwn(user, 'password')) {
      user.credentials = await passwordRecord(password);
      delete user.password;
      localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
    }
    startSession(user, remember);
    return { ok: true, user: { name: user.name, email: user.email } };
  }

  async function register(name, email, password) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const accounts = users();
    if (accounts.some(item => item.email?.toLowerCase() === normalizedEmail)) {
      return { ok: false, reason: 'already-exists' };
    }
    const user = {
      name: String(name).trim(),
      email: normalizedEmail,
      credentials: await passwordRecord(password),
      createdAt: new Date().toISOString()
    };
    accounts.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
    startSession(user, true);
    return { ok: true, user: { name: user.name, email: user.email } };
  }

  window.MawjoodAuth = { getSession, signOut, startSession, signIn, register };
})(window);

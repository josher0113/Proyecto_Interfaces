export const PROFILE_STORAGE_KEY = 'conecta-lsm:local-session:v1';

const usernamePattern = /^[a-z0-9._-]{3,24}$/;
const profileIdPattern = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/;
const saltPattern = /^[a-f0-9]{32}$/;
const verifierPattern = /^[a-f0-9]{64}$/;
const iterations = 600000;
const invalidCredentials = 'Revisa el usuario y la contraseña e inténtalo de nuevo.';
const duplicateUsername = 'Ya hay un perfil con ese usuario en este navegador.';

function getBrowserStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function normalizedUsername(username) {
  return typeof username === 'string' ? username.trim().toLowerCase() : '';
}

function validPassword(password) {
  return typeof password === 'string' && password.length >= 8 && password.length <= 128 && password.trim().length > 0;
}

function findProfile(state, username) {
  if (typeof username !== 'string' || !usernamePattern.test(username) || !Object.hasOwn(state.profiles, username)) return null;
  const profile = state.profiles[username];
  if (!profile || typeof profile.id !== 'string' || !profileIdPattern.test(profile.id)
    || typeof profile.displayName !== 'string' || profile.displayName.length === 0 || profile.displayName.length > 40
    || typeof profile.salt !== 'string' || !saltPattern.test(profile.salt)
    || typeof profile.verifier !== 'string' || !verifierPattern.test(profile.verifier)) return null;
  return profile;
}

function publicProfile({ id, displayName }, username) {
  return { id, displayName, username };
}

function hex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function fromHex(value) {
  return Uint8Array.from(value.match(/../g), byte => Number.parseInt(byte, 16));
}

function equalVerifiers(expected, actual) {
  let differences = 0;
  for (let index = 0; index < expected.length; index++) {
    differences |= expected.charCodeAt(index) ^ actual.charCodeAt(index);
  }
  return differences === 0;
}

export function createLocalProfiles({
  storage = getBrowserStorage(),
  crypto = globalThis.crypto,
  locks = globalThis.navigator?.locks,
} = {}) {
  function available() {
    if (!storage || !crypto?.subtle || typeof crypto.randomUUID !== 'function') return false;
    try {
      storage.getItem(PROFILE_STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  }

  function assertAvailable() {
    if (!available()) throw new Error('Los perfiles requieren almacenamiento local y una conexión HTTPS o localhost. Puedes continuar como invitado.');
  }

  function readState() {
    const saved = storage.getItem(PROFILE_STORAGE_KEY);
    if (saved === null) return { profiles: {}, session: null };
    const corruptedData = 'No se pudo leer la información de los perfiles en este navegador.';
    let state;
    try {
      state = JSON.parse(saved);
    } catch {
      throw new Error(corruptedData);
    }
    if (!state?.profiles || typeof state.profiles !== 'object' || Array.isArray(state.profiles)) {
      throw new Error(corruptedData);
    }
    return state;
  }

  function writeState(state) {
    try {
      storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(state));
    } catch {
      throw new Error('No se pudieron guardar los perfiles. Revisa el almacenamiento del navegador.');
    }
  }

  function updateState(update) {
    // Each write uses the latest records so different tabs can add profiles without losing changes.
    return locks ? locks.request(PROFILE_STORAGE_KEY, update) : update();
  }

  async function deriveVerifier(password, salt) {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bytes = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256);
    return hex(new Uint8Array(bytes));
  }

  function current() {
    try {
      const state = readState();
      const profile = findProfile(state, state.session);
      return profile ? publicProfile(profile, state.session) : null;
    } catch {
      return null;
    }
  }

  async function register({ displayName, username, password }) {
    assertAvailable();
    const name = typeof displayName === 'string' ? displayName.trim().replace(/\s+/g, ' ') : '';
    const alias = normalizedUsername(username);
    if (name.length < 1 || name.length > 40) throw new Error('Escribe un nombre de entre 1 y 40 caracteres.');
    if (!usernamePattern.test(alias)) throw new Error('Usa de 3 a 24 letras sin acentos, números, puntos, guiones o guiones bajos en el usuario.');
    if (!validPassword(password)) throw new Error('Escribe una contraseña de entre 8 y 128 caracteres.');
    if (Object.hasOwn(readState().profiles, alias)) throw new Error(duplicateUsername);

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const verifier = await deriveVerifier(password, salt);
    const profile = { id: crypto.randomUUID(), displayName: name, salt: hex(salt), verifier };
    return updateState(() => {
      const state = readState();
      if (Object.hasOwn(state.profiles, alias)) throw new Error(duplicateUsername);
      writeState({ profiles: { ...state.profiles, [alias]: profile }, session: alias });
      return publicProfile(profile, alias);
    });
  }

  async function signIn({ username, password }) {
    assertAvailable();
    const alias = normalizedUsername(username);
    const profile = findProfile(readState(), alias);
    if (!profile || !validPassword(password)) throw new Error(invalidCredentials);

    const verifier = await deriveVerifier(password, fromHex(profile.salt));
    if (!equalVerifiers(profile.verifier, verifier)) throw new Error(invalidCredentials);
    return updateState(() => {
      const state = readState();
      if (findProfile(state, alias)?.id !== profile.id) throw new Error(invalidCredentials);
      writeState({ profiles: state.profiles, session: alias });
      return publicProfile(profile, alias);
    });
  }

  async function signOut() {
    return updateState(() => {
      const state = readState();
      if (state.session === null) return;
      writeState({ profiles: state.profiles, session: null });
    });
  }

  return { available, current, register, signIn, signOut };
}

const letters = [...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'];
const letterPrefix = 'linguaplay:letter-practice:v1:';
const numberPrefix = 'linguaplay:number-practice:v1:';
const storedValue = '1';

export const LETTER_PRACTICE_GOAL = 3;

export function isLetterPracticeStorageKey(key) {
  return typeof key === 'string' && key.startsWith(letterPrefix);
}

function getBrowserStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function localDateKey(date) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    throw new TypeError('La fecha de práctica debe ser una fecha válida.');
  }
  const year = date.getFullYear();
  if (year < 0 || year > 9999) throw new RangeError('Año de práctica fuera del rango admitido.');
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return [
    String(year).padStart(4, '0'),
    String(month).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-');
}

function isPracticeToken(token, signs) {
  const match = /^([^:]+):(\d{4}-\d{2}-\d{2})$/.exec(token);
  if (!match || !signs.has(match[1])) return false;
  const [, , day] = match;
  const parsed = new Date(day + 'T00:00:00Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().startsWith(day + 'T');
}

function practiceKeyPrefix(prefix, profileId) {
  return profileId == null ? prefix : `${prefix}profile:${encodeURIComponent(profileId)}:`;
}

export function createLetterProgress(storage = getBrowserStorage(), profileId = null) {
  const prefix = practiceKeyPrefix(letterPrefix, profileId);
  return createPracticeProgress(letters, prefix, 'Letra de práctica fuera del abecedario.', storage);
}

export function createNumberProgress(numbers, storage = getBrowserStorage(), profileId = null) {
  const prefix = practiceKeyPrefix(numberPrefix, profileId);
  return createPracticeProgress(numbers.map(String), prefix, 'Número de práctica fuera de la unidad.', storage);
}

export function summarizePracticeStreak(letterSnapshot, numberSnapshot, date = new Date()) {
  const dates = new Set([
    ...(letterSnapshot?.practiceDates ?? []),
    ...(numberSnapshot?.practiceDates ?? []),
  ]);
  const today = localDateKey(date);
  const practicedToday = dates.has(today);
  // Use UTC to step between local calendar labels regardless of daylight saving.
  const cursor = new Date(`${today}T00:00:00Z`);
  if (!practicedToday) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let days = 0;
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    days++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return { days, practicedToday };
}

function createPracticeProgress(signs, keyPrefix, unknownSign, storage) {
  const validSigns = new Set(signs);
  let saved = new Set();
  const pending = new Set();

  function refresh() {
    if (!storage) return false;
    try {
      const latest = new Set();
      for (let index = 0; index < storage.length; index++) {
        const key = storage.key(index);
        if (typeof key !== 'string' || !key.startsWith(keyPrefix)) continue;
        const token = key.slice(keyPrefix.length);
        if (isPracticeToken(token, validSigns) && storage.getItem(key) === storedValue) latest.add(token);
      }
      saved = latest;
      // Another tab may have saved a day while this tab had trouble writing it.
      for (const token of pending) {
        if (saved.has(token)) pending.delete(token);
      }
      return true;
    } catch {
      return false;
    }
  }

  function savePending() {
    try {
      // Each day has its own key, so saving one day cannot overwrite another tab's progress.
      for (const token of pending) {
        storage.setItem(keyPrefix + token, storedValue);
        saved.add(token);
        pending.delete(token);
      }
      return true;
    } catch {
      return false;
    }
  }

  function summarize(today, persistent) {
    const bySign = Object.fromEntries(signs.map(sign => [
      sign, { days: 0, mastered: false, practicedToday: false },
    ]));
    const dates = new Set();
    for (const token of new Set([...saved, ...pending])) {
      const [sign, day] = token.split(':');
      if (day <= today) dates.add(day);
      const entry = bySign[sign];
      entry.days++;
      entry.mastered = entry.days >= LETTER_PRACTICE_GOAL;
      if (day === today) entry.practicedToday = true;
    }
    const masteredCount = Object.values(bySign).filter(entry => entry.mastered).length;
    return { letters: bySign, masteredCount, persistent, practiceDates: [...dates].sort() };
  }

  return {
    snapshot(date = new Date()) {
      const today = localDateKey(date);
      return summarize(today, refresh() && pending.size === 0);
    },

    record(sign, date = new Date()) {
      const label = String(sign);
      if (!validSigns.has(label)) throw new RangeError(unknownSign);
      const today = localDateKey(date);
      const readable = refresh();
      const token = `${label}:${today}`;
      const credited = !saved.has(token) && !pending.has(token);
      if (credited) pending.add(token);
      const persistent = readable && savePending();
      return { credited, ...summarize(today, persistent).letters[label], persistent };
    },
  };
}

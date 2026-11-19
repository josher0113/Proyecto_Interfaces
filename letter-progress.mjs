const letters = [...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'];
const keyPrefix = 'linguaplay:letter-practice:v1:';
const storedValue = '1';

export const LETTER_PRACTICE_GOAL = 3;

export function isLetterPracticeStorageKey(key) {
  return typeof key === 'string' && key.startsWith(keyPrefix);
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

function isPracticeToken(token) {
  const match = /^([A-ZÑ]):(\d{4}-\d{2}-\d{2})$/.exec(token);
  if (!match) return false;
  const day = match[2];
  const parsed = new Date(day + 'T00:00:00Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().startsWith(day + 'T');
}

export function createLetterProgress(storage = getBrowserStorage()) {
  let saved = new Set();
  const pending = new Set();

  function refresh() {
    if (!storage) return false;
    try {
      const latest = new Set();
      for (let index = 0; index < storage.length; index++) {
        const key = storage.key(index);
        if (!isLetterPracticeStorageKey(key)) continue;
        const token = key.slice(keyPrefix.length);
        if (isPracticeToken(token) && storage.getItem(key) === storedValue) latest.add(token);
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
    const byLetter = Object.fromEntries(letters.map(letter => [
      letter, { days: 0, mastered: false, practicedToday: false },
    ]));
    for (const token of new Set([...saved, ...pending])) {
      const [letter, day] = token.split(':');
      const entry = byLetter[letter];
      entry.days++;
      entry.mastered = entry.days >= LETTER_PRACTICE_GOAL;
      if (day === today) entry.practicedToday = true;
    }
    const masteredCount = Object.values(byLetter).filter(entry => entry.mastered).length;
    return { letters: byLetter, masteredCount, persistent };
  }

  return {
    snapshot(date = new Date()) {
      const today = localDateKey(date);
      return summarize(today, refresh() && pending.size === 0);
    },

    record(letter, date = new Date()) {
      if (!letters.includes(letter)) throw new RangeError('Letra de práctica fuera del abecedario.');
      const today = localDateKey(date);
      const readable = refresh();
      const token = `${letter}:${today}`;
      const credited = !saved.has(token) && !pending.has(token);
      if (credited) pending.add(token);
      const persistent = readable && savePending();
      return { credited, ...summarize(today, persistent).letters[letter], persistent };
    },
  };
}

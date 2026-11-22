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

function isCalendarDay(day) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const parsed = new Date(day + 'T00:00:00Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().startsWith(day + 'T');
}

function consecutiveProgress(days, today) {
  const calendarIndex = day => Date.parse(day + 'T00:00:00Z') / 86400000;
  let run = 0;
  let longest = 0;
  let last = -Infinity;
  for (const day of days.filter(day => day <= today).sort()) {
    const index = calendarIndex(day);
    run = index === last + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    last = index;
  }
  const mastered = longest >= LETTER_PRACTICE_GOAL;
  return {
    days: mastered ? LETTER_PRACTICE_GOAL : (calendarIndex(today) - last <= 1 ? run : 0),
    mastered,
  };
}

function createPracticeProgress(items, prefix, consecutive, storage) {
  const allowed = new Set(items);
  let saved = new Set();
  const pending = new Set();

  function refresh() {
    if (!storage) return false;
    try {
      const latest = new Set();
      for (let index = 0; index < storage.length; index++) {
        const key = storage.key(index);
        if (!key?.startsWith(prefix)) continue;
        const token = key.slice(prefix.length);
        const [item, day, extra] = token.split(':');
        if (extra === undefined && allowed.has(item) && isCalendarDay(day) && storage.getItem(key) === storedValue) latest.add(token);
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
        storage.setItem(prefix + token, storedValue);
        saved.add(token);
        pending.delete(token);
      }
      return true;
    } catch {
      return false;
    }
  }

  function summarize(today, persistent) {
    const byItem = Object.fromEntries(items.map(item => [item, []]));
    for (const token of new Set([...saved, ...pending])) {
      const [item, day] = token.split(':');
      byItem[item].push(day);
    }
    const entries = Object.fromEntries(Object.entries(byItem).map(([item, days]) => [
      item, {
        ...(consecutive ? consecutiveProgress(days, today) : { days: days.length, mastered: days.length >= LETTER_PRACTICE_GOAL }),
        practicedToday: days.includes(today),
      },
    ]));
    const masteredCount = Object.values(entries).filter(entry => entry.mastered).length;
    return { entries, masteredCount, persistent };
  }

  return {
    snapshot(date = new Date()) {
      const today = localDateKey(date);
      return summarize(today, refresh() && pending.size === 0);
    },

    record(item, date = new Date()) {
      if (!allowed.has(item)) throw new RangeError('La seña no está en esta unidad.');
      const today = localDateKey(date);
      const readable = refresh();
      const token = `${item}:${today}`;
      const credited = !saved.has(token) && !pending.has(token);
      if (credited) pending.add(token);
      const persistent = readable && savePending();
      return { credited, ...summarize(today, persistent).entries[item], persistent };
    },
  };
}

export function createLetterProgress(storage = getBrowserStorage()) {
  const progress = createPracticeProgress(letters, keyPrefix, false, storage);
  return {
    snapshot(date) {
      const { entries: letters, ...summary } = progress.snapshot(date);
      return { letters, ...summary };
    },
    record: progress.record,
  };
}

export function createVocabularyProgress(items, storage = getBrowserStorage()) {
  return createPracticeProgress(items, 'linguaplay:vocabulary-practice:v1:', true, storage);
}

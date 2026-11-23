import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createLetterProgress, createNumberProgress, isLetterPracticeStorageKey,
  LETTER_PRACTICE_GOAL, summarizePracticeStreak,
} from '../letter-progress.mjs';

process.env.TZ = 'America/Mexico_City';

const localDate = (day, hour = 12) => new Date(2026, 10, day, hour);

function createStorage() {
  const data = new Map();
  return {
    get length() { return data.size; },
    key(index) { return [...data.keys()][index] ?? null; },
    getItem(key) { return data.get(key) ?? null; },
    setItem(key, value) { data.set(key, value); },
    clear() { data.clear(); },
  };
}

test('starts with all 27 letters and counts only one practice on a local date', () => {
  const progress = createLetterProgress(createStorage());
  assert.deepEqual(Object.keys(progress.snapshot().letters), [...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ']);
  assert.deepEqual(progress.snapshot().letters.Ñ, { days: 0, mastered: false, practicedToday: false });

  assert.deepEqual(progress.record('Ñ', localDate(19, 8)), {
    credited: true, days: 1, mastered: false, practicedToday: true, persistent: true,
  });
  assert.deepEqual(progress.record('Ñ', localDate(19, 23)), {
    credited: false, days: 1, mastered: false, practicedToday: true, persistent: true,
  });
  assert.equal(progress.snapshot(localDate(20, 0)).letters.Ñ.practicedToday, false);
  assert.equal(progress.record('Ñ', localDate(20, 0)).credited, true);
});

test('counts number practice on distinct dates and preserves separate letter records', () => {
  const storage = createStorage();
  const numbers = createNumberProgress(['1', '20', '1000'], storage);
  const letters = createLetterProgress(storage);
  letters.record('A', localDate(12));
  assert.equal(numbers.record('20', localDate(12)).credited, true);
  assert.equal(numbers.record('20', localDate(12, 18)).credited, false);
  assert.equal(numbers.record('20', localDate(15)).mastered, false);
  assert.equal(numbers.record('20', localDate(19)).mastered, true);
  const reloaded = createNumberProgress(['1', '20', '1000'], storage);
  assert.equal(reloaded.snapshot(localDate(20)).letters['20'].mastered, true);
  assert.equal(reloaded.snapshot(localDate(20)).letters['1000'].days, 0);
  assert.equal(letters.snapshot(localDate(20)).letters.A.days, 1);
  assert.throws(() => numbers.record('25', localDate(20)), RangeError);
});

test('separates guest and profile histories for letters and numbers', () => {
  const storage = createStorage();
  const date = localDate(19);
  storage.setItem('linguaplay:letter-practice:v1:A:2026-11-19', '1');
  storage.setItem('linguaplay:number-practice:v1:2:2026-11-19', '1');

  const guestLetters = createLetterProgress(storage);
  const guestNumbers = createNumberProgress([1, 2], storage);
  const firstLetters = createLetterProgress(storage, 'first-profile');
  const firstNumbers = createNumberProgress([1, 2], storage, 'first-profile');

  assert.equal(firstLetters.snapshot(date).letters.A.days, 0);
  assert.equal(firstNumbers.snapshot(date).letters['2'].days, 0);
  assert.deepEqual(summarizePracticeStreak(firstLetters.snapshot(date), firstNumbers.snapshot(date), date),
    { days: 0, practicedToday: false });
  assert.equal(firstLetters.record('A', date).credited, true);
  assert.equal(firstNumbers.record(2, date).credited, true);
  firstLetters.record('B', date);
  firstNumbers.record(1, date);

  assert.equal(guestLetters.snapshot(date).letters.A.days, 1);
  assert.equal(guestNumbers.snapshot(date).letters['2'].days, 1);
  assert.equal(guestLetters.snapshot(date).letters.B.days, 0);
  assert.equal(guestNumbers.snapshot(date).letters['1'].days, 0);
  assert.equal(createLetterProgress(storage, 'first-profile').snapshot(date).letters.B.days, 1);
  assert.equal(createNumberProgress([1, 2], storage, 'first-profile').snapshot(date).letters['1'].days, 1);
  assert.equal(createLetterProgress(storage, 'second-profile').snapshot(date).letters.A.days, 0);
  assert.equal(createNumberProgress([1, 2], storage, 'second-profile').snapshot(date).letters['2'].days, 0);
});

test('counts consecutive practice dates across letters and numbers', () => {
  const storage = createStorage();
  const letters = createLetterProgress(storage);
  const numbers = createNumberProgress([2], storage);
  const streakAt = date => summarizePracticeStreak(letters.snapshot(date), numbers.snapshot(date), date);

  assert.deepEqual(streakAt(localDate(17)), { days: 0, practicedToday: false });
  letters.record('A', localDate(17, 23));
  assert.deepEqual(streakAt(localDate(17, 23)), { days: 1, practicedToday: true });
  numbers.record(2, localDate(18, 0));
  numbers.record(2, localDate(19));
  letters.record('B', localDate(19));
  letters.record('A', localDate(19));
  letters.record('A', localDate(22));

  assert.deepEqual(letters.snapshot(localDate(19)).practiceDates, ['2026-11-17', '2026-11-19']);
  assert.deepEqual(numbers.snapshot(localDate(19)).practiceDates, ['2026-11-18', '2026-11-19']);
  assert.deepEqual(streakAt(localDate(19)), { days: 3, practicedToday: true });
  assert.deepEqual(streakAt(localDate(20)), { days: 3, practicedToday: false });
  assert.deepEqual(streakAt(localDate(21)), { days: 0, practicedToday: false });
  assert.deepEqual(streakAt(localDate(22)), { days: 1, practicedToday: true });
});

test('keeps the streak across a local daylight-saving transition', () => {
  const progress = createLetterProgress(createStorage());
  progress.record('A', new Date(2021, 3, 3, 23));
  progress.record('B', new Date(2021, 3, 4, 23));
  const date = new Date(2021, 3, 5, 0);
  assert.deepEqual(summarizePracticeStreak(progress.snapshot(date), null, date),
    { days: 2, practicedToday: false });
});

test('marks the third distinct date as mastery and restores it on reload', () => {
  const storage = createStorage();
  const progress = createLetterProgress(storage);
  for (const day of [9, 14]) {
    assert.equal(progress.record('A', localDate(day)).mastered, false);
  }
  assert.equal(progress.record('A', localDate(19)).mastered, true);
  const reloaded = createLetterProgress(storage);
  assert.deepEqual(reloaded.snapshot(localDate(20)).letters.A, {
    days: LETTER_PRACTICE_GOAL, mastered: true, practicedToday: false,
  });
  assert.equal(reloaded.snapshot(localDate(20)).masteredCount, 1);
  assert.equal(reloaded.snapshot(localDate(20)).letters.B.days, 0);
  assert.equal(reloaded.record('A', localDate(20)).days, LETTER_PRACTICE_GOAL + 1);
});

test('shares progress across stores and honors storage clearing', () => {
  const storage = createStorage();
  const firstTab = createLetterProgress(storage);
  const secondTab = createLetterProgress(storage);
  firstTab.record('A', localDate(19));
  secondTab.record('B', localDate(19));
  assert.equal(secondTab.record('A', localDate(19)).credited, false);
  assert.equal(firstTab.snapshot(localDate(19)).letters.B.practicedToday, true);
  assert.equal(isLetterPracticeStorageKey(storage.key(0)), true);
  assert.equal(isLetterPracticeStorageKey(null), false);
  assert.equal(isLetterPracticeStorageKey('other-key'), false);
  storage.clear();
  assert.equal(firstTab.snapshot(localDate(19)).letters.A.days, 0);
});

test('ignores corrupt records, unknown keys, and invalid calendar dates', () => {
  const storage = createStorage();
  const progress = createLetterProgress(storage);
  progress.record('A', localDate(19));
  const prefix = storage.key(0).split('A:')[0];
  storage.setItem(prefix + 'A:2026-02-31', '1');
  storage.setItem(prefix + 'A:2026-11-20', '{broken');
  storage.setItem(prefix + '?:2026-11-19', '1');
  storage.setItem('linguaplay:letter-practice:v0:A:2026-11-20', '1');
  assert.equal(progress.snapshot(localDate(19)).letters.A.days, 1);
  assert.throws(() => progress.record('CH', localDate(19)), RangeError);
  assert.throws(() => progress.record('A', new Date('invalid')), TypeError);
  assert.throws(() => progress.snapshot('2026-11-19'), TypeError);
});

test('preserves credit in memory when browser storage is unavailable', () => {
  const progress = createLetterProgress(null);
  assert.equal(progress.snapshot(localDate(19)).persistent, false);
  for (const day of [17, 18, 19]) progress.record('C', localDate(day));
  assert.equal(progress.snapshot(localDate(19)).letters.C.mastered, true);
  assert.equal(progress.record('C', localDate(19)).credited, false);
  assert.equal(progress.snapshot(localDate(19)).persistent, false);
});

test('recovers a day after a write failure without duplicating credit', () => {
  const storage = createStorage();
  createLetterProgress(storage).record('A', localDate(18));
  const originalWrite = storage.setItem;
  storage.setItem = () => { throw Error('quota'); };
  const progress = createLetterProgress(storage);
  assert.deepEqual(progress.record('A', localDate(19)), {
    credited: true, days: 2, mastered: false, practicedToday: true, persistent: false,
  });
  assert.equal(progress.snapshot(localDate(19)).persistent, false);
  storage.setItem = originalWrite;
  assert.deepEqual(progress.record('A', localDate(19)), {
    credited: false, days: 2, mastered: false, practicedToday: true, persistent: true,
  });
  assert.equal(createLetterProgress(storage).snapshot(localDate(19)).letters.A.days, 2);
});

test('retains prior reads if access to storage later fails', () => {
  const storage = createStorage();
  const progress = createLetterProgress(storage);
  progress.record('A', localDate(18));
  storage.getItem = () => { throw Error('blocked'); };
  assert.equal(progress.snapshot(localDate(19)).letters.A.days, 1);
  assert.equal(progress.snapshot(localDate(19)).persistent, false);
  assert.equal(progress.record('A', localDate(19)).days, 2);
});

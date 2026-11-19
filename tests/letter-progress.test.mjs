import assert from 'node:assert/strict';
import test from 'node:test';
import { createLetterProgress, isLetterPracticeStorageKey, LETTER_PRACTICE_GOAL } from '../letter-progress.mjs';

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

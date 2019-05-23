import { get, set, setAsync, deleteAll } from '.';

beforeAll(() => localStorage.clear());
afterAll(() => localStorage.clear());

describe('storage utilities', () => {
  describe('set', () => {
    it('should set a value', () => {
      set('key', 20);
      expect(Object.entries(localStorage)).toEqual([
        [expect.stringMatching(/key$/), '20'],
      ]);
    });
  });

  describe('setAsync', () => {
    it('should asynchronously set a value', async () => {
      const setPromise = setAsync('key-async', 25);
      expect(Object.entries(localStorage)).toEqual([
        [expect.stringMatching(/key$/), '20'],
      ]);
      await setPromise;
      expect(Object.entries(localStorage)).toEqual([
        [expect.stringMatching(/key$/), '20'],
        [expect.stringMatching(/key-async$/), '25'],
      ]);
    });
  });

  describe('get', () => {
    it('should get a value', () => expect(get('key', 'default')).toBe(20));

    it('should get a value, and return default if not existing', () =>
      expect(get('unexisting', 'default')).toBe('default'));
  });

  describe('deleteAll', () => {
    it('should delete all entries', () => {
      deleteAll();
      expect(Object.entries(localStorage)).toEqual([]);
    });
  });
});

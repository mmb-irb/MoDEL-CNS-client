import { get, set, deleteAll } from '.';

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

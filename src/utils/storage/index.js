const KEY = 'MoDEL-CNS-';

export const get = (key, defaultValue) => {
  const storedValue = localStorage.getItem(KEY + key);
  if (storedValue === null) return defaultValue;
  return JSON.parse(storedValue);
};

export const set = (key, value) => {
  localStorage.setItem(KEY + key, JSON.stringify(value));
};

export const deleteAll = () => {
  Object.keys(localStorage)
    .filter(key => key.startsWith(KEY))
    .forEach(localStorage.deleteItem);
};

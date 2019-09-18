import hashFromString from '../hash-from-string/index';

const colorFromString = string => {
  const hash = hashFromString(string);
  const hue = Math.abs(hash % 360);
  const saturation = Math.abs(hash % 20) + 40; // 50% give or take 10%
  const lightness = Math.abs(hash % 10) + 45; // 50% give or take 5%
  return `hsla(${hue}, ${saturation}%, ${lightness}%, 1)`;
};

export default colorFromString;

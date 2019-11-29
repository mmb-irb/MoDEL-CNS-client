/**
 * @param {number | string} n
 */
const numberFormatter = n => {
  const _n = +n;
  if (!window.Intl || !window.Intl.NumberFormat) {
    return `${_n}`;
  }
  const formatter = new window.Intl.NumberFormat('en-UK');
  return formatter.format(_n);
};

export default numberFormatter;

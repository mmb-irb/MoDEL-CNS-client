export default n => {
  const _n = +n;
  if (!window.Intl || !window.Intl.NumberFormat) {
    return `${_n}`;
  }
  const formatter = new window.Intl.NumberFormat('en-UK');
  return formatter.format(_n);
};

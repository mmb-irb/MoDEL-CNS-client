export default (() => {
  if (!('Intl' in window) || !('NumberFormat' in window.Intl))
    return n => `${+n}`;
  const formatter = new window.Intl.NumberFormat('en-UK');
  return n => formatter.format(+n);
})();

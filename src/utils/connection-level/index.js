export const LOW = Symbol('low');
export const MEDIUM = Symbol('medium');
export const HIGH = Symbol('high');

const connectionLevel = () => {
  if (!(navigator && 'connection' in navigator)) return MEDIUM;
  const { effectiveType, saveData } = navigator.connection;
  if (saveData === true) return LOW;
  if (saveData || !effectiveType) return MEDIUM;
  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return LOW;
    case '3g':
      return MEDIUM;
    case '4g':
      return HIGH;
    default:
      return HIGH;
  }
};

export default connectionLevel;

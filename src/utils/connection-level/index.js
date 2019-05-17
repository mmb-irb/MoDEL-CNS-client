export const LOW = Symbol('low');
export const MEDIUM = Symbol('medium');
export const HIGH = Symbol('high');

const connectionLevel = () => {
  if (!(navigator && navigator.connection)) return MEDIUM;
  const { effectiveType, saveData } = navigator.connection;
  if (saveData === true) return LOW;
  if (!effectiveType) return MEDIUM;
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

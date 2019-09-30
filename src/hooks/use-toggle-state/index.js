import { useState, useCallback } from 'react';

const useToggleState = initialState => {
  const [state, setState] = useState(!!initialState);

  const toggleState = useCallback(valueOrSetter => {
    switch (typeof valueOrSetter) {
      // setter
      case 'function':
        setState(valueOrSetter);
        break;
      // boolean, or boolean casting for the following cases
      case 'boolean':
      case 'number':
      case 'string':
        setState(!!valueOrSetter);
        break;
      // just toggle if undefined, or an object (might be an Event)
      default:
        setState(state => !state);
    }
  }, []);

  return [state, toggleState];
};

export default useToggleState;

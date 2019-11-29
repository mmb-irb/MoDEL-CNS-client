import { useState, useCallback } from 'react';

// useToggleState is a custom hook which returns a state and a custom function to calculate the new state
const useToggleState = initialState => {
  // useState is a React hook which returns a state and a function to change this state respectively
  // The state is the initialState at the moment it is called
  const [state, setState] = useState(!!initialState);
  // useCallback is a React hook which returns a memoize callback
  const toggleState = useCallback(valueOrSetter => {
    // Set the state according to the input type
    switch (typeof valueOrSetter) {
      // Funtions are accepted and set as state
      case 'function':
        setState(valueOrSetter);
        break;
      // In case of booleans, numers and strings, a function that returns the opposite in boolean format is returned
      case 'boolean':
      case 'number':
      case 'string':
        setState(Boolean(valueOrSetter));
        break;
      // In other cases, returns a function which just change the state to the opposite of the previours state in boolean format
      default:
        setState(state => !state);
    }
  }, []);

  return [state, toggleState];
};

export default useToggleState;

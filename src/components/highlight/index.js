import React from 'react';
import { escapeRegExp, memoize } from 'lodash-es';

import style from './style.module.css';

// A fragment of text is converted to a specific RegExp format
// The generated RexExp matches each word from the original text (highlight)
const spaces = /\s+/;
// Memoize saves the result of the function when the properties are the same
const getRegExFor = memoize(
  highlight =>
    new RegExp(
      `(${highlight
        .toString() // Convert it into a string
        .trim() // Remove spaces
        .split(spaces) // Split by a previously defined RegExp
        // escapeRegExp returns a string which "escapes" RegExp special characters
        .map(escapeRegExp) // It is equivalent to adding "\" before each special character
        .join('|')})`, // Finally, join all split fragments separated by "|"
      'i', // "i" is a RegExp flag called "ignore case"
    ),
);

// This function finds text fragments inside a text input which must be highlighted
// This function expects to recieve 2 propierties: "highlight" and "children"
// "highlight" is a text search provided by the user
// "children" is all the text where the highlight must be serached
// Propierties are delcared as <Highlight highlight={highlight}> children </Highlight>
// This function returns multiple reacts elements which contain text chunks tagged to be marked or not
const Highlight = React.memo(({ highlight, children }) => {
  if (Array.isArray(children)) {
    return children.map((child, i) => (
      <Highlight highlight={highlight} key={i}>
        {child}
      </Highlight>
    ));
  }

  // If there is no text to highlight or selected children, send the children back
  // If children is not a string or a finite number, send the children back
  if (
    !highlight ||
    !children ||
    !(typeof children === 'string' || Number.isFinite(children))
  ) {
    return children || null; // If children is falsy (undefined or similar) returns null instead, which is supported by React
  }

  // Generates a RegExp pattern that matches each word from the provided text search (highlight)
  const re = getRegExFor(highlight);

  return (
    <span className={style.highlightable}>
      {children
        .toString() // Convert it into a string
        .split(re) // Split the children by the previously generated RegExp pattern
        .filter(Boolean) // Save only non empty ("") strings
        .map((chunk, index) =>
          React.createElement(
            // Create a new React element for each chunk
            // Since children has been split by the "re" RegExp pattern, the half of the chunks should match this pattern
            // Chunks wich match "re" are tagged as "mark" and chunk which do not match are tagged as "span"
            re.test(chunk) ? 'mark' : 'span',
            { key: index }, // Save the array index as "key" attribute of an object
            chunk, // save the chunk itself
          ),
        )}
    </span>
  );
});

export default Highlight;

import React, { memo, useState, useRef, useCallback } from 'react';
import screenfull from 'screenfull';

import {
  IconButton,
  Popover,
  Paper,
  Button,
  ButtonGroup,
  Slider,
} from '@material-ui/core';

import style from './style.module.css';

// Display a small panel to select which chains to display or hide adn the membrane opacity
const Chains = memo(({ // Array with all chain letters ("A","B","C"...)
  chains, // Hook string added to the NGL selection string to filter the displayed chains
  bannedChains, // 'bannedChains' setter
  chainBanner, // Label to display over the chain buttons
  label, children, // Boolean to show or not the membrane opacity slide
  membrane, // Hook numeric value
  membraneOpacity, // Label to display over the membrane opacity slide
  membraneLabel, // 'membraneOpacity' setter
  handleChange, // Other
  ...buttonProps }) => {
  const [element, setElement] = useState(null);
  // Track the state of each chain: they may be hidden (true) or visible (false)
  const hidden = useRef(new Array(chains.length).fill(false));

  return (
    <>
      <IconButton
        {...buttonProps}
        onClick={event => setElement(event.currentTarget)}
      >
        {children}
      </IconButton>
      <Popover
        open={!!element}
        anchorEl={element}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        data-popover
        container={screenfull.element || document.body}
        onClose={useCallback(() => setElement(null), [])}
      >
        <Paper className={style['popover-paper']}>
          {label && <span>{label}</span>}
          <ButtonGroup
            className={style['popover-chains']}
            variant="text"
            aria-label="outlined primary button group"
          >
            {chains &&
              chains.map(chain => (
                <Button
                  key={chain}
                  // Display the button as contained if the chain is visible
                  variant={
                    hidden.current[chains.findIndex(c => c === chain)]
                      ? 'text'
                      : 'contained'
                  }
                  // When the button is clicked, modify the NGL selection string 'bannedChains'
                  onClick={() => {
                    const chainIndex = chains.findIndex(c => c === chain);
                    hidden.current[chainIndex] = !hidden.current[chainIndex];
                    if (hidden.current[chainIndex])
                      chainBanner(bannedChains + (' and not :' + chain));
                    else
                      chainBanner(
                        bannedChains.replace(' and not :' + chain, ''),
                      );
                  }}
                >
                  {chain}
                </Button>
              ))}
          </ButtonGroup>
          {/* Render the membrane opacity slider only if it is required */}
          {membrane && <span>{membraneLabel}</span>}
          {membrane && (
            <Slider
              value={membraneOpacity}
              onChange={handleChange}
              className={style['popover-slider']}
            />
          )}
        </Paper>
      </Popover>
    </>
  );
});

export default Chains;

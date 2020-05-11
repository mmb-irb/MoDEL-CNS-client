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

const Chains = memo(
  ({
    chains,
    bannedChains,
    chainBanner,
    label,
    children,
    membraneOpacity,
    membraneLabel,
    handleChange,
    ...buttonProps
  }) => {
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
                    // When the button is clicked, modify the NGL selection string 'chains'
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
            {membraneLabel && <span>{membraneLabel}</span>}
            <Slider
              value={membraneOpacity}
              onChange={handleChange}
              className={style['popover-slider']}
            />
          </Paper>
        </Popover>
      </>
    );
  },
);

export default Chains;

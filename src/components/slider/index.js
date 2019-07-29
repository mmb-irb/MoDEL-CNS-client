import React, { memo, useState, useCallback } from 'react';
import screenfull from 'screenfull';

import {
  IconButton,
  Popover,
  Paper,
  Slider as MaterialSlider,
} from '@material-ui/core';

import style from './style.module.css';

const Slider = memo(
  ({ value, label, handleChange, children, ...buttonProps }) => {
    // useState
    const [element, setElement] = useState(null);

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
            <MaterialSlider
              value={value}
              onChange={handleChange}
              className={style['popover-slider']}
            />
          </Paper>
        </Popover>
      </>
    );
  },
);

export default Slider;

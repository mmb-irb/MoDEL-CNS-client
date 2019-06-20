import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';

import Slider from '.';

describe('<Slider />', () => {
  let wrapper;

  afterAll(cleanup);

  describe('no projection selected', () => {
    afterAll(() => wrapper.unmount());

    it('should render', () => {
      wrapper = render(<Slider value={50} label="Some label:" />);
      expect(wrapper.container).toBeInstanceOf(HTMLElement);
      expect(wrapper.container).toMatchSnapshot();
    });

    it('should render without label', () => {
      wrapper = render(<Slider value={50} className="button-class" />);
      expect(wrapper.container).toBeInstanceOf(HTMLElement);
      expect(wrapper.container).toMatchSnapshot();
    });

    it('should handle clicks', () => {
      expect(
        wrapper.container.parentElement.querySelector('[data-popover]'),
      ).toBeNull();

      // open
      fireEvent.click(wrapper.container.querySelector('.button-class'));
      const popover = wrapper.container.parentElement.querySelector(
        '[data-popover] > [role=document]',
      );
      expect(popover).toBeInstanceOf(HTMLElement);

      // close by clicking on backdrop
      fireEvent.click(
        wrapper.container.parentElement.querySelector(
          '[data-popover] > :not([role=document])',
        ),
      );
      expect(
        wrapper.container.parentElement.querySelector(
          '[data-popover]:not([aria-hidden=true]) > [role=document]',
        ),
      ).toBeNull();
    });

    it('should handle click to open, escape to close', () => {
      // open
      fireEvent.click(wrapper.container.querySelector('.button-class'));
      const popover = wrapper.container.parentElement.querySelector(
        '[data-popover] > [role=document]',
      );
      expect(popover).toBeInstanceOf(HTMLElement);

      // close by escaping
      fireEvent.keyDown(popover, { key: 'Escape', code: 27 });
      expect(
        wrapper.container.parentElement.querySelector(
          '[data-popover]:not([aria-hidden=true]) > [role=document]',
        ),
      ).toBeNull();
    });
  });
});

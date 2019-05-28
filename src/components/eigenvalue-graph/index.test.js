import React, { useState } from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import EigenvalueGraph from '.';
import style from './style.module.css';

const data = [{ eigenvalue: 50, data: [1, 2] }, { eigenvalue: 50 }];

describe('<EigenvalueGraph />', () => {
  let wrapper;

  afterAll(cleanup);

  describe('no projection selected', () => {
    const ref = {};

    afterAll(() => wrapper.unmount());

    it('should render', () => {
      const Component = () => {
        const [projections, setProjections] = useState([]);
        ref.current = projections;
        return (
          <EigenvalueGraph
            data={data}
            totalEigenvalue={100}
            projections={projections}
            setProjections={setProjections}
          />
        );
      };
      wrapper = render(<Component />);
      expect(wrapper.container).toBeInstanceOf(HTMLElement);
    });

    it('should handle clicks', () => {
      expect(ref.current).toEqual([]);
      let target = wrapper.container.querySelector(
        `.${style.target} rect.${style['has-projection']}`,
      );
      fireEvent.click(target);
      expect(ref.current).toEqual([0]);
      target = wrapper.container.querySelector(
        `.${style.target} rect:not(.${style['has-projection']})`,
      );
      fireEvent.click(target);
      expect(ref.current).toEqual([0]);
    });
  });

  describe('one projection selected', () => {
    const ref = {};

    afterAll(() => wrapper.unmount());

    it('should render', () => {
      const Component = () => {
        const [projections, setProjections] = useState([0]);
        ref.current = projections;
        return (
          <EigenvalueGraph
            data={data}
            totalEigenvalue={100}
            projections={projections}
            setProjections={setProjections}
          />
        );
      };
      wrapper = render(<Component />);
      expect(wrapper.container).toBeInstanceOf(HTMLElement);
    });

    it('should handle clicks', () => {
      expect(ref.current).toEqual([0]);
      let target = wrapper.container.querySelector(
        `.${style.target} rect.${style['has-projection']}`,
      );
      fireEvent.click(target);
      expect(ref.current).toEqual([]);
      target = wrapper.container.querySelector(
        `.${style.target} rect:not(.${style['has-projection']})`,
      );
      fireEvent.click(target);
      expect(ref.current).toEqual([]);
    });
  });
});

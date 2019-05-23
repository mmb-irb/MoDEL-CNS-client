import React from 'react';
import { shallow } from 'enzyme';

import Trajectory, { TrajectoryMetadata } from '.';
import { ProjectCtx } from '../../../contexts';

describe('<Trajectory />', () => {
  it('should render', () => expect(shallow(<Trajectory />)).toMatchSnapshot());
});

describe('<TrajectoryMetadata />', () => {
  const metadata = {
    BOXSIZEX: 13.66313,
    BOXSIZEY: 13.66313,
    BOXSIZEZ: 14.49403,
    BOXTYPE: 'Triclinic',
    CL: 263,
    DPPC: 601,
    ENSEMBLE: 'NPT',
    FF: 'gromos53a6',
    FREQUENCY: 100,
    LENGTH: 100,
    MEMBRANE: 'DPPC',
    NA: 251,
    PCOUPLING: 'Semiisotropic',
    PROT: 570,
    PROTATS: 6050,
    SNAPSHOTS: 1000,
    SOL: 61651,
    SYSTATS: 221567,
    TEMP: 300,
    TIMESTEP: 2,
    WAT: 'TIP3P',
    atomCount: 36100,
    frameCount: 10001,
  };
  it('should render', () =>
    expect(
      shallow(
        <ProjectCtx.Provider value={{ metadata }}>
          <TrajectoryMetadata />
        </ProjectCtx.Provider>,
      ),
    ).toMatchSnapshot());
});

import React from 'react';
import { shallow } from 'enzyme';

import StatisticsTable from '.';

describe('<StatisticsTable />', () => {
  it('should render empty table', () => {
    expect(shallow(<StatisticsTable />)).toMatchSnapshot();
  });

  it('should render table with data', () => {
    expect(
      shallow(
        <StatisticsTable
          y={{
            rgyr: { average: Math.PI, stddev: 1 },
            'other-analysis': { average: 2, stddev: 2 },
          }}
        />,
      ),
    ).toMatchSnapshot();
  });
});

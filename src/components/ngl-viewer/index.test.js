import React from 'react';
import { shallow } from 'enzyme';

import { AccessionCtx, ProjectCtx, PdbCtx } from '../../contexts';
import NGLViewer from '.';

const renderWrapped = children =>
  shallow(
    <AccessionCtx.Provider value="MCNS00001">
      <ProjectCtx.Provider value={{ metadata: {} }}>
        <PdbCtx.Provider value={{}}>{children}</PdbCtx.Provider>
      </ProjectCtx.Provider>
    </AccessionCtx.Provider>,
  );

describe('<NGLViewer />', () => {
  it('should render without crashing', () => {
    expect(() => renderWrapped(<NGLViewer />)).not.toThrow();
  });
});

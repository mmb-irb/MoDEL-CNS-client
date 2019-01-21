import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Root from '../Root';

const App = () => (
  <Router basename={process.env.REACT_APP_ROOT}>
    <Root />
  </Router>
);

export default App;

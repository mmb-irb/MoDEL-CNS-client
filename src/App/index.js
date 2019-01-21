import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Root from '../Root';

const App = () => (
  <Router basename={process.env.PUBLIC_URL}>
    <Root />
  </Router>
);

export default App;

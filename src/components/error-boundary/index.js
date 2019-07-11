import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  state = { hasError: false };

  componentDidCatch(error, errorInfo) {
    this.setState({ hasError: true });

    console.error(error);
    console.error(errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <h1>
          An error happened. Try to reload the page. If the error persists
          please <Link to="/contact">get in touch and report it</Link>
        </h1>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

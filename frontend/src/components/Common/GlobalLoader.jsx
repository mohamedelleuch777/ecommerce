import React from 'react';
import './GlobalLoader.css';

const GlobalLoader = () => {
  return (
    <div className="global-loader">
      <div className="global-loader-content">
        <div className="spinner-large"></div>
        <h2>Loading...</h2>
        <p>Initializing application...</p>
      </div>
    </div>
  );
};

export default GlobalLoader;
import React from 'react';
import styles from './GlobalLoader.module.css';

const GlobalLoader = () => {
  return (
    <div className={styles.globalLoader}>
      <div className={styles.globalLoaderContent}>
        <div className={styles.spinnerLarge}></div>
        <h2>Loading...</h2>
        <p>Initializing application...</p>
      </div>
    </div>
  );
};

export default GlobalLoader;
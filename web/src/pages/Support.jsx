import React from 'react';
import Layout from '../components/Layout';
import styles from './Support.module.css';

const Support = () => {
  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Support</h1>
        <div className={styles.content}>
          <p>Page de support en construction.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Support;

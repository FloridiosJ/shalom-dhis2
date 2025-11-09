import React from 'react';
import styles from './FormRow.module.css';

/**
 * FormRow - Container for side-by-side form fields
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.gap - Gap between fields (sm, md, lg)
 */
const FormRow = ({ children, gap = 'md' }) => {
  return (
    <div className={`${styles.formRow} ${styles[`gap-${gap}`]}`}>
      {children}
    </div>
  );
};

export default FormRow;

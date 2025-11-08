import React, { useState } from 'react';
import styles from './Tooltip.module.css';

const Tooltip = ({ children, text, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className={styles.tooltipWrapper}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && text && (
        <div 
          className={`${styles.tooltip} ${styles[position]}`}
          role="tooltip"
          aria-live="polite"
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;

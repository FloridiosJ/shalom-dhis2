import React from 'react';
import styles from './Avatar.module.css';

const Avatar = ({ firstName, lastName, size = 'medium' }) => {
  const getInitials = () => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}` || '?';
  };

  return (
    <div className={`${styles.avatar} ${styles[size]}`} aria-label={`Avatar de ${firstName} ${lastName}`}>
      <span className={styles.initials}>{getInitials()}</span>
    </div>
  );
};

export default Avatar;

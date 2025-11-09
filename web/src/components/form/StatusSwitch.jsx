import React from 'react';
import styles from './StatusSwitch.module.css';

/**
 * StatusSwitch - Toggle switch for active/inactive status
 * @param {Object} props
 * @param {string} props.id - Switch ID
 * @param {string} props.name - Switch name
 * @param {boolean} props.checked - Is switch checked (active)
 * @param {function} props.onChange - Change handler
 * @param {boolean} props.disabled - Is switch disabled
 * @param {string} props.activeLabel - Label for active state
 * @param {string} props.inactiveLabel - Label for inactive state
 * @param {string} props.ariaLabel - Aria label
 */
const StatusSwitch = ({
  id = 'statusSwitch',
  name = 'isActive',
  checked = true,
  onChange,
  disabled = false,
  activeLabel = 'Actif',
  inactiveLabel = 'Inactif',
  ariaLabel = 'Statut',
}) => {
  return (
    <div className={styles.statusSwitch}>
      <span className={styles.label}>Statut</span>
      <div className={styles.switchContainer}>
        <span className={`${styles.statusLabel} ${!checked ? styles.active : ''}`}>
          {inactiveLabel}
        </span>
        <label className={styles.switch} htmlFor={id}>
          <input
            type="checkbox"
            id={id}
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            aria-label={ariaLabel}
            className={styles.checkbox}
          />
          <span className={styles.slider}></span>
        </label>
        <span className={`${styles.statusLabel} ${checked ? styles.active : ''}`}>
          {activeLabel}
        </span>
      </div>
    </div>
  );
};

export default StatusSwitch;

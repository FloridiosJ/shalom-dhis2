import React from 'react';
import styles from './SelectField.module.css';

/**
 * SelectField - Reusable dropdown/select component
 * @param {Object} props
 * @param {string} props.label - Label text
 * @param {string} props.id - Select ID
 * @param {string} props.name - Select name
 * @param {string} props.value - Selected value
 * @param {function} props.onChange - Change handler
 * @param {Array} props.options - Array of {value, label, icon} objects
 * @param {boolean} props.required - Is field required
 * @param {boolean} props.disabled - Is field disabled
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message
 * @param {string} props.ariaLabel - Aria label
 */
const SelectField = ({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  placeholder = 'Sélectionner une option',
  error = '',
  ariaLabel,
}) => {
  return (
    <div className={styles.formGroup}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true"> *</span>}
        </label>
      )}
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-label={ariaLabel || label}
        className={`${styles.select} ${error ? styles.selectError : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.icon ? `${opt.icon} ${opt.label}` : opt.label}
          </option>
        ))}
      </select>
      {error && <div className={styles.errorField}>{error}</div>}
    </div>
  );
};

export default SelectField;

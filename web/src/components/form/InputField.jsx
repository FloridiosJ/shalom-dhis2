import React from 'react';
import styles from './InputField.module.css';

/**
 * Reusable InputField component
 * @param {Object} props
 * @param {string} props.label - Label text
 * @param {string} props.id - Input ID
 * @param {string} props.name - Input name
 * @param {string} props.type - Input type
 * @param {string} props.value - Input value
 * @param {function} props.onChange - Change handler
 * @param {boolean} props.required - Is field required
 * @param {boolean} props.disabled - Is field disabled
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message
 * @param {string} props.ariaLabel - Aria label
 * @param {Object} props.inputRef - Input reference
 * @param {string} props.autoComplete - Autocomplete attribute
 */
const InputField = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = '',
  error = '',
  ariaLabel,
  inputRef,
  autoComplete,
}) => {
  return (
    <div className={styles.formGroup}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true"> *</span>}
        </label>
      )}
      <input
        ref={inputRef}
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        aria-label={ariaLabel || label}
        autoComplete={autoComplete}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      />
      {error && <div className={styles.errorField}>{error}</div>}
    </div>
  );
};

export default InputField;

import React from 'react';
import styles from './InputWithGenerator.module.css';

/**
 * InputWithGenerator - Input field with a generate button
 * Used for login and password fields
 * @param {Object} props
 * @param {string} props.label - Label text
 * @param {string} props.id - Input ID
 * @param {string} props.name - Input name
 * @param {string} props.type - Input type
 * @param {string} props.value - Input value
 * @param {function} props.onChange - Change handler
 * @param {function} props.onGenerate - Generate button handler
 * @param {boolean} props.required - Is field required
 * @param {boolean} props.disabled - Is field disabled
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message
 * @param {string} props.ariaLabel - Aria label
 * @param {boolean} props.showGenerator - Show generate button
 * @param {string} props.generatorLabel - Generate button text
 */
const InputWithGenerator = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  onGenerate,
  required = false,
  disabled = false,
  placeholder = '',
  error = '',
  ariaLabel,
  showGenerator = true,
  generatorLabel = 'Générer',
}) => {
  return (
    <div className={styles.formGroup}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={styles.inputRow}>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          aria-label={ariaLabel || label}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
        />
        {showGenerator && onGenerate && (
          <button
            type="button"
            onClick={onGenerate}
            disabled={disabled}
            aria-label={`Générer ${label?.toLowerCase() || 'valeur'}`}
            className={styles.genBtn}
          >
            {generatorLabel}
          </button>
        )}
      </div>
      {error && <div className={styles.errorField}>{error}</div>}
    </div>
  );
};

export default InputWithGenerator;

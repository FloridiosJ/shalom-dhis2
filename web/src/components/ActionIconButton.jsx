import React from 'react';
import Tooltip from './Tooltip';
import styles from './ActionIconButton.module.css';

/**
 * ActionIconButton - Generic accessible icon button with tooltip support
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {Function} props.onClick - Click handler
 * @param {string} props.ariaLabel - Accessibility label (required)
 * @param {string} props.variant - Button variant: 'edit' | 'delete' (default: 'edit')
 * @param {string} props.tooltipText - Tooltip text (optional)
 * @param {string} props.tooltipPosition - Tooltip position: 'top' | 'bottom' | 'left' | 'right' (default: 'left')
 * @param {boolean} props.disabled - Disabled state (default: false)
 * @param {string} props.className - Additional CSS classes
 */
const ActionIconButton = ({
  icon,
  onClick,
  ariaLabel,
  variant = 'edit',
  tooltipText,
  tooltipPosition = 'left',
  disabled = false,
  className = ''
}) => {
  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${styles.actionIconButton} ${styles[variant]} ${className}`}
    >
      {icon}
    </button>
  );

  // Wrap with Tooltip if tooltipText is provided
  if (tooltipText) {
    return (
      <Tooltip text={tooltipText} position={tooltipPosition}>
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default ActionIconButton;

import React from 'react';
import ActionIconButton from './ActionIconButton';
import DeleteIcon from './icons/DeleteIcon';

/**
 * DeleteButton - Convenient wrapper for delete action buttons
 * @param {Object} props
 * @param {Function} props.onClick - Click handler
 * @param {string} props.ariaLabel - Accessibility label (default: "Supprimer")
 * @param {string} props.tooltipText - Tooltip text (optional, e.g., "Supprimer le patient")
 * @param {string} props.tooltipPosition - Tooltip position (default: 'left')
 * @param {boolean} props.disabled - Disabled state (default: false)
 * @param {string} props.className - Additional CSS classes
 */
const DeleteButton = ({
  onClick,
  ariaLabel = "Supprimer",
  tooltipText,
  tooltipPosition = 'left',
  disabled = false,
  className = ''
}) => {
  return (
    <ActionIconButton
      icon={<DeleteIcon />}
      onClick={onClick}
      ariaLabel={ariaLabel}
      variant="delete"
      tooltipText={tooltipText}
      tooltipPosition={tooltipPosition}
      disabled={disabled}
      className={className}
    />
  );
};

export default DeleteButton;

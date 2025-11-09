import React from 'react';
import ActionIconButton from './ActionIconButton';
import EditIcon from './icons/EditIcon';

/**
 * EditButton - Convenient wrapper for edit action buttons
 * @param {Object} props
 * @param {Function} props.onClick - Click handler
 * @param {string} props.ariaLabel - Accessibility label (default: "Modifier")
 * @param {string} props.tooltipText - Tooltip text (optional, e.g., "Modifier le patient")
 * @param {string} props.tooltipPosition - Tooltip position (default: 'left')
 * @param {boolean} props.disabled - Disabled state (default: false)
 * @param {string} props.className - Additional CSS classes
 */
const EditButton = ({
  onClick,
  ariaLabel = "Modifier",
  tooltipText,
  tooltipPosition = 'left',
  disabled = false,
  className = ''
}) => {
  return (
    <ActionIconButton
      icon={<EditIcon />}
      onClick={onClick}
      ariaLabel={ariaLabel}
      variant="edit"
      tooltipText={tooltipText}
      tooltipPosition={tooltipPosition}
      disabled={disabled}
      className={className}
    />
  );
};

export default EditButton;

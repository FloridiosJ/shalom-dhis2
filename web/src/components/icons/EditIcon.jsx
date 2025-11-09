import React from 'react';

/**
 * EditIcon - SVG icon for edit actions
 * @param {Object} props
 * @param {number} props.width - Icon width (default: 18)
 * @param {number} props.height - Icon height (default: 18)
 */
const EditIcon = ({ width = 18, height = 18 }) => (
  <svg 
    width={width} 
    height={height} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 0 0 .707-.293l9.414-9.414a2 2 0 0 0 0-2.828l-3.172-3.172a2 2 0 0 0-2.828 0L4.293 14.879A1 1 0 0 0 4 15.586V20z"/>
  </svg>
);

export default EditIcon;

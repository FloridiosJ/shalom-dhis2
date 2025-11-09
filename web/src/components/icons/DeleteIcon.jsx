import React from 'react';

/**
 * DeleteIcon - SVG icon for delete actions
 * @param {Object} props
 * @param {number} props.width - Icon width (default: 18)
 * @param {number} props.height - Icon height (default: 18)
 */
const DeleteIcon = ({ width = 18, height = 18 }) => (
  <svg 
    width={width} 
    height={height} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3m5 0H4"/>
  </svg>
);

export default DeleteIcon;

import React from 'react';
import PropTypes from 'prop-types';

/**
 * AppLogo Component - Displays the Shalom DHIS2 logo
 * 
 * @param {Object} props - Component props
 * @param {number} props.width - Width of the logo (default: 200)
 * @param {number} props.height - Height of the logo (default: 200)
 * @param {string} props.variant - Logo variant: 'full', 'mark', or 'mono' (default: 'full')
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.alt - Alternative text for accessibility
 */
// Base styles for the logo (constant)
const logoBaseStyles = {
  maxWidth: '100%',
  display: 'inline-block',
  verticalAlign: 'middle',
};

export const AppLogo = ({
  width = 200,
  height = 200,
  variant = 'full',
  className = '',
  alt = 'Logo Shalom DHIS2 - Système de gestion de santé',
}) => {
  const getLogoPath = () => {
    // Construct path relative to the public assets
    const basePath = '/assets/branding/logos';
    
    switch (variant) {
      case 'mark':
        return `${basePath}/shalom-mark.svg`;
      case 'mono':
        return `${basePath}/shalom-logo-mono.svg`;
      case 'full':
      default:
        return `${basePath}/shalom-logo.svg`;
    }
  };

  // Dynamic styles based on props
  const dynamicStyles = {
    ...logoBaseStyles,
    width: width ? `${width}px` : 'auto',
    height: height ? `${height}px` : 'auto',
  };

  return (
    <img
      src={getLogoPath()}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={dynamicStyles}
    />
  );
};

AppLogo.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  variant: PropTypes.oneOf(['full', 'mark', 'mono']),
  className: PropTypes.string,
  alt: PropTypes.string,
};

export default AppLogo;

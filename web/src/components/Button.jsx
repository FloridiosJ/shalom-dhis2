export function Button({ 
  onClick, 
  children, 
  variant = 'primary', 
  size = 'medium',
  icon,
  disabled = false,
  ...props 
}) {
  const variants = {
    primary: {
      backgroundColor: '#2563eb',
      hoverColor: '#1d4ed8',
      color: 'white'
    },
    danger: {
      backgroundColor: '#dc2626',
      hoverColor: '#b91c1c',
      color: 'white'
    },
    success: {
      backgroundColor: '#059669',
      hoverColor: '#047857',
      color: 'white'
    },
    secondary: {
      backgroundColor: '#6b7280',
      hoverColor: '#4b5563',
      color: 'white'
    }
  };

  const sizes = {
    small: {
      padding: '0.5rem 1rem',
      fontSize: '0.75rem'
    },
    medium: {
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem'
    },
    large: {
      padding: '1rem 2rem',
      fontSize: '1rem'
    }
  };

  const currentVariant = variants[variant];
  const currentSize = sizes[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? '#9ca3af' : currentVariant.backgroundColor,
        color: currentVariant.color,
        padding: currentSize.padding,
        fontSize: currentSize.fontSize,
        fontWeight: '500',
        borderRadius: '8px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        opacity: disabled ? 0.6 : 1,
        ...props.style
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.backgroundColor = currentVariant.hoverColor;
          e.target.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.backgroundColor = currentVariant.backgroundColor;
          e.target.style.transform = 'translateY(0px)';
        }
      }}
      {...props}
    >
      {icon && icon}
      {children}
    </button>
  );
}
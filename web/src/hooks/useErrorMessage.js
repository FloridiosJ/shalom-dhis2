import { useState, useEffect } from 'react';

export const useErrorMessage = (duration = 5000) => {
  const [error, setError] = useState('');

  const showError = (message) => {
    setError(message);
  };

  const clearError = () => {
    setError('');
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [error, duration]);

  return { error, showError, clearError };
};
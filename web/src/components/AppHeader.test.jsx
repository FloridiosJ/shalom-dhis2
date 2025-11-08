import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppHeader from './AppHeader';
import { AuthContext } from '../context/AuthContext';

describe('AppHeader', () => {
  let mockLogout;

  beforeEach(() => {
    mockLogout = vi.fn();
  });

  const renderWithAuth = (ui, { authValue = {} } = {}) => {
    const defaultAuthValue = {
      user: { email: 'test@example.com', role: 'admin' },
      isAuthenticated: true,
      loading: false,
      logout: mockLogout,
      ...authValue,
    };

    return render(
      <AuthContext.Provider value={defaultAuthValue}>
        {ui}
      </AuthContext.Provider>
    );
  };

  it('renders the header with default title', () => {
    renderWithAuth(<AppHeader />);
    
    expect(screen.getByText('SDC Shalom')).toBeInTheDocument();
  });

  it('renders the header with custom title', () => {
    renderWithAuth(<AppHeader title="Custom Title" />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders the logout button', () => {
    renderWithAuth(<AppHeader />);
    
    const logoutButton = screen.getByRole('button', { name: /déconnexion/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', () => {
    renderWithAuth(<AppHeader />);
    
    const logoutButton = screen.getByRole('button', { name: /déconnexion/i });
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('renders the diamond icon', () => {
    const { container } = renderWithAuth(<AppHeader />);
    
    // Check if SVG icon exists
    const svgIcon = container.querySelector('svg');
    expect(svgIcon).toBeInTheDocument();
  });
});

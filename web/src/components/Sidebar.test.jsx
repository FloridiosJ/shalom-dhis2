import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import { AuthContext } from '../context/AuthContext';

describe('Sidebar Toggle Button', () => {
  let mockLogout;

  beforeEach(() => {
    mockLogout = vi.fn();
  });

  const renderLayout = ({ user = { email: 'test@example.com', role: 'admin' } } = {}) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ user, logout: mockLogout, isAuthenticated: true, loading: false }}>
          <Layout title="Test Page">
            <div>Test Content</div>
          </Layout>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  describe('Collapse Toggle Button', () => {
    it('renders the collapse toggle button', () => {
      renderLayout();
      
      const toggleButton = screen.getByRole('button', { name: /réduire la barre latérale/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('has proper aria-expanded attribute when expanded', () => {
      renderLayout();
      
      const toggleButton = screen.getByRole('button', { name: /réduire la barre latérale/i });
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('has proper aria-expanded attribute when collapsed', () => {
      renderLayout();
      
      const toggleButton = screen.getByRole('button', { name: /réduire la barre latérale/i });
      
      // Click to collapse
      fireEvent.click(toggleButton);
      
      // Now check for collapsed state
      const collapsedButton = screen.getByRole('button', { name: /étendre la barre latérale/i });
      expect(collapsedButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('has proper aria-label when expanded', () => {
      renderLayout();
      
      const toggleButton = screen.getByRole('button', { name: /réduire la barre latérale/i });
      expect(toggleButton).toHaveAttribute('aria-label', 'Réduire la barre latérale');
    });

    it('has proper aria-label when collapsed', () => {
      renderLayout();
      
      const toggleButton = screen.getByRole('button', { name: /réduire la barre latérale/i });
      
      // Click to collapse
      fireEvent.click(toggleButton);
      
      // Now check for collapsed state
      const collapsedButton = screen.getByRole('button', { name: /étendre la barre latérale/i });
      expect(collapsedButton).toHaveAttribute('aria-label', 'Étendre la barre latérale');
    });

    it('toggles sidebar state when clicked', () => {
      renderLayout();
      
      const toggleButton = screen.getByRole('button', { name: /réduire la barre latérale/i });
      
      // Initial state - expanded
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      
      // Click to collapse
      fireEvent.click(toggleButton);
      
      // Should now be collapsed
      const collapsedButton = screen.getByRole('button', { name: /étendre la barre latérale/i });
      expect(collapsedButton).toHaveAttribute('aria-expanded', 'false');
      
      // Click to expand
      fireEvent.click(collapsedButton);
      
      // Should be expanded again
      const expandedButton = screen.getByRole('button', { name: /réduire la barre latérale/i });
      expect(expandedButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('is keyboard accessible', () => {
      renderLayout();
      
      const toggleButton = screen.getByRole('button', { name: /réduire la barre latérale/i });
      toggleButton.focus();
      
      expect(toggleButton).toHaveFocus();
    });
  });

  describe('Mobile Toggle Button', () => {
    it('renders the mobile hamburger menu button', () => {
      renderLayout();
      
      const mobileToggle = screen.getByRole('button', { name: /ouvrir le menu/i });
      expect(mobileToggle).toBeInTheDocument();
    });

    it('has proper aria-expanded attribute', () => {
      renderLayout();
      
      const mobileToggle = screen.getByRole('button', { name: /ouvrir le menu/i });
      expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
    });

    it('toggles mobile menu when clicked', () => {
      renderLayout();
      
      const mobileToggle = screen.getByRole('button', { name: /ouvrir le menu/i });
      
      // Click to open
      fireEvent.click(mobileToggle);
      
      // Should now show close button
      const closeButton = screen.getByRole('button', { name: /fermer le menu/i });
      expect(closeButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Navigation Items', () => {
    it('renders navigation items for admin role', () => {
      renderLayout({ user: { email: 'admin@test.com', role: 'admin' } });
      
      expect(screen.getByText('Accueil')).toBeInTheDocument();
      expect(screen.getByText('Patients')).toBeInTheDocument();
      expect(screen.getByText('Dispensaires')).toBeInTheDocument();
      expect(screen.getByText('Utilisateurs')).toBeInTheDocument();
    });
  });
});


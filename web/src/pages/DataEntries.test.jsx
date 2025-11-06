import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DataEntries from './DataEntries';
import * as useAuthHook from '../hooks/useAuth';

// Mock all the services
vi.mock('../services/dataEntries', () => ({
  default: {
    getAll: vi.fn(() => Promise.resolve([])),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  }
}));

vi.mock('../services/patients', () => ({
  default: {
    getAll: vi.fn(() => Promise.resolve([])),
  }
}));

vi.mock('../services/dispensaires', () => ({
  default: {
    getAll: vi.fn(() => Promise.resolve([])),
  }
}));

vi.mock('../services/categories', () => ({
  default: {
    getAll: vi.fn(() => Promise.resolve([])),
  }
}));

describe('DataEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should hide "Ajouter une consultation" button for admin users', async () => {
    // Mock useAuth to return admin user
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAdmin: () => true,
      user: { role: 'admin' }
    });

    render(
      <BrowserRouter>
        <DataEntries />
      </BrowserRouter>
    );

    // Wait for the component to render
    await screen.findByText('Consultations');

    // Button should not be present for admin
    expect(screen.queryByText('Ajouter une consultation')).not.toBeInTheDocument();
  });

  it('should show "Ajouter une consultation" button for non-admin users', async () => {
    // Mock useAuth to return non-admin user (agent)
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAdmin: () => false,
      user: { role: 'agent' }
    });

    render(
      <BrowserRouter>
        <DataEntries />
      </BrowserRouter>
    );

    // Wait for the component to render
    await screen.findByText('Consultations');

    // Button should be present for non-admin
    expect(screen.getByText('Ajouter une consultation')).toBeInTheDocument();
  });

  it('should show "Ajouter une consultation" button for manager users', async () => {
    // Mock useAuth to return manager user
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAdmin: () => false,
      user: { role: 'manager' }
    });

    render(
      <BrowserRouter>
        <DataEntries />
      </BrowserRouter>
    );

    // Wait for the component to render
    await screen.findByText('Consultations');

    // Button should be present for manager
    expect(screen.getByText('Ajouter une consultation')).toBeInTheDocument();
  });
});

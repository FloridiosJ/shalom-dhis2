import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BadgeStatus from '../components/BadgeStatus';

describe('BadgeStatus', () => {
  it('renders active status correctly', () => {
    render(<BadgeStatus isActive={true} />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Actif');
  });

  it('renders inactive status correctly', () => {
    render(<BadgeStatus isActive={false} />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Inactif');
  });

  it('supports custom text for active status', () => {
    render(<BadgeStatus isActive={true} activeText="Active" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Active');
  });

  it('supports custom text for inactive status', () => {
    render(<BadgeStatus isActive={false} inactiveText="Inactive" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Inactive');
  });
});

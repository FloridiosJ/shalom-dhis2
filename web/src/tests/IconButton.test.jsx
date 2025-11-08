import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IconButton from '../components/IconButton';

describe('IconButton', () => {
  it('renders edit variant correctly', () => {
    render(<IconButton variant="edit" ariaLabel="Edit user" onClick={() => {}} />);
    const button = screen.getByRole('button', { name: 'Edit user' });
    expect(button).toBeInTheDocument();
  });

  it('renders delete variant correctly', () => {
    render(<IconButton variant="delete" ariaLabel="Delete user" onClick={() => {}} />);
    const button = screen.getByRole('button', { name: 'Delete user' });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<IconButton variant="edit" ariaLabel="Edit" onClick={handleClick} />);
    
    const button = screen.getByRole('button', { name: 'Edit' });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<IconButton variant="edit" ariaLabel="Edit" onClick={() => {}} disabled={true} />);
    const button = screen.getByRole('button', { name: 'Edit' });
    expect(button).toBeDisabled();
  });
});

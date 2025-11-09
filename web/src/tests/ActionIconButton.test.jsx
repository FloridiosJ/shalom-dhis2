import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionIconButton from '../components/ActionIconButton';
import EditIcon from '../components/icons/EditIcon';
import DeleteIcon from '../components/icons/DeleteIcon';

describe('ActionIconButton', () => {
  it('renders with edit variant', () => {
    const handleClick = vi.fn();
    render(
      <ActionIconButton
        icon={<EditIcon />}
        onClick={handleClick}
        ariaLabel="Edit item"
        variant="edit"
      />
    );
    
    const button = screen.getByRole('button', { name: 'Edit item' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Edit item');
  });

  it('renders with delete variant', () => {
    const handleClick = vi.fn();
    render(
      <ActionIconButton
        icon={<DeleteIcon />}
        onClick={handleClick}
        ariaLabel="Delete item"
        variant="delete"
      />
    );
    
    const button = screen.getByRole('button', { name: 'Delete item' });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(
      <ActionIconButton
        icon={<EditIcon />}
        onClick={handleClick}
        ariaLabel="Edit"
        variant="edit"
      />
    );
    
    const button = screen.getByRole('button', { name: 'Edit' });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <ActionIconButton
        icon={<EditIcon />}
        onClick={() => {}}
        ariaLabel="Edit"
        variant="edit"
        disabled={true}
      />
    );
    
    const button = screen.getByRole('button', { name: 'Edit' });
    expect(button).toBeDisabled();
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <ActionIconButton
        icon={<EditIcon />}
        onClick={handleClick}
        ariaLabel="Edit"
        variant="edit"
        disabled={true}
      />
    );
    
    const button = screen.getByRole('button', { name: 'Edit' });
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with tooltip when tooltipText is provided', () => {
    render(
      <ActionIconButton
        icon={<EditIcon />}
        onClick={() => {}}
        ariaLabel="Edit"
        variant="edit"
        tooltipText="Edit this item"
      />
    );
    
    const button = screen.getByRole('button', { name: 'Edit' });
    expect(button).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <ActionIconButton
        icon={<EditIcon />}
        onClick={() => {}}
        ariaLabel="Edit"
        variant="edit"
        className="custom-class"
      />
    );
    
    const button = screen.getByRole('button', { name: 'Edit' });
    expect(button.className).toContain('custom-class');
  });
});

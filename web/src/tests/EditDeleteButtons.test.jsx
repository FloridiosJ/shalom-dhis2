import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';

describe('EditButton', () => {
  it('renders with default aria label', () => {
    const handleClick = vi.fn();
    render(<EditButton onClick={handleClick} />);
    
    const button = screen.getByRole('button', { name: 'Modifier' });
    expect(button).toBeInTheDocument();
  });

  it('renders with custom aria label', () => {
    const handleClick = vi.fn();
    render(<EditButton onClick={handleClick} ariaLabel="Modifier le patient" />);
    
    const button = screen.getByRole('button', { name: 'Modifier le patient' });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<EditButton onClick={handleClick} />);
    
    const button = screen.getByRole('button', { name: 'Modifier' });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<EditButton onClick={() => {}} disabled={true} />);
    
    const button = screen.getByRole('button', { name: 'Modifier' });
    expect(button).toBeDisabled();
  });

  it('renders with tooltip when tooltipText is provided', () => {
    render(
      <EditButton
        onClick={() => {}}
        ariaLabel="Modifier le patient"
        tooltipText="Modifier le patient"
      />
    );
    
    const button = screen.getByRole('button', { name: 'Modifier le patient' });
    expect(button).toBeInTheDocument();
  });
});

describe('DeleteButton', () => {
  it('renders with default aria label', () => {
    const handleClick = vi.fn();
    render(<DeleteButton onClick={handleClick} />);
    
    const button = screen.getByRole('button', { name: 'Supprimer' });
    expect(button).toBeInTheDocument();
  });

  it('renders with custom aria label', () => {
    const handleClick = vi.fn();
    render(<DeleteButton onClick={handleClick} ariaLabel="Supprimer le patient" />);
    
    const button = screen.getByRole('button', { name: 'Supprimer le patient' });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<DeleteButton onClick={handleClick} />);
    
    const button = screen.getByRole('button', { name: 'Supprimer' });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<DeleteButton onClick={() => {}} disabled={true} />);
    
    const button = screen.getByRole('button', { name: 'Supprimer' });
    expect(button).toBeDisabled();
  });

  it('renders with tooltip when tooltipText is provided', () => {
    render(
      <DeleteButton
        onClick={() => {}}
        ariaLabel="Supprimer le patient"
        tooltipText="Supprimer le patient"
      />
    );
    
    const button = screen.getByRole('button', { name: 'Supprimer le patient' });
    expect(button).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PrescriptionSubForm from './PrescriptionSubForm';

describe('PrescriptionSubForm', () => {
  const mockOnChange = vi.fn();
  const mockOnRemove = vi.fn();

  const defaultValue = {
    medicament: '',
    dose: '',
    frequence: '',
    duree: '',
    notes: ''
  };

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnRemove.mockClear();
  });

  it('renders all required fields', () => {
    render(
      <PrescriptionSubForm 
        value={defaultValue} 
        onChange={mockOnChange} 
      />
    );

    expect(screen.getByText(/Médicament/)).toBeInTheDocument();
    expect(screen.getByText(/Dose/)).toBeInTheDocument();
    expect(screen.getByText(/Fréquence/)).toBeInTheDocument();
    expect(screen.getByText(/Durée/)).toBeInTheDocument();
    expect(screen.getByText(/Notes/)).toBeInTheDocument();
  });

  it('displays index when provided', () => {
    render(
      <PrescriptionSubForm 
        value={defaultValue} 
        onChange={mockOnChange}
        index={0}
      />
    );

    expect(screen.getByText('Médicament #1')).toBeInTheDocument();
  });

  it('displays remove button when onRemove is provided', () => {
    render(
      <PrescriptionSubForm 
        value={defaultValue} 
        onChange={mockOnChange}
        onRemove={mockOnRemove}
      />
    );

    const removeButton = screen.getByTitle('Retirer ce médicament');
    expect(removeButton).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', () => {
    render(
      <PrescriptionSubForm 
        value={defaultValue} 
        onChange={mockOnChange}
        onRemove={mockOnRemove}
      />
    );

    const removeButton = screen.getByTitle('Retirer ce médicament');
    fireEvent.click(removeButton);
    
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it('updates dose field when changed', () => {
    render(
      <PrescriptionSubForm 
        value={defaultValue} 
        onChange={mockOnChange}
      />
    );

    const doseInput = screen.getByPlaceholderText(/Ex: 500mg, 2 comprimés.../);
    fireEvent.change(doseInput, { target: { value: '500mg' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultValue,
      dose: '500mg'
    });
  });

  it('updates notes field when changed', () => {
    render(
      <PrescriptionSubForm 
        value={defaultValue} 
        onChange={mockOnChange}
      />
    );

    const notesInput = screen.getByPlaceholderText(/Précisions pour ce médicament.../);
    fireEvent.change(notesInput, { target: { value: 'Prendre après le repas' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultValue,
      notes: 'Prendre après le repas'
    });
  });

  it('disables all fields when disabled prop is true', () => {
    render(
      <PrescriptionSubForm 
        value={defaultValue} 
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const doseInput = screen.getByPlaceholderText(/Ex: 500mg, 2 comprimés.../);
    const notesInput = screen.getByPlaceholderText(/Précisions pour ce médicament.../);
    
    expect(doseInput).toBeDisabled();
    expect(notesInput).toBeDisabled();
  });

  it('hides labels when showLabels is false', () => {
    render(
      <PrescriptionSubForm 
        value={defaultValue} 
        onChange={mockOnChange}
        showLabels={false}
      />
    );

    // Labels should not be in the document
    expect(screen.queryByText(/^Dose$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Notes$/)).not.toBeInTheDocument();
  });

  it('renders with pre-filled values', () => {
    const filledValue = {
      medicament: 'Paracétamol',
      dose: '500mg',
      frequence: '3x/jour',
      duree: '3 jours',
      notes: 'Après les repas'
    };

    render(
      <PrescriptionSubForm 
        value={filledValue} 
        onChange={mockOnChange}
      />
    );

    expect(screen.getByDisplayValue('500mg')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Après les repas')).toBeInTheDocument();
  });

  it('marks medicament field as required', () => {
    render(
      <PrescriptionSubForm 
        value={defaultValue} 
        onChange={mockOnChange}
      />
    );

    // Check for the required indicator (red asterisk)
    const medicamentLabel = screen.getByText(/Médicament/);
    expect(medicamentLabel.parentElement).toContainHTML('*');
  });
});

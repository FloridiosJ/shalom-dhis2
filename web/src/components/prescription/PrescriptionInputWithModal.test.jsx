import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PrescriptionInputWithModal from './PrescriptionInputWithModal';

describe('PrescriptionInputWithModal', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders input field with placeholder text', () => {
    render(
      <PrescriptionInputWithModal 
        prescriptions={[]} 
        onChange={mockOnChange} 
      />
    );

    expect(screen.getByText('Cliquez pour ajouter des médicaments')).toBeInTheDocument();
  });

  it('opens modal when input is clicked', () => {
    render(
      <PrescriptionInputWithModal 
        prescriptions={[]} 
        onChange={mockOnChange} 
      />
    );

    const input = screen.getByText('Cliquez pour ajouter des médicaments');
    fireEvent.click(input);

    expect(screen.getByText('Ajouter un médicament')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', () => {
    render(
      <PrescriptionInputWithModal 
        prescriptions={[]} 
        onChange={mockOnChange} 
      />
    );

    // Open modal
    const input = screen.getByText('Cliquez pour ajouter des médicaments');
    fireEvent.click(input);

    // Close modal
    const closeButton = screen.getAllByTitle('Fermer')[0];
    fireEvent.click(closeButton);

    expect(screen.queryByText('Ajouter un médicament')).not.toBeInTheDocument();
  });

  it('displays prescription list when prescriptions exist', () => {
    const prescriptions = [
      {
        id: '1',
        medicament: 'Paracétamol',
        dose: '500mg',
        frequence: '3x/jour',
        duree: '3 jours',
        notes: ''
      }
    ];

    render(
      <PrescriptionInputWithModal 
        prescriptions={prescriptions} 
        onChange={mockOnChange} 
      />
    );

    // Should show medication in both input and list
    const paracetamolElements = screen.getAllByText(/Paracétamol/);
    expect(paracetamolElements.length).toBeGreaterThan(0);
    expect(screen.getByText('- 500mg')).toBeInTheDocument();
  });

  it('shows medication count in input when multiple prescriptions', () => {
    const prescriptions = [
      { id: '1', medicament: 'Paracétamol', dose: '', frequence: '', duree: '', notes: '' },
      { id: '2', medicament: 'Ibuprofène', dose: '', frequence: '', duree: '', notes: '' }
    ];

    render(
      <PrescriptionInputWithModal 
        prescriptions={prescriptions} 
        onChange={mockOnChange} 
      />
    );

    expect(screen.getByText('2 médicaments prescrits')).toBeInTheDocument();
  });

  it('shows single medication name when only one prescription', () => {
    const prescriptions = [
      { id: '1', medicament: 'Paracétamol', dose: '', frequence: '', duree: '', notes: '' }
    ];

    render(
      <PrescriptionInputWithModal 
        prescriptions={prescriptions} 
        onChange={mockOnChange} 
      />
    );

    // Should show medication name in both input and list
    const paracetamolElements = screen.getAllByText('Paracétamol');
    expect(paracetamolElements.length).toBe(2); // Once in input, once in list
  });

  it('removes prescription when remove button is clicked', () => {
    const prescriptions = [
      { id: '1', medicament: 'Paracétamol', dose: '500mg', frequence: '', duree: '', notes: '' }
    ];

    render(
      <PrescriptionInputWithModal 
        prescriptions={prescriptions} 
        onChange={mockOnChange} 
      />
    );

    const removeButton = screen.getByTitle('Retirer ce médicament');
    fireEvent.click(removeButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('does not open modal when disabled', () => {
    render(
      <PrescriptionInputWithModal 
        prescriptions={[]} 
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const input = screen.getByText('Cliquez pour ajouter des médicaments');
    fireEvent.click(input);

    expect(screen.queryByText('Ajouter un médicament')).not.toBeInTheDocument();
  });
});

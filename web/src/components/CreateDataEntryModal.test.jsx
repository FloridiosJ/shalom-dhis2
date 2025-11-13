import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CreateDataEntryModal from './CreateDataEntryModal';

// Mock the child components
vi.mock('./PatientAutocomplete', () => ({
  default: () => <div data-testid="patient-autocomplete">Patient Autocomplete</div>
}));

vi.mock('./CategoriesSelector', () => ({
  default: () => <div data-testid="categories-selector">Categories Selector</div>
}));

vi.mock('./PrescriptionList', () => ({
  default: () => <div data-testid="prescription-list">Prescription List</div>
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { role: 'agent', dispensaire: { id: '1', name: 'Test' } } })
}));

describe('CreateDataEntryModal - Gender-based consultation type filtering', () => {
  const mockPatients = [
    { id: '1', nom: 'Doe', prenom: 'John', sexe: 'M', numeroPatient: 'PAT-001' },
    { id: '2', nom: 'Smith', prenom: 'Jane', sexe: 'F', numeroPatient: 'PAT-002' },
    { id: '3', nom: 'Other', prenom: 'Alex', sexe: 'L', numeroPatient: 'PAT-003' },
  ];

  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSaved: vi.fn(),
    dispensaires: [],
    patients: mockPatients,
    categories: [],
    onSubmit: vi.fn(),
  };

  it('should hide female-only consultation types for male patients', () => {
    const props = {
      ...defaultProps,
      initialData: {
        patient: mockPatients[0], // Male patient
      },
    };

    render(<CreateDataEntryModal {...props} />);

    // Get the select element
    const select = screen.getByLabelText(/Type de consultation/i);
    const options = Array.from(select.querySelectorAll('option'));
    const optionTexts = options.map(opt => opt.textContent);

    // Female-only types should NOT be present
    expect(optionTexts.some(text => text.includes('Consultation Prénatale'))).toBe(false);
    expect(optionTexts.some(text => text.includes('Consultation Post-Natale'))).toBe(false);
    expect(optionTexts.some(text => text.includes('Accouchement'))).toBe(false);

    // General types should be present
    expect(optionTexts.some(text => text.includes('Consultation Curative'))).toBe(true);
    expect(optionTexts.some(text => text.includes('Consultation Préventive'))).toBe(true);
  });

  it('should show all consultation types for female patients', () => {
    const props = {
      ...defaultProps,
      initialData: {
        patient: mockPatients[1], // Female patient
      },
    };

    render(<CreateDataEntryModal {...props} />);

    const select = screen.getByLabelText(/Type de consultation/i);
    const options = Array.from(select.querySelectorAll('option'));
    const optionTexts = options.map(opt => opt.textContent);

    // Female-only types should be present
    expect(optionTexts.some(text => text.includes('Consultation Prénatale'))).toBe(true);
    expect(optionTexts.some(text => text.includes('Consultation Post-Natale'))).toBe(true);
    expect(optionTexts.some(text => text.includes('Accouchement'))).toBe(true);

    // General types should be present
    expect(optionTexts.some(text => text.includes('Consultation Curative'))).toBe(true);
    expect(optionTexts.some(text => text.includes('Consultation Préventive'))).toBe(true);
  });

  it('should show all consultation types for other gender patients', () => {
    const props = {
      ...defaultProps,
      initialData: {
        patient: mockPatients[2], // Other gender patient
      },
    };

    render(<CreateDataEntryModal {...props} />);

    const select = screen.getByLabelText(/Type de consultation/i);
    const options = Array.from(select.querySelectorAll('option'));
    const optionTexts = options.map(opt => opt.textContent);

    // All types should be present
    expect(optionTexts.some(text => text.includes('Consultation Prénatale'))).toBe(true);
    expect(optionTexts.some(text => text.includes('Consultation Curative'))).toBe(true);
  });

  it('should show all consultation types when no patient is selected', () => {
    render(<CreateDataEntryModal {...defaultProps} />);

    const select = screen.getByLabelText(/Type de consultation/i);
    const options = Array.from(select.querySelectorAll('option'));
    const optionTexts = options.map(opt => opt.textContent);

    // All types should be present when no patient is selected
    expect(optionTexts.some(text => text.includes('Consultation Prénatale'))).toBe(true);
    expect(optionTexts.some(text => text.includes('Consultation Curative'))).toBe(true);
  });
});

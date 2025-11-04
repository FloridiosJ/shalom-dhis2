/**
 * @format
 */

import {consultationValidationSchema} from '../src/utils/consultationValidation';

describe('consultationValidationSchema', () => {
  it('validates a complete and valid form', async () => {
    const validData = {
      patientId: '1',
      dateConsultation: new Date('2023-01-01'),
      heureConsultation: new Date('2023-01-01T10:00:00'),
      diagnostic: 'Paludisme simple',
      prescriptions: 'Paracétamol 500mg',
      notes: 'Patient en bonne santé',
      attachments: [],
    };

    await expect(
      consultationValidationSchema.validate(validData),
    ).resolves.toBeDefined();
  });

  it('rejects form without patient', async () => {
    const invalidData = {
      patientId: null,
      dateConsultation: new Date(),
      heureConsultation: new Date(),
      diagnostic: 'Paludisme simple',
      prescriptions: '',
      notes: '',
      attachments: [],
    };

    await expect(
      consultationValidationSchema.validate(invalidData),
    ).rejects.toThrow();
  });

  it('rejects form without diagnostic', async () => {
    const invalidData = {
      patientId: '1',
      dateConsultation: new Date(),
      heureConsultation: new Date(),
      diagnostic: '',
      prescriptions: '',
      notes: '',
      attachments: [],
    };

    await expect(
      consultationValidationSchema.validate(invalidData),
    ).rejects.toThrow();
  });

  it('rejects diagnostic shorter than 3 characters', async () => {
    const invalidData = {
      patientId: '1',
      dateConsultation: new Date(),
      heureConsultation: new Date(),
      diagnostic: 'AB',
      prescriptions: '',
      notes: '',
      attachments: [],
    };

    await expect(
      consultationValidationSchema.validate(invalidData),
    ).rejects.toThrow();
  });

  it('rejects future date', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const invalidData = {
      patientId: '1',
      dateConsultation: futureDate,
      heureConsultation: new Date(),
      diagnostic: 'Paludisme simple',
      prescriptions: '',
      notes: '',
      attachments: [],
    };

    await expect(
      consultationValidationSchema.validate(invalidData),
    ).rejects.toThrow();
  });

  it('allows optional fields to be empty', async () => {
    const validData = {
      patientId: '1',
      dateConsultation: new Date('2023-01-01'),
      heureConsultation: new Date('2023-01-01T10:00:00'),
      diagnostic: 'Paludisme simple',
      prescriptions: '',
      notes: '',
      attachments: [],
    };

    await expect(
      consultationValidationSchema.validate(validData),
    ).resolves.toBeDefined();
  });
});

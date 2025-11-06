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
      typeConsultation: 'Consultation générale',
      categoriesMaladie: 'Maladies infectieuses',
      prescriptionsStructurees: 'Paracétamol 500mg',
      notes: 'Patient en bonne santé',
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
      typeConsultation: 'Consultation générale',
      categoriesMaladie: 'Maladies infectieuses',
      prescriptionsStructurees: '',
      notes: '',
    };

    await expect(
      consultationValidationSchema.validate(invalidData),
    ).rejects.toThrow();
  });

  it('rejects form without typeConsultation', async () => {
    const invalidData = {
      patientId: '1',
      dateConsultation: new Date(),
      heureConsultation: new Date(),
      typeConsultation: '',
      categoriesMaladie: 'Maladies infectieuses',
      prescriptionsStructurees: '',
      notes: '',
    };

    await expect(
      consultationValidationSchema.validate(invalidData),
    ).rejects.toThrow('Le type de consultation est requis');
  });

  it('rejects form without categoriesMaladie', async () => {
    const invalidData = {
      patientId: '1',
      dateConsultation: new Date(),
      heureConsultation: new Date(),
      typeConsultation: 'Consultation générale',
      categoriesMaladie: '',
      prescriptionsStructurees: '',
      notes: '',
    };

    await expect(
      consultationValidationSchema.validate(invalidData),
    ).rejects.toThrow('La catégorie de maladie est requise');
  });

  it('rejects future date', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const invalidData = {
      patientId: '1',
      dateConsultation: futureDate,
      heureConsultation: new Date(),
      typeConsultation: 'Consultation générale',
      categoriesMaladie: 'Maladies infectieuses',
      prescriptionsStructurees: '',
      notes: '',
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
      typeConsultation: 'Consultation générale',
      categoriesMaladie: 'Maladies infectieuses',
      prescriptionsStructurees: '',
      notes: '',
    };

    await expect(
      consultationValidationSchema.validate(validData),
    ).resolves.toBeDefined();
  });
});

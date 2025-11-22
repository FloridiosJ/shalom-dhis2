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

  it('transforms prescriptionsStructurees array to JSON string', async () => {
    const validData = {
      patientId: '1',
      dateConsultation: new Date('2023-01-01'),
      heureConsultation: new Date('2023-01-01T10:00:00'),
      typeConsultation: 'Consultation générale',
      categoriesMaladie: 'Maladies infectieuses',
      prescriptionsStructurees: [
        {
          id: 'temp-1763811489694',
          medicament: 'Albendazole',
          dose: '4',
          frequence: '3x/jour',
          duree: '7 jours',
          notes: 'Rtf...',
          ordre: 0,
        },
      ],
      notes: 'Test notes',
    };

    const result = await consultationValidationSchema.validate(validData);
    
    // Verify that prescriptionsStructurees has been transformed to a string
    expect(typeof result.prescriptionsStructurees).toBe('string');
    
    // Verify that it's valid JSON
    const parsed = JSON.parse(result.prescriptionsStructurees as string);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].medicament).toBe('Albendazole');
  });

  it('keeps prescriptionsStructurees as string if already a string', async () => {
    const validData = {
      patientId: '1',
      dateConsultation: new Date('2023-01-01'),
      heureConsultation: new Date('2023-01-01T10:00:00'),
      typeConsultation: 'Consultation générale',
      categoriesMaladie: 'Maladies infectieuses',
      prescriptionsStructurees: '["already", "a", "string"]',
      notes: '',
    };

    const result = await consultationValidationSchema.validate(validData);
    
    // Verify that it remains a string
    expect(result.prescriptionsStructurees).toBe('["already", "a", "string"]');
  });

  it('handles empty array for prescriptionsStructurees', async () => {
    const validData = {
      patientId: '1',
      dateConsultation: new Date('2023-01-01'),
      heureConsultation: new Date('2023-01-01T10:00:00'),
      typeConsultation: 'Consultation générale',
      categoriesMaladie: 'Maladies infectieuses',
      prescriptionsStructurees: [],
      notes: '',
    };

    const result = await consultationValidationSchema.validate(validData);
    
    // Empty array should be transformed to "[]"
    expect(result.prescriptionsStructurees).toBe('[]');
  });
});

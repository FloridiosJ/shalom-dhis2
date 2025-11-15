import * as yup from 'yup';

/**
 * Shared consultation validation schema for web and mobile
 * This ensures consistent validation across platforms
 */
export const consultationValidationSchema = yup.object().shape({
  patientId: yup
    .string()
    .nullable()
    .required('Veuillez sélectionner un patient'),
  
  dateConsultation: yup
    .mixed()
    .required('La date de consultation est requise')
    .test('is-date', 'Date invalide', (value) => {
      if (!value) return false;
      return value instanceof Date || typeof value === 'string';
    })
    .test('not-future', 'La date de consultation ne peut pas être future', function(value) {
      if (!value) return true;
      const date = value instanceof Date ? value : new Date(value);
      return date <= new Date();
    }),
  
  heureConsultation: yup
    .mixed()
    .optional()
    .nullable()
    .test('not-future', "L'heure de consultation ne peut pas être future", function(value) {
      const { dateConsultation } = this.parent;
      if (!value || !dateConsultation) return true;
      
      const date = dateConsultation instanceof Date ? dateConsultation : new Date(dateConsultation);
      const time = value instanceof Date ? value : new Date(value);
      
      const consultationDateTime = new Date(date);
      consultationDateTime.setHours(
        time.getHours(),
        time.getMinutes(),
        0,
        0,
      );
      
      return consultationDateTime <= new Date();
    }),
  
  dispensaireId: yup
    .string()
    .optional()
    .nullable(),
  
  typeConsultation: yup
    .string()
    .required('Le type de consultation est requis'),
  
  categories: yup
    .array()
    .of(
      yup.object().shape({
        categorieMaladieId: yup.string().required(),
        isPrincipal: yup.boolean().required(),
        notes: yup.string().optional(),
      })
    )
    .min(1, 'Au moins une catégorie de maladie est requise')
    .test('has-principal', 'Une catégorie principale est requise', function(categories) {
      if (!categories || categories.length === 0) return false;
      if (categories.length === 1) return true;
      
      const principalCount = categories.filter((c: any) => c.isPrincipal).length;
      return principalCount === 1;
    }),
  
  prescriptionItems: yup
    .array()
    .of(
      yup.object().shape({
        medicament: yup.string().required('Le médicament est requis'),
        dose: yup.string().optional().nullable(),
        frequence: yup.string().optional().nullable(),
        duree: yup.string().optional().nullable(),
        notes: yup.string().optional().nullable(),
        ordre: yup.number().required(),
      })
    )
    .optional(),
  
  notes: yup.string().optional(),
});

export type ConsultationValidationSchema = yup.InferType<typeof consultationValidationSchema>;

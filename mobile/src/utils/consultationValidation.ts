import * as yup from 'yup';

/**
 * Validation schema for consultation forms.
 * 
 * Note: prescriptionsStructurees is defined as PrescriptionItem[] in the TypeScript types,
 * but the API expects it as a JSON string. This schema automatically transforms the array
 * to a JSON string during validation using yup's transform() method.
 */
export const consultationValidationSchema = yup.object().shape({
  patientId: yup
    .string()
    .required('Veuillez sélectionner un patient'),
  dateConsultation: yup
    .date()
    .required('La date de consultation est requise')
    .max(new Date(), 'La date de consultation ne peut pas être future'),
  heureConsultation: yup
    .date()
    .required("L'heure de consultation est requise")
    .test(
      'not-future',
      "L'heure de consultation ne peut pas être future",
      function (value) {
        const {dateConsultation} = this.parent;
        if (!value || !dateConsultation) {
          return true;
        }
        const consultationDateTime = new Date(dateConsultation);
        consultationDateTime.setHours(
          value.getHours(),
          value.getMinutes(),
          0,
          0,
        );
        return consultationDateTime <= new Date();
      },
    ),
  typeConsultation: yup
    .string()
    .required('Le type de consultation est requis'),
  categoriesMaladie: yup
    .string()
    .required('La catégorie de maladie est requise'),
  prescriptionsStructurees: yup
    .mixed()
    .optional()
    .transform((value) => {
      // If it's already a string, return it as-is
      if (typeof value === 'string') {
        return value;
      }
      // If it's an array or object, serialize it to JSON string
      if (Array.isArray(value) || (value && typeof value === 'object')) {
        return JSON.stringify(value);
      }
      // For empty/null/undefined, return empty string
      return '';
    }),
  notes: yup.string().optional(),
});

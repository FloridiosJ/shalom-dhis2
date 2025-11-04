import * as yup from 'yup';

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
  diagnostic: yup
    .string()
    .required('Le diagnostic est requis')
    .min(3, 'Le diagnostic doit contenir au moins 3 caractères'),
  prescriptions: yup.string().optional(),
  notes: yup.string().optional(),
  attachments: yup.array().optional(),
});

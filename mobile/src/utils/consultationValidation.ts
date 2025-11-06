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
  typeConsultation: yup
    .string()
    .required('Le type de consultation est requis'),
  categoriesMaladie: yup
    .string()
    .required('La catégorie de maladie est requise'),
  prescriptionsStructurees: yup.string().optional(),
  notes: yup.string().optional(),
});

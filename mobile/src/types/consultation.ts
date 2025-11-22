import {PrescriptionItem} from '../constants/medications';

export interface Attachment {
  id: string;
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface ConsultationFormData {
  patientId: string | null;
  dateConsultation: Date;
  heureConsultation: Date;
  typeConsultation: string;
  categoriesMaladie: string;
  /**
   * Structured prescriptions array.
   * This is stored as an array in the form but will be automatically
   * serialized to a JSON string during validation and submission.
   */
  prescriptionsStructurees: PrescriptionItem[];
  notes: string;
}

export interface ConsultationDraft {
  formData: ConsultationFormData;
  savedAt: string;
}

export interface PatientOption {
  id: string;
  displayName: string;
  numeroPatient: string;
}

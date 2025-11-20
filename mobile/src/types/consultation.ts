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

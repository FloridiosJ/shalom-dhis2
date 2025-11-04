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
  diagnostic: string;
  prescriptions: string;
  notes: string;
  attachments: Attachment[];
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

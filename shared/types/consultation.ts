/**
 * Shared types for consultation forms (web and mobile)
 */

export interface PatientOption {
  id: string;
  displayName: string;
  numeroPatient: string;
  nom?: string;
  prenom?: string;
  sexe?: 'M' | 'F' | 'L';
}

export interface CategoryWithMeta {
  categorieMaladieId: string;
  isPrincipal: boolean;
  notes: string;
  // Info pour l'affichage
  nom?: string;
  code?: string;
}

export interface PrescriptionItem {
  id?: string;
  medicament: string;
  dose?: string | null;
  frequence?: string | null;
  duree?: string | null;
  notes?: string | null;
  ordre: number;
}

export interface ConsultationFormData {
  patientId: string | null;
  dateConsultation: Date | string;
  heureConsultation?: Date | string;
  dispensaireId?: string;
  typeConsultation: string;
  diagnostic?: string;
  diagnosticDetails?: string;
  prescription?: string;
  notes?: string;
  categories: CategoryWithMeta[];
  prescriptionItems: PrescriptionItem[];
}

export interface ConsultationDraft {
  formData: ConsultationFormData;
  savedAt: string;
}

export interface CategorieMaladie {
  id: string;
  nom: string;
  code: string;
  description?: string;
}

export interface Dispensaire {
  id: string;
  name: string;
  code?: string;
}

export interface Patient {
  id: string;
  displayName: string;
  nom: string;
  prenom: string;
  sexe: string;
  age: number;
  numeroPatient: string;
  village: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  religion?: string;
}

// Backend ConsultationStatus enum values
export type ConsultationStatus = 
  | 'en_cours'      // En cours (draft/in progress)
  | 'termine'       // Terminé (completed/sent)
  | 'suivi_requis'  // Suivi requis (follow-up required/pending)
  | 'active'        // Active
  | 'completed'     // Completed
  | 'cancelled';    // Cancelled

/**
 * Vital signs data for a consultation
 */
export interface VitalSigns {
  weight?: number; // Poids (kg)
  temperature?: number; // Température (°C)
  bloodPressureSystolic?: number; // Pression artérielle systolique
  bloodPressureDiastolic?: number; // Pression artérielle diastolique
  pulse?: number; // Pouls (bpm)
}

export interface DataEntry {
  id: string;
  clientTempId?: string; // Temporary ID for offline/pending sync items
  dateConsultation: string;
  diagnostic: string;
  prescription: string;
  notes: string;
  patient: Patient;
  status: ConsultationStatus;
  typeConsultation?: string;
  motifConsultation?: string; // Reason for consultation
  vitalSigns?: VitalSigns; // Vital signs data
  agentNotes?: string; // Agent's notes (can be same as notes)
}

// Alias for better semantics
export type Consultation = DataEntry;

export interface Dispensaire {
  id: string;
  name: string;
  location: string;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  login: string;
  role: string;
  dispensaireId?: string;
  specialite?: string;
}

export interface LoginInput {
  login: string;
  password: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}
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

export interface DataEntry {
  id: string;
  dateConsultation: string;
  diagnostic: string;
  prescription: string;
  notes: string;
  patient: Patient;
  status: ConsultationStatus;
  typeConsultation?: string;
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
}

export interface LoginInput {
  login: string;
  password: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}
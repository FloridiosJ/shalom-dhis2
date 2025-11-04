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

export type ConsultationStatus = 'brouillon' | 'en_attente' | 'envoye';

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

export interface Consultation extends DataEntry {
  // Alias for better semantics
}

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
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

export interface DataEntry {
  id: string;
  dateConsultation: string;
  diagnostic: string;
  prescription: string;
  notes: string;
  patient: Patient;
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
  role: string;
}
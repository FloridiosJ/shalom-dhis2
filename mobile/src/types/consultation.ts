// Re-export shared types
export type {
  PatientOption,
  CategoryWithMeta,
  PrescriptionItem,
  ConsultationFormData,
  ConsultationDraft,
  CategorieMaladie,
  Dispensaire,
} from '@shared/types/consultation';

// Mobile-specific types
export interface Attachment {
  id: string;
  uri: string;
  name: string;
  type: string;
  size?: number;
}

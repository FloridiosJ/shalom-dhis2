import { describe, it, expect } from 'vitest';
import { 
  TYPES_CONSULTATION, 
  getConsultationTypeLabel, 
  getConsultationTypeIcon,
  getConsultationTypesByGender 
} from './typeConsultations';

describe('typeConsultations', () => {
  describe('TYPES_CONSULTATION', () => {
    it('should have femaleOnly flag for feminine consultation types', () => {
      const feminineTypes = ['CPN', 'CPON', 'ACCOUCHEMENT'];
      
      feminineTypes.forEach(code => {
        const type = TYPES_CONSULTATION.find(t => t.code === code);
        expect(type).toBeDefined();
        expect(type.femaleOnly).toBe(true);
      });
    });

    it('should have femaleOnly false for general consultation types', () => {
      const generalTypes = ['CURATIF', 'PREVENTIF', 'VACCINATION', 'NUTRITION', 'PLANIFICATION', 'IST', 'PALUDISME', 'TUBERCULOSE', 'URGENCE'];
      
      generalTypes.forEach(code => {
        const type = TYPES_CONSULTATION.find(t => t.code === code);
        expect(type).toBeDefined();
        expect(type.femaleOnly).toBe(false);
      });
    });
  });

  describe('getConsultationTypesByGender', () => {
    it('should filter out female-only types for male patients', () => {
      const maleTypes = getConsultationTypesByGender('M');
      
      // Female-only types should not be present
      expect(maleTypes.find(t => t.code === 'CPN')).toBeUndefined();
      expect(maleTypes.find(t => t.code === 'CPON')).toBeUndefined();
      expect(maleTypes.find(t => t.code === 'ACCOUCHEMENT')).toBeUndefined();
      
      // General types should be present
      expect(maleTypes.find(t => t.code === 'CURATIF')).toBeDefined();
      expect(maleTypes.find(t => t.code === 'PREVENTIF')).toBeDefined();
      expect(maleTypes.find(t => t.code === 'VACCINATION')).toBeDefined();
    });

    it('should return all types for female patients', () => {
      const femaleTypes = getConsultationTypesByGender('F');
      
      // All types should be present
      expect(femaleTypes.find(t => t.code === 'CPN')).toBeDefined();
      expect(femaleTypes.find(t => t.code === 'CPON')).toBeDefined();
      expect(femaleTypes.find(t => t.code === 'ACCOUCHEMENT')).toBeDefined();
      expect(femaleTypes.find(t => t.code === 'CURATIF')).toBeDefined();
      
      expect(femaleTypes.length).toBe(TYPES_CONSULTATION.length);
    });

    it('should return all types for other gender', () => {
      const otherTypes = getConsultationTypesByGender('L');
      
      // All types should be present
      expect(otherTypes.length).toBe(TYPES_CONSULTATION.length);
    });

    it('should return all types for undefined gender', () => {
      const undefinedTypes = getConsultationTypesByGender(undefined);
      
      // All types should be present
      expect(undefinedTypes.length).toBe(TYPES_CONSULTATION.length);
    });

    it('should return all types for null gender', () => {
      const nullTypes = getConsultationTypesByGender(null);
      
      // All types should be present
      expect(nullTypes.length).toBe(TYPES_CONSULTATION.length);
    });
  });

  describe('getConsultationTypeLabel', () => {
    it('should return correct label for valid code', () => {
      expect(getConsultationTypeLabel('CURATIF')).toBe('Consultation Curative');
      expect(getConsultationTypeLabel('CPN')).toBe('Consultation Prénatale (CPN)');
    });

    it('should return code if not found', () => {
      expect(getConsultationTypeLabel('INVALID')).toBe('INVALID');
    });
  });

  describe('getConsultationTypeIcon', () => {
    it('should return correct icon for valid code', () => {
      expect(getConsultationTypeIcon('CURATIF')).toBe('🏥');
      expect(getConsultationTypeIcon('CPN')).toBe('🤰');
    });

    it('should return default icon if not found', () => {
      expect(getConsultationTypeIcon('INVALID')).toBe('📋');
    });
  });
});

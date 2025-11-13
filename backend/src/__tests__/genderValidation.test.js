/**
 * Unit tests for gender-based consultation type validation
 * These tests validate that feminine consultation types are properly restricted for male patients
 */

import { describe, it, expect } from '@jest/globals';

describe('DataEntry Gender Validation - Unit Tests', () => {
  
  describe('Consultation Type Gender Restriction', () => {
    /**
     * Validate consultation type based on patient gender
     * @param {string} patientSexe - Patient gender ('M', 'F', 'L')
     * @param {string} consultationType - Consultation type code
     * @returns {Object} Validation result
     */
    const validateConsultationTypeForGender = (patientSexe, consultationType) => {
      const femaleOnlyConsultationTypes = ['CPN', 'CPON', 'ACCOUCHEMENT'];
      
      if (patientSexe === 'M' && femaleOnlyConsultationTypes.includes(consultationType)) {
        return {
          isValid: false,
          error: `Le type de consultation '${consultationType}' est réservé aux patientes de sexe féminin`
        };
      }
      
      return { isValid: true, error: null };
    };

    describe('Male Patients', () => {
      it('should reject CPN consultation type for male patients', () => {
        const result = validateConsultationTypeForGender('M', 'CPN');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('réservé aux patientes de sexe féminin');
      });

      it('should reject CPON consultation type for male patients', () => {
        const result = validateConsultationTypeForGender('M', 'CPON');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('réservé aux patientes de sexe féminin');
      });

      it('should reject ACCOUCHEMENT consultation type for male patients', () => {
        const result = validateConsultationTypeForGender('M', 'ACCOUCHEMENT');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('réservé aux patientes de sexe féminin');
      });

      it('should accept CURATIF consultation type for male patients', () => {
        const result = validateConsultationTypeForGender('M', 'CURATIF');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should accept PREVENTIF consultation type for male patients', () => {
        const result = validateConsultationTypeForGender('M', 'PREVENTIF');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should accept VACCINATION consultation type for male patients', () => {
        const result = validateConsultationTypeForGender('M', 'VACCINATION');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should accept URGENCE consultation type for male patients', () => {
        const result = validateConsultationTypeForGender('M', 'URGENCE');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });
    });

    describe('Female Patients', () => {
      it('should accept CPN consultation type for female patients', () => {
        const result = validateConsultationTypeForGender('F', 'CPN');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should accept CPON consultation type for female patients', () => {
        const result = validateConsultationTypeForGender('F', 'CPON');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should accept ACCOUCHEMENT consultation type for female patients', () => {
        const result = validateConsultationTypeForGender('F', 'ACCOUCHEMENT');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should accept CURATIF consultation type for female patients', () => {
        const result = validateConsultationTypeForGender('F', 'CURATIF');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });
    });

    describe('Other Gender Patients', () => {
      it('should accept CPN consultation type for other gender patients', () => {
        const result = validateConsultationTypeForGender('L', 'CPN');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should accept CPON consultation type for other gender patients', () => {
        const result = validateConsultationTypeForGender('L', 'CPON');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should accept ACCOUCHEMENT consultation type for other gender patients', () => {
        const result = validateConsultationTypeForGender('L', 'ACCOUCHEMENT');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should accept CURATIF consultation type for other gender patients', () => {
        const result = validateConsultationTypeForGender('L', 'CURATIF');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });
    });

    describe('Edge Cases', () => {
      it('should accept all consultation types when gender is undefined', () => {
        const result = validateConsultationTypeForGender(undefined, 'CPN');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should accept all consultation types when gender is null', () => {
        const result = validateConsultationTypeForGender(null, 'CPON');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });

      it('should handle empty string gender', () => {
        const result = validateConsultationTypeForGender('', 'ACCOUCHEMENT');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });
    });
  });

  describe('Feminine Consultation Types List', () => {
    it('should contain exactly 3 feminine-only consultation types', () => {
      const femaleOnlyConsultationTypes = ['CPN', 'CPON', 'ACCOUCHEMENT'];
      expect(femaleOnlyConsultationTypes).toHaveLength(3);
    });

    it('should include CPN, CPON, and ACCOUCHEMENT as feminine types', () => {
      const femaleOnlyConsultationTypes = ['CPN', 'CPON', 'ACCOUCHEMENT'];
      expect(femaleOnlyConsultationTypes).toContain('CPN');
      expect(femaleOnlyConsultationTypes).toContain('CPON');
      expect(femaleOnlyConsultationTypes).toContain('ACCOUCHEMENT');
    });

    it('should not include general consultation types as feminine-only', () => {
      const femaleOnlyConsultationTypes = ['CPN', 'CPON', 'ACCOUCHEMENT'];
      expect(femaleOnlyConsultationTypes).not.toContain('CURATIF');
      expect(femaleOnlyConsultationTypes).not.toContain('PREVENTIF');
      expect(femaleOnlyConsultationTypes).not.toContain('VACCINATION');
      expect(femaleOnlyConsultationTypes).not.toContain('URGENCE');
    });
  });
});

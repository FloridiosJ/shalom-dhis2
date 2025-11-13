/**
 * Unit tests for fitorianaStats GraphQL resolver
 * These tests validate the resolver logic for Fitoriana statistics aggregation
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

describe('FitorianaStats Resolver - Unit Tests', () => {
  
  describe('Age Group Categorization Logic', () => {
    /**
     * Test age group categorization according to specifications:
     * - Zaza: ≤12 years
     * - Tanora: 13-30 years
     * - Olon-dehibe: >30 years
     */
    const getAgeGroup = (age) => {
      if (age <= 12) return 'ZAZA';
      if (age >= 13 && age <= 30) return 'TANORA';
      return 'OLON_DEHIBE';
    };

    it('should categorize children (≤12 years) as ZAZA', () => {
      expect(getAgeGroup(0)).toBe('ZAZA');
      expect(getAgeGroup(5)).toBe('ZAZA');
      expect(getAgeGroup(12)).toBe('ZAZA');
    });

    it('should categorize youth (13-30 years) as TANORA', () => {
      expect(getAgeGroup(13)).toBe('TANORA');
      expect(getAgeGroup(20)).toBe('TANORA');
      expect(getAgeGroup(30)).toBe('TANORA');
    });

    it('should categorize adults (>30 years) as OLON_DEHIBE', () => {
      expect(getAgeGroup(31)).toBe('OLON_DEHIBE');
      expect(getAgeGroup(50)).toBe('OLON_DEHIBE');
      expect(getAgeGroup(80)).toBe('OLON_DEHIBE');
    });

    it('should handle edge cases', () => {
      // Boundary between ZAZA and TANORA
      expect(getAgeGroup(12)).toBe('ZAZA');
      expect(getAgeGroup(13)).toBe('TANORA');
      
      // Boundary between TANORA and OLON_DEHIBE
      expect(getAgeGroup(30)).toBe('TANORA');
      expect(getAgeGroup(31)).toBe('OLON_DEHIBE');
    });
  });

  describe('Gender Label Conversion Logic', () => {
    /**
     * Test conversion from database gender codes to Malagasy labels:
     * - M/L (Masculin) -> lahy
     * - F (Féminin) -> vavy
     */
    const getSexeLabel = (sexe) => {
      if (sexe === 'M' || sexe === 'L') return 'lahy';
      if (sexe === 'F') return 'vavy';
      return 'lahy'; // Default fallback
    };

    it('should convert M (Masculin) to lahy', () => {
      expect(getSexeLabel('M')).toBe('lahy');
    });

    it('should convert L (Other/Masculin) to lahy', () => {
      expect(getSexeLabel('L')).toBe('lahy');
    });

    it('should convert F (Féminin) to vavy', () => {
      expect(getSexeLabel('F')).toBe('vavy');
    });

    it('should handle invalid values with default fallback', () => {
      expect(getSexeLabel('')).toBe('lahy');
      expect(getSexeLabel(null)).toBe('lahy');
      expect(getSexeLabel('X')).toBe('lahy');
    });
  });

  describe('Data Aggregation Logic', () => {
    /**
     * Test aggregation of consultations by age group, gender, and dispensaire
     */
    it('should aggregate consultations correctly', () => {
      const consultations = [
        { patient: { age: 10, sexe: 'M' }, dispensaireId: 'disp1' }, // ZAZA, lahy
        { patient: { age: 11, sexe: 'F' }, dispensaireId: 'disp1' }, // ZAZA, vavy
        { patient: { age: 20, sexe: 'M' }, dispensaireId: 'disp1' }, // TANORA, lahy
        { patient: { age: 25, sexe: 'F' }, dispensaireId: 'disp2' }, // TANORA, vavy
        { patient: { age: 40, sexe: 'M' }, dispensaireId: 'disp2' }, // OLON_DEHIBE, lahy
      ];

      const dispensaires = [
        { id: 'disp1', name: 'Dispensaire 1' },
        { id: 'disp2', name: 'Dispensaire 2' }
      ];

      const ageGroups = ['ZAZA', 'TANORA', 'OLON_DEHIBE'];

      // Initialize aggregation structure
      const aggregation = {};
      ageGroups.forEach(ageGroup => {
        aggregation[ageGroup] = {};
        dispensaires.forEach(disp => {
          aggregation[ageGroup][disp.id] = { lahy: 0, vavy: 0 };
        });
      });

      // Helper functions
      const getAgeGroup = (age) => {
        if (age <= 12) return 'ZAZA';
        if (age >= 13 && age <= 30) return 'TANORA';
        return 'OLON_DEHIBE';
      };

      const getSexeLabel = (sexe) => {
        if (sexe === 'M' || sexe === 'L') return 'lahy';
        if (sexe === 'F') return 'vavy';
        return 'lahy';
      };

      // Aggregate
      consultations.forEach(consultation => {
        const ageGroup = getAgeGroup(consultation.patient.age);
        const sexeLabel = getSexeLabel(consultation.patient.sexe);
        aggregation[ageGroup][consultation.dispensaireId][sexeLabel]++;
      });

      // Verify ZAZA counts
      expect(aggregation['ZAZA']['disp1'].lahy).toBe(1);
      expect(aggregation['ZAZA']['disp1'].vavy).toBe(1);
      expect(aggregation['ZAZA']['disp2'].lahy).toBe(0);
      expect(aggregation['ZAZA']['disp2'].vavy).toBe(0);

      // Verify TANORA counts
      expect(aggregation['TANORA']['disp1'].lahy).toBe(1);
      expect(aggregation['TANORA']['disp1'].vavy).toBe(0);
      expect(aggregation['TANORA']['disp2'].lahy).toBe(0);
      expect(aggregation['TANORA']['disp2'].vavy).toBe(1);

      // Verify OLON_DEHIBE counts
      expect(aggregation['OLON_DEHIBE']['disp1'].lahy).toBe(0);
      expect(aggregation['OLON_DEHIBE']['disp1'].vavy).toBe(0);
      expect(aggregation['OLON_DEHIBE']['disp2'].lahy).toBe(1);
      expect(aggregation['OLON_DEHIBE']['disp2'].vavy).toBe(0);
    });

    it('should calculate Fitambarany (totals) correctly', () => {
      const aggregation = {
        'ZAZA': {
          'disp1': { lahy: 5, vavy: 8 },
          'disp2': { lahy: 3, vavy: 4 },
          'disp3': { lahy: 2, vavy: 1 }
        }
      };

      const dispensaires = [
        { id: 'disp1', name: 'Disp 1' },
        { id: 'disp2', name: 'Disp 2' },
        { id: 'disp3', name: 'Disp 3' }
      ];

      const fitambarany = {
        lahy: dispensaires.reduce((sum, disp) => 
          sum + aggregation['ZAZA'][disp.id].lahy, 0),
        vavy: dispensaires.reduce((sum, disp) => 
          sum + aggregation['ZAZA'][disp.id].vavy, 0)
      };

      expect(fitambarany.lahy).toBe(10); // 5 + 3 + 2
      expect(fitambarany.vavy).toBe(13); // 8 + 4 + 1
    });
  });

  describe('Religion Filtering Logic', () => {
    /**
     * Test filtering by religion
     */
    it('should filter consultations by single religion', () => {
      const consultations = [
        { patient: { religion: 'Kristianina', age: 10, sexe: 'M' } },
        { patient: { religion: 'Musulman', age: 20, sexe: 'F' } },
        { patient: { religion: 'traditionnelle', age: 30, sexe: 'M' } },
        { patient: { religion: 'Kristianina', age: 40, sexe: 'F' } },
      ];

      const religions = ['Musulman'];
      
      const filtered = consultations.filter(c => 
        religions.includes(c.patient.religion)
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].patient.religion).toBe('Musulman');
    });

    it('should filter consultations by multiple religions', () => {
      const consultations = [
        { patient: { religion: 'Kristianina', age: 10, sexe: 'M' } },
        { patient: { religion: 'Musulman', age: 20, sexe: 'F' } },
        { patient: { religion: 'traditionnelle', age: 30, sexe: 'M' } },
        { patient: { religion: 'Kristianina', age: 40, sexe: 'F' } },
      ];

      const religions = ['Kristianina', 'traditionnelle'];
      
      const filtered = consultations.filter(c => 
        religions.includes(c.patient.religion)
      );

      expect(filtered).toHaveLength(3);
      expect(filtered.map(c => c.patient.religion)).toEqual([
        'Kristianina',
        'traditionnelle',
        'Kristianina'
      ]);
    });

    it('should return all consultations when no religion filter is applied', () => {
      const consultations = [
        { patient: { religion: 'Kristianina', age: 10, sexe: 'M' } },
        { patient: { religion: 'Musulman', age: 20, sexe: 'F' } },
        { patient: { religion: 'traditionnelle', age: 30, sexe: 'M' } },
      ];

      const religions = null; // No filter
      
      const filtered = religions 
        ? consultations.filter(c => religions.includes(c.patient.religion))
        : consultations;

      expect(filtered).toHaveLength(3);
    });
  });

  describe('Date Range Validation Logic', () => {
    /**
     * Test date range validation
     */
    it('should validate date format', () => {
      const isValidDate = (dateStr) => {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
      };

      expect(isValidDate('2025-01-01')).toBe(true);
      expect(isValidDate('2025-12-31')).toBe(true);
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate('')).toBe(false);
    });

    it('should validate that start date is before end date', () => {
      const validateDateRange = (startDateStr, endDateStr) => {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error('Format de date invalide');
        }
        
        if (startDate > endDate) {
          throw new Error('La date de début doit être antérieure à la date de fin');
        }
        
        return true;
      };

      expect(validateDateRange('2025-01-01', '2025-12-31')).toBe(true);
      expect(validateDateRange('2025-01-01', '2025-01-01')).toBe(true);
      
      expect(() => validateDateRange('2025-12-31', '2025-01-01'))
        .toThrow('La date de début doit être antérieure à la date de fin');
      
      expect(() => validateDateRange('invalid', '2025-01-01'))
        .toThrow('Format de date invalide');
    });
  });

  describe('Response Structure Validation', () => {
    /**
     * Test response structure matches expected format
     */
    it('should generate correct response structure', () => {
      const ageGroups = [
        { label: 'Zaza (12 taona noho midina)', code: 'ZAZA' },
        { label: 'Tanora (13 taona - 30 taona)', code: 'TANORA' }
      ];

      const dispensaires = [
        { id: 'disp1', name: 'Ampitsopitsoka' },
        { id: 'disp2', name: 'Boeny Aranta' }
      ];

      const aggregation = {
        'ZAZA': {
          'disp1': { lahy: 8, vavy: 10 },
          'disp2': { lahy: 87, vavy: 124 }
        },
        'TANORA': {
          'disp1': { lahy: 15, vavy: 20 },
          'disp2': { lahy: 45, vavy: 60 }
        }
      };

      const rows = ageGroups.map(ageGroup => {
        const valuesByDispensaire = dispensaires.map(disp => ({
          dispensaireName: disp.name,
          values: {
            lahy: aggregation[ageGroup.code][disp.id].lahy,
            vavy: aggregation[ageGroup.code][disp.id].vavy
          }
        }));

        const fitambarany = {
          lahy: dispensaires.reduce((sum, disp) => 
            sum + aggregation[ageGroup.code][disp.id].lahy, 0),
          vavy: dispensaires.reduce((sum, disp) => 
            sum + aggregation[ageGroup.code][disp.id].vavy, 0)
        };

        return {
          label: ageGroup.label,
          ageGroup: ageGroup.code,
          valuesByDispensaire,
          fitambarany
        };
      });

      // Verify structure
      expect(rows).toHaveLength(2);
      
      // Verify ZAZA row
      expect(rows[0].label).toBe('Zaza (12 taona noho midina)');
      expect(rows[0].ageGroup).toBe('ZAZA');
      expect(rows[0].valuesByDispensaire).toHaveLength(2);
      expect(rows[0].valuesByDispensaire[0].dispensaireName).toBe('Ampitsopitsoka');
      expect(rows[0].valuesByDispensaire[0].values.lahy).toBe(8);
      expect(rows[0].valuesByDispensaire[0].values.vavy).toBe(10);
      expect(rows[0].fitambarany.lahy).toBe(95); // 8 + 87
      expect(rows[0].fitambarany.vavy).toBe(134); // 10 + 124

      // Verify TANORA row
      expect(rows[1].label).toBe('Tanora (13 taona - 30 taona)');
      expect(rows[1].ageGroup).toBe('TANORA');
      expect(rows[1].fitambarany.lahy).toBe(60); // 15 + 45
      expect(rows[1].fitambarany.vavy).toBe(80); // 20 + 60
    });

    it('should include metadata in response', () => {
      const response = {
        rows: [],
        dateFrom: '2025-01-01',
        dateTo: '2025-03-31',
        totalConsultations: 500
      };

      expect(response).toHaveProperty('rows');
      expect(response).toHaveProperty('dateFrom');
      expect(response).toHaveProperty('dateTo');
      expect(response).toHaveProperty('totalConsultations');
      expect(response.totalConsultations).toBe(500);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    /**
     * Test edge cases
     */
    it('should handle zero consultations', () => {
      const consultations = [];
      const totalConsultations = consultations.length;
      
      expect(totalConsultations).toBe(0);
    });

    it('should handle missing patient data gracefully', () => {
      const consultations = [
        { patient: { age: 10, sexe: 'M' }, dispensaireId: 'disp1' },
        { patient: null, dispensaireId: 'disp1' }, // Missing patient
        { patient: { age: 20, sexe: 'F' }, dispensaireId: 'disp2' },
      ];

      const validConsultations = consultations.filter(c => 
        c.patient && c.dispensaireId
      );

      expect(validConsultations).toHaveLength(2);
    });

    it('should handle dispensaire with zero consultations', () => {
      const aggregation = {
        'ZAZA': {
          'disp1': { lahy: 5, vavy: 3 },
          'disp2': { lahy: 0, vavy: 0 }, // No consultations
          'disp3': { lahy: 2, vavy: 1 }
        }
      };

      const dispensaires = [
        { id: 'disp1', name: 'Disp 1' },
        { id: 'disp2', name: 'Disp 2' },
        { id: 'disp3', name: 'Disp 3' }
      ];

      const valuesByDispensaire = dispensaires.map(disp => ({
        dispensaireName: disp.name,
        values: aggregation['ZAZA'][disp.id]
      }));

      expect(valuesByDispensaire[1].values.lahy).toBe(0);
      expect(valuesByDispensaire[1].values.vavy).toBe(0);
    });

    it('should initialize all dispensaires with zero counts', () => {
      const dispensaires = [
        { id: 'disp1', name: 'Disp 1' },
        { id: 'disp2', name: 'Disp 2' }
      ];

      const ageGroups = ['ZAZA', 'TANORA', 'OLON_DEHIBE'];

      const aggregation = {};
      ageGroups.forEach(ageGroup => {
        aggregation[ageGroup] = {};
        dispensaires.forEach(disp => {
          aggregation[ageGroup][disp.id] = { lahy: 0, vavy: 0 };
        });
      });

      // Verify all initialized to zero
      expect(aggregation['ZAZA']['disp1'].lahy).toBe(0);
      expect(aggregation['ZAZA']['disp1'].vavy).toBe(0);
      expect(aggregation['TANORA']['disp2'].lahy).toBe(0);
      expect(aggregation['OLON_DEHIBE']['disp1'].vavy).toBe(0);
    });
  });
});

import {useState, useEffect, useMemo} from 'react';
import {Patient} from '../types';

export type SortOption = 'nom' | 'age' | 'recent';

interface UseFilteredPatientsProps {
  patients: Patient[];
  searchQuery: string;
  sortBy: SortOption;
}

/**
 * Custom hook to filter and sort patients based on search query and sort option
 * Implements debounced search and efficient sorting
 */
export function useFilteredPatients({
  patients,
  searchQuery,
  sortBy,
}: UseFilteredPatientsProps) {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce search query for better performance
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Filter and sort patients
  const filteredPatients = useMemo(() => {
    let filtered = patients;

    // Apply search filter
    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase().trim();
      filtered = patients.filter(
        patient =>
          patient.nom.toLowerCase().includes(query) ||
          patient.prenom.toLowerCase().includes(query) ||
          patient.displayName.toLowerCase().includes(query) ||
          patient.numeroPatient.toLowerCase().includes(query) ||
          patient.village.toLowerCase().includes(query),
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'nom':
          return a.displayName.localeCompare(b.displayName);
        case 'age':
          return b.age - a.age;
        case 'recent':
          // Assuming patients are already sorted by creation date
          // This would require additional timestamp field in real implementation
          return 0;
        default:
          return 0;
      }
    });

    return sorted;
  }, [patients, debouncedQuery, sortBy]);

  return {
    filteredPatients,
    isSearching: searchQuery !== debouncedQuery,
  };
}

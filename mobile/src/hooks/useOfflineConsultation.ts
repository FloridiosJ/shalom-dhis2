import {useCallback} from 'react';
import {useNetwork} from '../contexts/NetworkContext';
import {useLocalSync} from './useLocalSync';
import {
  createConsultation as createConsultationAPI,
  CreateConsultationInput,
} from '../services/consultationService';
import {Consultation} from '../types';

/**
 * Hook for creating consultations with offline support
 * 
 * Automatically detects network status and either:
 * - Creates consultation immediately if online
 * - Enqueues for later sync if offline
 * 
 * Usage:
 * ```tsx
 * const {createConsultation, isOffline} = useOfflineConsultation();
 * 
 * const handleSubmit = async (data) => {
 *   const result = await createConsultation(data);
 *   if (result.offline) {
 *     alert('Consultation saved offline');
 *   } else {
 *     alert('Consultation created successfully');
 *   }
 * };
 * ```
 */
export function useOfflineConsultation() {
  const {isConnected, isInternetReachable} = useNetwork();
  const {enqueue} = useLocalSync();

  const isOffline = !isConnected || isInternetReachable === false;

  /**
   * Create a consultation with offline support
   * 
   * @param input - Consultation data
   * @returns Object containing consultation data and offline flag
   */
  const createConsultation = useCallback(
    async (
      input: CreateConsultationInput
    ): Promise<{
      consultation: Consultation | null;
      offline: boolean;
      clientTempId?: string;
    }> => {
      // If online, try to create immediately
      if (!isOffline) {
        try {
          const consultation = await createConsultationAPI(input);
          console.log('✅ Consultation created online:', consultation.id);
          return {
            consultation,
            offline: false,
          };
        } catch (error: unknown) {
          // If network error, fall back to offline mode
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          const hasNetworkError =
            errorMessage.toLowerCase().includes('network') ||
            (typeof error === 'object' &&
              error !== null &&
              'networkError' in error);

          if (hasNetworkError) {
            console.log(
              '⚠️ Network error, falling back to offline mode:',
              errorMessage
            );
            // Continue to offline mode below
          } else {
            // For other errors, throw them
            throw error;
          }
        }
      }

      // Offline mode: enqueue for later sync
      console.log('📴 Offline mode: enqueueing consultation');

      // Prepare payload for offline storage
      const payload = {
        ...input,
        // Convert dates to ISO strings for storage
        dateConsultation: input.dateConsultation.toISOString(),
        heureConsultation: input.heureConsultation.toISOString(),
      };

      const clientTempId = await enqueue('consultation', payload);

      console.log('✅ Consultation enqueued with ID:', clientTempId);

      return {
        consultation: null,
        offline: true,
        clientTempId,
      };
    },
    [isOffline, enqueue]
  );

  return {
    createConsultation,
    isOffline,
  };
}

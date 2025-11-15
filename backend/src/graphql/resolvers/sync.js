import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { v4 as uuidv4 } from 'uuid';

const syncResolvers = {
  Mutation: {
    /**
     * Batch sync mutation for offline data synchronization
     * Accepts an array of items with clientTempId and returns mapping to server IDs
     */
    syncBatch: async (_, { items }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      console.log(`🔄 Starting batch sync for ${items.length} items from user ${user.id}`);

      const results = [];
      let successCount = 0;
      let errorCount = 0;

      // Process each item sequentially to maintain data integrity
      for (const item of items) {
        try {
          const { clientTempId, type, payload, createdAt } = item;

          // Validate item structure
          if (!clientTempId || !type || !payload) {
            results.push({
              clientTempId: clientTempId || 'unknown',
              serverId: null,
              status: 'error',
              message: null,
              error: 'Invalid item structure: clientTempId, type, and payload are required'
            });
            errorCount++;
            continue;
          }

          // Parse payload
          let parsedPayload;
          try {
            parsedPayload = JSON.parse(payload);
          } catch (parseError) {
            results.push({
              clientTempId,
              serverId: null,
              status: 'error',
              message: null,
              error: 'Invalid JSON payload'
            });
            errorCount++;
            continue;
          }

          // Process based on type
          let serverId = null;
          let message = null;

          switch (type.toLowerCase()) {
            case 'patient':
              const patientResult = await syncPatient(parsedPayload, user, clientTempId);
              serverId = patientResult.serverId;
              message = patientResult.message;
              if (!serverId) {
                throw new Error(patientResult.error || 'Failed to sync patient');
              }
              break;

            case 'consultation':
            case 'dataentry':
              const consultationResult = await syncConsultation(parsedPayload, user, clientTempId);
              serverId = consultationResult.serverId;
              message = consultationResult.message;
              if (!serverId) {
                throw new Error(consultationResult.error || 'Failed to sync consultation');
              }
              break;

            default:
              throw new Error(`Unsupported sync type: ${type}`);
          }

          results.push({
            clientTempId,
            serverId,
            status: 'success',
            message: message || `${type} synced successfully`,
            error: null
          });
          successCount++;

          console.log(`✅ Synced ${type} ${clientTempId} -> ${serverId}`);
        } catch (error) {
          console.error(`❌ Error syncing item ${item.clientTempId}:`, error);
          results.push({
            clientTempId: item.clientTempId,
            serverId: null,
            status: 'error',
            message: null,
            error: error.message || 'Unknown error occurred'
          });
          errorCount++;
        }
      }

      const overallMessage = `Synced ${successCount} items successfully, ${errorCount} failed`;
      console.log(`✅ Batch sync complete: ${overallMessage}`);

      return {
        results,
        successCount,
        errorCount,
        message: overallMessage
      };
    }
  }
};

/**
 * Helper function to sync a patient
 */
async function syncPatient(payload, user, clientTempId) {
  const { Patient, Dispensaire } = await import('../../models/index.js');

  try {
    // Check if this patient was already synced (idempotency check)
    // We can use a combination of client data and tempId to detect duplicates
    // For now, we'll create a new patient each time
    // TODO: Implement proper idempotency using clientTempId tracking table

    // Validate required fields
    if (!payload.nom || !payload.sexe || !payload.religion || !payload.village) {
      return {
        serverId: null,
        message: null,
        error: 'Missing required patient fields: nom, sexe, religion, village are required'
      };
    }

    // Validate dispensaire
    const dispensaireId = payload.dispensaireId || user.dispensaireId;
    if (!dispensaireId) {
      return {
        serverId: null,
        message: null,
        error: 'No dispensaire specified'
      };
    }

    const dispensaire = await Dispensaire.findByPk(dispensaireId);
    if (!dispensaire) {
      return {
        serverId: null,
        message: null,
        error: 'Dispensaire not found'
      };
    }

    // Check permissions
    if (user.role === 'agent' && user.dispensaireId !== dispensaireId) {
      return {
        serverId: null,
        message: null,
        error: 'Unauthorized: Cannot create patient for this dispensaire'
      };
    }

    // Calculate age from dateNaissance if provided
    let age = payload.age;
    if (payload.dateNaissance) {
      const birthDate = new Date(payload.dateNaissance);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      age = Math.max(0, age);
    }

    // Create patient
    const patientData = {
      nom: payload.nom,
      prenom: payload.prenom || null,
      age: age,
      dateNaissance: payload.dateNaissance || null,
      sexe: payload.sexe,
      religion: payload.religion,
      village: payload.village,
      numeroPatient: payload.numeroPatient || null, // Will be auto-generated if not provided
      dispensaireId: dispensaireId,
      userId: user.id
    };

    // Handle location data
    if (payload.location) {
      patientData.locationLat = payload.location.lat;
      patientData.locationLon = payload.location.lon;
      patientData.locationAccuracy = payload.location.accuracy;
      patientData.locationTimestamp = payload.location.timestamp;
    }

    const patient = await Patient.create(patientData);

    return {
      serverId: patient.id,
      message: `Patient created: ${patient.numeroPatient}`,
      error: null
    };
  } catch (error) {
    console.error('Error syncing patient:', error);
    return {
      serverId: null,
      message: null,
      error: error.message || 'Failed to create patient'
    };
  }
}

/**
 * Helper function to sync a consultation (DataEntry)
 */
async function syncConsultation(payload, user, clientTempId) {
  const { DataEntry, Patient, TypeConsultation, DataEntryCategorieMaladie, PrescriptionItem } = await import('../../models/index.js');

  try {
    // Validate required fields
    if (!payload.patientId || !payload.typeConsultation || !payload.diagnostic) {
      return {
        serverId: null,
        message: null,
        error: 'Missing required consultation fields: patientId, typeConsultation, diagnostic are required'
      };
    }

    // Validate patient exists
    const patient = await Patient.findByPk(payload.patientId);
    if (!patient) {
      return {
        serverId: null,
        message: null,
        error: 'Patient not found'
      };
    }

    // Validate type consultation
    const typeConsultation = await TypeConsultation.findOne({
      where: { code: payload.typeConsultation }
    });

    if (!typeConsultation || !typeConsultation.isActive) {
      return {
        serverId: null,
        message: null,
        error: 'Invalid or inactive consultation type'
      };
    }

    // Validate gender-specific consultation types
    const femaleOnlyConsultationTypes = ['CPN', 'CPON', 'ACCOUCHEMENT'];
    if (patient.sexe === 'M' && femaleOnlyConsultationTypes.includes(payload.typeConsultation)) {
      return {
        serverId: null,
        message: null,
        error: 'This consultation type is reserved for female patients'
      };
    }

    // Determine dispensaire
    const dispensaireId = payload.dispensaireId || patient.dispensaireId || user.dispensaireId;
    if (!dispensaireId) {
      return {
        serverId: null,
        message: null,
        error: 'No dispensaire specified'
      };
    }

    // Parse date
    const consultationDate = payload.dateConsultation ? new Date(payload.dateConsultation) : new Date();
    const dateOnly = consultationDate.toISOString().split('T')[0];
    const timeConsultation = consultationDate.toISOString().split('T')[1]?.split('.')[0] || null;

    // Create consultation
    const entryData = {
      patientId: payload.patientId,
      typeConsultation: payload.typeConsultation,
      diagnostic: payload.diagnostic,
      prescription: payload.prescription || null,
      notes: payload.notes || null,
      dateConsultation: consultationDate,
      dateOnly: dateOnly,
      timeConsultation: timeConsultation,
      dispensaireId: dispensaireId,
      userId: user.id,
      status: payload.status || 'active'
    };

    // Handle location data
    if (payload.location) {
      entryData.locationLat = payload.location.lat;
      entryData.locationLon = payload.location.lon;
      entryData.locationAccuracy = payload.location.accuracy;
      entryData.locationTimestamp = payload.location.timestamp;
    }

    const entry = await DataEntry.create(entryData);

    // Handle categories if provided
    if (payload.categories && Array.isArray(payload.categories)) {
      for (const cat of payload.categories) {
        if (cat.categorieMaladieId) {
          await DataEntryCategorieMaladie.addCategorie(
            entry.id,
            cat.categorieMaladieId,
            {
              isPrincipal: cat.isPrincipal || false,
              notes: cat.notes || null
            }
          );
        }
      }
    }

    // Handle prescription items if provided
    if (payload.prescriptionItems && Array.isArray(payload.prescriptionItems)) {
      for (let i = 0; i < payload.prescriptionItems.length; i++) {
        const item = payload.prescriptionItems[i];
        await PrescriptionItem.create({
          dataEntryId: entry.id,
          medicament: item.medicament,
          dose: item.dose || null,
          frequence: item.frequence || null,
          duree: item.duree || null,
          notes: item.notes || null,
          ordre: item.ordre || i + 1
        });
      }
    }

    return {
      serverId: entry.id,
      message: `Consultation created for patient ${patient.numeroPatient}`,
      error: null
    };
  } catch (error) {
    console.error('Error syncing consultation:', error);
    return {
      serverId: null,
      message: null,
      error: error.message || 'Failed to create consultation'
    };
  }
}

export default syncResolvers;

import authResolvers from './auth.js';
import userResolvers from './user.js';
import dispensaireResolvers from './dispensaire.js';
import dataEntryResolvers from './dataEntry.js';
import patientResolvers from './patient.js';
import eventResolvers from './event.js';
import typeConsultationResolvers from './typeConsultation.js';

export const resolvers = {
  Query: {
    // Auth queries
    ...(authResolvers.Query || {}),
    
    // User queries
    ...userResolvers.Query,
    
    // Dispensaire queries
    dispensaire: dispensaireResolvers.Query?.dispensaire,
    dispensaires: dispensaireResolvers.Query?.dispensaires,
    
    // Patient queries
    patient: patientResolvers.Query?.patient,
    patients: patientResolvers.Query?.patients,
    
    // DataEntry queries
    dataEntry: dataEntryResolvers.Query?.dataEntry,
    dataEntries: dataEntryResolvers.Query?.dataEntries,
    patientConsultations: dataEntryResolvers.Query?.patientConsultations,
    consultationStatsByType: dataEntryResolvers.Query?.consultationStatsByType,
    consultationStats: dataEntryResolvers.Query?.consultationStats,
    recentConsultations: dataEntryResolvers.Query?.recentConsultations,
    
    // Event queries
    event: eventResolvers.Query?.event,
    events: eventResolvers.Query?.events,
    
    // TypeConsultation queries
    typeConsultation: typeConsultationResolvers.Query?.typeConsultation,
    typeConsultations: typeConsultationResolvers.Query?.typeConsultations,
  },
  
  Mutation: {
    // Auth mutations
    ...authResolvers.Mutation,
    
    // User mutations
    ...userResolvers.Mutation,
    
    // Dispensaire mutations
    ...(dispensaireResolvers.Mutation || {}),
    
    // Patient mutations
    ...(patientResolvers.Mutation || {}),
    
    // DataEntry mutations
    createDataEntry: dataEntryResolvers.Mutation?.createDataEntry,
    updateDataEntry: dataEntryResolvers.Mutation?.updateDataEntry,
    deleteDataEntry: dataEntryResolvers.Mutation?.deleteDataEntry,
    completeConsultation: dataEntryResolvers.Mutation?.completeConsultation,
    requireFollowUp: dataEntryResolvers.Mutation?.requireFollowUp,
    
    // Event mutations
    ...(eventResolvers.Mutation || {}),
    
    // TypeConsultation mutations
    updateTypeConsultation: typeConsultationResolvers.Mutation?.updateTypeConsultation,
  },
  
  // Field resolvers
  User: userResolvers.User || {},
  Dispensaire: dispensaireResolvers.Dispensaire || {},
  Patient: patientResolvers.Patient || {},
  DataEntry: dataEntryResolvers.DataEntry || {},
  Event: eventResolvers.Event || {},
  TypeConsultation: typeConsultationResolvers.TypeConsultation || {}
};

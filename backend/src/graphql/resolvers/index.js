import authResolvers from './auth.js';
import userResolvers from './user.js';
import dispensaireResolvers from './dispensaire.js';
import dataEntryResolvers from './dataEntry.js';
import patientResolvers from './patient.js';
import eventResolvers from './event.js';

export const resolvers = {
  Query: {
    // Auth queries
    ...(authResolvers.Query || {}),
    
    // User queries
    ...userResolvers.Query,
    
    // Dispensaire queries - SUPPRIMER dispensairesBySynoda
    dispensaire: dispensaireResolvers.Query?.dispensaire,
    dispensaires: dispensaireResolvers.Query?.dispensaires,
    // ❌ SUPPRIMER: dispensairesBySynoda: dispensaireResolvers.Query?.dispensairesBySynoda,
    
    // Patient queries - SUPPRIMER les queries non définies dans le schéma
    patient: patientResolvers.Query?.patient,
    patients: patientResolvers.Query?.patients,
    // ❌ SUPPRIMER: patientByNumero: patientResolvers.Query?.patientByNumero,
    // ❌ SUPPRIMER: searchPatients: patientResolvers.Query?.searchPatients,
    
    // DataEntry queries - SUPPRIMER les queries non définies
    dataEntry: dataEntryResolvers.Query?.dataEntry,
    dataEntries: dataEntryResolvers.Query?.dataEntries,
    // ❌ SUPPRIMER: patientConsultations: dataEntryResolvers.Query?.patientConsultations,
    
    // Event queries - SUPPRIMER les queries non définies
    event: eventResolvers.Query?.event,
    events: eventResolvers.Query?.events,
    // ❌ SUPPRIMER: upcomingEvents: eventResolvers.Query?.upcomingEvents,
    // ❌ SUPPRIMER: todayEvents: eventResolvers.Query?.todayEvents,
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
    
    // DataEntry mutations - SUPPRIMER les mutations non définies
    createDataEntry: dataEntryResolvers.Mutation?.createDataEntry,
    updateDataEntry: dataEntryResolvers.Mutation?.updateDataEntry,
    // ❌ SUPPRIMER: completeConsultation: dataEntryResolvers.Mutation?.completeConsultation,
    
    // Event mutations
    ...(eventResolvers.Mutation || {}),
  },
  
  // Field resolvers
  User: userResolvers.User || {},
  Dispensaire: dispensaireResolvers.Dispensaire || {},
  Patient: patientResolvers.Patient || {},
  DataEntry: dataEntryResolvers.DataEntry || {},
  Event: eventResolvers.Event || {},
};

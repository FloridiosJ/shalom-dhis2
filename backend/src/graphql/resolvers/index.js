import authResolvers from './auth.js';
import userResolvers from './user.js';
import dispensaireResolvers from './dispensaire.js';
import patientResolvers from './patient.js';
import dataEntryResolvers from './dataEntry.js';
import eventResolvers from './event.js';
import categorieMaladieResolvers from './categorieMaladie.js';
import typeConsultationResolvers from './typeConsultation.js';
import vaccinationResolvers from './vaccination.js';
import activiteSpirituelleResolvers from './activiteSpirituelle.js';
import reportsResolvers from './reports.js'; // ✅ NOUVEAU
import prescriptionItemResolvers from './prescriptionItem.js';
import { GraphQLScalarType, Kind } from 'graphql';

// Custom DateTime scalar
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date custom scalar type',
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return new Date(value).toISOString();
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  }
});

export const resolvers = {
  DateTime: DateTimeScalar,
  
  Query: {
    // Auth queries
    me: authResolvers.Query?.me,
    
    // User queries
    ...userResolvers.Query,
    
    // Dispensaire queries
    ...dispensaireResolvers.Query,
    
    // Patient queries
    ...patientResolvers.Query,
    
    // DataEntry queries
    ...dataEntryResolvers.Query,
    
    // Event queries
    ...eventResolvers.Query,
    
    // TypeConsultation queries
    ...typeConsultationResolvers.Query,
    
    // CategorieMaladie queries
    ...categorieMaladieResolvers.Query,

    // Vaccination queries
    ...vaccinationResolvers.Query,

    // ActiviteSpirituelle queries
    ...activiteSpirituelleResolvers.Query,

    // Reports queries
    ...reportsResolvers.Query, // ✅ NOUVEAU

    // PrescriptionItem queries
    ...prescriptionItemResolvers.Query,
  },
  
  Mutation: {
    // Auth mutations
    ...authResolvers.Mutation,
    
    // User mutations
    ...userResolvers.Mutation,
    
    // Dispensaire mutations
    ...dispensaireResolvers.Mutation,
    
    // Patient mutations
    ...patientResolvers.Mutation,
    
    // DataEntry mutations
    ...dataEntryResolvers.Mutation,
    
    // Event mutations
    ...eventResolvers.Mutation,
    
    // TypeConsultation mutations
    ...typeConsultationResolvers.Mutation,
    
    // CategorieMaladie mutations
    ...categorieMaladieResolvers.Mutation,

    // Vaccination mutations
    ...vaccinationResolvers.Mutation,

    // ActiviteSpirituelle mutations
    ...activiteSpirituelleResolvers.Mutation,
  },
  
  // Field resolvers
  User: userResolvers.User,
  Dispensaire: dispensaireResolvers.Dispensaire,
  Patient: patientResolvers.Patient,
  DataEntry: dataEntryResolvers.DataEntry,
  Event: eventResolvers.Event,
  TypeConsultation: typeConsultationResolvers.TypeConsultation,
  CategorieMaladie: categorieMaladieResolvers.CategorieMaladie,
  ArbreCategorie: categorieMaladieResolvers.ArbreCategorie,
  Vaccination: vaccinationResolvers.Vaccination,
  ActiviteSpirituelle: activiteSpirituelleResolvers.ActiviteSpirituelle,
  PrescriptionItem: prescriptionItemResolvers.PrescriptionItem,
};

export default resolvers;

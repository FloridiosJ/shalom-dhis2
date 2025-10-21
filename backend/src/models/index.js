import sequelize from '../config/db.js';

// Import de tous les modèles
import User from './user.js';
import Dispensaire from './dispensaire.js';
import Patient from './patient.js';
import TypeConsultation from './typeConsultation.js';
import CategorieMaladie from './categorieMaladie.js';
import DataEntry from './dataEntry.js';
import DataEntryCatégorieMaladie from './dataEntryCatégorieMaladie.js';
import Vaccination from './vaccination.js';
import ActiviteSpirituelle from './activiteSpirituelle.js';
import Event from './event.js';

// Définir les associations après que tous les modèles soient importés
const models = {
  User,
  Dispensaire,
  Patient,
  TypeConsultation,
  CategorieMaladie,
  DataEntry,
  DataEntryCatégorieMaladie,
  Vaccination,
  ActiviteSpirituelle,
  Event
};

// Configuration des associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

// Exporter les modèles individuellement pour une utilisation facile
export {
  sequelize,
  User,
  Dispensaire,
  Patient,
  TypeConsultation,
  CategorieMaladie,
  DataEntry,
  DataEntryCatégorieMaladie,
  Vaccination,
  ActiviteSpirituelle,
  Event
};

// Export par défaut de tous les modèles
export default models;
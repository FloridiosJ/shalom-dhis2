import sequelize from '../config/db.js';

// Import de tous les modèles
import User from './user.js';
import Dispensaire from './dispensaire.js';
import Patient from './patient.js';
import DataEntry from './dataEntry.js';
import Event from './event.js';
import TypeConsultation from './typeConsultation.js';
import CategorieMaladie from './categorieMaladie.js';
import Vaccination from './vaccination.js';
import ActiviteSpirituelle from './activiteSpirituelle.js';

// Définir les associations après que tous les modèles soient importés
const models = {
  User,
  Dispensaire,
  Patient,
  DataEntry,
  Event,
  TypeConsultation,
  CategorieMaladie,
  Vaccination,
  ActiviteSpirituelle
};

// ✅ Définir les associations si les méthodes associate existent
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Exporter les modèles individuellement pour une utilisation facile
export {
  User,
  Dispensaire,
  Patient,
  DataEntry,
  Event,
  TypeConsultation,
  CategorieMaladie,
  Vaccination,
  ActiviteSpirituelle,
  sequelize
};

// Export par défaut de tous les modèles
export default models;
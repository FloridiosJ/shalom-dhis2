import sequelize from '../config/db.js';
import User from './user.js';
import Dispensaire from './dispensaire.js';
import DataEntry from './dataEntry.js';

const models = {
  User,
  Dispensaire,
  DataEntry
};

// TEMPORAIREMENT COMMENTÉ - associations sans contraintes DB
// Object.keys(models).forEach(modelName => {
//   if (models[modelName].associate) {
//     models[modelName].associate(models);
//   }
// });

export {
  sequelize,
  User,
  Dispensaire,
  DataEntry
};

export default models;
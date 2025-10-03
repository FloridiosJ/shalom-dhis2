import sequelize from '../config/db.js';
import User from './user.js';
import Organisation from './organisation.js';
import Dispensaire from './dispensaire.js';

// Initialize associations
Object.values([User, Organisation, Dispensaire])
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate({ User, Organisation, Dispensaire }));

export {
  sequelize,
  User,
  Organisation,
  Dispensaire
};
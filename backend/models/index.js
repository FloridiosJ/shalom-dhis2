import sequelize from '../config/db.js';
import User from './user.js';
import Organisation from './organisation.js';
import Dispensaire from './dispensaire.js';
import DataEntry from './data_entry.js';

// Initialize associations
Object.values([User, Organisation, Dispensaire, DataEntry])
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate({ User, Organisation, Dispensaire, DataEntry }));

export {
  sequelize,
  User,
  Organisation,
  Dispensaire,
  DataEntry
};
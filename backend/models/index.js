import sequelize from '../config/db.js';
import User from './user.js';
import Dispensaire from './dispensaire.js';
import DataEntry from './dataEntry.js';

// Initialize associations
Object.values([User, Dispensaire, DataEntry])
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate({ User, Dispensaire, DataEntry }));

export {
  sequelize,
  User,
  Dispensaire,
  DataEntry
};
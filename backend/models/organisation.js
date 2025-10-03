import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Organisation = sequelize.define('Organisation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Organisations',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'SynodaLehibe',
      'SynodamParitany',
      'Fileovana',
      'Fitandremana',
      'Fiangonana'
    ),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
});

// Set up self-referential associations
Organisation.belongsTo(Organisation, {
  as: 'parent',
  foreignKey: 'parentId'
});

Organisation.hasMany(Organisation, {
  as: 'children',
  foreignKey: 'parentId'
});

export default Organisation;
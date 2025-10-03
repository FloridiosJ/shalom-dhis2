const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Organisation extends Model {}

Organisation.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parentId: {
    type: DataTypes.UUID,
    references: {
      model: Organisation,
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('SynodaLehibe', 'SynodamParitany', 'Fileovana', 'Fitandremana', 'Fiangonana'),
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Organisation',
  timestamps: true,
});

Organisation.hasMany(Organisation, { foreignKey: 'parentId', as: 'children' });
Organisation.belongsTo(Organisation, { foreignKey: 'parentId', as: 'parent' });

module.exports = Organisation;
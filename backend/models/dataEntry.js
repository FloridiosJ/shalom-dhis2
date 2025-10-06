import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const DataEntry = sequelize.define('DataEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dataElement: {
    type: DataTypes.STRING,
    allowNull: false
  },
  period: {
    type: DataTypes.STRING,
    allowNull: false
  },
  orgUnit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
    // PAS DE REFERENCES pour l'instant
  },
  dispensaireId: {
    type: DataTypes.UUID,
    allowNull: true
    // PAS DE REFERENCES pour l'instant
  }
}, {
  tableName: 'dataentries',
  timestamps: true
});

// Associations (sans contraintes DB pour l'instant)
DataEntry.associate = (models) => {
  DataEntry.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  DataEntry.belongsTo(models.Dispensaire, {
    foreignKey: 'dispensaireId',
    as: 'dispensaire'
  });
};

export default DataEntry;
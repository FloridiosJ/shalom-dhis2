import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Dispensaire = sequelize.define('Dispensaire', {
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
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  }
}, {
  tableName: 'dispensaires',
  timestamps: true
});

// Associations
Dispensaire.associate = (models) => {
  Dispensaire.hasMany(models.User, {
    foreignKey: 'dispensaireId',
    as: 'users'
  });
  
  Dispensaire.hasMany(models.DataEntry, {
    foreignKey: 'dispensaireId',
    as: 'dataEntries'
  });
};

export default Dispensaire;
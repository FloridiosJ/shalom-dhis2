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
  organisationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Organisations',
      key: 'id'
    }
  }
});

// Set up association with Organisation
Dispensaire.associate = (models) => {
  Dispensaire.belongsTo(models.Organisation, {
    foreignKey: 'organisationId',
    as: 'organisation'
  });
};

export default Dispensaire;
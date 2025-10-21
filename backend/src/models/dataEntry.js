import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const DataEntry = sequelize.define('DataEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notNull: { msg: 'Le patient est obligatoire' }
    }
  },
  typeConsultation: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le type de consultation est obligatoire' }
    }
  },
  diagnostic: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le diagnostic ne peut pas être vide' }
    }
  },
  prescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dateConsultation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  dispensaireId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'completed', 'cancelled']]
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'data_entries',
  timestamps: true
});

DataEntry.associate = (models) => {
  DataEntry.belongsTo(models.Patient, {
    foreignKey: 'patientId',
    as: 'patient',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  
  DataEntry.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'createdBy',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  
  DataEntry.belongsTo(models.Dispensaire, {
    foreignKey: 'dispensaireId',
    as: 'dispensaire',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  DataEntry.belongsTo(models.TypeConsultation, {
    foreignKey: 'typeConsultation',
    targetKey: 'code',
    as: 'typeConsultationDetails',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  });

  // Relation Many-to-Many avec CategorieMaladie
  DataEntry.belongsToMany(models.CategorieMaladie, {
    through: 'DataEntry_CategorieMaladie',
    foreignKey: 'dataEntryId',
    otherKey: 'categorieMaladieId',
    as: 'categories',
    timestamps: true
  });

  // ✅ AJOUTER : Relation inverse avec Vaccination
  DataEntry.hasMany(models.Vaccination, {
    foreignKey: 'dataEntryId',
    as: 'vaccinations',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
};

export default DataEntry;
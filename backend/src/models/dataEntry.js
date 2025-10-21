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

  // Association Many-to-Many avec CategorieMaladie via table de jointure
  DataEntry.belongsToMany(models.CategorieMaladie, {
    through: models.DataEntryCatégorieMaladie,
    foreignKey: 'dataEntryId',
    otherKey: 'categorieMaladieId',
    as: 'categories'
  });

  // Association directe avec la table de jointure pour accéder aux métadonnées
  DataEntry.hasMany(models.DataEntryCatégorieMaladie, {
    foreignKey: 'dataEntryId',
    as: 'categoriesAssociations'
  });

  // ✅ AJOUTER : Relation inverse avec Vaccination
  DataEntry.hasMany(models.Vaccination, {
    foreignKey: 'dataEntryId',
    as: 'vaccinations',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
};

// Méthodes pour gérer les catégories avec métadonnées
DataEntry.prototype.getCategoriesWithMeta = async function() {
  const { DataEntryCatégorieMaladie } = await import('./index.js');
  return await DataEntryCatégorieMaladie.getCategoriesWithMeta(this.id);
};

DataEntry.prototype.getPrincipalCategorie = async function() {
  const { DataEntryCatégorieMaladie } = await import('./index.js');
  return await DataEntryCatégorieMaladie.getPrincipalCategorie(this.id);
};

DataEntry.prototype.setPrincipalCategorie = async function(categorieMaladieId) {
  const { DataEntryCatégorieMaladie } = await import('./index.js');
  return await DataEntryCatégorieMaladie.setPrincipal(this.id, categorieMaladieId);
};

DataEntry.prototype.addCategorie = async function(categorieMaladieId, options) {
  const { DataEntryCatégorieMaladie } = await import('./index.js');
  return await DataEntryCatégorieMaladie.addCategorie(this.id, categorieMaladieId, options);
};

DataEntry.prototype.removeCategorie = async function(categorieMaladieId) {
  const { DataEntryCatégorieMaladie } = await import('./index.js');
  return await DataEntryCatégorieMaladie.removeCategorie(this.id, categorieMaladieId);
};

export default DataEntry;
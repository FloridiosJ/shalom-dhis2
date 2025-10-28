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
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  typeConsultation: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'type_consultations',
      key: 'code' // ✅ IMPORTANT : Référence sur 'code' pas 'id'
    }
  },
  diagnostic: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notNull: { msg: 'Le diagnostic est obligatoire' },
      notEmpty: { msg: 'Le diagnostic ne peut pas être vide' },
      len: { args: [5, 5000], msg: 'Le diagnostic doit contenir entre 5 et 5000 caractères' }
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
  dateOnly: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Date de consultation (YYYY-MM-DD) pour agrégations analytics'
  },
  timeConsultation: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Heure de consultation (HH:MM:SS) optionnelle'
  },
  dispensaireId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'dispensaires',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled', 'follow_up_required'),
    defaultValue: 'active',
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'data_entries',
  timestamps: true,
  indexes: [
    { fields: ['patientId'] },
    { fields: ['typeConsultation'] },
    { fields: ['dispensaireId'] },
    { fields: ['userId'] },
    { fields: ['dateConsultation'] },
    { fields: ['dateOnly'] },
    { fields: ['status'] },
    { fields: ['isActive'] },
    { 
      fields: ['patientId', 'dateConsultation'],
      name: 'idx_patient_date'
    },
    { 
      fields: ['dateOnly', 'dispensaireId'],
      name: 'idx_date_only_dispensaire'
    }
  ]
});

// Méthodes d'instance
DataEntry.prototype.getSummary = function() {
  const dateStr = new Date(this.dateConsultation).toLocaleDateString('fr-FR');
  return `${this.typeConsultation} - ${dateStr} - ${this.diagnostic.substring(0, 50)}${this.diagnostic.length > 50 ? '...' : ''}`;
};

DataEntry.prototype.canBeModifiedBy = function(user) {
  if (user.role === 'admin') return true;
  if (user.role === 'manager' && this.dispensaireId === user.dispensaireId) return true;
  if (this.userId === user.id) return true;
  return false;
};

DataEntry.prototype.getCategoriesWithMeta = async function() {
  const { DataEntryCategorieMaladie } = await import('./index.js');
  return await DataEntryCategorieMaladie.getCategoriesWithMeta(this.id);
};

DataEntry.prototype.getPrincipalCategorie = async function() {
  const { DataEntryCategorieMaladie } = await import('./index.js');
  return await DataEntryCategorieMaladie.getPrincipalCategorie(this.id);
};

DataEntry.prototype.setPrincipalCategorie = async function(categorieMaladieId) {
  const { DataEntryCategorieMaladie } = await import('./index.js');
  return await DataEntryCategorieMaladie.setPrincipal(this.id, categorieMaladieId);
};

DataEntry.prototype.addCategorie = async function(categorieMaladieId, options) {
  const { DataEntryCategorieMaladie } = await import('./index.js');
  return await DataEntryCategorieMaladie.addCategorie(this.id, categorieMaladieId, options);
};

DataEntry.prototype.removeCategorie = async function(categorieMaladieId) {
  const { DataEntryCategorieMaladie } = await import('./index.js');
  return await DataEntryCategorieMaladie.removeCategorie(this.id, categorieMaladieId);
};

// Méthodes statiques
DataEntry.getByPatient = async function(patientId, limit = 10) {
  return await this.findAll({
    where: { 
      patientId,
      isActive: true 
    },
    order: [['dateConsultation', 'DESC']],
    limit,
    include: [
      { 
        model: (await import('./index.js')).User, 
        as: 'createdBy',
        attributes: ['id', 'nom', 'prenom', 'role']
      },
      { 
        model: (await import('./index.js')).TypeConsultation, 
        as: 'typeConsultationDetails'
      }
    ]
  });
};

DataEntry.getByDispensaire = async function(dispensaireId, options = {}) {
  const { limit = 50, offset = 0, dateFrom, dateTo } = options;
  const { Op } = await import('sequelize');
  
  const whereClause = {
    dispensaireId,
    isActive: true
  };
  
  if (dateFrom || dateTo) {
    whereClause.dateConsultation = {};
    if (dateFrom) whereClause.dateConsultation[Op.gte] = dateFrom;
    if (dateTo) whereClause.dateConsultation[Op.lte] = dateTo;
  }
  
  return await this.findAll({
    where: whereClause,
    order: [['dateConsultation', 'DESC']],
    limit,
    offset,
    include: [
      { 
        model: (await import('./index.js')).Patient, 
        as: 'patient'
      },
      { 
        model: (await import('./index.js')).User, 
        as: 'createdBy',
        attributes: ['id', 'nom', 'prenom']
      },
      { 
        model: (await import('./index.js')).TypeConsultation, 
        as: 'typeConsultationDetails'
      }
    ]
  });
};

DataEntry.getStats = async function(dispensaireId = null, userId = null) {
  const { Op } = await import('sequelize');
  
  const whereClause = { isActive: true };
  if (dispensaireId) whereClause.dispensaireId = dispensaireId;
  if (userId) whereClause.userId = userId;
  
  const total = await this.count({ where: whereClause });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = await this.count({
    where: {
      ...whereClause,
      dateConsultation: { [Op.gte]: today }
    }
  });
  
  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);
  const weekCount = await this.count({
    where: {
      ...whereClause,
      dateConsultation: { [Op.gte]: thisWeek }
    }
  });
  
  const statusCounts = await this.findAll({
    where: whereClause,
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['status'],
    raw: true
  });
  
  return {
    total,
    today: todayCount,
    thisWeek: weekCount,
    byStatus: statusCounts
  };
};

// Définition des associations
DataEntry.associate = (models) => {
  DataEntry.belongsTo(models.Patient, {
    foreignKey: 'patientId',
    as: 'patient',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  });

  DataEntry.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'createdBy',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  });

  DataEntry.belongsTo(models.Dispensaire, {
    foreignKey: 'dispensaireId',
    as: 'dispensaire',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  });

  // ✅ CORRECTION : Association avec TypeConsultation via 'code'
  DataEntry.belongsTo(models.TypeConsultation, {
    foreignKey: 'typeConsultation',
    targetKey: 'code', // ✅ IMPORTANT : Spécifier que la jointure se fait sur 'code'
    as: 'typeConsultationDetails',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  });

  // Association Many-to-Many avec CategorieMaladie via table de jointure
  DataEntry.belongsToMany(models.CategorieMaladie, {
    through: models.DataEntryCategorieMaladie,
    foreignKey: 'dataEntryId',
    otherKey: 'categorieMaladieId',
    as: 'categories'
  });

  DataEntry.hasMany(models.DataEntryCategorieMaladie, {
    foreignKey: 'dataEntryId',
    as: 'categoriesAssociations'
  });

  DataEntry.hasMany(models.Vaccination, {
    foreignKey: 'dataEntryId',
    as: 'vaccinations',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
};

export default DataEntry;
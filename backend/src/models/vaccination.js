import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Vaccination = sequelize.define('Vaccination', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  dataEntryId: {
    type: DataTypes.UUID,
    allowNull: true,
    validate: {
      isUUID: { args: 4, msg: 'Format UUID invalide pour dataEntryId' }
    }
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notNull: { msg: 'Le patient est obligatoire' },
      isUUID: { args: 4, msg: 'Format UUID invalide pour le patient' }
    }
  },
  dateVaccination: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notNull: { msg: 'La date de vaccination est obligatoire' },
      isDate: { msg: 'Format de date invalide' },
      isNotFuture(value) {
        if (new Date(value) > new Date()) {
          throw new Error('La date de vaccination ne peut pas être dans le futur');
        }
      }
    }
  },
  typeVaccin: {
    type: DataTypes.ENUM(
      'BCG_POLIO_O',
      'DTCOQ_HEP_B_POLIO_I',
      'DTCOQ_HEP_B_POLIO_II',
      'DTCOQ_HEP_B_POLIO_III',
      'VAR',
      'VAA',
      'DTCOQ_HEP_B_POLIO_RAPPEL',
      'VPO_RAPPEL',
      'AUTRES'
    ),
    allowNull: false,
    validate: {
      notNull: { msg: 'Le type de vaccin est obligatoire' },
      isIn: {
        args: [[
          'BCG_POLIO_O',
          'DTCOQ_HEP_B_POLIO_I',
          'DTCOQ_HEP_B_POLIO_II',
          'DTCOQ_HEP_B_POLIO_III',
          'VAR',
          'VAA',
          'DTCOQ_HEP_B_POLIO_RAPPEL',
          'VPO_RAPPEL',
          'AUTRES'
        ]],
        msg: 'Type de vaccin invalide'
      }
    }
  },
  lot: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: { args: [0, 50], msg: 'Le numéro de lot ne peut pas dépasser 50 caractères' }
    }
  },
  agentId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notNull: { msg: 'L\'agent vaccinateur est obligatoire' },
      isUUID: { args: 4, msg: 'Format UUID invalide pour l\'agent' }
    }
  },
  remarques: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: { args: [0, 500], msg: 'Les remarques ne peuvent pas dépasser 500 caractères' }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'vaccinations',
  timestamps: true,
  indexes: [
    {
      fields: ['patientId']
    },
    {
      fields: ['dataEntryId']
    },
    {
      fields: ['agentId']
    },
    {
      fields: ['dateVaccination']
    },
    {
      fields: ['typeVaccin']
    },
    {
      fields: ['isActive']
    }
  ],
  hooks: {
    beforeValidate: (vaccination) => {
      // Normaliser le lot
      if (vaccination.lot) {
        vaccination.lot = vaccination.lot.trim().toUpperCase();
      }
    }
  }
});

/**
 * Retourne le libellé complet du vaccin
 * @returns {string} Libellé du vaccin
 */
Vaccination.prototype.getVaccinLabel = function() {
  const labels = {
    'BCG_POLIO_O': 'BCG + Polio 0',
    'DTCOQ_HEP_B_POLIO_I': 'DTCoq-Hep B-Polio 1',
    'DTCOQ_HEP_B_POLIO_II': 'DTCoq-Hep B-Polio 2',
    'DTCOQ_HEP_B_POLIO_III': 'DTCoq-Hep B-Polio 3',
    'VAR': 'VAR (Anti-Rougeoleux)',
    'VAA': 'VAA (Anti-Amaril)',
    'DTCOQ_HEP_B_POLIO_RAPPEL': 'DTCoq-Hep B-Polio Rappel',
    'VPO_RAPPEL': 'VPO Rappel',
    'AUTRES': 'Autres vaccins'
  };
  
  return labels[this.typeVaccin] || this.typeVaccin;
};

/**
 * Retourne un résumé de la vaccination
 * @returns {string} Résumé
 */
Vaccination.prototype.getSummary = function() {
  const date = new Date(this.dateVaccination).toLocaleDateString('fr-FR');
  return `${this.getVaccinLabel()} - ${date}${this.lot ? ` (Lot: ${this.lot})` : ''}`;
};

/**
 * Vérifie si la vaccination est récente (moins de 7 jours)
 * @returns {boolean} True si récente
 */
Vaccination.prototype.isRecent = function() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(this.dateVaccination) >= sevenDaysAgo;
};

/**
 * Méthode statique : Récupérer l'historique de vaccination d'un patient
 */
Vaccination.getPatientHistory = async function(patientId, limit = 50) {
  return await this.findAll({
    where: { 
      patientId,
      isActive: true 
    },
    include: [
      {
        model: sequelize.models.User,
        as: 'agent',
        attributes: ['id', 'nom', 'prenom', 'specialite']
      },
      {
        model: sequelize.models.Patient,
        as: 'patient',
        attributes: ['id', 'nom', 'prenom', 'age']
      }
    ],
    order: [['dateVaccination', 'DESC']],
    limit
  });
};

/**
 * Méthode statique : Obtenir les statistiques de vaccination
 */
Vaccination.getStats = async function(filters = {}) {
  const where = { isActive: true };
  
  if (filters.dateFrom && filters.dateTo) {
    where.dateVaccination = {
      [sequelize.Sequelize.Op.between]: [
        new Date(filters.dateFrom),
        new Date(filters.dateTo)
      ]
    };
  }
  
  if (filters.agentId) {
    where.agentId = filters.agentId;
  }
  
  const stats = await this.findAll({
    where,
    attributes: [
      'typeVaccin',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['typeVaccin'],
    raw: true
  });
  
  return stats.map(stat => ({
    typeVaccin: stat.typeVaccin,
    label: this.prototype.getVaccinLabel.call({ typeVaccin: stat.typeVaccin }),
    count: parseInt(stat.count)
  }));
};

// Définition des associations
Vaccination.associate = (models) => {
  // Relation avec DataEntry (optionnelle)
  Vaccination.belongsTo(models.DataEntry, {
    foreignKey: 'dataEntryId',
    as: 'dataEntry',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
  
  // Relation avec Patient (obligatoire)
  Vaccination.belongsTo(models.Patient, {
    foreignKey: 'patientId',
    as: 'patient',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  
  // Relation avec User (agent vaccinateur)
  Vaccination.belongsTo(models.User, {
    foreignKey: 'agentId',
    as: 'agent',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  });
};

export default Vaccination;
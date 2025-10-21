import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ActiviteSpirituelle = sequelize.define('ActiviteSpirituelle', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notNull: { msg: 'La date est obligatoire' },
      isDate: { msg: 'Format de date invalide' }
    }
  },
  dispensaireId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notNull: { msg: 'Le dispensaire est obligatoire' },
      isUUID: { args: 4, msg: 'Format UUID invalide pour le dispensaire' }
    }
  },
  typeActivite: {
    type: DataTypes.ENUM('culte', 'priere'),
    allowNull: false,
    validate: {
      notNull: { msg: 'Le type d\'activité est obligatoire' },
      isIn: {
        args: [['culte', 'priere']],
        msg: 'Le type d\'activité doit être "culte" ou "priere"'
      }
    }
  },
  nombreParticipants: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: { args: [0], msg: 'Le nombre de participants ne peut pas être négatif' },
      max: { args: [10000], msg: 'Le nombre de participants semble trop élevé' }
    }
  },
  precheur: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: { args: [0, 200], msg: 'Le nom du précheur ne peut pas dépasser 200 caractères' }
    }
  },
  versetPreche: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: { args: [0, 1000], msg: 'Le verset prêché ne peut pas dépasser 1000 caractères' }
    }
  },
  theme: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: { args: [0, 500], msg: 'Le thème ne peut pas dépasser 500 caractères' }
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: { args: [0, 2000], msg: 'Les notes ne peuvent pas dépasser 2000 caractères' }
    }
  },
  agentId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notNull: { msg: 'L\'agent responsable est obligatoire' },
      isUUID: { args: 4, msg: 'Format UUID invalide pour l\'agent' }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'activites_spirituelles',
  timestamps: true,
  indexes: [
    {
      fields: ['dispensaireId']
    },
    {
      fields: ['agentId']
    },
    {
      fields: ['date']
    },
    {
      fields: ['typeActivite']
    },
    {
      fields: ['isActive']
    }
  ],
  hooks: {
    beforeValidate: (activite) => {
      // Normaliser les données
      if (activite.precheur) {
        activite.precheur = activite.precheur.trim();
      }
      if (activite.theme) {
        activite.theme = activite.theme.trim();
      }
      if (activite.versetPreche) {
        activite.versetPreche = activite.versetPreche.trim();
      }
    }
  }
});

/**
 * Retourne le libellé du type d'activité
 * @returns {string} Libellé
 */
ActiviteSpirituelle.prototype.getTypeLabel = function() {
  const labels = {
    'culte': 'Culte',
    'priere': 'Prière'
  };
  return labels[this.typeActivite] || this.typeActivite;
};

/**
 * Retourne un résumé de l'activité
 * @returns {string} Résumé
 */
ActiviteSpirituelle.prototype.getSummary = function() {
  const date = new Date(this.date).toLocaleDateString('fr-FR');
  const type = this.getTypeLabel();
  const participants = this.nombreParticipants 
    ? ` - ${this.nombreParticipants} participant(s)` 
    : '';
  
  if (this.theme) {
    return `${type} : ${this.theme} (${date})${participants}`;
  }
  
  return `${type} du ${date}${participants}`;
};

/**
 * Vérifie si l'activité est récente (moins de 7 jours)
 * @returns {boolean} True si récente
 */
ActiviteSpirituelle.prototype.isRecent = function() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(this.date) >= sevenDaysAgo;
};

/**
 * Vérifie si l'activité est aujourd'hui
 * @returns {boolean} True si aujourd'hui
 */
ActiviteSpirituelle.prototype.isToday = function() {
  const today = new Date();
  const activityDate = new Date(this.date);
  return (
    activityDate.getDate() === today.getDate() &&
    activityDate.getMonth() === today.getMonth() &&
    activityDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Vérifie si l'activité est future
 * @returns {boolean} True si future
 */
ActiviteSpirituelle.prototype.isUpcoming = function() {
  return new Date(this.date) > new Date();
};

/**
 * Méthode statique : Récupérer les activités d'un dispensaire
 */
ActiviteSpirituelle.getByDispensaire = async function(dispensaireId, limit = 50) {
  return await this.findAll({
    where: { 
      dispensaireId,
      isActive: true 
    },
    include: [
      {
        model: sequelize.models.User,
        as: 'agent',
        attributes: ['id', 'nom', 'prenom', 'role']
      }
    ],
    order: [['date', 'DESC']],
    limit
  });
};

/**
 * Méthode statique : Obtenir les statistiques d'activités
 */
ActiviteSpirituelle.getStats = async function(filters = {}) {
  const where = { isActive: true };
  
  if (filters.dispensaireId) {
    where.dispensaireId = filters.dispensaireId;
  }
  
  if (filters.dateFrom && filters.dateTo) {
    where.date = {
      [sequelize.Sequelize.Op.between]: [
        new Date(filters.dateFrom),
        new Date(filters.dateTo)
      ]
    };
  }
  
  if (filters.typeActivite) {
    where.typeActivite = filters.typeActivite;
  }
  
  const stats = await this.findAll({
    where,
    attributes: [
      'typeActivite',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('nombreParticipants')), 'totalParticipants'],
      [sequelize.fn('AVG', sequelize.col('nombreParticipants')), 'moyenneParticipants']
    ],
    group: ['typeActivite'],
    raw: true
  });
  
  return stats.map(stat => ({
    typeActivite: stat.typeActivite,
    count: parseInt(stat.count),
    totalParticipants: parseInt(stat.totalParticipants) || 0,
    moyenneParticipants: parseFloat(stat.moyenneParticipants) || 0
  }));
};

// Définition des associations
ActiviteSpirituelle.associate = (models) => {
  // Relation avec Dispensaire
  ActiviteSpirituelle.belongsTo(models.Dispensaire, {
    foreignKey: 'dispensaireId',
    as: 'dispensaire',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  
  // Relation avec User (agent responsable)
  ActiviteSpirituelle.belongsTo(models.User, {
    foreignKey: 'agentId',
    as: 'agent',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  });
};

export default ActiviteSpirituelle;
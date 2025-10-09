import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Event = sequelize.define('Event', {
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
  type_event: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le type d\'événement ne peut pas être vide' },
      len: { args: [2, 100], msg: 'Le type d\'événement doit contenir entre 2 et 100 caractères' }
    }
  },
  participant: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le participant ne peut pas être vide' },
      len: { args: [2, 200], msg: 'Le participant doit contenir entre 2 et 200 caractères' }
    }
  },
  outils: {
    // ✅ CORRIGER l'enum pour supprimer l'accent
    type: DataTypes.ENUM('presentiel', 'visio'), // ✅ "presentiel" au lieu de "présentiel"
    allowNull: false,
    validate: {
      notNull: { msg: 'L\'outil est obligatoire' },
      isIn: { 
        args: [['presentiel', 'visio']], // ✅ Corriger ici aussi
        msg: 'L\'outil doit être "presentiel" ou "visio"' 
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: { args: [0, 500], msg: 'La description ne peut pas dépasser 500 caractères' }
    }
  },
  lieu: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: { args: [0, 200], msg: 'Le lieu ne peut pas dépasser 200 caractères' }
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notNull: { msg: 'L\'organisateur est obligatoire' },
      isUUID: { args: 4, msg: 'Format UUID invalide pour l\'organisateur' }
    }
  },
  dispensaireId: {
    type: DataTypes.UUID,
    allowNull: true,
    validate: {
      isUUID: { args: 4, msg: 'Format UUID invalide pour le dispensaire' }
    }
  },
  status: {
    type: DataTypes.ENUM('planifie', 'en_cours', 'termine', 'annule'),
    defaultValue: 'planifie',
    allowNull: false
  },
  nombreParticipants: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Le nombre de participants doit être au moins 1' },
      max: { args: [1000], msg: 'Le nombre de participants ne peut pas dépasser 1000' }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'events',
  timestamps: true
});

/**
 * Retourne le titre complet de l'événement
 * @returns {string} Titre complet
 */
Event.prototype.getFullTitle = function() {
  return `${this.type_event} - ${this.participant}`;
};

/**
 * Vérifie si l'événement est aujourd'hui
 * @returns {boolean} True si l'événement est aujourd'hui
 */
Event.prototype.isToday = function() {
  const today = new Date();
  const eventDate = new Date(this.date);
  return today.toDateString() === eventDate.toDateString();
};

/**
 * Vérifie si l'événement est à venir
 * @returns {boolean} True si l'événement est à venir
 */
Event.prototype.isUpcoming = function() {
  const now = new Date();
  return new Date(this.date) > now;
};

// Définition des associations
Event.associate = (models) => {
  // Relation avec User (organisateur)
  Event.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'organisateur',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  
  // Relation avec Dispensaire (optionnelle)
  Event.belongsTo(models.Dispensaire, {
    foreignKey: 'dispensaireId',
    as: 'dispensaire',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
};

export default Event;
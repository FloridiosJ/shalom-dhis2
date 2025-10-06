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
      notNull: {
        msg: 'La date est obligatoire'
      },
      isDate: {
        msg: 'Format de date invalide'
      },
      isValidEventDate(value) {
        const eventDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (eventDate < today) {
          throw new Error('La date de l\'événement ne peut pas être dans le passé');
        }
      }
    }
  },
  type_event: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Le type d\'événement ne peut pas être vide'
      },
      len: {
        args: [3, 100],
        msg: 'Le type d\'événement doit contenir entre 3 et 100 caractères'
      }
    }
  },
  participant: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Le participant ne peut pas être vide'
      },
      len: {
        args: [2, 200],
        msg: 'Le participant doit contenir entre 2 et 200 caractères'
      }
    }
  },
  outils: {
    type: DataTypes.ENUM('présentiel', 'visio'),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'L\'outil est obligatoire'
      },
      isIn: {
        args: [['présentiel', 'visio']],
        msg: 'L\'outil doit être présentiel ou visio'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'La description ne peut pas dépasser 500 caractères'
      }
    }
  },
  lieu: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: {
        args: [0, 200],
        msg: 'Le lieu ne peut pas dépasser 200 caractères'
      }
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'L\'utilisateur organisateur est obligatoire'
      },
      isUUID: {
        args: 4,
        msg: 'Format UUID invalide pour l\'utilisateur'
      }
    }
  },
  dispensaireId: {
    type: DataTypes.UUID,
    allowNull: true,
    validate: {
      isUUID: {
        args: 4,
        msg: 'Format UUID invalide pour le dispensaire'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('planifie', 'en_cours', 'termine', 'annule'),
    defaultValue: 'planifie',
    allowNull: false
  },
  nombreParticipants: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Le nombre de participants ne peut pas être négatif'
      },
      max: {
        args: [1000],
        msg: 'Le nombre de participants ne peut pas dépasser 1000'
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'events',
  timestamps: true,
  indexes: [
    {
      fields: ['date']
    },
    {
      fields: ['type_event']
    },
    {
      fields: ['outils']
    },
    {
      fields: ['status']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['dispensaireId']
    },
    {
      fields: ['isActive']
    }
  ],
  hooks: {
    beforeValidate: (event) => {
      // Normaliser les textes
      if (event.type_event) {
        event.type_event = event.type_event.trim();
      }
      
      if (event.participant) {
        event.participant = event.participant.trim();
      }
      
      if (event.description) {
        event.description = event.description.trim();
      }
      
      if (event.lieu) {
        event.lieu = event.lieu.trim();
      }
      
      // Si visio, pas besoin de lieu physique spécifique
      if (event.outils === 'visio' && !event.lieu) {
        event.lieu = 'Visioconférence';
      }
    }
  }
});

/**
 * Retourne le titre complet de l'événement
 * @returns {string} Titre complet
 */
Event.prototype.getFullTitle = function() {
  const dateStr = this.date.toLocaleDateString('fr-FR');
  return `${this.type_event} - ${dateStr} (${this.outils})`;
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
  const eventDate = new Date(this.date);
  
  return eventDate > now;
};

/**
 * Marque l'événement comme en cours
 * @returns {Promise<void>}
 */
Event.prototype.start = async function() {
  this.status = 'en_cours';
  await this.save();
};

/**
 * Marque l'événement comme terminé
 * @param {number} nombreParticipants - Nombre final de participants
 * @returns {Promise<void>}
 */
Event.prototype.complete = async function(nombreParticipants) {
  this.status = 'termine';
  if (nombreParticipants !== undefined) {
    this.nombreParticipants = nombreParticipants;
  }
  await this.save();
};

/**
 * Annule l'événement
 * @param {string} raison - Raison de l'annulation
 * @returns {Promise<void>}
 */
Event.prototype.cancel = async function(raison) {
  this.status = 'annule';
  if (raison) {
    this.description = (this.description || '') + `\nAnnulé: ${raison}`;
  }
  await this.save();
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
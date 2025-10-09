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
      notNull: {
        msg: 'Le patient est obligatoire'
      },
      isUUID: {
        args: 4,
        msg: 'Format UUID invalide pour le patient'
      }
    }
  },
  diagnostic: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Le diagnostic ne peut pas être vide'
      },
      len: {
        args: [5, 1000],
        msg: 'Le diagnostic doit contenir entre 5 et 1000 caractères'
      }
    }
  },
  prescription: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La prescription ne peut pas être vide'
      },
      len: {
        args: [5, 1000],
        msg: 'La prescription doit contenir entre 5 et 1000 caractères'
      }
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'L\'utilisateur est obligatoire'
      },
      isUUID: {
        args: 4,
        msg: 'Format UUID invalide pour l\'utilisateur'
      }
    }
  },
  dispensaireId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Le dispensaire est obligatoire'
      },
      isUUID: {
        args: 4,
        msg: 'Format UUID invalide pour le dispensaire'
      }
    }
  },
  dateConsultation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('en_cours', 'termine', 'suivi_requis'),
    defaultValue: 'en_cours',
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'Les notes ne peuvent pas dépasser 500 caractères'
      }
    }
  }
}, {
  tableName: 'data_entries',
  timestamps: true,
  indexes: [
    {
      fields: ['patientId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['dispensaireId']
    },
    {
      fields: ['dateConsultation']
    },
    {
      fields: ['status']
    },
    {
      fields: ['createdAt']
    }
  ],
  hooks: {
    beforeValidate: async (dataEntry) => {
      // Normaliser les textes
      if (dataEntry.diagnostic) {
        dataEntry.diagnostic = dataEntry.diagnostic.trim();
      }
      
      if (dataEntry.prescription) {
        dataEntry.prescription = dataEntry.prescription.trim();
      }
      
      if (dataEntry.notes) {
        dataEntry.notes = dataEntry.notes.trim();
      }
    },
    
    beforeCreate: async (dataEntry) => {
      // Vérifier que le patient appartient au dispensaire
      const { Patient } = await import('./index.js');
      const patient = await Patient.findByPk(dataEntry.patientId);
      
      if (patient && patient.dispensaireId !== dataEntry.dispensaireId) {
        throw new Error('Le patient n\'appartient pas au dispensaire spécifié');
      }
      
      // Vérifier que l'utilisateur appartient au dispensaire
      const { User } = await import('./index.js');
      const user = await User.findByPk(dataEntry.userId);
      
      if (user && user.dispensaireId !== dataEntry.dispensaireId) {
        if (user.role !== 'admin' && user.role !== 'manager') {
          throw new Error('L\'utilisateur ne peut créer des consultations que pour son dispensaire');
        }
      }
    }
  }
});

/**
 * Retourne un résumé de la consultation
 * @returns {string} Résumé
 */
DataEntry.prototype.getSummary = function() {
  const diagnosticShort = this.diagnostic.length > 50 
    ? this.diagnostic.substring(0, 50) + '...' 
    : this.diagnostic;
  return `Consultation du ${this.dateConsultation.toLocaleDateString()} - ${diagnosticShort}`;
};

/**
 * Marque la consultation comme terminée
 * @returns {Promise<void>}
 */
DataEntry.prototype.markAsCompleted = async function() {
  this.status = 'termine';
  await this.save();
};

/**
 * Marque la consultation comme nécessitant un suivi
 * @param {string} notes - Notes de suivi
 * @returns {Promise<void>}
 */
DataEntry.prototype.requireFollowUp = async function(notes) {
  this.status = 'suivi_requis';
  if (notes) {
    this.notes = notes;
  }
  await this.save();
};

// Définition des associations
DataEntry.associate = (models) => {
  // Relation avec Patient
  DataEntry.belongsTo(models.Patient, {
    foreignKey: 'patientId',
    as: 'patient',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  
  // Relation avec User
  DataEntry.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  
  // Relation avec Dispensaire
  DataEntry.belongsTo(models.Dispensaire, {
    foreignKey: 'dispensaireId',
    as: 'dispensaire',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

export default DataEntry;
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
      notEmpty: {
        msg: 'Le nom du site ne peut pas être vide'
      },
      len: {
        args: [2, 100],
        msg: 'Le nom doit contenir entre 2 et 100 caractères'
      }
    }
  },
  fileovana: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Le fileovana ne peut pas être vide'
      },
      len: {
        args: [2, 100],
        msg: 'Le fileovana doit contenir entre 2 et 100 caractères'
      }
    }
  },
  synoda: {
    type: DataTypes.ENUM('SPA', 'SPSofia', 'SPBM', 'SPMel'),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Le synoda est obligatoire'
      },
      isIn: {
        args: [['SPA', 'SPSofia', 'SPBM', 'SPMel']],
        msg: 'Le synoda doit être SPA, SPSofia, SPBM ou SPMel'
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'dispensaires',
  timestamps: true,
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['synoda']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['fileovana']
    }
  ],
  hooks: {
    beforeValidate: (dispensaire) => {
      // Normaliser le nom
      if (dispensaire.name) {
        dispensaire.name = dispensaire.name.trim();
      }
      
      // Normaliser le fileovana
      if (dispensaire.fileovana) {
        dispensaire.fileovana = dispensaire.fileovana.trim();
      }
    }
  }
});

/**
 * Retourne le nom complet avec fileovana
 * @returns {string} Nom complet
 */
Dispensaire.prototype.getFullName = function() {
  return `${this.name} - ${this.fileovana}`;
};

/**
 * Retourne les statistiques du dispensaire
 * @returns {Promise<Object>} Statistiques
 */
Dispensaire.prototype.getStats = async function() {
  const { User, DataEntry } = await import('./index.js');
  
  const [
    totalUsers,
    activeUsers,
    totalDataEntries
  ] = await Promise.all([
    User.count({ where: { dispensaireId: this.id } }),
    User.count({ where: { dispensaireId: this.id, isActive: true } }),
    DataEntry.count({ where: { dispensaireId: this.id } })
  ]);
  
  return {
    totalUsers,
    activeUsers,
    totalDataEntries
  };
};

// Définition des associations
Dispensaire.associate = (models) => {
  // Relation inverse avec User (utilisateurs du dispensaire)
  Dispensaire.hasMany(models.User, {
    foreignKey: 'dispensaireId',
    as: 'users',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  // Relation inverse avec Patient (patients du dispensaire)
  Dispensaire.hasMany(models.Patient, {
    foreignKey: 'dispensaireId',
    as: 'patients',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Relation inverse avec DataEntry (consultations du dispensaire)
  Dispensaire.hasMany(models.DataEntry, {
    foreignKey: 'dispensaireId',
    as: 'dataEntries',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Relation inverse avec Event (événements du dispensaire)
  Dispensaire.hasMany(models.Event, {
    foreignKey: 'dispensaireId',
    as: 'events',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  // ✅ AJOUTER : Relation inverse avec ActiviteSpirituelle
  Dispensaire.hasMany(models.ActiviteSpirituelle, {
    foreignKey: 'dispensaireId',
    as: 'activitesSpiritulles',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

export default Dispensaire;
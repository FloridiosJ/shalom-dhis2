import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le nom est obligatoire' },
      len: { args: [2, 100], msg: 'Le nom doit contenir entre 2 et 100 caractères' }
    }
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: true, // ✅ Optionnel
    validate: {
      len: { args: [0, 100], msg: 'Le prénom ne peut pas dépasser 100 caractères' }
    }
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true, // Made nullable - age will be calculated from dateNaissance
    validate: {
      min: { args: [0], msg: 'L\'âge ne peut pas être négatif' },
      max: { args: [150], msg: 'L\'âge ne peut pas dépasser 150 ans' }
    }
  },
  dateNaissance: {
    type: DataTypes.DATEONLY,
    allowNull: true, // Will become required after migration period
    validate: {
      isDate: { msg: 'La date de naissance doit être une date valide' },
      isNotFuture(value) {
        if (value && new Date(value) > new Date()) {
          throw new Error('La date de naissance ne peut pas être dans le futur');
        }
      }
    }
  },
  sexe: {
    type: DataTypes.STRING(1),
    allowNull: false,
    validate: {
      notNull: { msg: 'Le sexe est obligatoire' },
      isIn: {
        args: [['M', 'F', 'L']],
        msg: 'Le sexe doit être M (Masculin), F (Féminin) ou L (Autre)'
      }
    }
  },
  religion: {
    type: DataTypes.ENUM('Kristianina', 'Musulman', 'traditionnelle'),
    allowNull: false,
    validate: {
      notNull: { msg: 'La religion est obligatoire' }
    }
  },
  village: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le village est obligatoire' },
      len: { args: [2, 100], msg: 'Le village doit contenir entre 2 et 100 caractères' }
    }
  },
  numeroPatient: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Le numéro patient est obligatoire' }
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notNull: { msg: 'L\'utilisateur créateur est obligatoire' },
      isUUID: { args: 4, msg: 'Format UUID invalide pour l\'utilisateur' }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'patients',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['numeroPatient']
    },
    {
      fields: ['dispensaireId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['nom']
    },
    {
      fields: ['village']
    },
    {
      fields: ['isActive']
    }
  ],
  hooks: {
    beforeValidate: async (patient) => {
      // Générer automatiquement un numeroPatient si non fourni
      if (!patient.numeroPatient) {
        const year = String(new Date().getFullYear()).slice(-2);
        const count = await Patient.count() + 1;
        const paddedCount = String(count).padStart(4, '0');
        patient.numeroPatient = `PAT-${year}${paddedCount}`;
      }
      
      // Normaliser les données
      if (patient.nom) {
        patient.nom = patient.nom.trim().toUpperCase();
      }
      if (patient.prenom) {
        patient.prenom = patient.prenom.trim();
      }
      if (patient.village) {
        patient.village = patient.village.trim();
      }
    }
  }
});

// Méthodes d'instance
Patient.prototype.getDisplayName = function() {
  return this.prenom 
    ? `${this.nom} ${this.prenom}` 
    : this.nom;
};

/**
 * Calculate current age from date of birth
 * @returns {number} Age in years
 */
Patient.prototype.calculateAge = function() {
  if (this.dateNaissance) {
    const birthDate = new Date(this.dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  }
  
  // Fallback to stored age if dateNaissance not available
  return this.age || 0;
};

Patient.prototype.getCategorieAge = function() {
  const age = this.calculateAge();
  if (age < 1) return 'Nourrisson';
  if (age < 5) return 'Jeune enfant';
  if (age < 12) return 'Enfant';
  if (age < 18) return 'Adolescent';
  if (age < 60) return 'Adulte';
  return 'Senior';
};

Patient.prototype.isMineur = function() {
  return this.calculateAge() < 18;
};

// Définition des associations
Patient.associate = (models) => {
  // Relation avec User (créateur)
  Patient.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'createdBy',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  
  // Relation avec Dispensaire
  Patient.belongsTo(models.Dispensaire, {
    foreignKey: 'dispensaireId',
    as: 'dispensaire',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  
  // Relation avec DataEntry (consultations)
  Patient.hasMany(models.DataEntry, {
    foreignKey: 'patientId',
    as: 'consultations',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Relation inverse avec Vaccination
  Patient.hasMany(models.Vaccination, {
    foreignKey: 'patientId',
    as: 'vaccinations',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

export default Patient;
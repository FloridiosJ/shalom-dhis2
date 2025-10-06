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
      notEmpty: {
        msg: 'Le nom ne peut pas être vide'
      },
      len: {
        args: [2, 100],
        msg: 'Le nom doit contenir entre 2 et 100 caractères'
      }
    }
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'L\'âge est obligatoire'
      },
      isInt: {
        msg: 'L\'âge doit être un nombre entier'
      },
      min: {
        args: [0],
        msg: 'L\'âge ne peut pas être négatif'
      },
      max: {
        args: [150],
        msg: 'L\'âge ne peut pas dépasser 150 ans'
      }
    }
  },
  sexe: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Le sexe ne peut pas être vide'
      },
      isIn: {
        args: [['Masculin', 'Féminin', 'M', 'F']],
        msg: 'Le sexe doit être Masculin, Féminin, M ou F'
      }
    }
  },
  religion: {
    type: DataTypes.ENUM('Kristianina', 'Musulman', 'traditionnelle'),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'La religion est obligatoire'
      },
      isIn: {
        args: [['Kristianina', 'Musulman', 'traditionnelle']],
        msg: 'La religion doit être Kristianina, Musulman ou traditionnelle'
      }
    }
  },
  village: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Le village ne peut pas être vide'
      },
      len: {
        args: [2, 100],
        msg: 'Le village doit contenir entre 2 et 100 caractères'
      }
    }
  },
  numeroPatient: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      name: 'patients_numero_unique',
      msg: 'Ce numéro patient est déjà utilisé'
    }
  },
  dispensaireId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Le dispensaire est obligatoire'
      }
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'L\'utilisateur créateur est obligatoire'
      }
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
      fields: ['nom']
    },
    {
      fields: ['village']
    },
    {
      fields: ['dispensaireId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['religion']
    },
    {
      fields: ['sexe']
    },
    {
      fields: ['isActive']
    }
  ],
  hooks: {
    beforeValidate: async (patient) => {
      // Normaliser le nom
      if (patient.nom) {
        patient.nom = patient.nom.trim();
      }
      
      // Normaliser le village
      if (patient.village) {
        patient.village = patient.village.trim();
      }
      
      // Normaliser le sexe
      if (patient.sexe) {
        const sexeMap = {
          'M': 'Masculin',
          'F': 'Féminin',
          'masculin': 'Masculin',
          'feminin': 'Féminin',
          'féminin': 'Féminin'
        };
        patient.sexe = sexeMap[patient.sexe] || patient.sexe;
      }
      
      // Générer numéro patient si absent
      if (!patient.numeroPatient && patient.isNewRecord) {
        patient.numeroPatient = await generateNumeroPatient();
      }
    },
    
    beforeCreate: async (patient) => {
      // Vérifier que l'utilisateur appartient au dispensaire
      const { User } = await import('./index.js');
      const user = await User.findByPk(patient.userId);
      
      if (user && user.dispensaireId !== patient.dispensaireId) {
        if (user.role !== 'admin' && user.role !== 'manager') {
          throw new Error('L\'utilisateur ne peut créer des patients que pour son dispensaire');
        }
      }
    }
  }
});

/**
 * Génère un numéro patient unique
 * @returns {Promise<string>} Numéro patient généré
 */
async function generateNumeroPatient() {
  const year = new Date().getFullYear();
  const baseNumber = `P-${year}-`;
  
  let number;
  let attempts = 0;
  
  do {
    // Générer un nombre aléatoire à 4 chiffres
    const randomNum = String(Math.floor(1000 + Math.random() * 9000));
    number = baseNumber + randomNum;
    attempts++;
    
    // Vérifier l'unicité
    const existing = await Patient.findOne({ where: { numeroPatient: number } });
    if (!existing) {
      break;
    }
    
    // Sécurité : éviter les boucles infinies
    if (attempts > 100) {
      // Utiliser timestamp comme fallback
      number = baseNumber + Date.now().toString().slice(-4);
      break;
    }
  } while (true);
  
  return number;
}

/**
 * Retourne le nom complet avec informations de base
 * @returns {string} Informations du patient
 */
Patient.prototype.getDisplayName = function() {
  return `${this.nom} (${this.age} ans, ${this.sexe}, ${this.village})`;
};

/**
 * Retourne la catégorie d'âge
 * @returns {string} Catégorie d'âge
 */
Patient.prototype.getCategorieAge = function() {
  if (this.age < 1) return 'Nourrisson';
  if (this.age < 5) return 'Enfant en bas âge';
  if (this.age < 12) return 'Enfant';
  if (this.age < 18) return 'Adolescent';
  if (this.age < 60) return 'Adulte';
  return 'Senior';
};

/**
 * Vérifie si le patient est mineur
 * @returns {boolean} True si mineur
 */
Patient.prototype.isMineur = function() {
  return this.age < 18;
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
};

export default Patient;
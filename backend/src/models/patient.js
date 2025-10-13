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
    allowNull: false
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: true
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 150
    }
  },
  sexe: {
    type: DataTypes.STRING(1),
    allowNull: false,
    validate: {
      isIn: [['M', 'F', 'L']]
    }
  },
  village: {
    type: DataTypes.STRING,
    allowNull: false
  },
  religion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dispensaireId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  numeroPatient: {
    type: DataTypes.STRING,
    allowNull: false, // important pour respecter le schéma GraphQL !
    unique: true
  }
}, {
  tableName: 'patients',
  timestamps: true
});

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
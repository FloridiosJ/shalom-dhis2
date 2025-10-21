import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le nom ne peut pas être vide' },
      len: { args: [2, 50], msg: 'Le nom doit contenir entre 2 et 50 caractères' }
    }
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le prénom ne peut pas être vide' },
      len: { args: [2, 50], msg: 'Le prénom doit contenir entre 2 et 50 caractères' }
    }
  },
  // ✅ CORRIGER le champ email - sans index unique complexe
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: { msg: 'Format email invalide' }
    }
  },
  login: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      name: 'users_login_unique',
      msg: 'Ce login est déjà utilisé'
    },
    validate: {
      notEmpty: { msg: 'Le login ne peut pas être vide' },
      isValidLogin(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const fourDigitRegex = /^\d{4}$/;
        
        if (!emailRegex.test(value) && !fourDigitRegex.test(value)) {
          throw new Error('Le login doit être un email valide ou un identifiant à 4 chiffres');
        }
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: { args: [6, 255], msg: 'Le mot de passe doit contenir au moins 6 caractères' }
    }
  },
  specialite: {
    type: DataTypes.ENUM('sage_femme', 'infirmier', 'infirmiere'),
    allowNull: true,
    validate: {
      isIn: {
        args: [['sage_femme', 'infirmier', 'infirmiere']],
        msg: 'La spécialité doit être sage_femme, infirmier ou infirmiere'
      }
    }
  },
  dispensaireId: {
    type: DataTypes.UUID,
    allowNull: true,
    validate: {
      isRequiredForAgent(value) {
        if (this.role === 'agent' && !value) {
          throw new Error('Un dispensaire est obligatoire pour les agents');
        }
      }
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'agent'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['admin', 'manager', 'agent']],
        msg: 'Le rôle doit être admin, manager ou agent'
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  // ✅ SIMPLIFIER les indexes - supprimer l'index email complexe
  indexes: [
    {
      unique: true,
      fields: ['login']
    },
    {
      fields: ['role']
    },
    {
      fields: ['dispensaireId']
    },
    {
      fields: ['isActive']
    }
    // ✅ SUPPRIMER l'index email pour éviter l'erreur
  ],
  hooks: {
    beforeValidate: async (user) => {
      // Génération automatique du login si non fourni
      if (!user.login && user.isNewRecord) {
        user.login = await generateUniqueLogin(user);
        console.log(`🔑 Login généré pour ${user.nom} ${user.prenom}: ${user.login}`);
      }

      // Si l'email est fourni et que c'est un email valide, l'utiliser aussi comme login
      if (user.email && !user.login && user.isNewRecord) {
        user.login = user.email;
      }

      // Génération automatique du mot de passe si non fourni
      if (!user.password && user.isNewRecord) {
        user.password = generateSecurePassword();
        console.log(`🔐 Mot de passe généré pour ${user.login}: ${user.password}`);
      }
    },
    
    beforeSave: async (user) => {
      // Hasher le mot de passe s'il a été modifié
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

/**
 * Compare le mot de passe fourni avec le hash stocké
 * @param {string} candidatePassword - Mot de passe à vérifier
 * @returns {boolean} True si le mot de passe est correct
 */
User.prototype.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('❌ Erreur comparaison mot de passe:', error);
    return false;
  }
};

/**
 * Met à jour la date de dernière connexion
 */
User.prototype.updateLastLogin = async function() {
  try {
    this.lastLoginAt = new Date();
    await this.save({ fields: ['lastLoginAt'] });
    console.log('✅ Dernière connexion mise à jour pour:', this.login);
  } catch (error) {
    console.error('❌ Erreur mise à jour dernière connexion:', error);
  }
};

/**
 * Retourne le nom complet
 * @returns {string} Nom complet
 */
User.prototype.getFullName = function() {
  return `${this.prenom} ${this.nom}`;
};

/**
 * Génère un login unique à 4 chiffres
 * @param {Object} user - Instance utilisateur
 * @returns {string} Login unique
 */
async function generateUniqueLogin(user) {
  let login;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 100;

  while (!isUnique && attempts < maxAttempts) {
    // Générer un nombre aléatoire à 4 chiffres
    login = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Vérifier si ce login existe déjà
    const existingUser = await User.findOne({ where: { login } });
    
    if (!existingUser) {
      isUnique = true;
    }
    
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Impossible de générer un login unique après ' + maxAttempts + ' tentatives');
  }

  return login;
}

/**
 * Génère un mot de passe sécurisé
 * @returns {string} Mot de passe généré
 */
function generateSecurePassword() {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < 12; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

// Définition des associations
User.associate = (models) => {
  // Relation avec Dispensaire
  User.belongsTo(models.Dispensaire, {
    foreignKey: 'dispensaireId',
    as: 'dispensaire',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  // Relation inverse avec Patient (créateur)
  User.hasMany(models.Patient, {
    foreignKey: 'userId',
    as: 'patients',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Relation inverse avec DataEntry (créateur)
  User.hasMany(models.DataEntry, {
    foreignKey: 'userId',
    as: 'consultations',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Relation inverse avec Event (organisateur)
  User.hasMany(models.Event, {
    foreignKey: 'userId',
    as: 'events',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // ✅ AJOUTER : Relation inverse avec Vaccination (agent)
  User.hasMany(models.Vaccination, {
    foreignKey: 'agentId',
    as: 'vaccinationsEffectuees',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  });
};

export default User;
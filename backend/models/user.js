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
      notEmpty: {
        msg: 'Le nom ne peut pas être vide'
      },
      len: {
        args: [2, 50],
        msg: 'Le nom doit contenir entre 2 et 50 caractères'
      }
    }
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Le prénom ne peut pas être vide'
      },
      len: {
        args: [2, 50],
        msg: 'Le prénom doit contenir entre 2 et 50 caractères'
      }
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
  login: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      name: 'users_login_unique',
      msg: 'Ce login est déjà utilisé'
    },
    validate: {
      notEmpty: {
        msg: 'Le login ne peut pas être vide'
      },
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
      len: {
        args: [6, 255],
        msg: 'Le mot de passe doit contenir au moins 6 caractères'
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
  ],
  hooks: {
    beforeValidate: async (user) => {
      // Génération automatique du login si non fourni
      if (!user.login && user.isNewRecord) {
        user.login = await generateUniqueLogin(user);
        console.log(`🔑 Login généré pour ${user.nom} ${user.prenom}: ${user.login}`);
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
 * Génère un login unique (identifiant à 4 chiffres)
 * @param {Object} user - Utilisateur
 * @returns {Promise<string>} Login généré
 */
async function generateUniqueLogin(user) {
  let login;
  let attempts = 0;
  
  do {
    // Générer un nombre aléatoire à 4 chiffres
    login = String(Math.floor(1000 + Math.random() * 9000));
    attempts++;
    
    // Vérifier l'unicité
    const existing = await User.findOne({ where: { login } });
    if (!existing) {
      break;
    }
    
    // Sécurité : éviter les boucles infinies
    if (attempts > 100) {
      // Utiliser timestamp comme fallback
      login = Date.now().toString().slice(-4);
      break;
    }
  } while (true);
  
  return login;
}

/**
 * Génère un mot de passe sécurisé
 * @returns {string} Mot de passe généré
 */
function generateSecurePassword() {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%&*';
  
  let password = '';
  
  // Au moins un caractère de chaque type
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += special.charAt(Math.floor(Math.random() * special.length));
  
  // Compléter jusqu'à 8 caractères
  const allChars = lowercase + uppercase + numbers + special;
  for (let i = password.length; i < 8; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Mélanger les caractères
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Compare un mot de passe en clair avec le hash stocké
 * @param {string} candidatePassword - Mot de passe à vérifier
 * @returns {Promise<boolean>} True si le mot de passe correspond
 */
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Met à jour la date de dernière connexion
 * @returns {Promise<void>}
 */
User.prototype.updateLastLogin = async function() {
  this.lastLoginAt = new Date();
  await this.save({ 
    validate: false,
    fields: ['lastLoginAt', 'updatedAt']
  });
};

/**
 * Retourne le nom complet de l'utilisateur
 * @returns {string} Nom complet
 */
User.prototype.getFullName = function() {
  return `${this.prenom} ${this.nom}`.trim();
};

// Définition des associations
User.associate = (models) => {
  // Relation avec Dispensaire
  User.belongsTo(models.Dispensaire, {
    foreignKey: 'dispensaireId',
    as: 'dispensaire',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
  
  // Relation avec DataEntry
  User.hasMany(models.DataEntry, {
    foreignKey: 'userId',
    as: 'dataEntries',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

export default User;
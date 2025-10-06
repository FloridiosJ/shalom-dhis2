import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  login: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      isValidLogin(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const fourDigitRegex = /^\d{4}$/;
        
        if (!emailRegex.test(value) && !fourDigitRegex.test(value)) {
          throw new Error('Login must be a valid email or 4-digit identifier');
        }
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [7, 255]
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'agent'),
    allowNull: false,
    validate: {
      isIn: [['admin', 'manager', 'agent']]
    }
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  poste: {
    type: DataTypes.STRING,
    allowNull: true
  },
  specialite: {
    type: DataTypes.ENUM('sage_femme', 'infirmier', 'infirmiere'),
    allowNull: true
  },
  dispensaireId: {
    type: DataTypes.UUID,
    allowNull: true
    // PAS DE REFERENCES pour l'instant
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeValidate: (user) => {
      if (!user.password && user.isNewRecord) {
        user.password = generateSecurePassword();
        console.log(`Generated password for ${user.email}: ${user.password}`);
      }
      
      if (user.role === 'admin') {
        user.login = user.email;
      }
    },
    
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

function generateSecurePassword() {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%&*';
  
  let password = '';
  password += letters.charAt(Math.floor(Math.random() * 26) + 26);
  password += letters.charAt(Math.floor(Math.random() * 26));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += special.charAt(Math.floor(Math.random() * special.length));
  
  const allChars = letters + numbers + special;
  for (let i = password.length; i < 8; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.updateLastLogin = async function() {
  this.lastLoginAt = new Date();
  await this.save({ validate: false });
};

User.prototype.generateNewPassword = function() {
  const newPassword = generateSecurePassword();
  this.password = newPassword;
  return { plainPassword: newPassword };
};

// Associations (sans contraintes DB pour l'instant)
User.associate = (models) => {
  User.belongsTo(models.Dispensaire, {
    foreignKey: 'dispensaireId',
    as: 'dispensaire'
  });
  
  User.hasMany(models.DataEntry, {
    foreignKey: 'userId',
    as: 'dataEntries'
  });
};

export default User;
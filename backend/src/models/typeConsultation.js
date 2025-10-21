import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const TypeConsultation = sequelize.define('TypeConsultation', {
  code: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le code ne peut pas être vide' },
      isUppercase: { msg: 'Le code doit être en majuscules' }
    }
  },
  libelle: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le libellé ne peut pas être vide' },
      len: { args: [2, 100], msg: 'Le libellé doit contenir entre 2 et 100 caractères' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'type_consultations',
  timestamps: true,
  indexes: [
    {
      fields: ['isActive']
    },
    {
      fields: ['libelle']
    }
  ]
});

/**
 * Retourne tous les types actifs
 */
TypeConsultation.getActiveTypes = async function() {
  return await this.findAll({
    where: { isActive: true },
    order: [['libelle', 'ASC']]
  });
};

/**
 * Recherche un type par code
 */
TypeConsultation.getByCode = async function(code) {
  return await this.findOne({
    where: { code: code.toUpperCase() }
  });
};

/**
 * Vérifie si un type existe et est actif
 */
TypeConsultation.isValid = async function(code) {
  const type = await this.findOne({
    where: { 
      code: code.toUpperCase(),
      isActive: true 
    }
  });
  return !!type;
};

// Définition des associations
TypeConsultation.associate = (models) => {
  TypeConsultation.hasMany(models.DataEntry, {
    foreignKey: 'typeConsultation',
    sourceKey: 'code', // ✅ IMPORTANT : Spécifier que la source est 'code'
    as: 'dataEntries',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  });
};

export default TypeConsultation;
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const CategorieMaladie = sequelize.define('CategorieMaladie', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nom: { // ✅ Le schéma GraphQL utilise "nom" - OK
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'Le nom de la catégorie est obligatoire' },
      notEmpty: { msg: 'Le nom ne peut pas être vide' },
      len: { args: [2, 100], msg: 'Le nom doit contenir entre 2 et 100 caractères' }
    }
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isUppercase: { msg: 'Le code doit être en majuscules' }
    }
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'categorie_maladies',
      key: 'id'
    }
  },
  niveau: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: { msg: 'Le niveau est obligatoire' },
      isIn: {
        args: [[1, 2]],
        msg: 'Le niveau doit être 1 ou 2'
      },
      // Validation custom : si parentId est null, niveau doit être 1
      validateNiveau(value) {
        if (this.parentId === null && value !== 1) {
          throw new Error('Une catégorie sans parent doit avoir le niveau 1');
        }
        if (this.parentId !== null && value !== 2) {
          throw new Error('Une sous-catégorie doit avoir le niveau 2');
        }
      }
    }
  },
  ordre: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'L\'ordre doit être un nombre positif' }
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
  tableName: 'categorie_maladies',
  timestamps: true,
  indexes: [
    {
      fields: ['parentId']
    },
    {
      fields: ['niveau']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['code'],
      unique: true,
      where: {
        code: {
          [sequelize.Sequelize.Op.ne]: null
        }
      }
    },
    {
      fields: ['ordre']
    }
  ],
  hooks: {
    // Hook avant validation pour définir le niveau automatiquement
    beforeValidate: (categorie) => {
      if (categorie.parentId === null) {
        categorie.niveau = 1;
      } else if (categorie.parentId !== null && !categorie.niveau) {
        categorie.niveau = 2;
      }
    },
    
    // Hook avant suppression pour vérifier les dépendances
    beforeDestroy: async (categorie) => {
      const sousCategories = await CategorieMaladie.count({
        where: { parentId: categorie.id }
      });
      
      if (sousCategories > 0) {
        throw new Error('Impossible de supprimer une catégorie qui contient des sous-catégories');
      }
    }
  }
});

/**
 * Définition des associations
 */
CategorieMaladie.associate = (models) => {
  // Auto-référence : Parent
  CategorieMaladie.belongsTo(models.CategorieMaladie, {
    foreignKey: 'parentId',
    as: 'parent',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  });

  // Auto-référence : Sous-catégories
  CategorieMaladie.hasMany(models.CategorieMaladie, {
    foreignKey: 'parentId',
    as: 'sousCategories',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  });

  // Relation many-to-many avec DataEntry via table de jonction
  CategorieMaladie.belongsToMany(models.DataEntry, {
    through: 'DataEntry_CategorieMaladie',
    foreignKey: 'categorieMaladieId',
    otherKey: 'dataEntryId',
    as: 'dataEntries',
    timestamps: true
  });
};

/**
 * Méthodes de classe (statiques)
 */

// Récupérer toutes les catégories de niveau 1 (catégories principales)
CategorieMaladie.getCategoriesPrincipales = async function(activeOnly = true) {
  const where = { niveau: 1 };
  if (activeOnly) {
    where.isActive = true;
  }
  
  return await this.findAll({
    where,
    include: [{
      model: this,
      as: 'sousCategories',
      where: activeOnly ? { isActive: true } : undefined,
      required: false,
      order: [['ordre', 'ASC']]
    }],
    order: [['ordre', 'ASC']]
  });
};

// Récupérer l'arbre complet des catégories
CategorieMaladie.getArbreCategories = async function(activeOnly = true) {
  const where = { niveau: 1 };
  if (activeOnly) {
    where.isActive = true;
  }
  
  const categories = await this.findAll({
    where,
    include: [{
      model: this,
      as: 'sousCategories',
      where: activeOnly ? { isActive: true } : undefined,
      required: false
    }],
    order: [
      ['ordre', 'ASC'],
      [{ model: this, as: 'sousCategories' }, 'ordre', 'ASC']
    ]
  });
  
  return categories;
};

// Récupérer les sous-catégories d'une catégorie
CategorieMaladie.getSousCategories = async function(parentId, activeOnly = true) {
  const where = { 
    parentId,
    niveau: 2
  };
  if (activeOnly) {
    where.isActive = true;
  }
  
  return await this.findAll({
    where,
    order: [['ordre', 'ASC']]
  });
};

// Vérifier si une catégorie peut être supprimée
CategorieMaladie.canDelete = async function(id) {
  const [sousCategories, dataEntries] = await Promise.all([
    this.count({ where: { parentId: id } }),
    sequelize.models.DataEntry.count({
      include: [{
        model: this,
        as: 'categories',
        where: { id }
      }]
    })
  ]);
  
  return {
    canDelete: sousCategories === 0 && dataEntries === 0,
    sousCategories,
    dataEntries
  };
};

/**
 * Méthodes d'instance
 */

// Obtenir le chemin complet (breadcrumb)
CategorieMaladie.prototype.getCheminComplet = async function() {
  const chemin = [this.nom];
  
  if (this.parentId) {
    const parent = await CategorieMaladie.findByPk(this.parentId);
    if (parent) {
      chemin.unshift(parent.nom);
    }
  }
  
  return chemin.join(' > ');
};

// Vérifier si la catégorie a des sous-catégories
CategorieMaladie.prototype.hasSousCategories = async function() {
  const count = await CategorieMaladie.count({
    where: { parentId: this.id }
  });
  return count > 0;
};

// Obtenir toutes les sous-catégories avec leurs données
CategorieMaladie.prototype.getSousCategoriesAvecStats = async function() {
  if (this.niveau !== 1) {
    throw new Error('Cette méthode est disponible uniquement pour les catégories de niveau 1');
  }
  
  const sousCategories = await CategorieMaladie.findAll({
    where: { 
      parentId: this.id,
      isActive: true 
    },
    include: [{
      model: sequelize.models.DataEntry,
      as: 'dataEntries',
      attributes: ['id'],
      through: { attributes: [] }
    }],
    order: [['ordre', 'ASC']]
  });
  
  return sousCategories.map(sc => ({
    ...sc.toJSON(),
    nombreConsultations: sc.dataEntries ? sc.dataEntries.length : 0
  }));
};

export default CategorieMaladie;
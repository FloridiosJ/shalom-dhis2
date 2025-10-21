import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const DataEntryCatégorieMaladie = sequelize.define('DataEntryCatégorieMaladie', {
  dataEntryId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'data_entries',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  categorieMaladieId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'categorie_maladies',
      key: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  },
  isPrincipal: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indique si cette catégorie est la catégorie principale du diagnostic'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes ou précisions sur cette catégorie pour ce diagnostic'
  }
}, {
  tableName: 'data_entry_categorie_maladies',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['dataEntryId', 'categorieMaladieId'],
      name: 'unique_data_entry_categorie'
    },
    {
      fields: ['dataEntryId'],
      name: 'idx_data_entry_id'
    },
    {
      fields: ['categorieMaladieId'],
      name: 'idx_categorie_maladie_id'
    },
    {
      fields: ['isPrincipal'],
      name: 'idx_is_principal'
    },
    {
      fields: ['dataEntryId', 'isPrincipal'],
      name: 'idx_data_entry_principal'
    }
  ],
  hooks: {
    // Hook pour s'assurer qu'il n'y a qu'une seule catégorie principale par dataEntry
    beforeSave: async (instance) => {
      if (instance.isPrincipal) {
        // Réinitialiser les autres catégories principales pour ce dataEntry
        await DataEntryCatégorieMaladie.update(
          { isPrincipal: false },
          {
            where: {
              dataEntryId: instance.dataEntryId,
              categorieMaladieId: { [sequelize.Sequelize.Op.ne]: instance.categorieMaladieId }
            }
          }
        );
      }
    }
  }
});

/**
 * Récupère toutes les catégories d'un dataEntry avec leurs métadonnées
 */
DataEntryCatégorieMaladie.getCategoriesWithMeta = async function(dataEntryId) {
  const { CategorieMaladie } = await import('./index.js');
  
  const associations = await this.findAll({
    where: { dataEntryId },
    include: [
      {
        model: CategorieMaladie,
        as: 'categorie',
        include: [
          {
            model: CategorieMaladie,
            as: 'parent'
          }
        ]
      }
    ],
    order: [
      ['isPrincipal', 'DESC'],
      ['createdAt', 'ASC']
    ]
  });

  return associations.map(assoc => ({
    ...assoc.categorie.toJSON(),
    isPrincipal: assoc.isPrincipal,
    notes: assoc.notes,
    associationCreatedAt: assoc.createdAt
  }));
};

/**
 * Récupère la catégorie principale d'un dataEntry
 */
DataEntryCatégorieMaladie.getPrincipalCategorie = async function(dataEntryId) {
  const { CategorieMaladie } = await import('./index.js');
  
  const principal = await this.findOne({
    where: { 
      dataEntryId,
      isPrincipal: true 
    },
    include: [
      {
        model: CategorieMaladie,
        as: 'categorie'
      }
    ]
  });

  return principal ? principal.categorie : null;
};

/**
 * Définit une catégorie comme principale pour un dataEntry
 */
DataEntryCatégorieMaladie.setPrincipal = async function(dataEntryId, categorieMaladieId) {
  const transaction = await sequelize.transaction();
  
  try {
    // Réinitialiser toutes les catégories de ce dataEntry
    await this.update(
      { isPrincipal: false },
      { 
        where: { dataEntryId },
        transaction 
      }
    );

    // Définir la nouvelle catégorie principale
    const [updatedCount] = await this.update(
      { isPrincipal: true },
      {
        where: {
          dataEntryId,
          categorieMaladieId
        },
        transaction
      }
    );

    if (updatedCount === 0) {
      throw new Error('Association non trouvée');
    }

    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Ajoute une catégorie à un dataEntry
 */
DataEntryCatégorieMaladie.addCategorie = async function(dataEntryId, categorieMaladieId, options = {}) {
  const { isPrincipal = false, notes = null } = options;

  // Si on définit cette catégorie comme principale, réinitialiser les autres
  if (isPrincipal) {
    await this.update(
      { isPrincipal: false },
      { where: { dataEntryId } }
    );
  }

  const [association, created] = await this.findOrCreate({
    where: {
      dataEntryId,
      categorieMaladieId
    },
    defaults: {
      isPrincipal,
      notes
    }
  });

  if (!created && isPrincipal) {
    // Si l'association existait déjà, la mettre à jour
    await association.update({ isPrincipal: true, notes });
  }

  return association;
};

/**
 * Retire une catégorie d'un dataEntry
 */
DataEntryCatégorieMaladie.removeCategorie = async function(dataEntryId, categorieMaladieId) {
  const deleted = await this.destroy({
    where: {
      dataEntryId,
      categorieMaladieId
    }
  });

  return deleted > 0;
};

/**
 * Compte le nombre de dataEntries utilisant une catégorie
 */
DataEntryCatégorieMaladie.countByCategorie = async function(categorieMaladieId) {
  return await this.count({
    where: { categorieMaladieId },
    distinct: true,
    col: 'dataEntryId'
  });
};

/**
 * Obtient les statistiques d'utilisation des catégories
 */
DataEntryCatégorieMaladie.getUsageStats = async function(options = {}) {
  const { 
    dateFrom, 
    dateTo, 
    dispensaireId,
    limit = 10 
  } = options;

  const { DataEntry } = await import('./index.js');
  
  const whereClause = {};
  
  if (dateFrom || dateTo || dispensaireId) {
    const dataEntryWhere = {};
    
    if (dateFrom) {
      dataEntryWhere.dateConsultation = { 
        [sequelize.Sequelize.Op.gte]: dateFrom 
      };
    }
    
    if (dateTo) {
      dataEntryWhere.dateConsultation = {
        ...dataEntryWhere.dateConsultation,
        [sequelize.Sequelize.Op.lte]: dateTo
      };
    }
    
    if (dispensaireId) {
      dataEntryWhere.dispensaireId = dispensaireId;
    }

    const validDataEntries = await DataEntry.findAll({
      where: dataEntryWhere,
      attributes: ['id']
    });

    whereClause.dataEntryId = {
      [sequelize.Sequelize.Op.in]: validDataEntries.map(de => de.id)
    };
  }

  const stats = await this.findAll({
    where: whereClause,
    attributes: [
      'categorieMaladieId',
      [sequelize.fn('COUNT', sequelize.col('dataEntryId')), 'count'],
      [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "isPrincipal" = true THEN 1 END')), 'principalCount']
    ],
    group: ['categorieMaladieId'],
    order: [[sequelize.literal('"count"'), 'DESC']],
    limit,
    raw: true
  });

  return stats;
};

// Définition des associations
DataEntryCatégorieMaladie.associate = (models) => {
  DataEntryCatégorieMaladie.belongsTo(models.DataEntry, {
    foreignKey: 'dataEntryId',
    as: 'dataEntry',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  DataEntryCatégorieMaladie.belongsTo(models.CategorieMaladie, {
    foreignKey: 'categorieMaladieId',
    as: 'categorie',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  });
};

export default DataEntryCatégorieMaladie;
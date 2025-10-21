import { CategorieMaladie, DataEntry } from '../../models/index.js';
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { Op } from 'sequelize';

const categorieMaladieResolvers = {
  Query: {
    categorieMaladie: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const categorie = await CategorieMaladie.findByPk(id, {
        include: [
          { model: CategorieMaladie, as: 'parent' },
          { model: CategorieMaladie, as: 'sousCategories' }
        ]
      });

      if (!categorie) {
        throw new UserInputError('Catégorie non trouvée');
      }

      return categorie;
    },

    categorieMaladieByCode: async (_, { code }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const categorie = await CategorieMaladie.findOne({
        where: { code },
        include: [
          { model: CategorieMaladie, as: 'parent' },
          { model: CategorieMaladie, as: 'sousCategories' }
        ]
      });

      if (!categorie) {
        throw new UserInputError(`Catégorie avec le code '${code}' non trouvée`);
      }

      return categorie;
    },

    categoriesMaladies: async (_, { filter }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const where = {};

      if (filter) {
        if (filter.niveau) {
          where.niveau = filter.niveau;
        }
        if (filter.parentId !== undefined) {
          where.parentId = filter.parentId;
        }
        if (filter.isActive !== undefined) {
          where.isActive = filter.isActive;
        }
        if (filter.search) {
          where[Op.or] = [
            { nom: { [Op.iLike]: `%${filter.search}%` } },
            { code: { [Op.iLike]: `%${filter.search}%` } },
            { description: { [Op.iLike]: `%${filter.search}%` } }
          ];
        }
      }

      return await CategorieMaladie.findAll({
        where,
        include: [
          { model: CategorieMaladie, as: 'parent' },
          { model: CategorieMaladie, as: 'sousCategories' }
        ],
        order: [['ordre', 'ASC'], ['nom', 'ASC']]
      });
    },

    categoriesPrincipales: async (_, { activeOnly = true }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      return await CategorieMaladie.getCategoriesPrincipales(activeOnly);
    },

    arbreCategories: async (_, { activeOnly = true }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      return await CategorieMaladie.getArbreCategories(activeOnly);
    },

    sousCategories: async (_, { parentId, activeOnly = true }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      return await CategorieMaladie.getSousCategories(parentId, activeOnly);
    },

    categoriesStats: async (_, { dispensaireId, dateFrom, dateTo }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const where = { isActive: true };

      // Filtrer par dispensaire si fourni ou selon le rôle
      if (dispensaireId) {
        where.dispensaireId = dispensaireId;
      } else if (user.role !== 'ADMIN' && user.dispensaireId) {
        where.dispensaireId = user.dispensaireId;
      }

      // Filtrer par date
      if (dateFrom && dateTo) {
        where.dateConsultation = {
          [Op.between]: [new Date(dateFrom), new Date(dateTo)]
        };
      }

      // Récupérer toutes les catégories
      const categories = await CategorieMaladie.findAll({
        where: { isActive: true },
        include: [{
          model: DataEntry,
          as: 'dataEntries',
          where,
          required: false,
          attributes: ['id']
        }]
      });

      const total = categories.reduce((sum, cat) => 
        sum + (cat.dataEntries ? cat.dataEntries.length : 0), 0
      );

      return categories.map(categorie => ({
        categorie,
        nombreConsultations: categorie.dataEntries ? categorie.dataEntries.length : 0,
        pourcentage: total > 0 
          ? ((categorie.dataEntries ? categorie.dataEntries.length : 0) / total * 100).toFixed(2)
          : 0,
        tendance: 'stable'
      })).filter(stat => stat.nombreConsultations > 0)
        .sort((a, b) => b.nombreConsultations - a.nombreConsultations);
    },

    checkDeleteCategorie: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      if (user.role !== 'ADMIN') {
        throw new AuthenticationError('Accès refusé. Rôle ADMIN requis.');
      }

      const result = await CategorieMaladie.canDelete(id);

      return {
        ...result,
        message: result.canDelete
          ? 'Cette catégorie peut être supprimée'
          : `Impossible de supprimer : ${result.sousCategories} sous-catégorie(s) et ${result.dataEntries} consultation(s) associée(s)`
      };
    }
  },

  Mutation: {
    createCategorieMaladie: async (_, { input }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError('Non authentifié');
        }

        if (user.role !== 'ADMIN') {
          throw new AuthenticationError('Accès refusé. Rôle ADMIN requis.');
        }

        // Vérifier que le code n'existe pas déjà
        if (input.code) {
          const existing = await CategorieMaladie.findOne({
            where: { code: input.code }
          });
          if (existing) {
            return {
              categorie: null,
              success: false,
              message: `Le code '${input.code}' existe déjà`,
              errors: ['CODE_ALREADY_EXISTS']
            };
          }
        }

        // Vérifier la validité du parent si fourni
        if (input.parentId) {
          const parent = await CategorieMaladie.findByPk(input.parentId);
          if (!parent) {
            return {
              categorie: null,
              success: false,
              message: 'Catégorie parente non trouvée',
              errors: ['PARENT_NOT_FOUND']
            };
          }
          if (parent.niveau !== 1) {
            return {
              categorie: null,
              success: false,
              message: 'Une sous-catégorie ne peut avoir qu\'une catégorie de niveau 1 comme parent',
              errors: ['INVALID_PARENT_LEVEL']
            };
          }
        }

        const categorie = await CategorieMaladie.create(input);

        const createdCategorie = await CategorieMaladie.findByPk(categorie.id, {
          include: [
            { model: CategorieMaladie, as: 'parent' },
            { model: CategorieMaladie, as: 'sousCategories' }
          ]
        });

        return {
          categorie: createdCategorie,
          success: true,
          message: 'Catégorie créée avec succès',
          errors: []
        };
      } catch (error) {
        return {
          categorie: null,
          success: false,
          message: error.message,
          errors: [error.message]
        };
      }
    },

    updateCategorieMaladie: async (_, { id, input }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError('Non authentifié');
        }

        if (user.role !== 'ADMIN') {
          throw new AuthenticationError('Accès refusé. Rôle ADMIN requis.');
        }

        const categorie = await CategorieMaladie.findByPk(id);
        if (!categorie) {
          return {
            categorie: null,
            success: false,
            message: 'Catégorie non trouvée',
            errors: ['NOT_FOUND']
          };
        }

        // Vérifier que le code n'existe pas déjà (si modifié)
        if (input.code && input.code !== categorie.code) {
          const existing = await CategorieMaladie.findOne({
            where: { 
              code: input.code,
              id: { [Op.ne]: id }
            }
          });
          if (existing) {
            return {
              categorie: null,
              success: false,
              message: `Le code '${input.code}' existe déjà`,
              errors: ['CODE_ALREADY_EXISTS']
            };
          }
        }

        await categorie.update(input);

        const updatedCategorie = await CategorieMaladie.findByPk(id, {
          include: [
            { model: CategorieMaladie, as: 'parent' },
            { model: CategorieMaladie, as: 'sousCategories' }
          ]
        });

        return {
          categorie: updatedCategorie,
          success: true,
          message: 'Catégorie mise à jour avec succès',
          errors: []
        };
      } catch (error) {
        return {
          categorie: null,
          success: false,
          message: error.message,
          errors: [error.message]
        };
      }
    },

    deleteCategorieMaladie: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError('Non authentifié');
        }

        if (user.role !== 'ADMIN') {
          throw new AuthenticationError('Accès refusé. Rôle ADMIN requis.');
        }

        const categorie = await CategorieMaladie.findByPk(id);
        if (!categorie) {
          return {
            categorie: null,
            success: false,
            message: 'Catégorie non trouvée',
            errors: ['NOT_FOUND']
          };
        }

        // Vérifier si la suppression est possible
        const canDeleteCheck = await CategorieMaladie.canDelete(id);
        if (!canDeleteCheck.canDelete) {
          return {
            categorie: null,
            success: false,
            message: `Impossible de supprimer : ${canDeleteCheck.sousCategories} sous-catégorie(s) et ${canDeleteCheck.dataEntries} consultation(s) associée(s)`,
            errors: ['HAS_DEPENDENCIES']
          };
        }

        // Soft delete
        await categorie.update({ isActive: false });

        return {
          categorie: null,
          success: true,
          message: 'Catégorie supprimée avec succès',
          errors: []
        };
      } catch (error) {
        return {
          categorie: null,
          success: false,
          message: error.message,
          errors: [error.message]
        };
      }
    },

    reorderCategories: async (_, { updates }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      if (user.role !== 'ADMIN') {
        throw new AuthenticationError('Accès refusé. Rôle ADMIN requis.');
      }

      try {
        await Promise.all(
          updates.map(({ id, ordre }) =>
            CategorieMaladie.update(
              { ordre },
              { where: { id } }
            )
          )
        );

        return true;
      } catch (error) {
        throw new Error(`Erreur lors du réordonnancement : ${error.message}`);
      }
    }
  },

  CategorieMaladie: {
    parent: async (parent) => {
      if (parent.parent) return parent.parent;
      if (!parent.parentId) return null;
      return await CategorieMaladie.findByPk(parent.parentId);
    },

    sousCategories: async (parent) => {
      if (parent.sousCategories) return parent.sousCategories;
      return await CategorieMaladie.findAll({
        where: { 
          parentId: parent.id,
          isActive: true 
        },
        order: [['ordre', 'ASC']]
      });
    },

    dataEntries: async (parent) => {
      if (parent.dataEntries) return parent.dataEntries;
      const categorie = await CategorieMaladie.findByPk(parent.id, {
        include: [{
          model: DataEntry,
          as: 'dataEntries',
          where: { isActive: true },
          required: false
        }]
      });
      return categorie.dataEntries || [];
    },

    cheminComplet: async (parent) => {
      return await parent.getCheminComplet();
    },

    nombreSousCategories: async (parent) => {
      return await CategorieMaladie.count({
        where: { 
          parentId: parent.id,
          isActive: true 
        }
      });
    },

    nombreConsultations: async (parent) => {
      const categorie = await CategorieMaladie.findByPk(parent.id, {
        include: [{
          model: DataEntry,
          as: 'dataEntries',
          where: { isActive: true },
          required: false,
          attributes: ['id']
        }]
      });
      return categorie.dataEntries ? categorie.dataEntries.length : 0;
    },

    hasSousCategories: async (parent) => {
      return await parent.hasSousCategories();
    }
  },

  ArbreCategorie: {
    sousCategories: async (parent) => {
      if (parent.sousCategories) return parent.sousCategories;
      return await CategorieMaladie.findAll({
        where: { 
          parentId: parent.id,
          isActive: true 
        },
        order: [['ordre', 'ASC']]
      });
    },

    nombreConsultations: async (parent) => {
      const categorie = await CategorieMaladie.findByPk(parent.id, {
        include: [{
          model: DataEntry,
          as: 'dataEntries',
          where: { isActive: true },
          required: false,
          attributes: ['id']
        }]
      });
      return categorie.dataEntries ? categorie.dataEntries.length : 0;
    }
  }
};

export default categorieMaladieResolvers;
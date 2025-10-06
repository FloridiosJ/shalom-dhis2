import { UserInputError, ForbiddenError } from 'apollo-server-express';
import { Op } from 'sequelize';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const userResolvers = {
  // Resolvers de champs
  User: {
    // ❌ Supprimer cette ligne car fullName est déjà dans le schéma
    // fullName: (user) => user.getFullName(),
    
    // Résoudre la relation dispensaire
    dispensaire: async (user, args, { dataloaders }) => {
      if (!user.dispensaireId) return null;
      
      if (dataloaders && dataloaders.dispensaireLoader) {
        return await dataloaders.dispensaireLoader.load(user.dispensaireId);
      }
      
      const { Dispensaire } = await import('../../models/index.js');
      return await Dispensaire.findByPk(user.dispensaireId);
    }
  },

  Query: {
    user: async (parent, { id }, { user }) => {
      requireAuth(user);
      
      const { User, Dispensaire } = await import('../../models/index.js');
      
      const targetUser = await User.findByPk(id, {
        include: [
          {
            model: Dispensaire,
            as: 'dispensaire'
          }
        ]
      });
      
      if (!targetUser) {
        throw new UserInputError('Utilisateur non trouvé');
      }
      
      // Vérification des permissions
      if (user.role === 'agent' && targetUser.id !== user.id) {
        throw new ForbiddenError('Accès non autorisé');
      }
      
      return targetUser;
    },

    users: async (parent, { filter, pagination }, { user }) => {
      requireAuth(user);
      requireRole(user, ['admin', 'manager']);
      
      const { User, Dispensaire } = await import('../../models/index.js');
      
      // Construction de la requête avec filtres
      const whereClause = {};
      
      if (filter) {
        if (filter.role) whereClause.role = filter.role;
        if (filter.dispensaireId) whereClause.dispensaireId = filter.dispensaireId;
        if (filter.isActive !== undefined) whereClause.isActive = filter.isActive;
        if (filter.specialite) whereClause.specialite = filter.specialite;
        if (filter.search) {
          whereClause[Op.or] = [
            { nom: { [Op.iLike]: `%${filter.search}%` } },
            { prenom: { [Op.iLike]: `%${filter.search}%` } },
            { login: { [Op.iLike]: `%${filter.search}%` } }
          ];
        }
      }
      
      // Pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;
      
      const { rows: users, count: totalCount } = await User.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Dispensaire,
            as: 'dispensaire'
          }
        ],
        order: [['nom', 'ASC'], ['prenom', 'ASC']],
        limit,
        offset
      });
      
      return {
        users,
        totalCount,
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: page > 1
      };
    }
  },

  Mutation: {
    createUser: async (parent, { input }, { user }) => {
      requireAuth(user);
      requireRole(user, ['admin', 'manager']);
      
      try {
        console.log('🔄 Création utilisateur:', { nom: input.nom, prenom: input.prenom, role: input.role });

        const { User, Dispensaire } = await import('../../models/index.js');
        
        // Validation des permissions
        if (user.role === 'manager' && input.role === 'admin') {
          return {
            success: false,
            message: 'Un manager ne peut pas créer d\'administrateur',
            errors: ['UNAUTHORIZED_ROLE']
          };
        }

        // Vérifier que le login n'existe pas (si fourni)
        if (input.login) {
          const existingLogin = await User.findOne({ where: { login: input.login } });
          if (existingLogin) {
            return {
              success: false,
              message: 'Ce login est déjà utilisé',
              errors: ['LOGIN_ALREADY_EXISTS']
            };
          }
        }

        // Validation pour les agents
        if (input.role === 'agent') {
          if (!input.dispensaireId) {
            return {
              success: false,
              message: 'Un dispensaire est obligatoire pour les agents',
              errors: ['DISPENSAIRE_REQUIRED_FOR_AGENT']
            };
          }

          // Vérifier que le dispensaire existe
          const dispensaire = await Dispensaire.findByPk(input.dispensaireId);
          if (!dispensaire) {
            return {
              success: false,
              message: 'Dispensaire non trouvé',
              errors: ['DISPENSAIRE_NOT_FOUND']
            };
          }
        }

        // Sauvegarder les valeurs générées pour la réponse
        let generatedLogin = null;
        let generatedPassword = null;

        // Si pas de login fourni, il sera généré dans le hook beforeValidate
        if (!input.login) {
          generatedLogin = 'généré automatiquement';
        }

        // Si pas de mot de passe fourni, il sera généré dans le hook beforeValidate
        if (!input.password) {
          generatedPassword = 'généré automatiquement';
        }

        // Créer l'utilisateur
        const newUser = await User.create(input);

        // Récupérer l'utilisateur créé avec ses relations
        const createdUser = await User.findByPk(newUser.id, {
          include: [
            {
              model: Dispensaire,
              as: 'dispensaire'
            }
          ]
        });

        console.log('✅ Utilisateur créé avec succès:', {
          id: createdUser.id,
          nom: createdUser.nom,
          prenom: createdUser.prenom,
          login: createdUser.login,
          role: createdUser.role
        });

        return {
          user: createdUser,
          success: true,
          message: 'Utilisateur créé avec succès',
          generatedLogin: generatedLogin ? createdUser.login : null,
          generatedPassword: generatedPassword ? 'Mot de passe généré (voir les logs)' : null,
          errors: []
        };

      } catch (error) {
        console.error('❌ Erreur création utilisateur:', error);
        
        // Gestion des erreurs Sequelize
        if (error.name === 'SequelizeValidationError') {
          const validationErrors = error.errors.map(err => err.message);
          return {
            success: false,
            message: 'Données invalides',
            errors: validationErrors
          };
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
          return {
            success: false,
            message: 'Login déjà utilisé',
            errors: ['DUPLICATE_LOGIN']
          };
        }

        return {
          success: false,
          message: error.message || 'Erreur lors de la création du compte',
          errors: ['INTERNAL_ERROR']
        };
      }
    },

    updateUser: async (parent, { id, input }, { user }) => {
      requireAuth(user);
      
      try {
        const { User, Dispensaire } = await import('../../models/index.js');
        
        const targetUser = await User.findByPk(id);
        if (!targetUser) {
          return {
            success: false,
            message: 'Utilisateur non trouvé',
            errors: ['USER_NOT_FOUND']
          };
        }

        // Vérification des permissions
        const canEdit = (
          user.role === 'admin' ||
          (user.role === 'manager' && targetUser.role !== 'admin') ||
          (user.id === targetUser.id) // Peut se modifier lui-même
        );

        if (!canEdit) {
          return {
            success: false,
            message: 'Permissions insuffisantes',
            errors: ['UNAUTHORIZED_EDIT']
          };
        }

        // Les utilisateurs ne peuvent modifier que certains champs sur eux-mêmes
        if (user.id === targetUser.id && user.role !== 'admin') {
          const allowedFields = ['nom', 'prenom', 'password'];
          const inputFields = Object.keys(input);
          const forbiddenFields = inputFields.filter(field => !allowedFields.includes(field));
          
          if (forbiddenFields.length > 0) {
            return {
              success: false,
              message: `Vous ne pouvez modifier que : ${allowedFields.join(', ')}`,
              errors: ['RESTRICTED_FIELDS']
            };
          }
        }

        await targetUser.update(input);

        // Récupérer l'utilisateur mis à jour
        const updatedUser = await User.findByPk(id, {
          include: [
            {
              model: Dispensaire,
              as: 'dispensaire'
            }
          ]
        });

        return {
          user: updatedUser,
          success: true,
          message: 'Utilisateur modifié avec succès',
          errors: []
        };

      } catch (error) {
        console.error('❌ Erreur modification utilisateur:', error);
        return {
          success: false,
          message: 'Erreur lors de la modification',
          errors: [error.message]
        };
      }
    }
  }
};

export default userResolvers;
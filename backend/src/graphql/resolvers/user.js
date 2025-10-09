import bcrypt from 'bcryptjs';
import { UserInputError, ForbiddenError } from 'apollo-server-express';
import { Op } from 'sequelize';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const userResolvers = {
  // Resolvers de champs
  User: {
    // ✅ AJOUTER le champ fullName requis par le schéma
    fullName: (user) => `${user.prenom} ${user.nom}`,
    
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
    },

    changeUserPassword: async (parent, { id, newPassword, generateNew }, { user }) => {
      console.log('🔍 changeUserPassword called:', { id, hasNewPassword: !!newPassword, generateNew });
      
      try {
        // Vérifications d'authentification
        requireAuth(user);
        
        // Seul admin/manager peut changer le mot de passe d'autres utilisateurs
        // Ou l'utilisateur peut changer son propre mot de passe
        if (user.id !== id) {
          requireRole(user, ['admin', 'manager']);
        }

        const { User } = await import('../../models/index.js');
        
        // Récupérer l'utilisateur cible
        const targetUser = await User.findByPk(id);
        
        if (!targetUser) {
          console.log('❌ User not found:', id);
          return {
            success: false,
            message: 'Utilisateur non trouvé',
            errors: ['USER_NOT_FOUND'],
            user: null
          };
        }

        console.log('✅ Target user found:', targetUser.login);

        let finalPassword = newPassword;
        let generatedPassword = null;

        // Générer un nouveau mot de passe si demandé
        if (generateNew || !newPassword) {
          generatedPassword = generateRandomPassword();
          finalPassword = generatedPassword;
          console.log('🔄 Generated new password');
        }

        // Valider le mot de passe
        if (!finalPassword || finalPassword.length < 6) {
          return {
            success: false,
            message: 'Le mot de passe doit contenir au moins 6 caractères',
            errors: ['PASSWORD_TOO_SHORT'],
            user: null
          };
        }

        // Hasher le nouveau mot de passe
        console.log('🔄 Hashing password...');
        const hashedPassword = await bcrypt.hash(finalPassword, 12);

        // Mettre à jour le mot de passe
        await targetUser.update({
          password: hashedPassword,
          updatedAt: new Date()
        });

        console.log('✅ Password updated successfully for user:', targetUser.login);

        // Récupérer l'utilisateur mis à jour avec ses relations
        const updatedUser = await User.findByPk(id, {
          include: [
            {
              model: (await import('../../models/index.js')).Dispensaire,
              as: 'dispensaire'
            }
          ]
        });

        return {
          success: true,
          message: `Mot de passe ${generateNew ? 'généré et ' : ''}modifié avec succès`,
          errors: [],
          user: updatedUser,
          generatedPassword: generatedPassword // Seulement retourné si généré
        };

      } catch (error) {
        console.error('❌ Error in changeUserPassword:', {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 3)
        });

        // Gestion des erreurs spécifiques
        if (error.message.includes('AUTH_REQUIRED')) {
          return {
            success: false,
            message: 'Authentification requise',
            errors: ['AUTH_REQUIRED'],
            user: null
          };
        }

        if (error.message.includes('INSUFFICIENT_ROLE')) {
          return {
            success: false,
            message: 'Permissions insuffisantes',
            errors: ['INSUFFICIENT_PERMISSIONS'],
            user: null
          };
        }

        return {
          success: false,
          message: 'Erreur lors du changement de mot de passe',
          errors: [error.message],
          user: null
        };
      }
    }
  }
};

// ✅ Fonction utilitaire pour générer un mot de passe aléatoire
function generateRandomPassword(length = 8) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Assurer au moins un caractère de chaque type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Majuscule
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Minuscule
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Chiffre
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Symbole
  
  // Compléter avec des caractères aléatoires
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Mélanger les caractères
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export default userResolvers;
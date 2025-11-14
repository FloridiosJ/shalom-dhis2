import { AuthenticationError, ForbiddenError } from 'apollo-server-express';

// ✅ Fonctions utilitaires pour générer login et password
function generateLogin(nom, prenom) {
  const nomClean = nom.toLowerCase().replace(/[^a-z]/g, '');
  const prenomClean = prenom.toLowerCase().replace(/[^a-z]/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prenomClean.substring(0, 1)}${nomClean}${random}`;
}

function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

const userResolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }
      
      const { User } = await import('../../models/index.js');
      return await User.findByPk(user.id);
    },

    user: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { User } = await import('../../models/index.js');
      const targetUser = await User.findByPk(id);
      
      if (!targetUser) {
        throw new Error('Utilisateur non trouvé');
      }

      // Vérifier les permissions
      if (user.role !== 'admin' && user.role !== 'manager' && user.id !== id) {
        throw new ForbiddenError('Accès non autorisé');
      }

      return targetUser;
    },

    users: async (_, { filter, sort, pagination }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { User, Dispensaire } = await import('../../models/index.js');
      const { Op } = await import('sequelize');

      // Construire les conditions WHERE
      const whereClause = {};
      
      if (filter) {
        if (filter.role) whereClause.role = filter.role;
        if (filter.dispensaireId) whereClause.dispensaireId = filter.dispensaireId;
        if (filter.isActive !== undefined) whereClause.isActive = filter.isActive;
        
        if (filter.search) {
          whereClause[Op.or] = [
            { nom: { [Op.iLike]: `%${filter.search}%` } },
            { prenom: { [Op.iLike]: `%${filter.search}%` } },
            { email: { [Op.iLike]: `%${filter.search}%` } },
            { login: { [Op.iLike]: `%${filter.search}%` } }
          ];
        }
      }

      // Manager ne peut voir que son dispensaire
      if (user.role === 'manager') {
        whereClause.dispensaireId = user.dispensaireId;
      }

      // Pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const offset = (page - 1) * limit;

      // Tri
      const order = [];
      if (sort?.field) {
        order.push([sort.field, sort.direction || 'ASC']);
      } else {
        order.push(['nom', 'ASC']);
      }

      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        order,
        limit,
        offset,
        include: [
          {
            model: Dispensaire,
            as: 'dispensaire',
            required: false
          }
        ]
      });

      return {
        users: rows,
        totalCount: count,
        hasNextPage: offset + limit < count,
        hasPreviousPage: page > 1
      };
    }
  },

  Mutation: {
    createUser: async (_, { input }, { user }) => {
      try {
        // Vérifier l'authentification
        if (!user) {
          throw new AuthenticationError('Non authentifié');
        }

        // Vérifier les permissions
        if (user.role !== 'admin' && user.role !== 'manager') {
          throw new ForbiddenError('Seuls les administrateurs et managers peuvent créer des utilisateurs');
        }

        console.log('🔄 Création utilisateur:', { 
          nom: input.nom, 
          prenom: input.prenom, 
          role: input.role 
        });

        const { User, Dispensaire } = await import('../../models/index.js');

        // ✅ CORRECTION : Valider le dispensaire seulement si fourni
        if (input.dispensaireId) {
          const dispensaire = await Dispensaire.findByPk(input.dispensaireId);
          if (!dispensaire) {
            return {
              user: null,
              success: false,
              message: 'Dispensaire non trouvé',
              errors: ['DISPENSAIRE_NOT_FOUND']
            };
          }

          // Manager ne peut créer que dans son dispensaire
          if (user.role === 'manager' && user.dispensaireId !== input.dispensaireId) {
            throw new ForbiddenError('Vous ne pouvez créer des utilisateurs que dans votre dispensaire');
          }
        } else {
          // ✅ Vérifier que seuls admin/manager peuvent créer sans dispensaire
          if (input.role === 'agent') {
            return {
              user: null,
              success: false,
              message: 'Un dispensaire est requis pour un agent',
              errors: ['DISPENSAIRE_REQUIRED_FOR_AGENT']
            };
          }
        }

        // Vérifier si l'email existe déjà
        if (input.email) {
          const existingEmail = await User.findOne({ 
            where: { email: input.email } 
          });
          if (existingEmail) {
            return {
              user: null,
              success: false,
              message: 'Cet email est déjà utilisé',
              errors: ['EMAIL_EXISTS']
            };
          }
        }

        // Générer login si non fourni
        let login = input.login;
        let generatedLogin = null;
        
        if (!login) {
          login = generateLogin(input.nom, input.prenom);
          generatedLogin = login;
          console.log('🔑 Login généré:', login);
        }

        // Vérifier si le login existe
        const existingLogin = await User.findOne({ where: { login } });
        if (existingLogin) {
          login = generateLogin(input.nom, input.prenom);
          generatedLogin = login;
          console.log('🔑 Login régénéré:', login);
        }

        // Générer mot de passe si non fourni
        let password = input.password;
        let generatedPassword = null;
        
        if (!password) {
          password = generatePassword();
          generatedPassword = password;
          console.log('🔒 Mot de passe généré');
        }

        // ✅ CORRECTION : Ne PAS hasher le mot de passe ici
        // Le hook beforeSave du modèle s'en charge
        const newUser = await User.create({
          nom: input.nom,
          prenom: input.prenom,
          email: input.email,
          login,
          password, // ✅ Mot de passe en clair - sera hashé par le hook
          role: input.role || 'agent',
          specialite: input.specialite || null,
          dispensaireId: input.dispensaireId || null,
          isActive: true
        });

        console.log('✅ Utilisateur créé:', newUser.id);

        // Récupérer l'utilisateur avec les relations
        const createdUser = await User.findByPk(newUser.id, {
          include: [
            {
              model: Dispensaire,
              as: 'dispensaire',
              required: false // ✅ Jointure optionnelle
            }
          ]
        });

        return {
          user: createdUser,
          success: true,
          message: 'Utilisateur créé avec succès',
          generatedLogin,
          generatedPassword,
          errors: []
        };
      } catch (error) {
        console.error('❌ Erreur création utilisateur:', error);
        
        if (error instanceof AuthenticationError || error instanceof ForbiddenError) {
          throw error;
        }
        
        return {
          user: null,
          success: false,
          message: error.message || 'Erreur lors de la création de l\'utilisateur',
          errors: [error.message]
        };
      }
    },

    updateUser: async (_, { id, input }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError('Non authentifié');
        }

        const { User, Dispensaire } = await import('../../models/index.js');

        const targetUser = await User.findByPk(id);
        if (!targetUser) {
          return {
            user: null,
            success: false,
            message: 'Utilisateur non trouvé',
            errors: ['USER_NOT_FOUND']
          };
        }

        // Vérifier les permissions
        if (user.role !== 'admin' && user.role !== 'manager' && user.id !== id) {
          throw new ForbiddenError('Accès non autorisé');
        }

        // Manager ne peut modifier que les utilisateurs de son dispensaire
        if (user.role === 'manager' && targetUser.dispensaireId !== user.dispensaireId) {
          throw new ForbiddenError('Vous ne pouvez modifier que les utilisateurs de votre dispensaire');
        }

        // Vérifier l'email si modifié
        if (input.email && input.email !== targetUser.email) {
          const existingEmail = await User.findOne({
            where: { email: input.email }
          });
          if (existingEmail) {
            return {
              user: null,
              success: false,
              message: 'Cet email est déjà utilisé',
              errors: ['EMAIL_EXISTS']
            };
          }
        }

        // Mettre à jour
        await targetUser.update({
          nom: input.nom || targetUser.nom,
          prenom: input.prenom || targetUser.prenom,
          email: input.email || targetUser.email,
          specialite: input.specialite !== undefined ? input.specialite : targetUser.specialite,
          isActive: input.isActive !== undefined ? input.isActive : targetUser.isActive
        });

        // Récupérer avec relations
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
          message: 'Utilisateur mis à jour avec succès',
          errors: []
        };
      } catch (error) {
        console.error('❌ Erreur mise à jour utilisateur:', error);
        
        if (error instanceof AuthenticationError || error instanceof ForbiddenError) {
          throw error;
        }
        
        return {
          user: null,
          success: false,
          message: error.message,
          errors: [error.message]
        };
      }
    },

    changeUserPassword: async (_, { id, currentPassword, newPassword, generateNew }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError('Non authentifié');
        }

        const { User } = await import('../../models/index.js');

        const targetUser = await User.findByPk(id);
        if (!targetUser) {
          return {
            user: null,
            success: false,
            message: 'Utilisateur non trouvé',
            errors: ['USER_NOT_FOUND']
          };
        }

        // Vérifier les permissions
        if (user.role !== 'admin' && user.role !== 'manager' && user.id !== id) {
          throw new ForbiddenError('Accès non autorisé');
        }

        // ✅ Vérifier le mot de passe actuel si l'utilisateur change son propre mot de passe
        if (user.id === id && !generateNew) {
          if (!currentPassword) {
            return {
              user: null,
              success: false,
              message: 'Le mot de passe actuel est requis',
              errors: ['CURRENT_PASSWORD_REQUIRED']
            };
          }

          const isPasswordValid = await targetUser.comparePassword(currentPassword);
          if (!isPasswordValid) {
            return {
              user: null,
              success: false,
              message: 'Le mot de passe actuel est incorrect',
              errors: ['INVALID_CURRENT_PASSWORD']
            };
          }
        }

        let password = newPassword;
        let generatedPassword = null;

        if (generateNew) {
          // ✅ CORRECTION : Utiliser la fonction locale
          password = generatePassword();
          generatedPassword = password;
          console.log('🔒 Nouveau mot de passe généré:', password);
        }

        if (!password) {
          return {
            user: null,
            success: false,
            message: 'Mot de passe requis',
            errors: ['PASSWORD_REQUIRED']
          };
        }

        // ✅ CORRECTION : Ne PAS hasher ici, laisser le hook faire le travail
        await targetUser.update({ password }); // Le hook beforeSave va hasher

        return {
          user: targetUser,
          success: true,
          message: 'Mot de passe modifié avec succès',
          generatedPassword,
          errors: []
        };
      } catch (error) {
        console.error('❌ Erreur changement mot de passe:', error);
        
        if (error instanceof AuthenticationError || error instanceof ForbiddenError) {
          throw error;
        }
        
        return {
          user: null,
          success: false,
          message: error.message,
          errors: [error.message]
        };
      }
    },

    deleteUser: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError('Non authentifié');
        }

        if (user.role !== 'admin') {
          throw new ForbiddenError('Seuls les administrateurs peuvent supprimer des utilisateurs');
        }

        const { User } = await import('../../models/index.js');

        const targetUser = await User.findByPk(id);
        if (!targetUser) {
          return {
            success: false,
            message: 'Utilisateur non trouvé',
            errors: ['USER_NOT_FOUND']
          };
        }

        if (targetUser.id === user.id) {
          return {
            success: false,
            message: 'Vous ne pouvez pas supprimer votre propre compte',
            errors: ['CANNOT_DELETE_SELF']
          };
        }

        await targetUser.destroy();

        return {
          success: true,
          message: 'Utilisateur supprimé avec succès',
          errors: []
        };
      } catch (error) {
        console.error('❌ Erreur suppression utilisateur:', error);
        
        if (error instanceof AuthenticationError || error instanceof ForbiddenError) {
          throw error;
        }
        
        return {
          success: false,
          message: error.message,
          errors: [error.message]
        };
      }
    }
  },

  User: {
    dispensaire: async (userObj) => {
      if (!userObj.dispensaireId) return null;
      
      const { Dispensaire } = await import('../../models/index.js');
      return await Dispensaire.findByPk(userObj.dispensaireId);
    },

    fullName: (userObj) => {
      return `${userObj.prenom} ${userObj.nom}`;
    }
  }
};

export default userResolvers;
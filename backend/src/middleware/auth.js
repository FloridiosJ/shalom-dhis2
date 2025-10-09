import jwt from 'jsonwebtoken';
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Vérifie qu'un utilisateur est authentifié
 * @param {Object} user - Utilisateur du contexte
 * @throws {AuthenticationError} Si l'utilisateur n'est pas connecté
 */
export const requireAuth = (user) => {
  if (!user) {
    throw new AuthenticationError('Vous devez être connecté pour effectuer cette action');
  }
};

/**
 * Vérifie qu'un utilisateur a l'un des rôles requis
 * @param {Object} user - Utilisateur du contexte
 * @param {Array<string>} allowedRoles - Rôles autorisés
 * @throws {ForbiddenError} Si l'utilisateur n'a pas les permissions
 */
export const requireRole = (user, allowedRoles) => {
  if (!user) {
    throw new AuthenticationError('Vous devez être connecté');
  }
  
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(`Permissions insuffisantes. Rôles requis: ${allowedRoles.join(', ')}`);
  }
};

/**
 * Middleware pour extraire l'utilisateur du token JWT
 * @param {Object} req - Requête Express
 * @returns {Object|null} Utilisateur décodé ou null
 */
export const getUser = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return null;
    }
    
    // Format: "Bearer TOKEN"
    let token = authHeader.split(' ')[1];
    
    if (!token) {
      return null;
    }
    
    // ✅ CORRIGER - Si le token a plus de 3 parties, prendre seulement les 3 premières
    const tokenParts = token.split('.');  
    if (tokenParts.length > 3) {
      token = tokenParts.slice(0, 3).join('.');
    }
    if (!JWT_SECRET) {
      return null;
    }
    
    // Vérifier et décoder le token corrigé
    const decoded = jwt.verify(token, JWT_SECRET);

    // Récupérer l'utilisateur complet depuis la base de données
    const { User, Dispensaire } = await import('../models/index.js'); // CORRIGER le chemin
    
    const user = await User.findByPk(decoded.userId, {
      include: [
        {
          model: Dispensaire,
          as: 'dispensaire'
        }
      ]
    });
    
    if (!user || !user.isActive) {
      return null;
    }
    
    return user;
    
  } catch (error) {
    console.log('❌ JWT Error details:', {
      name: error.name,
      message: error.message,
      tokenLength: req.headers.authorization?.split(' ')[1]?.length
    });
    return null;
  }
};

/**
 * Vérifie si un utilisateur peut accéder à un dispensaire
 * @param {Object} user - Utilisateur
 * @param {string} dispensaireId - ID du dispensaire
 * @returns {boolean} True si l'accès est autorisé
 */
export const canAccessDispensaire = (user, dispensaireId) => {
  if (!user) return false;
  
  // Les admins peuvent tout voir
  if (user.role === 'admin') return true;
  
  // Les managers peuvent voir tous les dispensaires
  if (user.role === 'manager') return true;
  
  // Les agents ne peuvent voir que leur dispensaire
  if (user.role === 'agent') {
    return user.dispensaireId === dispensaireId;
  }
  
  return false;
};

/**
 * Vérifie si un utilisateur peut modifier un autre utilisateur
 * @param {Object} currentUser - Utilisateur connecté
 * @param {Object} targetUser - Utilisateur à modifier
 * @returns {boolean} True si la modification est autorisée
 */
export const canModifyUser = (currentUser, targetUser) => {
  if (!currentUser || !targetUser) return false;
  
  // Un utilisateur peut se modifier lui-même (partiellement)
  if (currentUser.id === targetUser.id) return true;
  
  // Les admins peuvent modifier tout le monde
  if (currentUser.role === 'admin') return true;
  
  // Les managers peuvent modifier les agents et autres managers (mais pas les admins)
  if (currentUser.role === 'manager' && targetUser.role !== 'admin') {
    return true;
  }
  
  return false;
};

/**
 * Filtre les champs modifiables selon les permissions
 * @param {Object} currentUser - Utilisateur connecté
 * @param {Object} targetUser - Utilisateur à modifier
 * @param {Object} input - Données à modifier
 * @returns {Object} Champs autorisés
 */
export const filterAllowedFields = (currentUser, targetUser, input) => {
  if (!currentUser || !targetUser) return {};
  
  // Si l'utilisateur se modifie lui-même
  if (currentUser.id === targetUser.id) {
    const allowedFields = ['nom', 'prenom', 'password'];
    return Object.keys(input)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = input[key];
        return obj;
      }, {});
  }
  
  // Les admins peuvent tout modifier
  if (currentUser.role === 'admin') {
    return input;
  }
  
  // Les managers peuvent modifier certains champs (pas le rôle admin)
  if (currentUser.role === 'manager') {
    const restrictedFields = targetUser.role === 'admin' ? Object.keys(input) : [];
    return Object.keys(input)
      .filter(key => !restrictedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = input[key];
        return obj;
      }, {});
  }
  
  return {};
};

export default {
  requireAuth,
  requireRole,
  getUser,
  canAccessDispensaire,
  canModifyUser,
  filterAllowedFields
};
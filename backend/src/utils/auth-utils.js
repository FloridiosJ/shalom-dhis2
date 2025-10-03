import { ForbiddenError } from 'apollo-server-express';

/**
 * Vérifie si l'utilisateur a les droits requis
 * @param {Object} context - Contexte GraphQL contenant les infos utilisateur
 * @param {string[]} allowedRoles - Tableau des rôles autorisés
 * @throws {ForbiddenError} Si l'utilisateur n'a pas les droits requis
 */
export const checkRole = (context, allowedRoles = ['admin']) => {
  // Vérifier si l'utilisateur est connecté
  if (!context.userId) {
    throw new ForbiddenError('You must be logged in');
  }

  // Vérifier si le rôle de l'utilisateur est autorisé
  if (!allowedRoles.includes(context.role)) {
    throw new ForbiddenError(
      `Access denied. Required roles: ${allowedRoles.join(', ')}`
    );
  }
};
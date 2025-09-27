import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

/**
 * Mutation GraphQL login
 * - On demande un champ courant "accessToken" (camelCase)
 * - Certains serveurs renvoient "access_token" ou "token" — le code prend en charge plusieurs cas
 */
const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
    }
  }
`;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      console.log('Login successful:', data);
      localStorage.setItem('accessToken', data.login.accessToken);
      console.log('Token stored, redirecting...');
      navigate('/dashboard', { replace: true });
    },
    onError: (error) => {
      console.error('Login error in onError:', error);
      setErrorMessage(error.message || 'Login failed. Please try again.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Merci de remplir l’email et le mot de passe.');
      return;
    }

    try {
      await login({
        variables: {
          input: {
            email,
            password,
          },
        },
      });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Card */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Shalom DHIS2</h1>
            <p className="text-sm text-gray-500 mt-1">Connexion à la plateforme</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="nom@organisation.local"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {errorMessage && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-2 rounded">
                {errorMessage}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
              >
                {loading ? 'Connexion…' : 'Se connecter'}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-500">Pas encore de compte ? Contacte l’admin</div>
              <a href="#" className="text-blue-600 hover:underline">
                Mot de passe oublié ?
              </a>
            </div>
          </form>
        </div>

        {/* Footer / small info */}
        <div className="text-center text-xs text-gray-400">
          <div>© {new Date().getFullYear()} Shalom DHIS2</div>
          <div className="mt-1">Plateforme de collecte de données</div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ApolloClient } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { PaperProvider } from 'react-native-paper';
import Navigation from './src/navigation/Navigation';
import { AuthProvider } from './src/context/AuthContext';
import { createApolloClient } from './src/utils/apolloClient';
import 'react-native-gesture-handler';

// Create Apollo Client instance
const apolloClient = createApolloClient();

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <PaperProvider>
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      </PaperProvider>
    </ApolloProvider>
  );
}

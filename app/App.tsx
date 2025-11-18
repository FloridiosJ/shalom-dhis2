import React from 'react';
import { PaperProvider } from 'react-native-paper';
import Navigation from './src/navigation/Navigation';
import 'react-native-gesture-handler';

export default function App() {
  return (
    <PaperProvider>
      <Navigation />
    </PaperProvider>
  );
}

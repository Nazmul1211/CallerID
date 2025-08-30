/**
 * CallerID App - Organized Structure Version
 * Complete CRUD operations with enhanced user experience
 *
 * @format
 */

import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import AppNavigator, { Screen } from './src/navigation/AppNavigator';
import { UserProvider, useUserContext } from './src/context/UserContext';

const AppContent: React.FC = () => {
  const { user } = useUserContext();
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppNavigator 
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        user={user}
      />
    </SafeAreaView>
  );
};

function App() {
  return (
    <UserProvider>
      <AppContent /> 
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});

export default App;

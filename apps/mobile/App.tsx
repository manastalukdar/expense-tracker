import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { ThemeProvider } from 'react-native-elements';
import { NavigationContainer } from '@react-navigation/native';
import { useExpenseStore } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingScreen from './src/components/LoadingScreen';
import ErrorScreen from './src/components/ErrorScreen';
import { lightTheme } from './src/theme';

const App = () => {
  const { initializeApp, resetInitialization, isLoading, error, isAppInitialized } = useExpenseStore();

  useEffect(() => {
    if (!isAppInitialized && !isLoading && !error) {
      initializeApp();
    }
  }, []); // Empty dependency array - only run once on mount

  if (isLoading || !isAppInitialized) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={() => {
      // Reset state and retry initialization
      console.log('🔄 User requested retry, resetting state...');
      resetInitialization();
      initializeApp();
    }} />;
  }

  return (
    <ThemeProvider theme={lightTheme}>
      <StatusBar barStyle="dark-content" backgroundColor={lightTheme.colors.primary} />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;

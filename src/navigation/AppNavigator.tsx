// App routing logic (Screen navigation controller)
import React from 'react';
import { View } from 'react-native';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import ContactsScreen from '../screens/ContactsScreen';
import AddContactScreen from '../screens/AddContactScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import BottomTabs from '../components/BottomTabs';
import { User } from '../config/supabase';

export type Screen = 'auth' | 'home' | 'contacts' | 'addContact' | 'profile' | 'editProfile';

interface AppNavigatorProps {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  user: User | null;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({
  currentScreen,
  setCurrentScreen,
  user,
}) => {
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'auth':
        return <AuthScreen setCurrentScreen={setCurrentScreen} />;
      case 'home':
        return <HomeScreen />;
      case 'contacts':
        return <ContactsScreen setCurrentScreen={setCurrentScreen} />;
      case 'addContact':
        return <AddContactScreen setCurrentScreen={setCurrentScreen} />;
      case 'editProfile':
        return <EditProfileScreen setCurrentScreen={setCurrentScreen} user={user} />;
      case 'profile':
        return <ProfileScreen setCurrentScreen={setCurrentScreen} user={user} />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderCurrentScreen()}
      {user && !['addContact', 'editProfile'].includes(currentScreen) && (
        <BottomTabs currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
      )}
    </View>
  );
};

export default AppNavigator;
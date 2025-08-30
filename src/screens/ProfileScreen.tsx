// User profile management
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Screen } from '../navigation/AppNavigator';
import { useUserContext } from '../context/UserContext';
import { User } from '../config/supabase';

interface ProfileScreenProps {
  setCurrentScreen: (screen: Screen) => void;
  user: User | null;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ setCurrentScreen, user }) => {
  const { setUser } = useUserContext();

  const openDialer = async (phoneNumber: string) => {
    try {
      const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
      const url = `tel:${cleanNumber}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open dialer');
      }
    } catch (error) {
      console.error('Dialer error:', error);
      Alert.alert('Error', 'Failed to open dialer');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setUser(null);
              setCurrentScreen('auth');
              Alert.alert('Account Deleted', 'Your account has been deleted.');
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', 'Failed to delete account');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      {/* Profile Header with proper spacing */}
      <View style={[styles.header, { paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0) + 20 }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        {user && (
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            
            <Text style={styles.profileName}>{user.name}</Text>
            
            <TouchableOpacity onPress={() => openDialer(user.phone_number)}>
              <Text style={styles.profilePhone}>📞 {user.phone_number}</Text>
            </TouchableOpacity>
            
            {user.email && (
              <Text style={styles.profileEmail}>✉️ {user.email}</Text>
            )}
          </View>
        )}

        {/* Profile Actions */}
        <View style={styles.profileActions}>
          <TouchableOpacity
            style={styles.profileActionButton}
            onPress={() => setCurrentScreen('editProfile')}
          >
            <Text style={styles.profileActionIcon}>✏️</Text>
            <Text style={styles.profileActionText}>Edit Profile</Text>
            <Text style={styles.profileActionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.profileActionButton, styles.dangerAction]}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.profileActionIcon}>🗑️</Text>
            <Text style={[styles.profileActionText, styles.dangerText]}>Delete Account</Text>
            <Text style={styles.profileActionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={() => {
              setUser(null);
              setCurrentScreen('auth');
            }}
          >
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  profilePhone: {
    fontSize: 18,
    color: '#4A90E2',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666666',
  },
  profileActions: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  profileActionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  dangerAction: {
    borderColor: '#FF5252',
  },
  profileActionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  profileActionText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  dangerText: {
    color: '#FF5252',
  },
  profileActionArrow: {
    fontSize: 20,
    color: '#CCCCCC',
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#FF5252',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProfileScreen;
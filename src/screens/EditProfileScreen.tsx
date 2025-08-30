// Edit user details
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { databaseService } from '../services/database';
import { Screen } from '../navigation/AppNavigator';
import { useUserContext } from '../context/UserContext';
import { User } from '../config/supabase';

interface EditProfileScreenProps {
  setCurrentScreen: (screen: Screen) => void;
  user: User | null;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ setCurrentScreen, user }) => {
  const { setUser } = useUserContext();
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email || '');
    }
  }, [user]);

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

  const handleUpdateProfile = async () => {
    if (!user || !editName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await databaseService.updateUser(user.id, {
        name: editName.trim(),
        email: editEmail.trim() || undefined,
      });

      if (updatedUser) {
        setUser(updatedUser);
        Alert.alert('Success', 'Profile updated successfully!');
        setCurrentScreen('profile');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', `Failed to update profile: ${(error as any).message || 'Please try again'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      {/* Header with proper spacing */}
      <View style={[styles.header, { paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0) + 20 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('profile')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.formTitle}>Update Your Information</Text>
          
          {/* Phone Number (Read Only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputIcon}>📱</Text>
            <TouchableOpacity onPress={() => user && openDialer(user.phone_number)}>
              <TextInput
                style={[styles.formInput, styles.disabledInput]}
                value={user?.phone_number}
                editable={false}
                placeholder="Phone number"
                placeholderTextColor="#999999"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.inputHelp}>Phone number cannot be changed (tap to call)</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Full name (required)"
              placeholderTextColor="#A0A0A0"
              value={editName}
              onChangeText={setEditName}
              autoCapitalize="words"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Email address (optional)"
              placeholderTextColor="#A0A0A0"
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.formButton, loading && styles.buttonDisabled]}
            onPress={handleUpdateProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.formButtonText}>Update Profile</Text>
            )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  form: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    minHeight: 60,
  },
  inputIcon: {
    fontSize: 24,
    marginRight: 16,
    opacity: 0.8,
  },
  formInput: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  disabledInput: {
    color: '#999999',
    backgroundColor: 'transparent',
  },
  inputHelp: {
    fontSize: 12,
    color: '#666666',
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 56,
  },
  formButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  formButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
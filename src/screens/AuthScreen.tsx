// Login/Register functionality
import React, { useState } from 'react';
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
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { databaseService } from '../services/database';
import { Screen } from '../navigation/AppNavigator';
import { useUserContext } from '../context/UserContext';

interface AuthScreenProps {
  setCurrentScreen: (screen: Screen) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ setCurrentScreen }) => {
  const { setUser } = useUserContext();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!phoneNumber.trim() || !name.trim()) {
      Alert.alert('Error', 'Please enter your phone number and name');
      return;
    }

    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to sign in with:', phoneNumber.trim());
      
      let existingUser = await databaseService.getUserByPhone(phoneNumber.trim());
      
      if (existingUser) {
        console.log('Found existing user:', existingUser);
        setUser(existingUser);
        setCurrentScreen('home');
        Alert.alert('Welcome Back!', `Hello ${existingUser.name}!`);
      } else {
        console.log('Creating new user...');
        const newUser = await databaseService.createUser(phoneNumber.trim(), name.trim(), email.trim() || undefined);
        if (newUser) {
          console.log('Created new user:', newUser);
          setUser(newUser);
          setCurrentScreen('home');
          Alert.alert('Welcome!', 'Account created successfully!');
        } else {
          Alert.alert('Error', 'Failed to create account. Please check your connection and try again.');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert('Error', `Failed to sign in: ${(error as any).message || 'Please check your internet connection'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      <View style={styles.gradient}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>📞</Text>
          </View>
          <Text style={styles.title}>Caller ID</Text>
          <Text style={styles.subtitle}>Join the community to identify unknown callers</Text>
        </View>

        {/* Form Section */}
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputIcon}>📱</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor="#A0A0A0"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#A0A0A0"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="Email address (optional)"
              placeholderTextColor="#A0A0A0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Get Started</Text>
                  <Text style={styles.buttonArrow}>→</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By continuing, you agree to help build a community database to identify spam callers
          </Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90E2',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flex: 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 50,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    flex: 0.65,
    paddingHorizontal: 30,
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
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    marginTop: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    minHeight: 56,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  disclaimer: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 32,
    paddingHorizontal: 20,
  },
});

export default AuthScreen;
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../config/supabase';
import { databaseService } from '../services/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (phoneNumber: string, name: string, email?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (phoneNumber: string, name: string, email?: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Check if user already exists
      let existingUser = await databaseService.getUserByPhone(phoneNumber);
      
      if (existingUser) {
        // User exists, sign them in
        await AsyncStorage.setItem('user', JSON.stringify(existingUser));
        setUser(existingUser);
        return true;
      } else {
        // Create new user
        const newUser = await databaseService.createUser(phoneNumber, name, email);
        if (newUser) {
          await AsyncStorage.setItem('user', JSON.stringify(newUser));
          setUser(newUser);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error signing in:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
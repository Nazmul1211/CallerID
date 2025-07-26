import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut
        }
      ]
    );
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userPhone}>{user.phone_number}</Text>
            {user.email && <Text style={styles.userEmail}>{user.email}</Text>}
          </View>
        </View>

        <View style={styles.actionsSection}>
          <View style={styles.actionCard}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionText}>Edit Profile</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionText}>Privacy Settings</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionCard}>
            <Text style={styles.sectionTitle}>About</Text>
            
            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionText}>Help & Support</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionText}>Terms of Service</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity style={styles.actionItem}>
              <Text style={styles.actionText}>Privacy Policy</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>CallerID v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Help build a safer calling community
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  profileSection: {
    marginBottom: 32,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 16,
    color: '#8E8E93',
  },
  actionsSection: {
    marginBottom: 32,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    padding: 16,
    paddingBottom: 8,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  actionArrow: {
    fontSize: 20,
    color: '#8E8E93',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default ProfileScreen; 
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Screen } from '../navigation/AppNavigator';

interface BottomTabsProps {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
}

const BottomTabs: React.FC<BottomTabsProps> = ({ currentScreen, setCurrentScreen }) => {
  return (
    <View style={styles.bottomTabs}>
      <TouchableOpacity
        style={[styles.tab, currentScreen === 'home' && styles.activeTab]}
        onPress={() => setCurrentScreen('home')}
      >
        <Text style={styles.tabIcon}>🔍</Text>
        <Text style={[styles.tabText, currentScreen === 'home' && styles.activeTabText]}>
          Search
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, currentScreen === 'contacts' && styles.activeTab]}
        onPress={() => setCurrentScreen('contacts')}
      >
        <Text style={styles.tabIcon}>📞</Text>
        <Text style={[styles.tabText, currentScreen === 'contacts' && styles.activeTabText]}>
          Contacts
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, currentScreen === 'profile' && styles.activeTab]}
        onPress={() => setCurrentScreen('profile')}
      >
        <Text style={styles.tabIcon}>👤</Text>
        <Text style={[styles.tabText, currentScreen === 'profile' && styles.activeTabText]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    marginHorizontal: 8,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
});

export default BottomTabs;

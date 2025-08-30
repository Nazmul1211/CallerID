// Contact management
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { databaseService } from '../services/database';
import { Contact } from '../config/supabase';
import { Screen } from '../navigation/AppNavigator';
import { useUserContext } from '../context/UserContext';

interface ContactsScreenProps {
  setCurrentScreen: (screen: Screen) => void;
}

const ContactsScreen: React.FC<ContactsScreenProps> = ({ setCurrentScreen }) => {
  const { user } = useUserContext();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchQuery]);

  const filterContacts = () => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone_number.includes(searchQuery) ||
        (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredContacts(filtered);
    }
  };

  const makeCall = async (phoneNumber: string, contactName?: string) => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
          {
            title: 'Call Permission',
            message: 'This app needs access to make phone calls.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Cannot make a call without permission.');
          return;
        }
      }

      const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
      const url = `tel:${cleanNumber}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to handle this call');
      }
    } catch (error) {
      console.error('Call error:', error);
      Alert.alert('Error', 'Failed to make call');
    }
  };

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

  const loadContacts = async () => {
    if (!user) return;
    
    setContactsLoading(true);
    try {
      console.log('Loading contacts for user:', user.id);
      const userContacts = await databaseService.getContactsByUser(user.id);
      console.log('Loaded contacts:', userContacts);
      setContacts(userContacts);
      setFilteredContacts(userContacts);
    } catch (error) {
      console.error('Load contacts error:', error);
      Alert.alert('Error', `Failed to load contacts: ${(error as any).message || 'Please try again'}`);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleDeleteContact = async (contactId: string, contactName: string) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contactName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await databaseService.deleteContact(contactId);
              if (success) {
                setContacts(contacts.filter(c => c.id !== contactId));
                Alert.alert('Success', 'Contact deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete contact');
              }
            } catch (error) {
              console.error('Delete contact error:', error);
              Alert.alert('Error', `Failed to delete contact: ${(error as any).message || 'Please try again'}`);
            }
          }
        }
      ]
    );
  };

  const handleReportSpam = async (phoneNumber: string, contactName: string) => {
    if (!user) return;

    Alert.alert(
      'Report Spam',
      `Report ${contactName} (${phoneNumber}) as spam?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await databaseService.reportSpam(user.id, phoneNumber, 'Spam call');
              if (result) {
                Alert.alert('Success', 'Contact reported as spam');
                await loadContacts();
              } else {
                Alert.alert('Error', 'Failed to report spam');
              }
            } catch (error) {
              console.error('Report spam error:', error);
              Alert.alert('Error', `Failed to report spam: ${(error as any).message || 'Please try again'}`);
            }
          }
        }
      ]
    );
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <View style={[styles.contactCard, item.is_spam && styles.spamContactCard]}>
      <View style={styles.contactInfo}>
        <View style={styles.contactHeader}>
          <Text style={styles.contactName}>{item.name}</Text>
          {item.spam_reports_count > 0 && (
            <Text style={styles.spamIndicator}>⚠️</Text>
          )}
        </View>
        
        <TouchableOpacity onPress={() => openDialer(item.phone_number)}>
          <Text style={styles.contactPhone}>📞 {item.phone_number}</Text>
        </TouchableOpacity>
        
        {item.email && <Text style={styles.contactEmail}>✉️ {item.email}</Text>}
        
        {item.spam_reports_count > 0 && (
          <Text style={styles.contactSpamCount}>
            Spam reports: {item.spam_reports_count}
          </Text>
        )}
      </View>
      
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={styles.contactCallButton}
          onPress={() => makeCall(item.phone_number, item.name)}
        >
          <Text style={styles.contactCallText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.contactReportButton}
          onPress={() => handleReportSpam(item.phone_number, item.name)}
        >
          <Text style={styles.contactReportText}>Report</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.contactDeleteButton}
          onPress={() => handleDeleteContact(item.id, item.name)}
        >
          <Text style={styles.contactDeleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      {/* Enhanced Contacts Header with proper spacing */}
      <View style={[styles.header, { paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0) + 20 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Contacts</Text>
          <TouchableOpacity
            style={styles.addContactButton}
            onPress={() => setCurrentScreen('addContact')}
          >
            <Text style={styles.addContactText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        
        {/* Search Section */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputGroup}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search contacts..."
              placeholderTextColor="#A0A0A0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearSearchText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {contactsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      ) : (
        <FlatList
          style={styles.contactsList}
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContactItem}
          ListEmptyComponent={() => (
            <View style={styles.emptyContactsState}>
              <Text style={styles.emptyContactsTitle}>
                {searchQuery ? '🔍 No matching contacts' : '📱 No Contacts Yet'}
              </Text>
              <Text style={styles.emptyContactsSubtitle}>
                {searchQuery 
                  ? 'Try a different search term'
                  : 'Add contacts to help build the community database'
                }
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addContactButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addContactText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  contactsList: {
    flex: 1,
    paddingTop: 16,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  spamContactCard: {
    borderColor: '#FF5252',
    backgroundColor: '#FFF5F5',
  },
  contactInfo: {
    marginBottom: 12,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  spamIndicator: {
    fontSize: 16,
    color: '#FF5252',
  },
  contactPhone: {
    fontSize: 16,
    color: '#4A90E2',
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  contactSpamCount: {
    fontSize: 12,
    color: '#FF5252',
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactCallButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactReportButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactDeleteButton: {
    flex: 1,
    backgroundColor: '#FF5252',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactCallText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  contactReportText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  contactDeleteText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContactsState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyContactsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyContactsSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Search styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },
  searchInputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1b0202ff',
    paddingVertical: 4,
  },
  clearSearchButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearSearchText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ContactsScreen;
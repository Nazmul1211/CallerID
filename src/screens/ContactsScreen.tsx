import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { databaseService } from '../services/database';
import { Contact } from '../config/supabase';

interface ContactsScreenProps {
  navigation: any;
}

const ContactsScreen: React.FC<ContactsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadContacts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userContacts = await databaseService.getContactsByUser(user.id);
      setContacts(userContacts);
    } catch (error) {
      Alert.alert('Error', 'Failed to load contacts');
      console.error('Load contacts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [user])
  );

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
            const success = await databaseService.deleteContact(contactId);
            if (success) {
              setContacts(contacts.filter(c => c.id !== contactId));
            } else {
              Alert.alert('Error', 'Failed to delete contact');
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
            const result = await databaseService.reportSpam(user.id, phoneNumber, 'Spam call');
            if (result) {
              Alert.alert('Success', 'Contact reported as spam');
              loadContacts(); // Refresh to update spam count
            } else {
              Alert.alert('Error', 'Failed to report spam');
            }
          }
        }
      ]
    );
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <View style={[styles.contactCard, item.is_spam && styles.spamContact]}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>{item.phone_number}</Text>
        {item.email && <Text style={styles.contactEmail}>{item.email}</Text>}
        {item.spam_reports_count > 0 && (
          <Text style={styles.spamCount}>
            Spam reports: {item.spam_reports_count}
          </Text>
        )}
      </View>
      
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleReportSpam(item.phone_number, item.name)}>
          <Text style={styles.reportButtonText}>Report Spam</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteContact(item.id, item.name)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No Contacts Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add contacts to help build the community database
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddContact')}>
        <Text style={styles.addButtonText}>Add Your First Contact</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Contacts</Text>
        <TouchableOpacity
          style={styles.addContactButton}
          onPress={() => navigation.navigate('AddContact')}>
          <Text style={styles.addContactText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        contentContainerStyle={contacts.length === 0 ? styles.emptyContainer : styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  addContactButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addContactText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  spamContact: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  contactInfo: {
    marginBottom: 12,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  spamCount: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  reportButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ContactsScreen; 
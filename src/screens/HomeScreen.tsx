// Main dashboard
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
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { databaseService } from '../services/database';
import Header from '../components/Header';

const HomeScreen: React.FC = () => {
  const [searchNumber, setSearchNumber] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);

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

  const handleSearch = async () => {
    if (!searchNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number to search');
      return;
    }

    setSearchLoading(true);
    try {
      console.log('Searching for:', searchNumber.trim());
      const result = await databaseService.callerIdLookup(searchNumber.trim());
      console.log('Search result:', result);
      setSearchResult(result);
      
      if (!result.name && result.spamCount === 0) {
        Alert.alert('No Results', 'No information found for this number');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', `Failed to search: ${(error as any).message || 'Please check your connection'}`);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      <Header
        title="Caller ID"
        subtitle="Protection Active"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Identify Caller</Text>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputGroup}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter phone number to search"
                placeholderTextColor="#A0A0A0"
                value={searchNumber}
                onChangeText={setSearchNumber}
                keyboardType="phone-pad"
              />
            </View>
            
            <TouchableOpacity
              style={[styles.searchButton, searchLoading && styles.buttonDisabled]}
              onPress={handleSearch}
              disabled={searchLoading}
            >
              {searchLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Results */}
        {searchResult && (
          <View style={styles.resultSection}>
            <View style={[styles.resultCard, searchResult.isSpam && styles.spamResultCard]}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultNumber}>{searchNumber}</Text>
                {searchResult.isSpam && <Text style={styles.spamBadge}>⚠️ SPAM</Text>}
              </View>
              
              {searchResult.name ? (
                <Text style={styles.resultName}>{searchResult.name}</Text>
              ) : (
                <Text style={styles.unknownResult}>Unknown Caller</Text>
              )}
              
              {searchResult.spamCount > 0 && (
                <Text style={styles.spamInfo}>
                  Reported as spam {searchResult.spamCount} times
                </Text>
              )}
              
              {!searchResult.name && !searchResult.isSpam && (
                <Text style={styles.noResultInfo}>
                  No information available for this number
                </Text>
              )}
              
              {/* Enhanced Call Buttons */}
              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={styles.dialerButton}
                  onPress={() => openDialer(searchNumber)}
                >
                  <Text style={styles.dialerButtonText}>📞 Open Dialer</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => makeCall(searchNumber, searchResult.name)}
                >
                  <Text style={styles.callButtonText}>📱 Call Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Quick Tips */}
        <View style={styles.tipsSection}>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 Quick Tips</Text>
            <Text style={styles.tipText}>
              📞 +1987654321 - Clean contact{'\n'}
              ⚠️ +1555000999 - Spam number{'\n'}
              📱 Tap results to call directly
            </Text>
          </View>
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
  content: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 60,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 16,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    color: '#333333',
  },
  searchButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  resultSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  spamResultCard: {
    borderColor: '#FF5252',
    backgroundColor: '#FFF5F5',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  spamBadge: {
    fontSize: 16,
    color: '#FF5252',
    fontWeight: 'bold',
  },
  resultName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  unknownResult: {
    fontSize: 18,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  spamInfo: {
    fontSize: 14,
    color: '#FF5252',
    marginBottom: 8,
  },
  noResultInfo: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  resultActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  dialerButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  callButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  dialerButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  callButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
});

export default HomeScreen;
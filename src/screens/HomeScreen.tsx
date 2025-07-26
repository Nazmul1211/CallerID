import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { databaseService } from '../services/database';

const HomeScreen = () => {
  const [searchNumber, setSearchNumber] = useState('');
  const [searchResult, setSearchResult] = useState<{
    name?: string;
    isSpam: boolean;
    spamCount: number;
    contact?: any;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number to search');
      return;
    }

    setLoading(true);
    try {
      const result = await databaseService.callerIdLookup(searchNumber.trim());
      setSearchResult(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to search. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchNumber('');
    setSearchResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>CallerID Search</Text>
          <Text style={styles.subtitle}>Enter a phone number to identify the caller</Text>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter phone number"
              value={searchNumber}
              onChangeText={setSearchNumber}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <TouchableOpacity
              style={[styles.searchButton, loading && styles.buttonDisabled]}
              onPress={handleSearch}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          {searchNumber.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {searchResult && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Search Result</Text>
            
            <View style={[
              styles.resultCard,
              searchResult.isSpam && styles.spamCard
            ]}>
              <View style={styles.resultHeader}>
                <Text style={styles.phoneNumber}>{searchNumber}</Text>
                {searchResult.isSpam && (
                  <View style={styles.spamBadge}>
                    <Text style={styles.spamBadgeText}>SPAM</Text>
                  </View>
                )}
              </View>

              {searchResult.name ? (
                <Text style={styles.callerName}>{searchResult.name}</Text>
              ) : (
                <Text style={styles.unknownCaller}>Unknown Caller</Text>
              )}

              {searchResult.spamCount > 0 && (
                <Text style={styles.spamCount}>
                  Reported as spam {searchResult.spamCount} times
                </Text>
              )}

              {!searchResult.name && !searchResult.isSpam && (
                <Text style={styles.noData}>
                  No information available for this number
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            • Search phone numbers to identify callers{'\n'}
            • Get crowd-sourced information from the community{'\n'}
            • Help others by adding contacts and reporting spam{'\n'}
            • Build a safer calling experience together
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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  searchSection: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1C1C1E',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  buttonDisabled: {
    backgroundColor: '#8E8E93',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  clearButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  resultSection: {
    marginBottom: 32,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  spamCard: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  spamBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  spamBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  callerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  unknownCaller: {
    fontSize: 18,
    color: '#8E8E93',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  spamCount: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 8,
  },
  noData: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
  },
});

export default HomeScreen; 
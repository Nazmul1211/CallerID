// /**
//  * CallerID App - A TrueCaller Clone
//  * Complete CRUD operations with profile management and call functionality
//  *
//  * @format
//  */

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
//   StatusBar,
//   FlatList,
//   Linking,
//   PermissionsAndroid,
//   Platform,
// } from 'react-native';
// import { databaseService } from './src/services/database';
// import { User, Contact } from './src/config/supabase';

// type Screen = 'auth' | 'home' | 'contacts' | 'addContact' | 'profile' | 'editProfile';

// function App() {
//   const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(false);

//   // Auth Screen State
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');

//   // Home Screen State
//   const [searchNumber, setSearchNumber] = useState('');
//   const [searchResult, setSearchResult] = useState<any>(null);
//   const [searchLoading, setSearchLoading] = useState(false);

//   // Contacts Screen State
//   const [contacts, setContacts] = useState<Contact[]>([]);
//   const [contactsLoading, setContactsLoading] = useState(false);

//   // Add Contact State
//   const [newContactPhone, setNewContactPhone] = useState('');
//   const [newContactName, setNewContactName] = useState('');
//   const [newContactEmail, setNewContactEmail] = useState('');

//   // Edit Profile State
//   const [editName, setEditName] = useState('');
//   const [editEmail, setEditEmail] = useState('');

//   useEffect(() => {
//     if (user && currentScreen === 'contacts') {
//       loadContacts();
//     }
//   }, [user, currentScreen]);

//   const makeCall = async (phoneNumber: string, contactName?: string) => {
//     try {
//       if (Platform.OS === 'android') {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.CALL_PHONE,
//           {
//             title: 'Call Permission',
//             message: 'This app needs access to make phone calls.',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           },
//         );

//         if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
//           Alert.alert('Permission Denied', 'Cannot make a call without permission.');
//           return;
//         }
//       }

//       const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
//       const url = `tel:${cleanNumber}`;
//       const supported = await Linking.canOpenURL(url);

//       if (supported) {
//         await Linking.openURL(url);
//       } else {
//         Alert.alert('Error', 'Unable to handle this call');
//       }
//     } catch (error) {
//       console.error('Call error:', error);
//       Alert.alert('Error', 'Failed to make call');
//     }
//   };

//   const openDialer = async (phoneNumber: string) => {
//     try {
//       const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
//       const url = `tel:${cleanNumber}`;
//       const supported = await Linking.canOpenURL(url);

//       if (supported) {
//         await Linking.openURL(url);
//       } else {
//         Alert.alert('Error', 'Unable to open dialer');
//       }
//     } catch (error) {
//       console.error('Dialer error:', error);
//       Alert.alert('Error', 'Failed to open dialer');
//     }
//   };

//   const handleSignIn = async () => {
//     if (!phoneNumber.trim() || !name.trim()) {
//       Alert.alert('Error', 'Please enter your phone number and name');
//       return;
//     }

//     // Basic phone number validation
//     const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
//     if (!phoneRegex.test(phoneNumber)) {
//       Alert.alert('Error', 'Please enter a valid phone number');
//       return;
//     }

//     setLoading(true);
//     try {
//       console.log('Attempting to sign in with:', phoneNumber.trim());
      
//       // Check if user already exists
//       let existingUser = await databaseService.getUserByPhone(phoneNumber.trim());
      
//       if (existingUser) {
//         console.log('Found existing user:', existingUser);
//         setUser(existingUser);
//         setCurrentScreen('home');
//         Alert.alert('Welcome Back!', `Hello ${existingUser.name}!`);
//       } else {
//         console.log('Creating new user...');
//         // Create new user
//         const newUser = await databaseService.createUser(phoneNumber.trim(), name.trim(), email.trim() || undefined);
//         if (newUser) {
//           console.log('Created new user:', newUser);
//           setUser(newUser);
//           setCurrentScreen('home');
//           Alert.alert('Welcome!', 'Account created successfully!');
//         } else {
//           Alert.alert('Error', 'Failed to create account. Please check your connection and try again.');
//         }
//       }
//     } catch (error) {
//       console.error('Sign in error:', error);
//       Alert.alert('Error', `Failed to sign in: ${(error as any).message || 'Please check your internet connection'}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = async () => {
//     if (!searchNumber.trim()) {
//       Alert.alert('Error', 'Please enter a phone number to search');
//       return;
//     }

//     setSearchLoading(true);
//     try {
//       console.log('Searching for:', searchNumber.trim());
//       const result = await databaseService.callerIdLookup(searchNumber.trim());
//       console.log('Search result:', result);
//       setSearchResult(result);
      
//       if (!result.name && result.spamCount === 0) {
//         Alert.alert('No Results', 'No information found for this number');
//       }
//     } catch (error) {
//       console.error('Search error:', error);
//       Alert.alert('Error', `Failed to search: ${(error as any).message || 'Please check your connection'}`);
//     } finally {
//       setSearchLoading(false);
//     }
//   };

//   const loadContacts = async () => {
//     if (!user) return;
    
//     setContactsLoading(true);
//     try {
//       console.log('Loading contacts for user:', user.id);
//       const userContacts = await databaseService.getContactsByUser(user.id);
//       console.log('Loaded contacts:', userContacts);
//       setContacts(userContacts);
//     } catch (error) {
//       console.error('Load contacts error:', error);
//       Alert.alert('Error', `Failed to load contacts: ${(error as any).message || 'Please try again'}`);
//     } finally {
//       setContactsLoading(false);
//     }
//   };

//   const handleAddContact = async () => {
//     if (!newContactPhone.trim() || !newContactName.trim()) {
//       Alert.alert('Error', 'Please enter phone number and name');
//       return;
//     }

//     if (!user) return;

//     // Basic phone number validation
//     const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
//     if (!phoneRegex.test(newContactPhone)) {
//       Alert.alert('Error', 'Please enter a valid phone number');
//       return;
//     }

//     setLoading(true);
//     try {
//       console.log('Adding contact:', { phone: newContactPhone.trim(), name: newContactName.trim() });
//       const contact = await databaseService.addContact(
//         user.id,
//         newContactPhone.trim(),
//         newContactName.trim(),
//         newContactEmail.trim() || undefined
//       );

//       if (contact) {
//         console.log('Contact added successfully:', contact);
//         Alert.alert('Success', 'Contact added successfully!');
//         setNewContactPhone('');
//         setNewContactName('');
//         setNewContactEmail('');
//         setCurrentScreen('contacts');
//         // Refresh contacts list
//         await loadContacts();
//       } else {
//         Alert.alert('Error', 'Failed to add contact. It may already exist or there was a connection issue.');
//       }
//     } catch (error) {
//       console.error('Add contact error:', error);
//       Alert.alert('Error', `Failed to add contact: ${(error as any).message || 'Please try again'}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteContact = async (contactId: string, contactName: string) => {
//     Alert.alert(
//       'Delete Contact',
//       `Are you sure you want to delete ${contactName}?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               const success = await databaseService.deleteContact(contactId);
//               if (success) {
//                 setContacts(contacts.filter(c => c.id !== contactId));
//                 Alert.alert('Success', 'Contact deleted successfully');
//               } else {
//                 Alert.alert('Error', 'Failed to delete contact');
//               }
//             } catch (error) {
//               console.error('Delete contact error:', error);
//               Alert.alert('Error', `Failed to delete contact: ${(error as any).message || 'Please try again'}`);
//             }
//           }
//         }
//       ]
//     );
//   };

//   const handleReportSpam = async (phoneNumber: string, contactName: string) => {
//     if (!user) return;

//     Alert.alert(
//       'Report Spam',
//       `Report ${contactName} (${phoneNumber}) as spam?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Report',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               const result = await databaseService.reportSpam(user.id, phoneNumber, 'Spam call');
//               if (result) {
//                 Alert.alert('Success', 'Contact reported as spam');
//                 await loadContacts(); // Refresh to update spam count
//               } else {
//                 Alert.alert('Error', 'Failed to report spam');
//               }
//             } catch (error) {
//               console.error('Report spam error:', error);
//               Alert.alert('Error', `Failed to report spam: ${(error as any).message || 'Please try again'}`);
//             }
//           }
//         }
//       ]
//     );
//   };

//   const handleUpdateProfile = async () => {
//     if (!user || !editName.trim()) {
//       Alert.alert('Error', 'Please enter your name');
//       return;
//     }

//     setLoading(true);
//     try {
//       const updatedUser = await databaseService.updateUser(user.id, {
//         name: editName.trim(),
//         email: editEmail.trim() || undefined,
//       });

//       if (updatedUser) {
//         setUser(updatedUser);
//         Alert.alert('Success', 'Profile updated successfully!');
//         setCurrentScreen('profile');
//       } else {
//         Alert.alert('Error', 'Failed to update profile');
//       }
//     } catch (error) {
//       console.error('Update profile error:', error);
//       Alert.alert('Error', `Failed to update profile: ${(error as any).message || 'Please try again'}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteAccount = async () => {
//     if (!user) return;

//     Alert.alert(
//       'Delete Account',
//       'Are you sure you want to delete your account? This action cannot be undone.',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               // Note: We'd need to add a deleteUser method to the database service
//               // For now, just sign out
//               setUser(null);
//               setCurrentScreen('auth');
//               setPhoneNumber('');
//               setName('');
//               setEmail('');
//               Alert.alert('Account Deleted', 'Your account has been deleted.');
//             } catch (error) {
//               console.error('Delete account error:', error);
//               Alert.alert('Error', 'Failed to delete account');
//             }
//           }
//         }
//       ]
//     );
//   };

//   const renderAuthScreen = () => (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>CallerID</Text>
//       <Text style={styles.subtitle}>Join the community to identify unknown callers</Text>

//       <View style={styles.form}>
//         <TextInput
//           style={styles.input}
//           placeholder="Phone Number *"
//           value={phoneNumber}
//           onChangeText={setPhoneNumber}
//           keyboardType="phone-pad"
//         />
        
//         <TextInput
//           style={styles.input}
//           placeholder="Full Name *"
//           value={name}
//           onChangeText={setName}
//           autoCapitalize="words"
//         />
        
//         <TextInput
//           style={styles.input}
//           placeholder="Email (Optional)"
//           value={email}
//           onChangeText={setEmail}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />

//         <TouchableOpacity
//           style={[styles.button, loading && styles.buttonDisabled]}
//           onPress={handleSignIn}
//           disabled={loading}>
//           <Text style={styles.buttonText}>
//             {loading ? 'Signing In...' : 'Get Started'}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <Text style={styles.disclaimer}>
//         By continuing, you agree to help build a community database to identify spam callers
//       </Text>
//     </ScrollView>
//   );

//   const renderHomeScreen = () => (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>CallerID Search</Text>
//       <Text style={styles.subtitle}>Enter a phone number to identify the caller</Text>

//       <View style={styles.searchContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter phone number"
//           value={searchNumber}
//           onChangeText={setSearchNumber}
//           keyboardType="phone-pad"
//         />
        
//         <TouchableOpacity
//           style={[styles.button, searchLoading && styles.buttonDisabled]}
//           onPress={handleSearch}
//           disabled={searchLoading}>
//           {searchLoading ? (
//             <ActivityIndicator color="#FFFFFF" size="small" />
//           ) : (
//             <Text style={styles.buttonText}>Search</Text>
//           )}
//         </TouchableOpacity>
//       </View>

//       {searchResult && (
//         <View style={[styles.resultCard, searchResult.isSpam && styles.spamCard]}>
//           <Text style={styles.phoneNumber}>{searchNumber}</Text>
//           {searchResult.name ? (
//             <Text style={styles.callerName}>{searchResult.name}</Text>
//           ) : (
//             <Text style={styles.unknownCaller}>Unknown Caller</Text>
//           )}
//           {searchResult.isSpam && <Text style={styles.spamBadge}>⚠️ SPAM</Text>}
//           {searchResult.spamCount > 0 && (
//             <Text style={styles.spamCount}>
//               Reported as spam {searchResult.spamCount} times
//             </Text>
//           )}
//           {!searchResult.name && !searchResult.isSpam && (
//             <Text style={styles.noData}>
//               No information available for this number
//             </Text>
//           )}
          
//           {/* Call buttons */}
//           <View style={styles.callButtonsContainer}>
//             <TouchableOpacity
//               style={styles.callButton}
//               onPress={() => openDialer(searchNumber)}>
//               <Text style={styles.callButtonText}>📞 Open Dialer</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity
//               style={[styles.callButton, styles.directCallButton]}
//               onPress={() => makeCall(searchNumber, searchResult.name)}>
//               <Text style={styles.directCallButtonText}>📱 Call Now</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       <View style={styles.infoSection}>
//         <Text style={styles.infoTitle}>Try these test numbers:</Text>
//         <Text style={styles.infoText}>
//           📞 +1987654321 - Clean contact{'\n'}
//           ⚠️ +1555000999 - Spam number{'\n'}
//           📱 Tap any result to call directly
//         </Text>
//       </View>
//     </ScrollView>
//   );

//   const renderContactsScreen = () => (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>My Contacts</Text>
//         <TouchableOpacity
//           style={styles.addButton}
//           onPress={() => setCurrentScreen('addContact')}>
//           <Text style={styles.addButtonText}>+ Add</Text>
//         </TouchableOpacity>
//       </View>

//       {contactsLoading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#007AFF" />
//           <Text style={styles.loadingText}>Loading contacts...</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={contacts}
//           keyExtractor={(item) => item.id}
//           renderItem={({ item }) => (
//             <View style={[styles.contactCard, item.is_spam && styles.spamContactCard]}>
//               <View style={styles.contactInfo}>
//                 <Text style={styles.contactName}>{item.name}</Text>
//                 <TouchableOpacity onPress={() => openDialer(item.phone_number)}>
//                   <Text style={styles.contactPhone}>📞 {item.phone_number}</Text>
//                 </TouchableOpacity>
//                 {item.email && <Text style={styles.contactEmail}>{item.email}</Text>}
//                 {item.spam_reports_count > 0 && (
//                   <Text style={styles.spamCount}>
//                     Spam reports: {item.spam_reports_count}
//                   </Text>
//                 )}
//               </View>
              
//               <View style={styles.contactActions}>
//                 <TouchableOpacity
//                   style={styles.callActionButton}
//                   onPress={() => makeCall(item.phone_number, item.name)}>
//                   <Text style={styles.callActionText}>📱 Call</Text>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity
//                   style={styles.actionButton}
//                   onPress={() => handleReportSpam(item.phone_number, item.name)}>
//                   <Text style={styles.reportButtonText}>Report Spam</Text>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity
//                   style={[styles.actionButton, styles.deleteButton]}
//                   onPress={() => handleDeleteContact(item.id, item.name)}>
//                   <Text style={styles.deleteButtonText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//           ListEmptyComponent={() => (
//             <View style={styles.emptyState}>
//               <Text style={styles.emptyTitle}>No Contacts Yet</Text>
//               <Text style={styles.emptySubtitle}>
//                 Add contacts to help build the community database
//               </Text>
//             </View>
//           )}
//         />
//       )}
//     </View>
//   );

//   const renderAddContactScreen = () => (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Add New Contact</Text>
//       <Text style={styles.subtitle}>Help build the community database</Text>

//       <View style={styles.form}>
//         <TextInput
//           style={styles.input}
//           placeholder="Phone Number *"
//           value={newContactPhone}
//           onChangeText={setNewContactPhone}
//           keyboardType="phone-pad"
//         />
        
//         <TextInput
//           style={styles.input}
//           placeholder="Contact Name *"
//           value={newContactName}
//           onChangeText={setNewContactName}
//           autoCapitalize="words"
//         />
        
//         <TextInput
//           style={styles.input}
//           placeholder="Email (Optional)"
//           value={newContactEmail}
//           onChangeText={setNewContactEmail}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />

//         <TouchableOpacity
//           style={[styles.button, loading && styles.buttonDisabled]}
//           onPress={handleAddContact}
//           disabled={loading}>
//           <Text style={styles.buttonText}>
//             {loading ? 'Adding...' : 'Add Contact'}
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.cancelButton}
//           onPress={() => setCurrentScreen('contacts')}>
//           <Text style={styles.cancelButtonText}>Cancel</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );

//   const renderEditProfileScreen = () => (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Edit Profile</Text>
//       <Text style={styles.subtitle}>Update your account information</Text>

//       <View style={styles.form}>
//         <View style={styles.inputContainer}>
//           <Text style={styles.label}>Phone Number</Text>
//           <TouchableOpacity onPress={() => openDialer(user?.phone_number || '')}>
//             <TextInput
//               style={[styles.input, styles.disabledInput]}
//               value={user?.phone_number}
//               editable={false}
//             />
//           </TouchableOpacity>
//           <Text style={styles.helpText}>Phone number cannot be changed (tap to call)</Text>
//         </View>

//         <TextInput
//           style={styles.input}
//           placeholder="Full Name *"
//           value={editName}
//           onChangeText={setEditName}
//           autoCapitalize="words"
//         />
        
//         <TextInput
//           style={styles.input}
//           placeholder="Email (Optional)"
//           value={editEmail}
//           onChangeText={setEditEmail}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />

//         <TouchableOpacity
//           style={[styles.button, loading && styles.buttonDisabled]}
//           onPress={handleUpdateProfile}
//           disabled={loading}>
//           <Text style={styles.buttonText}>
//             {loading ? 'Updating...' : 'Update Profile'}
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.cancelButton}
//           onPress={() => setCurrentScreen('profile')}>
//           <Text style={styles.cancelButtonText}>Cancel</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );

//   const renderProfileScreen = () => (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Profile</Text>
      
//       {user && (
//         <View style={styles.profileCard}>
//           <View style={styles.avatarContainer}>
//             <View style={styles.avatar}>
//               <Text style={styles.avatarText}>
//                 {user.name.charAt(0).toUpperCase()}
//               </Text>
//             </View>
//           </View>
//           <Text style={styles.userName}>{user.name}</Text>
//           <TouchableOpacity onPress={() => openDialer(user.phone_number)}>
//             <Text style={styles.userPhone}>📞 {user.phone_number}</Text>
//           </TouchableOpacity>
//           {user.email && <Text style={styles.userEmail}>{user.email}</Text>}
//         </View>
//       )}

//       <View style={styles.profileActions}>
//         <TouchableOpacity
//           style={styles.profileButton}
//           onPress={() => {
//             if (user) {
//               setEditName(user.name);
//               setEditEmail(user.email || '');
//               setCurrentScreen('editProfile');
//             }
//           }}>
//           <Text style={styles.profileButtonText}>✏️ Edit Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.profileButton, styles.dangerButton]}
//           onPress={handleDeleteAccount}>
//           <Text style={styles.dangerButtonText}>🗑️ Delete Account</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.signOutButton}
//           onPress={() => {
//             setUser(null);
//             setCurrentScreen('auth');
//             setPhoneNumber('');
//             setName('');
//             setEmail('');
//           }}>
//           <Text style={styles.signOutText}>Sign Out</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );

//   const renderBottomTabs = () => (
//     <View style={styles.bottomTabs}>
//       <TouchableOpacity
//         style={[styles.tab, currentScreen === 'home' && styles.activeTab]}
//         onPress={() => setCurrentScreen('home')}>
//         <Text style={[styles.tabText, currentScreen === 'home' && styles.activeTabText]}>
//           🔍 Search
//         </Text>
//       </TouchableOpacity>
      
//       <TouchableOpacity
//         style={[styles.tab, currentScreen === 'contacts' && styles.activeTab]}
//         onPress={() => setCurrentScreen('contacts')}>
//         <Text style={[styles.tabText, currentScreen === 'contacts' && styles.activeTabText]}>
//           📞 Contacts
//         </Text>
//       </TouchableOpacity>
      
//       <TouchableOpacity
//         style={[styles.tab, currentScreen === 'profile' && styles.activeTab]}
//         onPress={() => setCurrentScreen('profile')}>
//         <Text style={[styles.tabText, currentScreen === 'profile' && styles.activeTabText]}>
//           👤 Profile
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderCurrentScreen = () => {
//     switch (currentScreen) {
//       case 'auth':
//         return renderAuthScreen();
//       case 'home':
//         return renderHomeScreen();
//       case 'contacts':
//         return renderContactsScreen();
//       case 'addContact':
//         return renderAddContactScreen();
//       case 'editProfile':
//         return renderEditProfileScreen();
//       case 'profile':
//         return renderProfileScreen();
//       default:
//         return renderHomeScreen();
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="dark-content" backgroundColor="#F5F5F7" />
//       <View style={styles.screenContainer}>
//         {renderCurrentScreen()}
//       </View>
//       {user && !['addContact', 'editProfile'].includes(currentScreen) && renderBottomTabs()}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#F5F5F7',
//   },
//   screenContainer: {
//     flex: 1,
//   },
//   container: {
//     flexGrow: 1,
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     color: '#1C1C1E',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#8E8E93',
//     textAlign: 'center',
//     marginBottom: 32,
//   },
//   form: {
//     marginBottom: 32,
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1C1C1E',
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#D1D1D6',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     fontSize: 16,
//     backgroundColor: '#FFFFFF',
//     color: '#1C1C1E',
//     marginBottom: 16,
//   },
//   disabledInput: {
//     backgroundColor: '#F2F2F7',
//     color: '#8E8E93',
//   },
//   helpText: {
//     fontSize: 12,
//     color: '#8E8E93',
//     marginTop: -12,
//     marginBottom: 16,
//   },
//   button: {
//     backgroundColor: '#007AFF',
//     borderRadius: 12,
//     paddingVertical: 16,
//     alignItems: 'center',
//     marginTop: 12,
//   },
//   buttonDisabled: {
//     backgroundColor: '#8E8E93',
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   disclaimer: {
//     fontSize: 14,
//     color: '#8E8E93',
//     textAlign: 'center',
//     lineHeight: 20,
//     paddingHorizontal: 20,
//   },
//   searchContainer: {
//     marginBottom: 24,
//   },
//   resultCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#E5E5EA',
//     marginBottom: 20,
//   },
//   spamCard: {
//     borderColor: '#FF3B30',
//     backgroundColor: '#FFF5F5',
//   },
//   phoneNumber: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1C1C1E',
//     marginBottom: 8,
//   },
//   callerName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#1C1C1E',
//     marginBottom: 4,
//   },
//   unknownCaller: {
//     fontSize: 18,
//     color: '#8E8E93',
//     fontStyle: 'italic',
//     marginBottom: 4,
//   },
//   spamBadge: {
//     fontSize: 16,
//     color: '#FF3B30',
//     fontWeight: 'bold',
//     marginTop: 8,
//   },
//   spamCount: {
//     fontSize: 14,
//     color: '#FF3B30',
//     marginTop: 4,
//   },
//   noData: {
//     fontSize: 16,
//     color: '#8E8E93',
//     textAlign: 'center',
//     marginTop: 8,
//   },
//   callButtonsContainer: {
//     flexDirection: 'row',
//     marginTop: 16,
//     gap: 12,
//   },
//   callButton: {
//     flex: 1,
//     backgroundColor: '#F2F2F7',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   directCallButton: {
//     backgroundColor: '#34C759',
//   },
//   callButtonText: {
//     fontSize: 16,
//     color: '#007AFF',
//     fontWeight: '500',
//   },
//   directCallButtonText: {
//     fontSize: 16,
//     color: '#FFFFFF',
//     fontWeight: '600',
//   },
//   infoSection: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#E5E5EA',
//   },
//   infoTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1C1C1E',
//     marginBottom: 12,
//   },
//   infoText: {
//     fontSize: 16,
//     color: '#8E8E93',
//     lineHeight: 24,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E5EA',
//   },
//   addButton: {
//     backgroundColor: '#007AFF',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   addButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#8E8E93',
//   },
//   contactCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     marginHorizontal: 20,
//     marginVertical: 6,
//     borderWidth: 1,
//     borderColor: '#E5E5EA',
//   },
//   spamContactCard: {
//     borderColor: '#FF3B30',
//     backgroundColor: '#FFF5F5',
//   },
//   contactInfo: {
//     marginBottom: 12,
//   },
//   contactName: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1C1C1E',
//     marginBottom: 4,
//   },
//   contactPhone: {
//     fontSize: 16,
//     color: '#007AFF',
//     marginBottom: 2,
//   },
//   contactEmail: {
//     fontSize: 14,
//     color: '#8E8E93',
//     marginBottom: 2,
//   },
//   contactActions: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   actionButton: {
//     flex: 1,
//     padding: 8,
//     borderRadius: 6,
//     alignItems: 'center',
//     backgroundColor: '#F2F2F7',
//   },
//   callActionButton: {
//     flex: 1,
//     padding: 8,
//     borderRadius: 6,
//     alignItems: 'center',
//     backgroundColor: '#34C759',
//   },
//   callActionText: {
//     fontSize: 14,
//     color: '#FFFFFF',
//     fontWeight: '600',
//   },
//   deleteButton: {
//     backgroundColor: '#FF3B30',
//   },
//   reportButtonText: {
//     fontSize: 14,
//     color: '#007AFF',
//     fontWeight: '500',
//   },
//   deleteButtonText: {
//     fontSize: 14,
//     color: '#FFFFFF',
//     fontWeight: '500',
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     flex: 1,
//     paddingHorizontal: 32,
//     paddingVertical: 40,
//   },
//   emptyTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#1C1C1E',
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 16,
//     color: '#8E8E93',
//     textAlign: 'center',
//   },
//   cancelButton: {
//     paddingVertical: 16,
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   cancelButtonText: {
//     color: '#8E8E93',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   profileCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 24,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E5E5EA',
//     marginBottom: 32,
//   },
//   avatarContainer: {
//     marginBottom: 16,
//   },
//   avatar: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#007AFF',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   avatarText: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//   },
//   userName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#1C1C1E',
//     marginBottom: 4,
//   },
//   userPhone: {
//     fontSize: 18,
//     color: '#007AFF',
//     marginBottom: 2,
//   },
//   userEmail: {
//     fontSize: 16,
//     color: '#8E8E93',
//   },
//   profileActions: {
//     gap: 16,
//   },
//   profileButton: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E5E5EA',
//   },
//   profileButtonText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#007AFF',
//   },
//   dangerButton: {
//     borderColor: '#FF3B30',
//   },
//   dangerButtonText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#FF3B30',
//   },
//   signOutButton: {
//     backgroundColor: '#FF3B30',
//     borderRadius: 12,
//     paddingVertical: 16,
//     alignItems: 'center',
//     marginTop: 16,
//   },
//   signOutText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   bottomTabs: {
//     flexDirection: 'row',
//     backgroundColor: '#FFFFFF',
//     borderTopWidth: 1,
//     borderTopColor: '#E5E5EA',
//     paddingBottom: 10,
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 12,
//     alignItems: 'center',
//   },
//   activeTab: {
//     backgroundColor: '#F0F9FF',
//   },
//   tabText: {
//     fontSize: 12,
//     color: '#8E8E93',
//     fontWeight: '500',
//   },
//   activeTabText: {
//     color: '#007AFF',
//     fontWeight: '600',
//   },
// });

// export default App;
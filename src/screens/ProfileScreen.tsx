import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context';
import { IDCardScanner } from '../components/IDCardScanner';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  
  const [showScanner, setShowScanner] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleScanSuccess = async (scannedId: string) => {
    // Verify last 9 digits match
    const scannedLast9 = scannedId.slice(-9);
    const expectedLast9 = (user?.studentId || '').slice(-9);
    
    if (scannedLast9 === expectedLast9) {
      setIsVerified(true);
      setShowScanner(false);
      Alert.alert('সফল ✓', 'আইডি যাচাই সম্পন্ন। এখন তথ্য পরিবর্তন করতে পারবেন।');
    } else {
      Alert.alert('ত্রুটি ❌', 'আইডি মিলছে না!');
    }
  };

  const handleUpdateProfile = async () => {
    if (!isVerified) {
      Alert.alert('সতর্কতা', 'প্রথমে আইডি কার্ড স্ক্যান করুন');
      return;
    }

    if (!newName.trim()) {
      Alert.alert('ত্রুটি', 'নাম খালি রাখা যাবে না');
      return;
    }

    // Check if password change is requested
    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        Alert.alert('ত্রুটি', 'বর্তমান পাসওয়ার্ড দিন');
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert('ত্রুটি', 'নতুন পাসওয়ার্ড মিলছে না');
        return;
      }
      if (newPassword.length < 4) {
        Alert.alert('ত্রুটি', 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Load existing custom users
      const customUsersData = await AsyncStorage.getItem('customUsers');
      const customUsers = customUsersData ? JSON.parse(customUsersData) : {};

      // Load existing custom passwords
      const customPasswordsData = await AsyncStorage.getItem('customPasswords');
      const customPasswords = customPasswordsData ? JSON.parse(customPasswordsData) : {};

      // Verify current password if changing password
      if (newPassword) {
        // First check custom passwords, then fall back to checking if it matches
        const storedPassword = customPasswords[user?.studentId || ''];
        
        // For first-time password change, we need to verify against original password
        // Load original passwords from mockData
        const { PASSWORDS } = require('../data/mockData');
        const originalPassword = PASSWORDS[user?.studentId || ''];
        
        if (storedPassword) {
          if (storedPassword !== currentPassword) {
            Alert.alert('ত্রুটি', 'বর্তমান পাসওয়ার্ড ভুল');
            setIsLoading(false);
            return;
          }
        } else if (originalPassword !== currentPassword) {
          Alert.alert('ত্রুটি', 'বর্তমান পাসওয়ার্ড ভুল');
          setIsLoading(false);
          return;
        }

        // Save new password
        customPasswords[user?.studentId || ''] = newPassword;
        await AsyncStorage.setItem('customPasswords', JSON.stringify(customPasswords));
      }

      // Update user name
      if (user) {
        const updatedUser = { ...user, name: newName.trim() };
        customUsers[user.studentId] = updatedUser;
        
        await AsyncStorage.setItem('customUsers', JSON.stringify(customUsers));
        await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }

      Alert.alert(
        'সফল ✓',
        'আপনার তথ্য সফলভাবে আপডেট হয়েছে। পরিবর্তন দেখতে পুনরায় লগইন করুন।',
        [
          {
            text: 'লগআউট করুন',
            onPress: () => logout(),
          },
          {
            text: 'পরে করবো',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('ত্রুটি', 'তথ্য আপডেট করতে সমস্যা হয়েছে');
    }

    setIsLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 প্রোফাইল সেটিংস</Text>
        <Text style={styles.headerSubtitle}>নাম ও পাসওয়ার্ড পরিবর্তন করুন</Text>
      </View>

      {/* Current Info */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>বর্তমান তথ্য</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>নাম:</Text>
          <Text style={styles.infoValue}>{user?.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>আইডি:</Text>
          <Text style={styles.infoValue}>{user?.studentId}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>বিভাগ:</Text>
          <Text style={styles.infoValue}>{user?.department}</Text>
        </View>
      </View>

      {/* Verification Section */}
      <View style={styles.verificationCard}>
        <Text style={styles.sectionTitle}>🔐 নিরাপত্তা যাচাই</Text>
        <Text style={styles.verificationText}>
          তথ্য পরিবর্তন করতে প্রথমে আইডি কার্ড স্ক্যান করুন
        </Text>
        
        {isVerified ? (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ যাচাই সম্পন্ন</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => setShowScanner(true)}
          >
            <Text style={styles.scanButtonText}>📷 আইডি কার্ড স্ক্যান করুন</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Edit Form */}
      {isVerified && (
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>✏️ তথ্য পরিবর্তন করুন</Text>
          
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>নতুন নাম</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="আপনার নাম লিখুন"
              placeholderTextColor="#999"
            />
          </View>

          {/* Password Section */}
          <View style={styles.divider} />
          <Text style={styles.passwordTitle}>পাসওয়ার্ড পরিবর্তন (ঐচ্ছিক)</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>বর্তমান পাসওয়ার্ড</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="বর্তমান পাসওয়ার্ড"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>নতুন পাসওয়ার্ড</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="নতুন পাসওয়ার্ড"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>নতুন পাসওয়ার্ড নিশ্চিত করুন</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="আবার নতুন পাসওয়ার্ড"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleUpdateProfile}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'আপডেট হচ্ছে...' : '💾 সংরক্ষণ করুন'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ID Card Scanner Modal */}
      <IDCardScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
        expectedId={user?.studentId || ''}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a472a',
    padding: 25,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffd700',
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  verificationCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verificationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  verifiedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 30,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  passwordTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#1a472a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context';

// Custom alert function for web compatibility
const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export const LoginScreen: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!studentId.trim() || !password.trim()) {
      showAlert('ত্রুটি', 'অনুগ্রহ করে Student ID এবং Password দিন');
      return;
    }

    console.log('Attempting login with:', studentId.trim(), password);
    setLoading(true);
    
    try {
      const success = await login(studentId.trim(), password);
      console.log('Login result:', success);
      setLoading(false);

      if (!success) {
        showAlert('Login Failed', 'Invalid Student ID or Password\n\nTry:\nID: 4155 or 2022331001\nPassword: 123456');
      }
    } catch (error) {
      console.error('Login error in screen:', error);
      setLoading(false);
      showAlert('Error', 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo Area */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>🗳️</Text>
          </View>
          <Text style={styles.title}>JOKSU</Text>
          <Text style={styles.subtitle}>জগন্নাথ বিশ্ববিদ্যালয়</Text>
          <Text style={styles.subtitle}>কেন্দ্রীয় ছাত্র সংসদ</Text>
          <Text style={styles.electionText}>নির্বাচন ২০২৬</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Student ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Student ID"
            placeholderTextColor="#999"
            value={studentId}
            onChangeText={setStudentId}
            autoCapitalize="none"
            keyboardType="default"
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login / লগইন</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Demo Credentials */}
        <View style={styles.demoContainer}>
          <Text style={styles.demoTitle}>Demo Credentials:</Text>
          <Text style={styles.demoText}>Student: 2022331001 / 123456</Text>
          <Text style={styles.demoText}>Admin: admin / admin123</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Jagannath University, Dhaka
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a472a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  logoText: {
    fontSize: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
    opacity: 0.9,
  },
  electionText: {
    fontSize: 20,
    color: '#ffd700',
    fontWeight: 'bold',
    marginTop: 10,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loginButton: {
    backgroundColor: '#1a472a',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  demoContainer: {
    marginTop: 25,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  demoTitle: {
    color: '#ffd700',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  demoText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  footer: {
    textAlign: 'center',
    color: '#fff',
    marginTop: 30,
    opacity: 0.7,
    fontSize: 12,
  },
});

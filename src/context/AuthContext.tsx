import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Student, AuthContextType } from '../types';
import { STUDENTS, PASSWORDS } from '../data/mockData';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Student | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    }
  };

  const login = async (studentId: string, password: string): Promise<boolean> => {
    try {
      console.log('Login attempt:', studentId, password);
      console.log('Available passwords:', PASSWORDS);
      console.log('Available students:', STUDENTS.map(s => s.studentId));
      
      // First check if there's a custom password for this user
      let storedPassword;
      try {
        const customPasswordsData = await AsyncStorage.getItem('customPasswords');
        const customPasswords = customPasswordsData ? JSON.parse(customPasswordsData) : {};
        storedPassword = customPasswords[studentId] || PASSWORDS[studentId];
      } catch (e) {
        storedPassword = PASSWORDS[studentId];
      }
      
      console.log('Found password for ID:', storedPassword);
      
      if (storedPassword && storedPassword === password) {
        // Check if there's a custom user data
        let foundStudent;
        try {
          const customUsersData = await AsyncStorage.getItem('customUsers');
          const customUsers = customUsersData ? JSON.parse(customUsersData) : {};
          foundStudent = customUsers[studentId] || STUDENTS.find(s => s.studentId === studentId);
        } catch (e) {
          foundStudent = STUDENTS.find(s => s.studentId === studentId);
        }
        
        console.log('Found student:', foundStudent);
        
        if (foundStudent) {
          // Load any stored voting data
          let userWithVotingData = { ...foundStudent };
          try {
            const storedVotingData = await AsyncStorage.getItem(`voter_${studentId}`);
            if (storedVotingData) {
              userWithVotingData = { ...foundStudent, ...JSON.parse(storedVotingData) };
            }
          } catch (e) {
            console.log('No voting data found');
          }

          console.log('Setting user:', userWithVotingData);
          setUser(userWithVotingData);
          setIsAuthenticated(true);
          
          try {
            await AsyncStorage.setItem('currentUser', JSON.stringify(userWithVotingData));
          } catch (e) {
            console.log('Could not save to storage');
          }
          
          console.log('Login successful!');
          return true;
        }
      }
      console.log('Login failed - invalid credentials');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('currentUser');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = user?.studentId === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

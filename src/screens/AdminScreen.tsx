import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useVoting, useAuth } from '../context';
import { Candidate, Position, PositionInfo } from '../types';

export const AdminScreen: React.FC = () => {
  const { electionState, candidates, positions, addCandidate, updateCandidate, deleteCandidate } = useVoting();
  const { isAdmin } = useAuth();
  const [isElectionActive, setIsElectionActive] = useState(electionState.isActive);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showPositionPicker, setShowPositionPicker] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    studentId: '',
    position: 'VP' as Position,
    department: '',
    session: '',
    manifesto: '',
    symbol: '',
  });

  if (!isAdmin) {
    return (
      <View style={styles.accessDenied}>
        <Text style={styles.accessDeniedIcon}>🚫</Text>
        <Text style={styles.accessDeniedText}>অ্যাক্সেস অস্বীকার</Text>
        <Text style={styles.accessDeniedSubtext}>
          এই পৃষ্ঠা দেখতে অ্যাডমিন অধিকার প্রয়োজন
        </Text>
      </View>
    );
  }

  const handleToggleElection = async (value: boolean) => {
    Alert.alert(
      value ? 'নির্বাচন শুরু' : 'নির্বাচন বন্ধ',
      value
        ? 'আপনি কি নির্বাচন শুরু করতে চান?'
        : 'আপনি কি নির্বাচন বন্ধ করতে চান?',
      [
        { text: 'বাতিল', style: 'cancel' },
        {
          text: 'হ্যাঁ',
          onPress: async () => {
            setIsElectionActive(value);
            const newState = { ...electionState, isActive: value };
            await AsyncStorage.setItem('electionState', JSON.stringify(newState));
          },
        },
      ]
    );
  };

  const resetCandidateForm = () => {
    setCandidateForm({
      name: '',
      studentId: '',
      position: 'VP',
      department: '',
      session: '',
      manifesto: '',
      symbol: '',
    });
    setEditingCandidate(null);
  };

  const handleAddCandidate = () => {
    resetCandidateForm();
    setShowCandidateModal(true);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setCandidateForm({
      name: candidate.name,
      studentId: candidate.studentId,
      position: candidate.position,
      department: candidate.department,
      session: candidate.session,
      manifesto: candidate.manifesto,
      symbol: candidate.symbol,
    });
    setEditingCandidate(candidate);
    setShowCandidateModal(true);
  };

  const handleSaveCandidate = async () => {
    if (!candidateForm.name.trim() || !candidateForm.studentId.trim() || 
        !candidateForm.department.trim() || !candidateForm.symbol.trim()) {
      Alert.alert('ত্রুটি', 'সব ক্ষেত্র পূরণ করুন');
      return;
    }

    try {
      let success = false;
      if (editingCandidate) {
        success = await updateCandidate(editingCandidate.id, candidateForm);
      } else {
        success = await addCandidate(candidateForm);
      }

      if (success) {
        Alert.alert('সফল', editingCandidate ? 'প্রার্থী আপডেট হয়েছে' : 'নতুন প্রার্থী যোগ হয়েছে');
        setShowCandidateModal(false);
        resetCandidateForm();
      } else {
        Alert.alert('ত্রুটি', 'প্রার্থী সংরক্ষণে সমস্যা হয়েছে');
      }
    } catch (error) {
      Alert.alert('ত্রুটি', 'প্রার্থী সংরক্ষণে সমস্যা হয়েছে');
    }
  };

  const handleDeleteCandidate = (candidate: Candidate) => {
    Alert.alert(
      'প্রার্থী মুছুন',
      `আপনি কি "${candidate.name}" কে মুছে ফেলতে চান?`,
      [
        { text: 'বাতিল', style: 'cancel' },
        {
          text: 'মুছুন',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteCandidate(candidate.id);
            if (success) {
              Alert.alert('সফল', 'প্রার্থী মুছে ফেলা হয়েছে');
            } else {
              Alert.alert('ত্রুটি', 'প্রার্থী মুছতে সমস্যা হয়েছে');
            }
          },
        },
      ]
    );
  };

  const handleResetVotes = () => {
    Alert.alert(
      '⚠️ সতর্কতা',
      'এটি সব ভোট মুছে ফেলবে। আপনি কি নিশ্চিত?',
      [
        { text: 'বাতিল', style: 'cancel' },
        {
          text: 'হ্যাঁ, মুছে ফেলুন',
          style: 'destructive',
          onPress: async () => {
            const resetCandidates = candidates.map(c => ({ ...c, votes: 0 }));
            await AsyncStorage.setItem('candidates', JSON.stringify(resetCandidates));
            
            const newState = { ...electionState, votedCount: 0 };
            await AsyncStorage.setItem('electionState', JSON.stringify(newState));
            
            Alert.alert('সফল', 'সব ভোট রিসেট করা হয়েছে। অ্যাপ পুনরায় চালু করুন।');
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      '⚠️ চূড়ান্ত সতর্কতা',
      'এটি সব ডেটা মুছে ফেলবে এবং অ্যাপ রিসেট হবে। আপনি কি নিশ্চিত?',
      [
        { text: 'বাতিল', style: 'cancel' },
        {
          text: 'হ্যাঁ, সব মুছুন',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('সফল', 'সব ডেটা মুছে ফেলা হয়েছে। অ্যাপ বন্ধ করে পুনরায় চালু করুন।');
          },
        },
      ]
    );
  };

  const getTotalVotes = () => {
    return candidates.reduce((sum, c) => sum + c.votes, 0);
  };

  const getTopCandidate = (positionId: string) => {
    const positionCandidates = candidates
      .filter(c => c.position === positionId)
      .sort((a, b) => b.votes - a.votes);
    return positionCandidates[0];
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.studentId.includes(searchQuery) ||
    candidate.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      {/* Admin Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ অ্যাডমিন প্যানেল</Text>
        <Text style={styles.headerSubtitle}>নির্বাচন ব্যবস্থাপনা</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{getTotalVotes()}</Text>
          <Text style={styles.statLabel}>মোট ভোট</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{candidates.length}</Text>
          <Text style={styles.statLabel}>প্রার্থী</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{positions.length}</Text>
          <Text style={styles.statLabel}>পদ</Text>
        </View>
      </View>

      {/* Election Control */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>নির্বাচন নিয়ন্ত্রণ</Text>
        
        <View style={styles.controlCard}>
          <View style={styles.controlRow}>
            <View>
              <Text style={styles.controlLabel}>নির্বাচন অবস্থা</Text>
              <Text style={styles.controlSubLabel}>
                {isElectionActive ? '🟢 চলমান' : '🔴 বন্ধ'}
              </Text>
            </View>
            <Switch
              value={isElectionActive}
              onValueChange={handleToggleElection}
              trackColor={{ false: '#ccc', true: '#4CAF50' }}
              thumbColor={isElectionActive ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      {/* Live Results */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 লাইভ ফলাফল</Text>
        
        {positions.map(position => {
          const topCandidate = getTopCandidate(position.id);
          const positionTotal = candidates
            .filter(c => c.position === position.id)
            .reduce((sum, c) => sum + c.votes, 0);

          return (
            <View key={position.id} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultPosition}>{position.titleBn}</Text>
                <Text style={styles.resultTotal}>{positionTotal} ভোট</Text>
              </View>
              {topCandidate && topCandidate.votes > 0 ? (
                <View style={styles.resultLeader}>
                  <Text style={styles.leaderSymbol}>{topCandidate.symbol}</Text>
                  <View style={styles.leaderInfo}>
                    <Text style={styles.leaderName}>{topCandidate.name}</Text>
                    <Text style={styles.leaderVotes}>
                      {topCandidate.votes} ভোট (
                      {positionTotal > 0
                        ? Math.round((topCandidate.votes / positionTotal) * 100)
                        : 0}
                      %)
                    </Text>
                  </View>
                  <Text style={styles.leaderBadge}>🏆</Text>
                </View>
              ) : (
                <Text style={styles.noVotes}>এখনো ভোট পড়েনি</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Candidate Management */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👥 প্রার্থী ব্যবস্থাপনা</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddCandidate}
          >
            <Text style={styles.addButtonText}>+ যোগ করুন</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="প্রার্থী খুঁজুন..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView style={styles.candidatesList}>
          {filteredCandidates.map(candidate => (
            <View key={candidate.id} style={styles.candidateCard}>
              <View style={styles.candidateHeader}>
                <Text style={styles.candidateSymbol}>{candidate.symbol}</Text>
                <View style={styles.candidateInfo}>
                  <Text style={styles.candidateName}>{candidate.name}</Text>
                  <Text style={styles.candidateDetails}>
                    {candidate.studentId} • {candidate.department}
                  </Text>
                  <Text style={styles.candidatePosition}>
                    {positions.find(p => p.id === candidate.position)?.titleBn}
                  </Text>
                </View>
                <Text style={styles.candidateVotes}>{candidate.votes} ভোট</Text>
              </View>
              
              <View style={styles.candidateActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditCandidate(candidate)}
                >
                  <Text style={styles.actionButtonText}>✏️ এডিট</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteCandidate(candidate)}
                >
                  <Text style={styles.actionButtonText}>🗑️ মুছুন</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Candidate Form Modal */}
      <Modal
        visible={showCandidateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingCandidate ? 'প্রার্থী সম্পাদনা' : 'নতুন প্রার্থী'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowCandidateModal(false);
                resetCandidateForm();
              }}
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>নাম *</Text>
              <TextInput
                style={styles.formInput}
                value={candidateForm.name}
                onChangeText={(text) => setCandidateForm({...candidateForm, name: text})}
                placeholder="প্রার্থীর নাম লিখুন"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>স্টুডেন্ট আইডি *</Text>
              <TextInput
                style={styles.formInput}
                value={candidateForm.studentId}
                onChangeText={(text) => setCandidateForm({...candidateForm, studentId: text})}
                placeholder="2019331501"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>পদ *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowPositionPicker(true)}
              >
                <Text style={styles.pickerButtonText}>
                  {positions.find(p => p.id === candidateForm.position)?.titleBn || 'পদ নির্বাচন করুন'}
                </Text>
                <Text style={styles.pickerArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>বিভাগ *</Text>
              <TextInput
                style={styles.formInput}
                value={candidateForm.department}
                onChangeText={(text) => setCandidateForm({...candidateForm, department: text})}
                placeholder="Computer Science & Engineering"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>সেশন</Text>
              <TextInput
                style={styles.formInput}
                value={candidateForm.session}
                onChangeText={(text) => setCandidateForm({...candidateForm, session: text})}
                placeholder="2019-20"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>প্রতীক *</Text>
              <TextInput
                style={styles.formInput}
                value={candidateForm.symbol}
                onChangeText={(text) => setCandidateForm({...candidateForm, symbol: text})}
                placeholder="🦁"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>ইশতেহার</Text>
              <TextInput
                style={[styles.formInput, styles.manifestoInput]}
                value={candidateForm.manifesto}
                onChangeText={(text) => setCandidateForm({...candidateForm, manifesto: text})}
                placeholder="প্রার্থীর ইশতেহার লিখুন..."
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCandidateModal(false);
                  resetCandidateForm();
                }}
              >
                <Text style={styles.cancelButtonText}>বাতিল</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveCandidate}
              >
                <Text style={styles.saveButtonText}>
                  {editingCandidate ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Position Picker Modal */}
      <Modal
        visible={showPositionPicker}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>পদ নির্বাচন করুন</Text>
              <TouchableOpacity onPress={() => setShowPositionPicker(false)}>
                <Text style={styles.pickerCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerOptions}>
              {positions.map(position => (
                <TouchableOpacity
                  key={position.id}
                  style={[
                    styles.pickerOption,
                    candidateForm.position === position.id && styles.pickerOptionSelected
                  ]}
                  onPress={() => {
                    setCandidateForm({...candidateForm, position: position.id});
                    setShowPositionPicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    candidateForm.position === position.id && styles.pickerOptionTextSelected
                  ]}>
                    {position.titleBn}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#f44336' }]}>
          ⚠️ বিপদ অঞ্চল
        </Text>
        
        <TouchableOpacity
          style={[styles.dangerButton, { backgroundColor: '#FF9800' }]}
          onPress={handleResetVotes}
        >
          <Text style={styles.dangerButtonText}>🔄 ভোট রিসেট করুন</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dangerButton, { backgroundColor: '#f44336' }]}
          onPress={handleClearAllData}
        >
          <Text style={styles.dangerButtonText}>🗑️ সব ডেটা মুছুন</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>JOKSU Admin Panel v1.0</Text>
        <Text style={styles.footerSubtext}>Jagannath University</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  accessDeniedIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  accessDeniedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f44336',
  },
  accessDeniedSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#9C27B0',
    padding: 25,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: -20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a472a',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  controlCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  controlSubLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultPosition: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a472a',
  },
  resultTotal: {
    fontSize: 12,
    color: '#666',
  },
  resultLeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderSymbol: {
    fontSize: 24,
    marginRight: 10,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  leaderVotes: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  leaderBadge: {
    fontSize: 20,
  },
  noVotes: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  dangerButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    padding: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 3,
  },
  // Candidate Management Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  candidatesList: {
    maxHeight: 400,
  },
  candidateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  candidateSymbol: {
    fontSize: 24,
    marginRight: 12,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  candidateDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  candidatePosition: {
    fontSize: 12,
    color: '#9C27B0',
    marginTop: 2,
    fontWeight: '600',
  },
  candidateVotes: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  candidateActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#9C27B0',
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  manifestoInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  formPicker: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#666',
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  pickerCloseButton: {
    fontSize: 20,
    color: '#666',
  },
  pickerOptions: {
    maxHeight: 300,
  },
  pickerOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerOptionSelected: {
    backgroundColor: '#e8f5e8',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginTop: 20,
    marginBottom: 40,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useVoting, useAuth } from '../context';
import { Position, Candidate } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IDCardScanner } from '../components/IDCardScanner';

// Custom alert function for web compatibility
const showAlert = (title: string, message: string, buttons?: any[]) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed && buttons[1]?.onPress) {
        buttons[1].onPress();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

export const VotingScreen: React.FC = () => {
  const { candidates, positions, castVote, electionState, verifyStudentId, isIdVerified } = useVoting();
  const { user } = useAuth();
  const [selectedCandidates, setSelectedCandidates] = useState<Map<Position, string>>(new Map());
  const [votedPositions, setVotedPositions] = useState<Position[]>([]);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [pendingVote, setPendingVote] = useState<{ candidateId: string; position: Position } | null>(null);

  React.useEffect(() => {
    loadVotedPositions();
  }, []);

  const loadVotedPositions = async () => {
    if (user) {
      try {
        const storedData = await AsyncStorage.getItem(`voter_${user.studentId}`);
        if (storedData) {
          const data = JSON.parse(storedData);
          setVotedPositions(data.votedPositions || []);
        }
      } catch (e) {
        console.log('Error loading voted positions');
      }
    }
  };

  const currentPosition = positions[currentPositionIndex];
  const positionCandidates = candidates.filter(c => c.position === currentPosition?.id);
  const hasVotedForCurrent = votedPositions.includes(currentPosition?.id);

  const handleSelectCandidate = (candidateId: string) => {
    if (hasVotedForCurrent) return;
    
    const newSelected = new Map(selectedCandidates);
    newSelected.set(currentPosition.id, candidateId);
    setSelectedCandidates(newSelected);
  };

  const handleCastVote = async () => {
    const selectedId = selectedCandidates.get(currentPosition.id);
    if (!selectedId) {
      showAlert('সতর্কতা', 'অনুগ্রহ করে একজন প্রার্থী নির্বাচন করুন');
      return;
    }

    if (!user) {
      showAlert('ত্রুটি', 'ইউজার তথ্য পাওয়া যাচ্ছে না');
      return;
    }

    // Check if ID is already verified for this session
    if (isIdVerified(user.studentId)) {
      // Proceed with voting directly
      proceedWithVoting(selectedId, currentPosition.id);
    } else {
      // Need ID verification first
      setPendingVote({ candidateId: selectedId, position: currentPosition.id });
      setShowScanner(true);
    }
  };

  const proceedWithVoting = async (candidateId: string, position: Position) => {
    setIsVoting(true);
    console.log('Casting vote for:', candidateId, 'position:', position);
    
    try {
      const success = await castVote(candidateId, position);
      console.log('Vote result:', success);
      
      if (success) {
        setVotedPositions([...votedPositions, position]);
        showAlert('সফল ✓', 'আপনার ভোট সফলভাবে গ্রহণ করা হয়েছে!');
        
        // Move to next position
        if (currentPositionIndex < positions.length - 1) {
          setCurrentPositionIndex(currentPositionIndex + 1);
        }
      } else {
        showAlert('ত্রুটি', 'ভোট দিতে সমস্যা হয়েছে। আপনি হয়তো এই আইডি দিয়ে আগেই ভোট দিয়েছেন।');
      }
    } catch (error) {
      console.error('Vote error:', error);
      showAlert('ত্রুটি', 'ভোট দিতে সমস্যা হয়েছে');
    }
    
    setIsVoting(false);
  };

  const handleScanSuccess = async (scannedId: string) => {
    if (!user || !pendingVote) return;

    try {
      const verified = await verifyStudentId(scannedId, user.studentId);
      if (verified) {
        // Proceed with the pending vote
        proceedWithVoting(pendingVote.candidateId, pendingVote.position);
        setPendingVote(null);
      } else {
        showAlert('ত্রুটি', 'এই আইডি ইতিমধ্যে ভোটে ব্যবহৃত হয়েছে বা আইডি মিলছে না।');
      }
    } catch (error) {
      showAlert('ত্রুটি', 'আইডি যাচাইয়ে সমস্যা হয়েছে');
    }
  };

  if (!electionState.isActive) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.inactiveIcon}>🔒</Text>
        <Text style={styles.inactiveText}>নির্বাচন এখন বন্ধ আছে</Text>
        <Text style={styles.inactiveSubtext}>Election is currently closed</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Position Navigation */}
      <View style={styles.positionNav}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {positions.map((pos, index) => (
            <TouchableOpacity
              key={pos.id}
              style={[
                styles.positionTab,
                index === currentPositionIndex && styles.positionTabActive,
                votedPositions.includes(pos.id) && styles.positionTabVoted,
              ]}
              onPress={() => setCurrentPositionIndex(index)}
            >
              <Text
                style={[
                  styles.positionTabText,
                  index === currentPositionIndex && styles.positionTabTextActive,
                ]}
              >
                {pos.id}
              </Text>
              {votedPositions.includes(pos.id) && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Current Position Header */}
      <View style={styles.positionHeader}>
        <Text style={styles.positionTitleBn}>{currentPosition?.titleBn}</Text>
        <Text style={styles.positionTitle}>{currentPosition?.title}</Text>
        <Text style={styles.positionDesc}>{currentPosition?.description}</Text>
      </View>

      {/* Status Badge */}
      {hasVotedForCurrent && (
        <View style={styles.votedBadge}>
          <Text style={styles.votedBadgeText}>✓ আপনি এই পদে ভোট দিয়েছেন</Text>
        </View>
      )}

      {/* Candidates List */}
      <ScrollView style={styles.candidatesList}>
        {positionCandidates.map((candidate) => (
          <TouchableOpacity
            key={candidate.id}
            style={[
              styles.candidateCard,
              selectedCandidates.get(currentPosition.id) === candidate.id &&
                styles.candidateCardSelected,
              hasVotedForCurrent && styles.candidateCardDisabled,
            ]}
            onPress={() => handleSelectCandidate(candidate.id)}
            disabled={hasVotedForCurrent}
          >
            <View style={styles.candidateSymbol}>
              <Text style={styles.symbolText}>{candidate.symbol}</Text>
            </View>
            <View style={styles.candidateInfo}>
              <Text style={styles.candidateName}>{candidate.name}</Text>
              <Text style={styles.candidateDept}>{candidate.department}</Text>
              <Text style={styles.candidateSession}>Session: {candidate.session}</Text>
            </View>
            {selectedCandidates.get(currentPosition.id) === candidate.id && (
              <View style={styles.selectedMark}>
                <Text style={styles.selectedMarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Vote Button */}
      {!hasVotedForCurrent && (
        <View style={styles.voteButtonContainer}>
          <TouchableOpacity
            style={[
              styles.voteButton,
              (!selectedCandidates.get(currentPosition.id) || isVoting) && styles.voteButtonDisabled,
            ]}
            onPress={handleCastVote}
            disabled={!selectedCandidates.get(currentPosition.id) || isVoting}
          >
            <Text style={styles.voteButtonText}>
              {isVoting ? '⏳ ভোট হচ্ছে...' : '🗳️ ভোট দিন / Cast Vote'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Progress */}
      <View style={styles.progressInfo}>
        <Text style={styles.progressText}>
          {votedPositions.length} / {positions.length} পদে ভোট সম্পন্ন
        </Text>
      </View>

      {/* ID Card Scanner Modal */}
      <IDCardScanner
        visible={showScanner}
        onClose={() => {
          setShowScanner(false);
          setPendingVote(null);
        }}
        onScanSuccess={handleScanSuccess}
        expectedId={user?.studentId || ''}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  inactiveIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  inactiveText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  inactiveSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  positionNav: {
    backgroundColor: '#1a472a',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  positionTab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionTabActive: {
    backgroundColor: '#fff',
  },
  positionTabVoted: {
    backgroundColor: '#4CAF50',
  },
  positionTabText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  positionTabTextActive: {
    color: '#1a472a',
  },
  checkMark: {
    marginLeft: 5,
    color: '#fff',
    fontWeight: 'bold',
  },
  positionHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  positionTitleBn: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a472a',
  },
  positionTitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  positionDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  votedBadge: {
    backgroundColor: '#4CAF50',
    padding: 10,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 10,
  },
  votedBadgeText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  candidatesList: {
    flex: 1,
    padding: 15,
  },
  candidateCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  candidateCardSelected: {
    borderColor: '#1a472a',
    backgroundColor: '#f0f7f0',
  },
  candidateCardDisabled: {
    opacity: 0.6,
  },
  candidateSymbol: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  symbolText: {
    fontSize: 30,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  candidateDept: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  candidateSession: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  selectedMark: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1a472a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedMarkText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  voteButtonContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  voteButton: {
    backgroundColor: '#1a472a',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  voteButtonDisabled: {
    backgroundColor: '#ccc',
  },
  voteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressInfo: {
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  progressText: {
    color: '#666',
    fontSize: 12,
  },
});

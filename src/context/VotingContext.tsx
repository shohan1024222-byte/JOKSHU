import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Candidate, Position, PositionInfo, ElectionState, VotingContextType } from '../types';
import { CANDIDATES, POSITIONS } from '../data/mockData';
import { useAuth } from './AuthContext';

const VotingContext = createContext<VotingContextType | undefined>(undefined);

interface VotingProviderProps {
  children: ReactNode;
}

export const VotingProvider: React.FC<VotingProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>(CANDIDATES);
  const [positions] = useState<PositionInfo[]>(POSITIONS);
  const [electionState, setElectionState] = useState<ElectionState>({
    isActive: true,
    startTime: new Date('2026-01-30T08:00:00'),
    endTime: new Date('2026-01-30T18:00:00'),
    totalVoters: 5000,
    votedCount: 0,
  });

  useEffect(() => {
    loadCandidatesFromStorage();
    loadElectionState();
  }, []);

  const loadCandidatesFromStorage = async () => {
    try {
      const storedCandidates = await AsyncStorage.getItem('candidates');
      if (storedCandidates) {
        setCandidates(JSON.parse(storedCandidates));
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  };

  const loadElectionState = async () => {
    try {
      const storedState = await AsyncStorage.getItem('electionState');
      if (storedState) {
        setElectionState(JSON.parse(storedState));
      }
    } catch (error) {
      console.error('Error loading election state:', error);
    }
  };

  const saveCandidates = async (updatedCandidates: Candidate[]) => {
    try {
      await AsyncStorage.setItem('candidates', JSON.stringify(updatedCandidates));
      setCandidates(updatedCandidates);
    } catch (error) {
      console.error('Error saving candidates:', error);
    }
  };

  const addCandidate = async (candidateData: Omit<Candidate, 'id' | 'votes'>): Promise<boolean> => {
    try {
      const newCandidate: Candidate = {
        ...candidateData,
        id: `cand_${Date.now()}`,
        votes: 0,
      };
      const updatedCandidates = [...candidates, newCandidate];
      await saveCandidates(updatedCandidates);
      return true;
    } catch (error) {
      console.error('Error adding candidate:', error);
      return false;
    }
  };

  const updateCandidate = async (candidateId: string, candidateData: Partial<Candidate>): Promise<boolean> => {
    try {
      const updatedCandidates = candidates.map(candidate => 
        candidate.id === candidateId ? { ...candidate, ...candidateData } : candidate
      );
      await saveCandidates(updatedCandidates);
      return true;
    } catch (error) {
      console.error('Error updating candidate:', error);
      return false;
    }
  };

  const deleteCandidate = async (candidateId: string): Promise<boolean> => {
    try {
      const updatedCandidates = candidates.filter(candidate => candidate.id !== candidateId);
      await saveCandidates(updatedCandidates);
      return true;
    } catch (error) {
      console.error('Error deleting candidate:', error);
      return false;
    }
  };

  // Track ID verification for voting
  const [verifiedVoters, setVerifiedVoters] = useState<Set<string>>(new Set());

  // Check if user has verified their ID for voting
  const isIdVerified = (studentId: string): boolean => {
    // Check both the exact studentId and variations with/without prefixes
    const last9 = studentId.slice(-9);
    
    // Check if any verified voter has the same last 9 digits
    for (const verifiedId of verifiedVoters) {
      if (verifiedId.slice(-9) === last9) {
        return true;
      }
    }
    
    return false;
  };

  // Verify student ID for voting - just checks if ID matches, allows entry anytime
  const verifyStudentId = async (scannedId: string, expectedId: string): Promise<boolean> => {
    // Extract last 9 digits from both IDs for comparison
    const scannedLast9 = scannedId.slice(-9);
    const expectedLast9 = expectedId.slice(-9);
    
    console.log('Verifying ID:', {
      scanned: scannedId,
      expected: expectedId,
      scannedLast9,
      expectedLast9,
      match: scannedLast9 === expectedLast9
    });
    
    if (scannedLast9 === expectedLast9) {
      // ID matches - allow entry (voting restriction will be checked during vote casting)
      // Mark this ID as verified for this session
      setVerifiedVoters(prev => {
        const newSet = new Set(prev);
        newSet.add(expectedId);
        console.log('Added to verified voters:', expectedId);
        console.log('Current verified voters:', Array.from(newSet));
        return newSet;
      });
      return true;
    }
    console.log('ID verification failed: last 9 digits do not match');
    return false;
  };

  const castVote = async (candidateId: string, position: Position): Promise<boolean> => {
    if (!user) return false;

    try {
      // Check if user ID is verified
      if (!isIdVerified(user.studentId)) {
        console.error('User ID not verified for voting');
        return false;
      }

      // Check global voting record to prevent duplicate voting
      const globalVotingRecord = await AsyncStorage.getItem('globalVotingRecord');
      const votingRecord = globalVotingRecord ? JSON.parse(globalVotingRecord) : {};

      if (votingRecord[user.studentId]) {
        console.error('This ID has already been used to vote');
        return false;
      }

      // Check if user already voted for this position
      const storedVotingData = await AsyncStorage.getItem(`voter_${user.studentId}`);
      const votingData = storedVotingData ? JSON.parse(storedVotingData) : { votedPositions: [] };

      if (votingData.votedPositions.includes(position)) {
        return false; // Already voted for this position
      }

      // Update candidate votes
      const updatedCandidates = candidates.map(candidate => {
        if (candidate.id === candidateId) {
          return { ...candidate, votes: candidate.votes + 1 };
        }
        return candidate;
      });

      setCandidates(updatedCandidates);
      await saveCandidates(updatedCandidates);

      // Update user voting record
      votingData.votedPositions.push(position);
      votingData.hasVoted = votingData.votedPositions.length === positions.length;
      await AsyncStorage.setItem(`voter_${user.studentId}`, JSON.stringify(votingData));

      // Update global voting record to prevent reuse of this ID
      votingRecord[user.studentId] = {
        timestamp: new Date().toISOString(),
        positions: votingData.votedPositions,
        hasCompletedVoting: votingData.hasVoted
      };
      await AsyncStorage.setItem('globalVotingRecord', JSON.stringify(votingRecord));

      // If user has completed all voting, remove from verified list
      if (votingData.hasVoted) {
        setVerifiedVoters(prev => {
          const newSet = new Set(prev);
          newSet.delete(user.studentId);
          return newSet;
        });
      }

      // Update election state
      const newState = {
        ...electionState,
        votedCount: electionState.votedCount + 1,
      };
      setElectionState(newState);
      await AsyncStorage.setItem('electionState', JSON.stringify(newState));

      return true;
    } catch (error) {
      console.error('Error casting vote:', error);
      return false;
    }
  };

  const hasVotedForPosition = (position: Position): boolean => {
    if (!user) return false;
    return user.votedPositions?.includes(position) || false;
  };

  const getResults = (): Map<Position, Candidate[]> => {
    const results = new Map<Position, Candidate[]>();

    positions.forEach(pos => {
      const positionCandidates = candidates
        .filter(c => c.position === pos.id)
        .sort((a, b) => b.votes - a.votes);
      results.set(pos.id, positionCandidates);
    });

    return results;
  };

    return (
    <VotingContext.Provider
      value={{
        candidates,
        positions,
        electionState,
        castVote,
        getResults,
        hasVotedForPosition,
        addCandidate,
        updateCandidate,
        deleteCandidate,
        verifyStudentId,
        isIdVerified,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};

export const useVoting = (): VotingContextType => {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
};

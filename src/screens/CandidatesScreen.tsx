import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useVoting } from '../context';
import { Position, Candidate } from '../types';

export const CandidatesScreen: React.FC = () => {
  const { candidates, positions } = useVoting();
  const [selectedPosition, setSelectedPosition] = useState<Position | 'all'>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const filteredCandidates = selectedPosition === 'all'
    ? candidates
    : candidates.filter(c => c.position === selectedPosition);

  return (
    <View style={styles.container}>
      {/* Position Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedPosition === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedPosition('all')}
          >
            <Text
              style={[
                styles.filterText,
                selectedPosition === 'all' && styles.filterTextActive,
              ]}
            >
              সকল
            </Text>
          </TouchableOpacity>
          
          {positions.map((pos) => (
            <TouchableOpacity
              key={pos.id}
              style={[
                styles.filterButton,
                selectedPosition === pos.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedPosition(pos.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedPosition === pos.id && styles.filterTextActive,
                ]}
              >
                {pos.id}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Candidates Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          মোট প্রার্থী: {filteredCandidates.length} জন
        </Text>
      </View>

      {/* Candidates List */}
      <ScrollView style={styles.candidatesList}>
        {filteredCandidates.map((candidate) => {
          const position = positions.find(p => p.id === candidate.position);
          return (
            <TouchableOpacity
              key={candidate.id}
              style={styles.candidateCard}
              onPress={() => setSelectedCandidate(candidate)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.symbolContainer}>
                  <Text style={styles.symbol}>{candidate.symbol}</Text>
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.candidateName}>{candidate.name}</Text>
                  <View style={styles.positionBadge}>
                    <Text style={styles.positionBadgeText}>
                      {position?.titleBn}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📚 বিভাগ:</Text>
                  <Text style={styles.infoValue}>{candidate.department}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📅 সেশন:</Text>
                  <Text style={styles.infoValue}>{candidate.session}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>🆔 ID:</Text>
                  <Text style={styles.infoValue}>{candidate.studentId}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.viewMore}>বিস্তারিত দেখুন →</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Candidate Detail Modal */}
      <Modal
        visible={selectedCandidate !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedCandidate(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedCandidate && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalSymbol}>
                    <Text style={styles.modalSymbolText}>
                      {selectedCandidate.symbol}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedCandidate(null)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalName}>{selectedCandidate.name}</Text>
                
                <View style={styles.modalPositionBadge}>
                  <Text style={styles.modalPositionText}>
                    {positions.find(p => p.id === selectedCandidate.position)?.titleBn}
                  </Text>
                </View>

                <View style={styles.modalInfo}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoIcon}>📚</Text>
                    <View>
                      <Text style={styles.modalInfoLabel}>বিভাগ</Text>
                      <Text style={styles.modalInfoValue}>
                        {selectedCandidate.department}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoIcon}>📅</Text>
                    <View>
                      <Text style={styles.modalInfoLabel}>সেশন</Text>
                      <Text style={styles.modalInfoValue}>
                        {selectedCandidate.session}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoIcon}>🆔</Text>
                    <View>
                      <Text style={styles.modalInfoLabel}>Student ID</Text>
                      <Text style={styles.modalInfoValue}>
                        {selectedCandidate.studentId}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.manifestoContainer}>
                  <Text style={styles.manifestoTitle}>📜 ইশতেহার / Manifesto</Text>
                  <Text style={styles.manifestoText}>
                    {selectedCandidate.manifesto}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setSelectedCandidate(null)}
                >
                  <Text style={styles.modalCloseButtonText}>বন্ধ করুন</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    backgroundColor: '#1a472a',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterButtonActive: {
    backgroundColor: '#fff',
  },
  filterText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  filterTextActive: {
    color: '#1a472a',
  },
  countContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  countText: {
    fontSize: 14,
    color: '#666',
  },
  candidatesList: {
    flex: 1,
    padding: 15,
  },
  candidateCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  symbolContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  symbol: {
    fontSize: 28,
  },
  headerInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  positionBadge: {
    backgroundColor: '#1a472a',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  positionBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  cardBody: {
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 80,
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  cardFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  viewMore: {
    color: '#1a472a',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  modalSymbol: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSymbolText: {
    fontSize: 40,
  },
  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  modalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalPositionBadge: {
    backgroundColor: '#1a472a',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  modalPositionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalInfo: {
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalInfoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  modalInfoLabel: {
    fontSize: 11,
    color: '#666',
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  manifestoContainer: {
    backgroundColor: '#f0f7f0',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  manifestoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a472a',
    marginBottom: 10,
  },
  manifestoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  modalCloseButton: {
    backgroundColor: '#1a472a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

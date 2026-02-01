import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useVoting, useAuth } from '../context';
import { Position } from '../types';

export const ResultsScreen: React.FC = () => {
  const { candidates, positions, electionState } = useVoting();
  const { isAdmin } = useAuth();
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  const getPositionResults = (positionId: Position) => {
    return candidates
      .filter(c => c.position === positionId)
      .sort((a, b) => b.votes - a.votes);
  };

  const getTotalVotesForPosition = (positionId: Position) => {
    return candidates
      .filter(c => c.position === positionId)
      .reduce((sum, c) => sum + c.votes, 0);
  };

  const getWinner = (positionId: Position) => {
    const results = getPositionResults(positionId);
    return results.length > 0 ? results[0] : null;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsHeader}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{electionState.votedCount}</Text>
          <Text style={styles.statLabel}>মোট ভোট</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{electionState.totalVoters}</Text>
          <Text style={styles.statLabel}>মোট ভোটার</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Math.round((electionState.votedCount / electionState.totalVoters) * 100)}%
          </Text>
          <Text style={styles.statLabel}>অংশগ্রহণ</Text>
        </View>
      </View>

      {/* Info Banner */}
      {!isAdmin && (
        <View style={styles.infoBanner}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            সম্পূর্ণ ফলাফল নির্বাচন শেষে প্রকাশিত হবে
          </Text>
        </View>
      )}

      {/* Results by Position */}
      <View style={styles.resultsContainer}>
        <Text style={styles.sectionTitle}>📊 পদভিত্তিক ফলাফল</Text>

        {positions.map((position) => {
          const results = getPositionResults(position.id);
          const totalVotes = getTotalVotesForPosition(position.id);
          const winner = getWinner(position.id);
          const isExpanded = selectedPosition === position.id;

          return (
            <View key={position.id} style={styles.positionCard}>
              <TouchableOpacity
                style={styles.positionHeader}
                onPress={() =>
                  setSelectedPosition(isExpanded ? null : position.id)
                }
              >
                <View style={styles.positionTitleContainer}>
                  <Text style={styles.positionTitleBn}>{position.titleBn}</Text>
                  <Text style={styles.positionTitle}>{position.title}</Text>
                </View>
                <View style={styles.positionMeta}>
                  <Text style={styles.voteCount}>{totalVotes} ভোট</Text>
                  <Text style={styles.expandIcon}>
                    {isExpanded ? '▲' : '▼'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Winner Preview */}
              {winner && winner.votes > 0 && (
                <View style={styles.winnerPreview}>
                  <Text style={styles.winnerSymbol}>{winner.symbol}</Text>
                  <View style={styles.winnerInfo}>
                    <Text style={styles.winnerName}>{winner.name}</Text>
                    <Text style={styles.winnerVotes}>
                      {isAdmin ? `${winner.votes} ভোট` : 'অগ্রগামী'}
                    </Text>
                  </View>
                  <View style={styles.leadBadge}>
                    <Text style={styles.leadBadgeText}>🏆</Text>
                  </View>
                </View>
              )}

              {/* Expanded Results */}
              {isExpanded && (
                <View style={styles.expandedResults}>
                  {results.map((candidate, index) => {
                    const percentage =
                      totalVotes > 0
                        ? Math.round((candidate.votes / totalVotes) * 100)
                        : 0;

                    return (
                      <View key={candidate.id} style={styles.resultRow}>
                        <View style={styles.rankContainer}>
                          <Text
                            style={[
                              styles.rank,
                              index === 0 && styles.rankFirst,
                            ]}
                          >
                            {index + 1}
                          </Text>
                        </View>

                        <View style={styles.candidateInfo}>
                          <Text style={styles.candidateSymbol}>
                            {candidate.symbol}
                          </Text>
                          <View style={styles.candidateDetails}>
                            <Text style={styles.candidateName}>
                              {candidate.name}
                            </Text>
                            <Text style={styles.candidateDept}>
                              {candidate.department}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.voteInfo}>
                          {isAdmin ? (
                            <>
                              <Text style={styles.voteNumber}>
                                {candidate.votes}
                              </Text>
                              <Text style={styles.votePercentage}>
                                ({percentage}%)
                              </Text>
                            </>
                          ) : (
                            <View style={styles.hiddenVote}>
                              <Text style={styles.hiddenVoteText}>***</Text>
                            </View>
                          )}
                        </View>

                        {/* Progress Bar */}
                        {isAdmin && (
                          <View style={styles.progressBarContainer}>
                            <View
                              style={[
                                styles.progressBar,
                                {
                                  width: `${percentage}%`,
                                  backgroundColor:
                                    index === 0 ? '#4CAF50' : '#1a472a',
                                },
                              ]}
                            />
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Footer Note */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          📌 এই ফলাফল রিয়েল-টাইম আপডেট হয়
        </Text>
        <Text style={styles.footerSubtext}>
          জগন্নাথ বিশ্ববিদ্যালয় কেন্দ্রীয় ছাত্র সংসদ নির্বাচন
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a472a',
    paddingVertical: 25,
    paddingHorizontal: 15,
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 12,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#856404',
  },
  resultsContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  positionCard: {
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
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  positionTitleContainer: {
    flex: 1,
  },
  positionTitleBn: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a472a',
  },
  positionTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  positionMeta: {
    alignItems: 'flex-end',
  },
  voteCount: {
    fontSize: 12,
    color: '#666',
  },
  expandIcon: {
    fontSize: 10,
    color: '#999',
    marginTop: 3,
  },
  winnerPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  winnerSymbol: {
    fontSize: 30,
    marginRight: 12,
  },
  winnerInfo: {
    flex: 1,
  },
  winnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  winnerVotes: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 2,
  },
  leadBadge: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#FFF3CD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leadBadgeText: {
    fontSize: 18,
  },
  expandedResults: {
    padding: 10,
  },
  resultRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankContainer: {
    position: 'absolute',
    left: 12,
    top: 12,
  },
  rank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  rankFirst: {
    backgroundColor: '#ffd700',
    color: '#333',
  },
  candidateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 35,
  },
  candidateSymbol: {
    fontSize: 24,
    marginRight: 10,
  },
  candidateDetails: {
    flex: 1,
  },
  candidateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  candidateDept: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  voteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 35,
    marginTop: 8,
  },
  voteNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a472a',
  },
  votePercentage: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  hiddenVote: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
  },
  hiddenVoteText: {
    color: '#999',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginLeft: 35,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    alignItems: 'center',
    padding: 25,
  },
  footerText: {
    fontSize: 14,
    color: '#1a472a',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});

// JOKSU Election Types

export interface Student {
  id: string;
  studentId: string;
  name: string;
  department: string;
  session: string;
  hasVoted: boolean;
  votedPositions: string[];
}

export interface Candidate {
  id: string;
  name: string;
  studentId: string;
  position: Position;
  department: string;
  session: string;
  image?: string;
  manifesto: string;
  votes: number;
  symbol: string;
}

export type Position = 
  | 'VP' // Vice President (সহ-সভাপতি)
  | 'GS' // General Secretary (সাধারণ সম্পাদক)
  | 'AGS' // Assistant General Secretary (সহ-সাধারণ সম্পাদক)
  | 'OS' // Organizing Secretary (সাংগঠনিক সম্পাদক)
  | 'PS' // Publicity Secretary (প্রচার সম্পাদক)
  | 'SS' // Social Service Secretary (সমাজসেবা সম্পাদক)
  | 'CS' // Cultural Secretary (সাংস্কৃতিক সম্পাদক)
  | 'SPS' // Sports Secretary (ক্রীড়া সম্পাদক)
  | 'IS' // International Secretary (আন্তর্জাতিক সম্পাদক)
  | 'LS'; // Library Secretary (গ্রন্থাগার সম্পাদক)

export interface PositionInfo {
  id: Position;
  title: string;
  titleBn: string;
  description: string;
}

export interface Vote {
  id: string;
  voterId: string;
  candidateId: string;
  position: Position;
  timestamp: Date;
}

export interface ElectionState {
  isActive: boolean;
  startTime: Date | null;
  endTime: Date | null;
  totalVoters: number;
  votedCount: number;
}

export interface AuthContextType {
  user: Student | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (studentId: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export interface VotingContextType {
  candidates: Candidate[];
  positions: PositionInfo[];
  electionState: ElectionState;
  castVote: (candidateId: string, position: Position) => Promise<boolean>;
  getResults: () => Map<Position, Candidate[]>;
  hasVotedForPosition: (position: Position) => boolean;
  addCandidate: (candidateData: Omit<Candidate, 'id' | 'votes'>) => Promise<boolean>;
  updateCandidate: (candidateId: string, candidateData: Partial<Candidate>) => Promise<boolean>;
  deleteCandidate: (candidateId: string) => Promise<boolean>;
  verifyStudentId: (scannedId: string, expectedId: string) => Promise<boolean>;
  isIdVerified: (studentId: string) => boolean;
}

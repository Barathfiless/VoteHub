import { database } from './config';
import { ref, set, get, update, remove, onValue } from 'firebase/database';
import { Election, Candidate } from '@/context/ElectionContext';

const ELECTIONS_PATH = 'elections';

// Add a new election
export const addElectionToFirebase = async (election: Election): Promise<void> => {
  try {
    const electionRef = ref(database, `${ELECTIONS_PATH}/${election.id}`);
    await set(electionRef, election);
  } catch (error) {
    console.error('Error adding election to Firebase:', error);
    throw error;
  }
};

// Get all elections
export const getAllElectionsFromFirebase = async (): Promise<Election[]> => {
  try {
    const electionsRef = ref(database, ELECTIONS_PATH);
    const snapshot = await get(electionsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data) as Election[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching elections from Firebase:', error);
    throw error;
  }
};

// Get a single election
export const getElectionFromFirebase = async (electionId: string): Promise<Election | null> => {
  try {
    const electionRef = ref(database, `${ELECTIONS_PATH}/${electionId}`);
    const snapshot = await get(electionRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as Election;
    }
    return null;
  } catch (error) {
    console.error('Error fetching election from Firebase:', error);
    throw error;
  }
};

// Update an election
export const updateElectionInFirebase = async (electionId: string, updates: Partial<Election>): Promise<void> => {
  try {
    const electionRef = ref(database, `${ELECTIONS_PATH}/${electionId}`);
    await update(electionRef, updates);
  } catch (error) {
    console.error('Error updating election in Firebase:', error);
    throw error;
  }
};

// Delete an election
export const deleteElectionFromFirebase = async (electionId: string): Promise<void> => {
  try {
    const electionRef = ref(database, `${ELECTIONS_PATH}/${electionId}`);
    await remove(electionRef);
  } catch (error) {
    console.error('Error deleting election from Firebase:', error);
    throw error;
  }
};

// Listen to real-time updates
export const listenToElections = (callback: (elections: Election[]) => void): (() => void) => {
  try {
    const electionsRef = ref(database, ELECTIONS_PATH);
    
    const unsubscribe = onValue(electionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const elections = Object.values(data) as Election[];
        callback(elections);
      } else {
        callback([]);
      }
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up real-time listener:', error);
    throw error;
  }
};

// Update candidate votes
export const updateCandidateVotes = async (
  electionId: string,
  candidateId: string,
  newVotes: number
): Promise<void> => {
  try {
    const candidateRef = ref(database, `${ELECTIONS_PATH}/${electionId}/candidates/${candidateId}/votes`);
    await set(candidateRef, newVotes);
  } catch (error) {
    console.error('Error updating candidate votes:', error);
    throw error;
  }
};

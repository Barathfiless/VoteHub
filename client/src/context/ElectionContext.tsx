import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import {
  addElectionToMongo,
  getAllElectionsFromMongo,
  updateElectionInMongo,
  deleteElectionFromMongo,
} from '@/integrations/mongo/electionService';

export interface Candidate {
  id: string;
  name: string;
  photo: string | null;
  bio: string;
  department: string;
  year: string;
  manifesto: string;
  votes: number;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  department: string;
  standing_post: string;
  logo_url: string | null;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'active' | 'completed';
  resultsPublished?: boolean; // New field to control result visibility
  created_by: string;
  candidates: Candidate[];
  created_at: string;
}

interface ElectionContextType {
  elections: Election[];
  addElection: (election: Election) => Promise<void>;
  updateElection: (id: string, election: Partial<Election>) => Promise<void>;
  deleteElection: (id: string) => Promise<void>;
  getElection: (id: string) => Election | undefined;
  getTotalVotes: () => number;
  getActiveElections: () => number;
  getScheduledElections: () => number;
  getParticipationRate: () => number;
  loading: boolean;
  refreshElections: () => Promise<void>;
}

const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

export const ElectionProvider = ({ children }: { children: ReactNode }) => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshElections = async () => {
    try {
      setLoading(true);
      const data = await getAllElectionsFromMongo();
      setElections(data);
    } catch (error) {
      console.error('Error loading elections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshElections();
  }, []);

  const addElection = async (election: Election) => {
    try {
      await addElectionToMongo(election);
      await refreshElections();
    } catch (error) {
      console.error('Error adding election:', error);
      throw error;
    }
  };

  const updateElection = async (id: string, updates: Partial<Election>) => {
    try {
      await updateElectionInMongo(id, updates);
      await refreshElections();
    } catch (error) {
      console.error('Error updating election:', error);
      throw error;
    }
  };

  const deleteElection = async (id: string) => {
    try {
      await deleteElectionFromMongo(id);
      await refreshElections();
    } catch (error) {
      console.error('Error deleting election:', error);
      throw error;
    }
  };

  const getElection = (id: string) => {
    return elections.find(e => e.id === id);
  };

  const getTotalVotes = () => {
    return elections.reduce((total, election) => {
      return total + election.candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
    }, 0);
  };

  const getActiveElections = () => {
    return elections.filter(e => e.status === 'active').length;
  };

  const getScheduledElections = () => {
    return elections.filter(e => e.status === 'scheduled').length;
  };

  const getParticipationRate = () => {
    const totalVotes = getTotalVotes();
    return totalVotes > 0 ? Math.round((totalVotes / 100) * 100) : 0;
  };

  return (
    <ElectionContext.Provider
      value={{
        elections,
        addElection,
        updateElection,
        deleteElection,
        getElection,
        getTotalVotes,
        getActiveElections,
        getScheduledElections,
        getParticipationRate,
        loading,
        refreshElections,
      }}
    >
      {children}
    </ElectionContext.Provider>
  );
};

export const useElections = () => {
  const context = useContext(ElectionContext);
  if (!context) {
    throw new Error('useElections must be used within ElectionProvider');
  }
  return context;
};

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Competitor, Competition } from '../types';

// Competition service
export const competitionService = {
  // Create a new competition
  async createCompetition(competition: Omit<Competition, 'id'>, userId: string) {
    try {
      const docRef = await addDoc(collection(db, 'competitions'), {
        ...competition,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating competition:', error);
      throw error;
    }
  },

  // Get all competitions for a user
  async getUserCompetitions(userId: string): Promise<Competition[]> {
    try {
      const q = query(
        collection(db, 'competitions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Competition[];
    } catch (error) {
      console.error('Error fetching competitions:', error);
      throw error;
    }
  },

  // Update competition
  async updateCompetition(competitionId: string, updates: Partial<Competition>) {
    try {
      const competitionRef = doc(db, 'competitions', competitionId);
      await updateDoc(competitionRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating competition:', error);
      throw error;
    }
  },

  // Delete competition
  async deleteCompetition(competitionId: string) {
    try {
      await deleteDoc(doc(db, 'competitions', competitionId));
    } catch (error) {
      console.error('Error deleting competition:', error);
      throw error;
    }
  },

  // Listen to competition changes
  subscribeToCompetitions(userId: string, callback: (competitions: Competition[]) => void) {
    const q = query(
      collection(db, 'competitions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const competitions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Competition[];
      callback(competitions);
    });
  }
};

// Competitor service
export const competitorService = {
  // Add competitor to competition
  async addCompetitor(competitor: Omit<Competitor, 'id'>, competitionId: string) {
    try {
      const docRef = await addDoc(collection(db, 'competitors'), {
        ...competitor,
        competitionId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding competitor:', error);
      throw error;
    }
  },

  // Get competitors for a competition
  async getCompetitionCompetitors(competitionId: string): Promise<Competitor[]> {
    try {
      const q = query(
        collection(db, 'competitors'),
        where('competitionId', '==', competitionId),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Competitor[];
    } catch (error) {
      console.error('Error fetching competitors:', error);
      throw error;
    }
  },

  // Update competitor
  async updateCompetitor(competitorId: string, updates: Partial<Competitor>) {
    try {
      const competitorRef = doc(db, 'competitors', competitorId);
      await updateDoc(competitorRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating competitor:', error);
      throw error;
    }
  },

  // Delete competitor
  async deleteCompetitor(competitorId: string) {
    try {
      await deleteDoc(doc(db, 'competitors', competitorId));
    } catch (error) {
      console.error('Error deleting competitor:', error);
      throw error;
    }
  },

  // Update competitor score
  async updateScore(competitorId: string, eventId: string, score: number) {
    try {
      const competitorRef = doc(db, 'competitors', competitorId);
      await updateDoc(competitorRef, {
        [`scores.${eventId}`]: score,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating score:', error);
      throw error;
    }
  },

  // Listen to competitor changes
  subscribeToCompetitors(competitionId: string, callback: (competitors: Competitor[]) => void) {
    const q = query(
      collection(db, 'competitors'),
      where('competitionId', '==', competitionId),
      orderBy('name')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const competitors = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Competitor[];
      callback(competitors);
    });
  }
};
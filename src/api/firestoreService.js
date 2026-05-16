import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export const firestoreService = {
  // User Profiles
  saveUserProfile: async (userId, profileData) => {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Error saving user profile: ", error);
      throw error;
    }
  },

  getUserProfile: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      return userSnap.exists() ? userSnap.data() : null;
    } catch (error) {
      console.error("Error getting user profile: ", error);
      return null;
    }
  },

  // Groups
  createGroup: async (groupData, creatorId) => {
    try {
      const groupRef = await addDoc(collection(db, 'groups'), {
        ...groupData,
        createdBy: creatorId,
        members: [creatorId],
        createdAt: serverTimestamp(),
        balances: {} 
      });
      return groupRef.id;
    } catch (error) {
      console.error("Error creating group: ", error);
      throw error;
    }
  },

  getUserGroups: async (userId) => {
    try {
      const q = query(collection(db, 'groups'), where('members', 'array-contains', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting user groups: ", error);
      throw error;
    }
  },

  joinGroup: async (groupId, userId) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(userId)
      });
    } catch (error) {
      console.error("Error joining group: ", error);
      throw error;
    }
  },

  getGroupDetails: async (groupId) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupSnap = await getDoc(groupRef);
      return groupSnap.exists() ? { id: groupSnap.id, ...groupSnap.data() } : null;
    } catch (error) {
      console.error("Error getting group details: ", error);
      throw error;
    }
  },

  // Expenses
  addExpense: async (groupId, expenseData) => {
    try {
      const expenseRef = await addDoc(collection(db, 'expenses'), {
        ...expenseData,
        groupId,
        createdAt: serverTimestamp()
      });
      return expenseRef.id;
    } catch (error) {
      console.error("Error adding expense: ", error);
      throw error;
    }
  },

  getGroupExpenses: async (groupId) => {
    try {
      const q = query(collection(db, 'expenses'), where('groupId', '==', groupId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting group expenses: ", error);
      throw error;
    }
  },

  getUserExpenses: async (userId) => {
    try {
      // Đầu tiên lấy danh sách các nhóm mà user tham gia
      const qGroups = query(collection(db, 'groups'), where('members', 'array-contains', userId));
      const groupSnapshot = await getDocs(qGroups);
      const groupIds = groupSnapshot.docs.map(doc => doc.id);

      if (groupIds.length === 0) return [];

      // Sau đó lấy tất cả hóa đơn thuộc các nhóm đó
      const qExpenses = query(collection(db, 'expenses'), where('groupId', 'in', groupIds));
      const expenseSnapshot = await getDocs(qExpenses);
      return expenseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting user expenses: ", error);
      return [];
    }
  },

  deleteExpense: async (expenseId) => {
    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
    } catch (error) {
      console.error("Error deleting expense: ", error);
      throw error;
    }
  },

  deleteGroup: async (groupId) => {
    try {
      const groupRef = doc(db, 'groups', groupId);
      await deleteDoc(groupRef);
    } catch (error) {
      console.error("Error deleting group: ", error);
      throw error;
    }
  }
};

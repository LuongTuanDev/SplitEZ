import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../api/firebase';
import { firestoreService } from '../api/firestoreService';

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  setProfile: (profile) => set({ profile }),

  setUser: (user) => set({ user, loading: false }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profile = await firestoreService.getUserProfile(result.user.uid);
      set({ user: result.user, profile, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  register: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Tạo profile mặc định
      const defaultProfile = { displayName: email.split('@')[0], email };
      await firestoreService.saveUserProfile(result.user.uid, defaultProfile);
      set({ user: result.user, profile: defaultProfile, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, profile: null });
  },

  init: () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await firestoreService.getUserProfile(user.uid);
        set({ user, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    });
  }
}));

export default useAuthStore;

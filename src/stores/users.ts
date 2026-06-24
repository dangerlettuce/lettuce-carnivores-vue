import type { User as fbUser } from 'firebase/auth';
import { defineStore } from 'pinia';
import {
  fbAuthStateListener,
  fbCreateAccount,
  fbSetUserProfile,
  fbSignIn,
  fbSignOut,
  requestPasswordResetEmail,
  fbSignInAnonymously,
  fbSignInWithGoogle,
} from '@/apis/firebaseAuth';
import { findDocById } from '@/apis/dataServices';
import type { Profile } from '@/types/Users';

interface State {
  user: fbUser | null;
  userRoles: any;
  profile: Profile | null;
  error: null;
  isUserLoading: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): State => ({
    user: null,
    userRoles: null,
    profile: null,
    error: null,
    isUserLoading: false,
  }),
  getters: {
    isLoggedIn: (state) => state.user !== null && !state.user.isAnonymous,
    isLoggedInOrAnonymous: (state) => state.user !== null,
    isAdmin: (state) => state.userRoles?.admin,
    isFamily: (state) => state.userRoles?.family,
    userError: (state) => state.error,
    getUserProfile: (state) => state.profile,
  },
  actions: {
    initializeAuthListener() {
      return new Promise((resolve) => {
        fbAuthStateListener(async (user: any) => {
          this.user = user ? user : null;
          if (user) {
            this.fetchUserDetails(user.uid);
          }
          resolve(true);
        });
      });
    },
    async createAccount(email: string, password: string) {
      try {
        const user = await fbCreateAccount(email, password);
        this.user = user ? user : null;
        this.error = null;
        return true;
      } catch (e: any) {
        this.user = null;
        this.error = e;
        console.log(e);
        return false;
      }
    },
    async setUserProfile(userProfile: Profile) {
      try {
        await fbSetUserProfile({ profile: userProfile });
        this.profile = userProfile ? userProfile : null;
        this.error = null;
        return true;
      } catch (e: any) {
        this.profile = null;
        this.error = e;
        console.log(e);
        return false;
      }
    },
    async logInUser(email: string, password: string) {
      this.isUserLoading = true;
      try {
        const response = await fbSignIn(email, password);
        this.user = response.user ? response.user : null;
        this.fetchUserDetails(response.user.uid);
        this.error = null;
        return true;
      } catch (e: any) {
        this.user = null;
        this.userRoles = null;
        this.error = e;
        return false;
      } finally {
        this.isUserLoading = false;
      }
    },
    async loginWithGoogle() {
      this.isUserLoading = true;
      try {
        const res = await fbSignInWithGoogle();
        this.user = res.user ? res.user : null;
        return res;
      } catch (e: any) {
        console.error(e);
        return { success: false, error: true, message: 'Unable to sign in' };
      } finally {
        this.isUserLoading = false;
      }
    },
    async loginAnonymously() {
      this.isUserLoading = true;
      try {
        const res = await fbSignInAnonymously();
        this.user = res.user ? res.user : null;
        return res;
      } catch (e: any) {
        console.error(e);
        return { success: false, error: true, message: e.message };
      } finally {
        this.isUserLoading = false;
      }
    },

    async requestPasswordReset(email: string) {
      const res = await requestPasswordResetEmail(email);
      if (res) {
        return res;
      }
    },

    async logoutUser() {
      try {
        await fbSignOut();
        this.user = null;
        this.userRoles = null;
        this.profile = null;
        this.error = null;
        return true;
      } catch (e: any) {
        this.error = e;
        return false;
      }
    },
    async fetchUserDetails(userId: string) {
      if (!userId) return;
      try {
        const res = await findDocById<{ profile: Profile; roles: { (key: string): boolean }[] }>('users', userId);
        if (res) {
          this.userRoles = res.roles;
          this.profile = res.profile;
        }
      } catch (e) {
        console.log(e);
        return;
      }
    },
  },
});

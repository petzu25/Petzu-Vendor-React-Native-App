import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../lib/axios';

export const useAuthStore = create((set, get) => ({
  authUser: null,
  role: null,
  isLoggingIn: false,
  isSigningUp: false,
  isCheckingAuth: true,
  vendorProfile: null,

  checkAuth: async () => {
    try {
      set({ isCheckingAuth: true });
      const activeRole = await AsyncStorage.getItem('activeRole');
      if (activeRole) {
        const userDataJson = await AsyncStorage.getItem(activeRole);
        if (userDataJson) {
          const parsedUser = JSON.parse(userDataJson);

          const roleDisplayMap = {
            admin: 'admin',
            vendor: 'Vendor',
            doctor: 'Vet Hospital',
            'vet hospital': 'Vet Hospital',
            vethospital: 'Vet Hospital',
            'pet trainer': 'Pet Trainer',
            pettrainer: 'Pet Trainer',
            'pet grooming shop': 'Pet Grooming Shop',
            petgroomingshop: 'Pet Grooming Shop',
            'pet boarding': 'Pet Boarding Shop',
            petboarding: 'Pet Boarding Shop',
            'pet boarding shop': 'Pet Boarding Shop',
            petboardingshop: 'Pet Boarding Shop',
          };

          const roleDisplay = roleDisplayMap[activeRole.toLowerCase()] || activeRole;

          set({ authUser: parsedUser, role: roleDisplay });

          if (['vendor', 'petgroomingshop', 'petboarding'].includes(activeRole.toLowerCase())) {
            set({ vendorProfile: parsedUser });
          }
        }
      }
    } catch (error) {
      console.error('Error checking authentication state:', error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axios.post('/vendors/signup', data);
      if (res.data && res.data.userId) {
        return {
          success: true,
          message: res.data.message || `${data.accountType} registration successful!`,
        };
      }
      return { success: false, message: 'Invalid server response format' };
    } catch (error) {
      console.error('Signup error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'An error occurred during registration';
      return { success: false, message: errorMessage };
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      let res;
      try {
        res = await axios.post('/auth/login', data);
      } catch (err) {
        const status = err?.response?.status;
        const shouldFallback = status === 400 || status === 401 || status === 404;
        if (!shouldFallback) throw err;
      }

      if (!res) {
        res = await axios.post('/vendors/login', data);
      }

      if (res.data && res.data.user && res.data.role) {
        const { user } = res.data;
        const roleFromApi = res.data.role;
        const roleNormalized = roleFromApi.toString().toLowerCase();

        const displayRoleMap = {
          admin: 'admin',
          vendor: 'Vendor',
          doctor: 'Vet Hospital',
          'vet hospital': 'Vet Hospital',
          vethospital: 'Vet Hospital',
          'pet trainer': 'Pet Trainer',
          pettrainer: 'Pet Trainer',
          'pet grooming shop': 'Pet Grooming Shop',
          petgroomingshop: 'Pet Grooming Shop',
          'pet boarding': 'Pet Boarding Shop',
          petboarding: 'Pet Boarding Shop',
          'pet boarding shop': 'Pet Boarding Shop',
          petboardingshop: 'Pet Boarding Shop',
        };

        const storageKeyMap = {
          admin: 'admin',
          vendor: 'vendor',
          doctor: 'doctor',
          'vet hospital': 'doctor',
          vethospital: 'doctor',
          'pet trainer': 'petTrainer',
          pettrainer: 'petTrainer',
          'pet grooming shop': 'petGroomingShop',
          petgroomingshop: 'petGroomingShop',
          'pet boarding': 'petBoarding',
          petboarding: 'petBoarding',
          'pet boarding shop': 'petBoarding',
          petboardingshop: 'petBoarding',
        };

        const displayRole = displayRoleMap[roleNormalized] || roleFromApi;
        const storageKey = storageKeyMap[roleNormalized] || 'vendor';

        set({ authUser: user, role: displayRole });

        await AsyncStorage.setItem(storageKey, JSON.stringify(user));
        await AsyncStorage.setItem('activeRole', storageKey);

        if (['vendor', 'petgroomingshop', 'petboarding'].includes(storageKey)) {
          set({ vendorProfile: user });
        }

        return { success: true, message: 'Login successful' };
      }
      return { success: false, message: 'Invalid response format' };
    } catch (error) {
      console.error('Login error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Invalid email or password';
      const requiresAccountType = error.response?.data?.requiresAccountType || false;
      return { success: false, message: errorMessage, requiresAccountType };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      const { role } = get();
      const roleNormalized = (role || '').toString().toLowerCase();

      if (roleNormalized === 'admin') {
        try {
          await axios.post('/auth/logoutAdmin');
        } catch (err) {
          console.warn('Network logout failed:', err);
        }
        await AsyncStorage.removeItem('admin');
        await AsyncStorage.removeItem('activeRole');
      } else {
        try {
          await axios.post('/vendors/logout');
        } catch (err) {
          console.warn('Network logout failed:', err);
        }
        const keys = [
          'vendor',
          'doctor',
          'petTrainer',
          'petGroomingShop',
          'petBoarding',
          'activeRole',
        ];
        for (const key of keys) {
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ authUser: null, role: null, vendorProfile: null });
    }
  },

  getVendorId: () => {
    const { authUser } = get();
    return authUser?.vendorId || authUser?.petGroomingShopId || null;
  },
}));

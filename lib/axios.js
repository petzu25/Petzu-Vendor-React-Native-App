import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosInstance = axios.create({
  baseURL: 'https://petzuwebsite-vendor-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to dynamically add the JWT token from AsyncStorage
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const activeRole = await AsyncStorage.getItem('activeRole');
      if (activeRole) {
        const userDataJson = await AsyncStorage.getItem(activeRole);
        if (userDataJson) {
          const userData = JSON.parse(userDataJson);
          if (userData && userData.token) {
            config.headers.Authorization = `Bearer ${userData.token}`;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching auth token in axios interceptor:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;

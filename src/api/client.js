import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Point this at your ngrok tunnel while developing, or your Cloud Run URL in prod.
// Kept as a separate constant so it's a one-line change (or wire to app config / env).
export const API_BASE_URL = 'https://feel-gumminess-amends.ngrok-free.dev';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach the stored JWT to every request once the rider is logged in.
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('itrola_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth ---
export const requestOtp = (phone) => apiClient.post('/auth/request-otp', { phone });

export const verifyOtp = (phone, otp, role = 'rider') =>
  apiClient.post('/auth/verify-otp', { phone, otp, role });

// --- Trips ---
export const requestTrip = ({ pickup_lat, pickup_lng, dropoff_lat, dropoff_lng }) =>
  apiClient.post('/trips/request', { pickup_lat, pickup_lng, dropoff_lat, dropoff_lng });

export const getTrip = (tripId) => apiClient.get(`/trips/${tripId}`);

export const cancelTrip = (tripId) => apiClient.post(`/trips/${tripId}/cancel`);

// --- Payments ---
export const payForTrip = (tripId, momo_number, network) =>
  apiClient.post(`/trips/${tripId}/pay`, { momo_number, network });

export default apiClient;

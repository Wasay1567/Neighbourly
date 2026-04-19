import axios from 'axios';
import { API_URL } from '../conf/conf';

const api = axios.create({
  baseURL: API_URL,
});

//automatically add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============= AUTH ENDPOINTS =============
export const authLogin = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const authRegister = async (payload) => {
  const response = await api.post('/auth/register', payload);
  return response.data;
};

export const authGetProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const authUpdateProfile = async (payload) => {
  const response = await api.patch('/auth/profile', payload);
  return response.data;
};

// // ============= SERVICES ENDPOINTS =============
// export const getServiceById = async (id) => {
//   const response = await api.get(`/services/${id}`);
//   return response.data;
// };

export const deleteService = async (id) => {
  const response = await api.delete(`/services/${id}`);
  return response.data;
};

export const getMyServices = async () => {
  const response = await api.get('/services/my/services');
  return response.data;
};

export const createService = async (payload) => {
  const response = await api.post('/services', payload);
  return response.data;
};

export const updateService = async (id, payload) => {
  const response = await api.patch(`/services/${id}`, payload);
  return response.data;
};

// ============= SEARCH/BROWSE ENDPOINTS =============
export const searchServices = async (endpoint) => {
  const response = await api.get(endpoint);
  return response.data;
};

// ============= BOOKINGS ENDPOINTS =============
export const getMyBookings = async () => {
  const response = await api.get('/bookings');
  return response.data;
};

export const cancelBooking = async (bookingId, reason = '') => {
  const response = await api.post(`/bookings/${bookingId}/cancel`, { reason });
  return response.data;
};

export const createBooking = async (payload) => {
  const response = await api.post('/bookings', payload);
  return response.data;
};

export const getBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

// ============= DISPUTES ENDPOINTS =============
export const getDisputesByRegion = async (neighborhoodIds) => {
  const response = await api.get(`/disputes/regional?neighborhoodIds=${neighborhoodIds}`);
  return response.data;
};

export const assignDispute = async (id) => {
  const response = await api.post(`/disputes/${id}/assign`);
  return response.data;
};

export const resolveDispute = async (id, resolution) => {
  const response = await api.post(`/disputes/${id}/resolve`, { resolution });
  return response.data;
};

export const createDispute = async (payload) => {
  const response = await api.post('/disputes', payload);
  return response.data;
};

// ============= REVIEWS ENDPOINTS =============
export const createReview = async (payload) => {
  const response = await api.post('/reviews', payload);
  return response.data;
};

export const getReviewsForService = async (serviceId) => {
  const response = await api.get(`/reviews/service/${serviceId}`);
  return response.data;
};

// ============= PAYMENT ENDPOINTS =============
export const processPayment = async (bookingId, paymentMethod = 'credit_card') => {
  const response = await api.post('/transactions/pay', {
    bookingId,
    paymentMethod,
  });
  return response.data;
};

// ============= ADMIN ENDPOINTS =============
export const getModerators = async () => {
  const response = await api.get('/admin/moderators');
  return response.data;
};

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const promoteModerator = async (email) => {
  const response = await api.patch('/admin/promote', { email });
  return response.data;
};

export const demoteModerator = async (userId) => {
  const response = await api.patch(`/admin/demote/${userId}`);
  return response.data;
};

export const addCity = async (payload) => {
  const response = await api.post('/locations/cities', payload);
  return response.data;
};

export const addNeighborhood = async (payload) => {
  const response = await api.post('/locations/neighborhoods', payload);
  return response.data;
};

// ============= CATEGORIES ENDPOINTS =============
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export default api;


/*
is it actually fetching all neighbourhoods in the city

*/
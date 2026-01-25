import api from './api';

export const processPayment = async (bookingId, amount, paymentMethod) => {
  try {
    // Stage 2: Hit the real backend endpoint
    // Endpoint: /transactions/pay)
    const response = await api.post('/transactions/pay', {
      bookingId: bookingId,
      paymentMethod: 'credit_card' // Hardcoded for demo, or pass from UI
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
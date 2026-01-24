// src/utils/paymentApi.js
import api from './api';
import toast from 'react-hot-toast';

export const processPayment = async (bookingId, amount, paymentMethod) => {
  try {
    // 1. Simulate "Contacting Bank" delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 2. Hit your real backend to record the transaction
    const response = await api.post('/transactions/create', {
      booking_id: bookingId,
      amount: amount,
      currency: 'USD',
      payment_method: paymentMethod, // 'credit_card', 'paypal', etc.
      status: 'completed' // We auto-complete it for the demo
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
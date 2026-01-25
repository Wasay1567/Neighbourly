import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { processPayment } from '../utils/paymentApi';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get transaction details passed from the previous screen (Booking Modal)
  // Fallback values provided for testing
  const { bookingId, serviceTitle, amount, providerName } = location.state || {
    bookingId: "TEST-123",
    serviceTitle: "Lawn Mowing Service",
    amount: 45.00,
    providerName: "Service Provider Inc."
  };

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  // Simple formatting for the card input to make it look real
  const handleCardChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    val = val.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(val.substring(0, 19));
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call the simulator + API
      await processPayment(bookingId, amount, 'credit_card');
      
      setSuccess(true);
      toast.success("Payment Successful! 🎉");
      
      // Redirect after showing success animation
      setTimeout(() => {
        navigate('/my-bookings');
      }, 3000);

    } catch (err) {
      toast.error("Transaction failed. Please try again.");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-sm w-full animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Complete!</h2>
          <p className="text-gray-500 mb-6">You successfully sent ${amount} to {providerName}.</p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
            <div className="bg-green-500 h-1.5 rounded-full animate-[width_3s_ease-out_forwards] w-0" style={{width: '100%'}}></div>
          </div>
          <p className="text-xs text-gray-400">Redirecting to bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: Summary Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-100">
                <p className="text-sm text-gray-500">Service</p>
                <p className="font-medium">{serviceTitle}</p>
              </div>
              <div className="pb-4 border-b border-gray-100">
                <p className="text-sm text-gray-500">Provider</p>
                <p className="font-medium">{providerName}</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-gray-700">Total</span>
                <span className="text-2xl font-bold text-teal-600">${amount}</span>
              </div>
            </div>
            <div className="mt-6 bg-blue-50 p-3 rounded-lg flex items-start gap-3">
              <Lock className="text-blue-600 shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-blue-700 leading-relaxed">
                Payments are held in secure escrow until the service is completed.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Payment Form */}
        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Secure Checkout</h2>
              <div className="flex gap-2">
                <div className="bg-gray-100 p-2 rounded"><Wallet size={20} className="text-gray-600"/></div>
                <div className="bg-gray-100 p-2 rounded"><CreditCard size={20} className="text-gray-600"/></div>
              </div>
            </div>

            <form onSubmit={handlePay} className="space-y-6">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={handleCardChange}
                    placeholder="0000 0000 0000 0000"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                  />
                  <CreditCard className="absolute left-4 top-3.5 text-gray-400" size={20} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Expiry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    required
                    maxLength="5"
                    value={expiry}
                    onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, '');
                        if (v.length >= 2) v = v.substring(0,2) + '/' + v.substring(2,4);
                        setExpiry(v);
                    }}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
                  />
                </div>
                {/* CVC */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVC / CVV</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      maxLength="3"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
                    />
                    <Lock className="absolute right-4 top-3.5 text-gray-400" size={16} />
                  </div>
                </div>
              </div>

              {/* Name on Card */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Ahmed"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 text-white font-bold py-4 rounded-lg shadow-lg hover:bg-teal-700 transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>Pay ${amount}</>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <Lock size={12}/> 256-bit SSL Encrypted Payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
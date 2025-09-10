'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';

// Separate component for the content that uses useSearchParams
function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('Processing your order...');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const sessionId = searchParams.get('session_id');

    if (orderId) {
      setStatus('Order placed successfully!');
      fetchOrderDetails(orderId);
    } else if (sessionId) {
      verifyCardPayment(sessionId);
    } else {
      setStatus('No order information found.');
      setIsLoading(false);
    }
  }, [searchParams]);

  const fetchOrderDetails = async (orderId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://72.60.111.193:5000/api/orders/order/${orderId}`);
      setTrackingNumber(response.data.trackingNumber);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setStatus('Error loading order details');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCardPayment = async (sessionId) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`http://72.60.111.193:5000/api/pay/check-payment?session_id=${sessionId}`);
      if (res.data.paid) {
        setStatus('Payment successful!');
        if (res.data.orderId) {
          fetchOrderDetails(res.data.orderId);
        }
      } else {
        setStatus('Payment not completed.');
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      setStatus('Failed to verify payment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100 max-w-md mx-auto"
    >
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 0.8 }}
          className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
        <h1 className="text-2xl font-bold text-white">{status}</h1>
      </div>

      <div className="p-6 text-center">
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4 mb-6"
          >
            <h2 className="text-xl font-semibold text-gray-800">Thank you for your order</h2>
            <p className="text-gray-600">Order has been confirmed</p>

            {trackingNumber && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-gray-700 font-medium">Order tracking number:</span>
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-blue-600 font-semibold">#{trackingNumber}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(trackingNumber);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
              </div>
            )}

            {copied && (
              <p className="text-green-600 text-sm">Tracking number copied!</p>
            )}
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium py-3 rounded-lg shadow-md"
          >
            Return to Home
          </motion.button>
        </>
      </div>
    </motion.div>
  );
}

// Main Page Component
export default function SuccessPay() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-white">
      {/* Blue blur effect */}
      <div className="fixed w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none -z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <Suspense fallback={<div className="text-center text-blue-500">Loading payment info...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}

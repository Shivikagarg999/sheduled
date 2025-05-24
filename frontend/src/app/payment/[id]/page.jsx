"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

const PaymentPage = () => {
  const params = useParams();
  const id = params.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`http://localhost:5000/api/orders/order/${id}`)
        .then(res => {
          setOrder(res.data);
          setError(null);
        })
        .catch(err => {
          console.error(err);
          setError('Failed to load order details');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handlePayment = async () => {
    try {
      setProcessingPayment(true);
      const res = await axios.post('/api/payment', { orderId: id });
      window.location.href = res.data.redirectUrl;
    } catch (err) {
      console.error(err);
      setError('Payment processing failed. Please try again.');
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-full mt-6 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-red-300">
          <div className="p-6 border-b border-red-300">
            <div className="flex items-center gap-2 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h2 className="text-xl font-semibold">Error</h2>
            </div>
          </div>
          <div className="p-6">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">
            Complete Your Payment
          </h1>
          <p className="text-sm text-gray-500">
            Order #{order.trackingNumber}
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Pickup Location</p>
                <p className="font-medium">
                  {order.pickupBuilding}, {order.pickupApartment}<br />
                  {order.pickupArea}, {order.pickupEmirate}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivery Location</p>
                <p className="font-medium">
                  {order.dropBuilding}, {order.dropApartment}<br />
                  {order.dropArea}, {order.dropEmirate}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">AED {order.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Service Fee</span>
              <span className="font-medium">AED 0.00</span>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <span className="text-lg font-semibold">Total Amount</span>
              <span className="text-lg font-bold text-blue-600">AED {order.amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Payment Method</h3>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="flex-1">
                <p className="font-medium capitalize">{order.paymentMethod}</p>
                <p className="text-sm text-gray-500">
                  {order.paymentMethod === 'card' ? 'Pay with credit/debit card' : 'Pay with cash on delivery'}
                </p>
              </div>
              {order.paymentMethod === 'card' && (
                <div className="flex space-x-2">
                  <div className="w-10 h-6 bg-gray-200 rounded-sm"></div>
                  <div className="w-10 h-6 bg-gray-200 rounded-sm"></div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={processingPayment}
            className={`w-full px-6 py-3 rounded-md text-white font-medium ${
              processingPayment ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {processingPayment ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Payment...
              </span>
            ) : (
              `Pay AED ${order.amount.toFixed(2)}`
            )}
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>Secure payment processed by our trusted partner</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Head from 'next/head';

function SuccessPay() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('Processing your order...');
  const [orderDetails, setOrderDetails] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const sessionId = searchParams.get('session_id');

    if (orderId) {
      // Handle cash on delivery case
      setStatus('Order placed successfully!');
      fetchOrderDetails(orderId);
    } else if (sessionId) {
      // Handle card payment case
      verifyCardPayment(sessionId);
    } else {
      setStatus('No order information found.');
      setIsLoading(false);
    }
  }, [searchParams]);

  const fetchOrderDetails = async (orderId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/orders/order/${orderId}`);
      setOrderDetails(response.data);
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
      const res = await axios.get(`http://localhost:5000/api/pay/check-payment?session_id=${sessionId}`);
      if (res.data.paid) {
        setStatus('Payment successful! Thank you for your purchase.');
        if (res.data.orderId) {
          fetchOrderDetails(res.data.orderId);
        }
      } else {
        setStatus('Payment not completed.');
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      setStatus('Failed to verify payment. Please contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (orderDetails?.trackingNumber) {
      navigator.clipboard.writeText(orderDetails.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Head>
        <title>Order Confirmation | YourCompanyName</title>
        <meta name="description" content="Your order confirmation page" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header with logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center">
              <svg className="h-12 w-auto text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold text-gray-900">YourCompanyName</h1>
          </div>

          {/* Main content card */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Status banner */}
            <div className="bg-indigo-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Order Confirmation</h2>
                {!isLoading && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-indigo-700">
                    {status.includes('success') ? 'Completed' : status.includes('Processing') ? 'Processing' : 'Issue'}
                  </span>
                )}
              </div>
            </div>

            <div className="px-6 py-8">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <>
                  <div className={`flex items-center justify-center mb-8 ${status.includes('success') ? 'text-green-600' : status.includes('Processing') ? 'text-blue-600' : 'text-red-600'}`}>
                    {status.includes('success') ? (
                      <svg className="h-12 w-12 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : status.includes('Processing') ? (
                      <svg className="h-12 w-12 mr-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="h-12 w-12 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    <div>
                      <h3 className="text-2xl font-bold">{status}</h3>
                      <p className="text-gray-600 mt-1">
                        {status.includes('success') 
                          ? 'We\'ve received your order and are preparing it for shipment.' 
                          : status.includes('Processing') 
                            ? 'Please wait while we process your order.' 
                            : 'Please contact our support team for assistance.'}
                      </p>
                    </div>
                  </div>

                  {orderDetails && (
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                      {/* Order summary */}
                      <div className="px-6 py-4">
                        <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Order Number</p>
                            <div className="mt-1 flex items-center">
                              <p className="text-base font-medium text-gray-900">{orderDetails.trackingNumber}</p>
                              <button
                                onClick={copyToClipboard}
                                className="ml-2 p-1 rounded-md hover:bg-gray-100"
                                title="Copy to clipboard"
                              >
                                {copied ? (
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                  </svg>
                                )}
                              </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Use this ID to track your order</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Date</p>
                            <p className="mt-1 text-base font-medium text-gray-900">
                              {new Date(orderDetails.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="mt-1 text-base font-medium text-gray-900">
                              AED {orderDetails.amount.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Payment Method</p>
                            <p className="mt-1 text-base font-medium text-gray-900">
                              {orderDetails.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Credit/Debit Card'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Shipping information */}
                      <div className="px-6 py-4">
                        <h3 className="text-lg font-medium text-gray-900">Shipping Information</h3>
                        <div className="mt-4">
                          <p className="text-sm text-gray-600">Delivery Address</p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {orderDetails.dropArea}, {orderDetails.dropEmirate}
                          </p>
                        </div>
                      </div>

                      {/* Next steps */}
                      <div className="px-6 py-4 bg-gray-50">
                        <h3 className="text-lg font-medium text-gray-900">What's Next?</h3>
                        <ul className="mt-4 space-y-3">
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-gray-600">You'll receive an email confirmation shortly</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-gray-600">We'll notify you when your order ships</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-gray-600">Estimated delivery: 3-5 business days</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      onClick={() => router.push('/')}
                      className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Continue Shopping
                    </button>
                    {orderDetails && (
                      <button
                        onClick={() => router.push(`/track-order?orderId=${orderDetails.trackingNumber}`)}
                        className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Track Your Order
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SuccessPay;
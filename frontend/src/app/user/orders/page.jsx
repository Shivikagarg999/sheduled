"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import bgimg from "../../../../public/images/bg.png";
import Nav from '@/app/nav/page';
import Sidebar from '@/app/dashboard/sidebar/page';
import Link from 'next/link';

export default function OrdersPage() {
  const [scrolled, setScrolled] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || 
                  document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    setHasToken(!!token);

    if (token) {
      fetchOrders(token);
    }
  }, []);

  const fetchOrders = async (token) => {
    try {
      // Extract user ID from token (assuming it's a JWT)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id; // Adjust based on your token structure

      const response = await fetch(`/api/user/allOrders/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const orderCardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <div
      className="min-h-[100vh] w-full overflow-x-hidden relative bg-center bg-white bg-no-repeat bg-cover"
      style={{ backgroundImage: `url(${bgimg.src})` }}
    >
      {hasToken ? (
        <Sidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
        />
      ) : (
        <Nav />
      )}

      <div 
        className={`relative z-10 transition-all duration-300 ${
          hasToken 
            ? sidebarCollapsed 
              ? 'ml-16'
              : 'ml-64'
            : 'ml-0'
        }`}
      >
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="w-full py-12 px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <motion.div variants={fadeIn} className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="mt-2 text-sm text-gray-600">All Orders made till date.</p>
          </motion.div>

          {loading ? (
            <motion.div 
              variants={fadeIn}
              className="flex justify-center items-center py-12"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </motion.div>
          ) : error ? (
            <motion.div 
              variants={fadeIn}
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-6"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </motion.div>
          ) : orders.length === 0 ? (
            <motion.div 
              variants={fadeIn}
              className="text-center py-12"
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">You haven't placed any orders yet.</p>
              <div className="mt-6">
                <Link href="/send-parcel">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create New Order
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto"
            >
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  custom={index}
                  variants={orderCardVariants}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                  className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 border border-gray-100"
                >
                  <div className="px-4 py-5 sm:px-6 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Order #{order.trackingNumber}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Pickup</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {order.pickupBuilding}, {order.pickupArea}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.pickupEmirate}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Dropoff</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {order.dropBuilding}, {order.dropArea}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.dropEmirate}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Delivery Type</h4>
                        <p className="mt-1 text-sm text-gray-900 capitalize">
                          {order.deliveryType}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Amount</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          AED {order.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-4 sm:px-6 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <Link href={`/track-order/${order.trackingNumber}`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Track Order
                        </motion.button>
                      </Link>
                      <span className={`text-sm font-medium ${
                        order.paymentStatus === 'pending' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
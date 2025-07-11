'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../dashboard/sidebar/page';
import { 
  FiBox, 
  FiMapPin, 
  FiClock, 
  FiTruck, 
  FiDollarSign, 
  FiCreditCard,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`/api/user/allOrders/${userId}`);
        setOrders(res.data);
      } catch (err) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'refunded':
        return 'bg-blue-100 text-blue-700';
      default: // pending
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const formatAddress = (order, type) => {
    if (type === 'pickup') {
      return `${order.pickupBuilding}, ${order.pickupApartment}, ${order.pickupArea}, ${order.pickupEmirate}`;
    }
    return `${order.dropBuilding}, ${order.dropApartment}, ${order.dropArea}, ${order.dropEmirate}`;
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />

      {/* Main Content */}
      <main className={`
        flex-1 transition-all duration-300 ease-in-out
        ${collapsed ? 'md:ml-20' : 'md:ml-64'}
        ${mobileMenuOpen ? 'ml-64' : 'ml-0'}
      `}>
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

            {/* Mobile Menu Toggle Button (only visible on mobile) */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg z-20"
            >
              <FiBox className="h-6 w-6" />
            </button>

            {/* Loading and Error States */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
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
              </div>
            )}

            {!loading && !error && orders.length === 0 && (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <FiBox className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
                <p className="mt-1 text-sm text-gray-500">You haven't placed any orders yet.</p>
              </div>
            )}

            {/* Orders List */}
            {!loading && !error && orders.length > 0 && (
              <div className="space-y-4">
                {orders.map(order => (
                  <div
                    key={order._id}
                    className="bg-white shadow rounded-lg overflow-hidden border border-gray-200"
                  >
                    {/* Order Header - Always visible */}
                    <div 
                      className="p-4 cursor-pointer flex justify-between items-center"
                      onClick={() => toggleOrderExpand(order._id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${
                          order.status === 'completed' ? 'bg-green-500' :
                          order.status === 'failed' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            #{order.trackingNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        {expandedOrderId === order._id ? (
                          <FiChevronUp className="ml-2 text-gray-500" />
                        ) : (
                          <FiChevronDown className="ml-2 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {/* Order Details - Collapsible */}
                    {expandedOrderId === order._id && (
                      <div className="border-t border-gray-200 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                              <FiMapPin className="text-red-500" />
                              Pickup Location
                            </div>
                            <div className="text-sm text-gray-600 pl-6">
                              {formatAddress(order, 'pickup')}
                              <div className="mt-1 text-xs text-gray-500">
                                Contact: {order.pickupContact}
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                              <FiMapPin className="text-green-500" />
                              Drop Location
                            </div>
                            <div className="text-sm text-gray-600 pl-6">
                              {formatAddress(order, 'drop')}
                              <div className="mt-1 text-xs text-gray-500">
                                Contact: {order.dropContact}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <FiTruck className="text-purple-500" />
                            <div>
                              <p className="text-gray-500">Service</p>
                              <p className="font-medium capitalize">{order.deliveryType}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <FiCreditCard className="text-blue-500" />
                            <div>
                              <p className="text-gray-500">Payment</p>
                              <p className="font-medium capitalize">{order.paymentMethod}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <FiDollarSign className="text-green-500" />
                            <div>
                              <p className="text-gray-500">Amount</p>
                              <p className="font-medium">AED {order.amount?.toFixed(2) || '0.00'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrdersPage;
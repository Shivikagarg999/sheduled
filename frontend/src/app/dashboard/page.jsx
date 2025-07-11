'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './sidebar/page';
import { FiActivity, FiPackage, FiCheckCircle, FiXCircle, FiTruck, FiPlus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  const [orderStats, setOrderStats] = useState({
    ongoing: 0,
    delivered: 0,
    cancelled: 0,
    total: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch stats and recent orders from backend
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // In a real app, you would fetch from your API endpoints:
        // const statsRes = await fetch('/api/orders/stats');
        // const ordersRes = await fetch('/api/orders/allOrders/userId');
        
        // Mock data for demonstration
        const statsRes = {
          ongoing: 12,
          delivered: 34,
          cancelled: 3,
          total: 49,
        };
        
        const ordersRes = [
          {
            _id: '1',
            trackingNumber: 'TRK123456',
            status: 'ongoing',
            pickupArea: 'Business Bay',
            dropArea: 'Dubai Marina',
            amount: 45.00,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            _id: '2',
            trackingNumber: 'TRK789012',
            status: 'delivered',
            pickupArea: 'Al Barsha',
            dropArea: 'Jumeirah',
            amount: 30.00,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            _id: '3',
            trackingNumber: 'TRK345678',
            status: 'cancelled',
            pickupArea: 'Deira',
            dropArea: 'Bur Dubai',
            amount: 25.00,
            createdAt: new Date(Date.now() - 172800000).toISOString()
          },
        ];
        
        setOrderStats(statsRes);
        setRecentOrders(ordersRes);
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

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
        delayChildren: 0.2
      }
    }
  };

  const handleCreateOrder = () => {
    router.push('/create-order');
  };

  const handleTrackOrder = (trackingNumber) => {
    router.push(`/track/${trackingNumber}`);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ongoing':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Ongoing</span>;
      case 'delivered':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Delivered</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Processing</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64 p-8">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64 p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 ml-0 md:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <motion.h1 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-2xl md:text-3xl font-bold text-gray-800"
            >
              Dashboard Overview
            </motion.h1>
            <button
              onClick={handleCreateOrder}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <FiPlus className="w-5 h-5" />
              Create Order
            </button>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card 
              title="Ongoing Orders" 
              count={orderStats.ongoing} 
              color="bg-blue-600" 
              icon={<FiTruck className="w-6 h-6 text-blue-100" />}
            />
            <Card 
              title="Delivered" 
              count={orderStats.delivered} 
              color="bg-green-600" 
              icon={<FiCheckCircle className="w-6 h-6 text-green-100" />}
            />
            <Card 
              title="Cancelled" 
              count={orderStats.cancelled} 
              color="bg-red-600" 
              icon={<FiXCircle className="w-6 h-6 text-red-100" />}
            />
            <Card 
              title="Total Orders" 
              count={orderStats.total} 
              color="bg-gray-800" 
              icon={<FiPackage className="w-6 h-6 text-gray-100" />}
            />
          </motion.div>

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
              <button 
                onClick={() => router.push('/orders')}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                View All
              </button>
            </div>
            
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tracking #
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Route
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.trackingNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.pickupArea} → {order.dropArea}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          AED {order.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleTrackOrder(order.trackingNumber)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Track
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new order.</p>
                <div className="mt-6">
                  <button
                    onClick={handleCreateOrder}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                    New Order
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

const Card = ({ title, count, color, icon }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`p-6 rounded-xl text-white shadow-md ${color} relative overflow-hidden`}
  >
    <div className="absolute top-4 right-4 opacity-20">
      {icon}
    </div>
    <div className="relative z-10">
      <p className="text-sm uppercase tracking-wider font-medium opacity-80">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{count}</h2>
    </div>
  </motion.div>
);

export default DashboardPage;
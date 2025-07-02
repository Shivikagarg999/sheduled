'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './sidebar/page'; 

const DashboardPage = () => {
  const [orderStats, setOrderStats] = useState({
    ongoing: 0,
    delivered: 0,
    cancelled: 0,
    total: 0,
  });

  // Fetch stats from backend
  useEffect(() => {
    async function fetchStats() {
      const res = {
        ongoing: 2,
        delivered: 5,
        cancelled: 1,
        total: 8,
      };
      setOrderStats(res);
    }
    fetchStats();
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar />
      
      {/* Main Content*/}
      <main className="flex-1 ml-0 md:ml-64 transition-all duration-300"> {/* Adjust margin based on sidebar width */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-2xl md:text-3xl font-bold mb-6 text-gray-800"
          >
            Welcome back 👋
          </motion.h1>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card title="Ongoing Orders" count={orderStats.ongoing} color="bg-blue-500" />
            <Card title="Delivered" count={orderStats.delivered} color="bg-green-500" />
            <Card title="Cancelled" count={orderStats.cancelled} color="bg-red-500" />
            <Card title="Total Orders" count={orderStats.total} color="bg-gray-700" />
          </motion.div>

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity</h2>
            <p className="text-gray-500">Your dashboard will show recent orders and activities here.</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

// Card Component
const Card = ({ title, count, color }) => (
  <div className={`p-6 rounded-xl text-white shadow-md ${color}`}>
    <p className="text-sm uppercase">{title}</p>
    <h2 className="text-3xl font-bold mt-2">{count}</h2>
  </div>
);

export default DashboardPage;
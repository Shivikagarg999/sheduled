"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import bgimg from "../../../public/images/bg.png"
import Nav from '../nav/page';
import Sidebar from '../dashboard/sidebar/page';

export default function Support() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: false, message: '' });
  const [hasToken, setHasToken] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check for authentication token
  useState(() => {
    const token = localStorage.getItem('token') || 
                  document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    setHasToken(!!token);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://sheduled-8umy.onrender.com/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, message }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmitStatus({ success: true, message: 'Query submitted successfully! Someone from our team will reach you out shortly.' });
        setEmail('');
        setMessage('');
      } else {
        setSubmitStatus({ success: false, message: 'Failed to submit support query. Please try again.' });
      }
    } catch (error) {
      setSubmitStatus({ success: false, message: 'An error occurred. Please try again later.' });
    } finally {
      setIsSubmitting(false);
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

  return (
    <div
      className="min-h-[100vh] w-full overflow-x-hidden relative bg-center bg-white bg-no-repeat bg-cover"
      style={{ backgroundImage: `url(${bgimg.src})` }}
    >
      {/* Conditionally render Sidebar or Nav */}
      {hasToken ? (
        <Sidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
        />
      ) : (
        <Nav />
      )}

      {/* Main content with proper margins when sidebar is present */}
      <div 
        className={`relative z-10 transition-all duration-300 pt-24 ${
          hasToken 
            ? sidebarCollapsed 
              ? 'ml-16' // Collapsed sidebar width
              : 'ml-64' // Full sidebar width
            : 'ml-0' // No sidebar
        }`}
      >
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="w-full py-12 px-4 relative z-10 max-w-4xl mx-auto"
        >
          <motion.div variants={fadeIn} className="bg-white rounded-2xl mt-8 shadow-lg p-8 border border-gray-100">
            <motion.h1 
              variants={fadeIn}
              className="text-3xl font-bold text-gray-800 mb-2 text-center"
            >
              Contact Support
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-gray-600 mb-8 text-center"
            >
              Have questions or need assistance? We're here to help!
            </motion.p>

            {submitStatus.message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg mb-6 ${
                  submitStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {submitStatus.message}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={fadeIn} className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="your@email.com"
                />
              </motion.div>

              <motion.div variants={fadeIn} className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="How can we help you?"
                />
              </motion.div>

              <motion.div variants={fadeIn} className="pt-4">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </motion.button>
              </motion.div>
            </form>

            <motion.div variants={fadeIn} className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Other Ways to Reach Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-700 mb-1">Email</h3>
                  <p className="text-gray-600">info@sheduled.com</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-700 mb-1">Response Time</h3>
                  <p className="text-gray-600">Within 24 hours</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import bgimg from "../../../public/images/bg.png";
// import Nav from '../nav/page';

export default function EnterTrackingPage() {
  const [trackingId, setTrackingId] = useState('');
  const router = useRouter();
  const handleSubmit = (e) => {
    e.preventDefault();
    if (trackingId.trim()) {
      router.push(`/track/${trackingId.trim().toUpperCase()}`);
    }
  };

  const buttonHover = {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  };

  const buttonTap = {
    scale: 0.95
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div
      className="min-h-[100vh] w-full overflow-x-hidden relative bg-center bg-no-repeat bg-cover flex items-center justify-center"
      style={{ backgroundImage: `url(${bgimg.src})` }}
    >
        {/* <Nav/> */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl backdrop-blur-sm bg-opacity-90 border border-blue-200"
      >
        <motion.h2 
          variants={fadeIn}
          className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800"
        >
          Track Your Order
        </motion.h2>
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          variants={fadeIn}
        >
          <motion.div variants={fadeIn}>
            <input
              type="text"
              placeholder="Enter Order Tracking Number"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </motion.div>
          
          <motion.div className="flex flex-col space-y-4">
            <motion.button 
              type="submit" 
              whileHover={{ 
                scale: 1.05,
                background: "linear-gradient(to right, #3b82f6, #2563eb)",
                boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)"
              }}
              whileTap={buttonTap}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium px-6 py-3 rounded-lg shadow-md"
            >
              Track Order
            </motion.button>
            
            <motion.button 
              type="button"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 20px rgba(191, 219, 254, 0.5)"
              }}
              whileTap={buttonTap}
              className="w-full bg-blue-100 text-blue-800 font-medium px-6 py-3 rounded-lg shadow-md"
              onClick={() => router.push('/send-parcel')}
            >
              Send a Parcel Instead
            </motion.button>
          </motion.div>
        </motion.form>
        
        <motion.div 
          variants={fadeIn}
          className="mt-6 text-center text-sm text-gray-500"
        >
          <p>Need help? <span className="text-blue-600 cursor-pointer hover:underline">Contact our support</span></p>
        </motion.div>
      </motion.div>
    </div>
  );
}
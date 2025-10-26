"use client"

import { FaBox, FaCreditCard, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Nav from '../nav/page';
import bg from '../../../public/images/bg.png'
import ProfessionalFAQ from '../faqs/page';

export default function Main() {
  // Cursor blur effect refs
  const blurRef = useRef(null);
  const frameRef = useRef(0);
  const targetPositionRef = useRef({ x: 0, y: 0 });

  // Smooth cursor follower effect
  useEffect(() => {
    const lerp = (start, end, t) => start * (1 - t) + end * t;
    
    const updateBlurPosition = () => {
      if (!blurRef.current) return;
      
      const currentX = parseFloat(blurRef.current.style.transform.split('(')[1]?.split(',')[0]) || 0;
      const currentY = parseFloat(blurRef.current.style.transform.split(',')[1]?.split(')')[0]) || 0;
      
      const newX = lerp(currentX, targetPositionRef.current.x, 0.1);
      const newY = lerp(currentY, targetPositionRef.current.y, 0.1);
      
      blurRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
      frameRef.current = requestAnimationFrame(updateBlurPosition);
    };

    const handleMouseMove = (e) => {
      targetPositionRef.current = {
        x: e.clientX - 64,
        y: e.clientY - 64
      };
    };

    frameRef.current = requestAnimationFrame(updateBlurPosition);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden relative bg-white">
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundImage: `url(${bg.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Navigation */}
      <Nav />

      {/* Smooth blue blur cursor effect */}
      <div
        ref={blurRef}
        className="fixed w-32 h-32 bg-blue-500/60 rounded-full blur-[80px] pointer-events-none z-0"
        style={{ 
          transform: 'translate(-100px, -100px)',
          willChange: 'transform'
        }}
      />

      {/* Main content */}
      <div className="relative z-10">
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="w-full pt-32 pb-20 px-4 text-center relative"
        >
          {/* Main headline */}
          <motion.h1 
            variants={fadeIn}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mt-8 mb-6 leading-tight max-w-5xl mx-auto"
          >
            No Warehouses. No Dark Stores.<br />
            <span className="text-blue-600">No Last Mile Headaches.</span><br />
            Just True End-to-End Delivery.
          </motion.h1>

          {/* Description */}
          <motion.p 
            variants={fadeIn}
            className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            We're redefining delivery by eliminating the clutter — no warehouses, no dark stores, no last-mile chaos. Our end-to-end platform connects businesses directly to customers, replacing outdated logistics with a smarter, faster, and more efficient 24 hrs delivery.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={fadeIn}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20"
          >
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg shadow-lg font-semibold text-lg"
            >
              Send Parcel
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-8 py-4 rounded-lg shadow-md font-semibold text-lg border border-blue-200"
            >
              Sign Up
            </motion.button>
          </motion.div>

          {/* Steps Section */}
          <motion.div 
            variants={fadeIn}
            className="max-w-5xl mx-auto mt-24"
          >
            <div className="grid md:grid-cols-3 gap-6 relative">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
                  {/* Number */}
                  <div className="absolute -top-4 left-8 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    1
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-4 mt-2">
                    <FaBox className="text-3xl text-blue-600" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Send Parcel Details
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Enter pickup and delivery addresses with package information
                  </p>
                </div>

                {/* Arrow connector - desktop only */}
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <FaArrowRight className="text-2xl text-blue-300" />
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
                  {/* Number */}
                  <div className="absolute -top-4 left-8 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    2
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center mb-4 mt-2">
                    <FaCreditCard className="text-3xl text-purple-600" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Make Payment
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Secure payment with multiple options available
                  </p>
                </div>

                {/* Arrow connector - desktop only */}
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <FaArrowRight className="text-2xl text-blue-300" />
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
                  {/* Number */}
                  <div className="absolute -top-4 left-8 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    3
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mb-4 mt-2">
                    <FaCheckCircle className="text-3xl text-green-600" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Parcel Booked
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Get instant confirmation and real-time tracking
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>
        <ProfessionalFAQ/>
      </div>
    </div>
  );
}
"use client"

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaShippingFast, FaMapMarkerAlt, FaBox, FaSearch, FaClock, FaDollarSign, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

export default function ProfessionalFAQ() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  const blurRef = useRef(null);
  const frameRef = useRef(0);
  const targetPositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsClient(true);
  }, []);

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

    // Only start animation on client side
    if (isClient) {
      frameRef.current = requestAnimationFrame(updateBlurPosition);
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (isClient) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isClient]);

  const faqs = [
    {
      question: "How do I book a parcel for delivery?",
      answer: "You can easily book a parcel by entering your pickup and drop-off locations, contact details, and parcel information on our website. Once the payment is completed, your booking will be confirmed instantly.",
      icon: FaShippingFast,
      stats: "2 min process"
    },
    {
      question: "Do you provide doorstep pickup and delivery?",
      answer: "Yes! Our delivery agent will visit your provided pickup address to collect the parcel and deliver it safely to the drop-off location.",
      icon: FaMapMarkerAlt,
      stats: "100% Doorstep"
    },
    {
      question: "In which areas of the UAE do you operate?",
      answer: "We currently provide parcel pickup and delivery services across all major cities in the UAE, including Dubai, Abu Dhabi, Sharjah, Ajman, and other nearby regions.",
      icon: FaMapMarkerAlt,
      stats: "Nationwide Coverage"
    },
    {
      question: "What types of parcels can I send?",
      answer: "You can send most non-restricted items such as documents, small packages, gifts, electronics, and personal items. Dangerous or prohibited goods are not allowed as per UAE regulations.",
      icon: FaBox,
      stats: "Multiple Categories"
    },
    {
      question: "How can I track my parcel?",
      answer: "Once your parcel is booked, you'll receive a tracking ID. You can use it to check your parcel's real-time status directly on our website.",
      icon: FaSearch,
      stats: "Real-time Tracking"
    },
    {
      question: "How long does delivery take?",
      answer: "Delivery time depends on the distance between pickup and drop-off locations.\n\nSame-city deliveries: Usually within a few hours.\n\nInter-city deliveries: Typically within 1–2 business days.",
      icon: FaClock,
      stats: "Fast Delivery"
    },
    {
      question: "What are the delivery charges?",
      answer: "Charges vary based on parcel size, weight, and distance. You can view the estimated cost instantly before confirming your booking.",
      icon: FaDollarSign,
      stats: "Transparent Pricing"
    }
  ];

  const navigateTo = (index) => {
    if (index >= 0 && index < faqs.length) {
      setDirection(index > activeIndex ? 1 : -1);
      setActiveIndex(index);
    }
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0
    })
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <section className="py-20 px-4 relative bg-white overflow-hidden">
      {/* Fixed background - remove dynamic URL logic */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          backgroundImage: 'url(/images/bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Conditionally render blur effect only on client side */}
      {isClient && (
        <div
          ref={blurRef}
          className="fixed w-32 h-32 bg-blue-500/60 rounded-full blur-[80px] pointer-events-none z-0"
          style={{ 
            transform: 'translate(-100px, -100px)',
            willChange: 'transform'
          }}
        />
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about our delivery service
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Questions Navigation */}
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.button
                key={index}
                onClick={() => navigateTo(index)}
                className={`w-full text-left p-6 rounded-2xl transition-all duration-300 border-2 ${
                  activeIndex === index 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      activeIndex === index ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <faq.icon className="text-lg" />
                    </div>
                    <h3 className="font-semibold text-gray-900 pr-4 text-left">{faq.question}</h3>
                  </div>
                  <motion.div
                    animate={{ rotate: activeIndex === index ? 180 : 0 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      activeIndex === index ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <FaChevronDown className="text-sm" />
                  </motion.div>
                </div>
                
                {/* Stats badge */}
                {activeIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {faq.stats}
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Answer Display */}
          <div className="sticky top-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 min-h-[500px] flex flex-col">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col"
                >
                  {/* Answer Header */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                      {(() => {
                        const ActiveIcon = faqs[activeIndex]?.icon;
                        return ActiveIcon ? <ActiveIcon className="text-2xl text-white" /> : null;
                      })()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {faqs[activeIndex]?.question || ''}
                      </h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-500">Instant answer</span>
                      </div>
                    </div>
                  </div>

                  {/* Answer Content */}
                  <div className="flex-1 mb-6">
                    <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                      {faqs[activeIndex]?.answer || ''}
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span>Question {activeIndex + 1} of {faqs.length}</span>
                      <span>{Math.round(((activeIndex + 1) / faqs.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((activeIndex + 1) / faqs.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className="bg-blue-500 h-2 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <div className="flex justify-between mt-6">
                    <motion.button
                      onClick={() => navigateTo(activeIndex - 1)}
                      disabled={activeIndex === 0}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        activeIndex === 0 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      whileHover={activeIndex !== 0 ? { scale: 1.05 } : {}}
                      whileTap={activeIndex !== 0 ? { scale: 0.95 } : {}}
                    >
                      <FaArrowLeft className="text-sm" />
                      <span>Previous</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => navigateTo(activeIndex + 1)}
                      disabled={activeIndex === faqs.length - 1}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        activeIndex === faqs.length - 1 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      whileHover={activeIndex !== faqs.length - 1 ? { scale: 1.05 } : {}}
                      whileTap={activeIndex !== faqs.length - 1 ? { scale: 0.95 } : {}}
                    >
                      <span>Next</span>
                      <FaArrowRight className="text-sm" />
                    </motion.button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl text-center font-semibold shadow-lg transition-all"
              >
                Send Parcel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-4 rounded-xl text-center font-semibold border border-blue-200 shadow-md transition-all"
              >
                Track Package
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
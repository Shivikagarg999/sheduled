'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import bgimg from "../../../../public/images/bg.png";
import { FaBox, FaMapMarkerAlt, FaMoneyBillWave, FaCreditCard, FaPhone, FaCalendarAlt } from 'react-icons/fa';

const statusStages = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'processing', label: 'Processing' },
  { key: 'out-for-delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' }
];

export default function TrackOrderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://sheduled-8umy.onrender.com/api/orders/track/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const buttonHover = {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  };

  const buttonTap = {
    scale: 0.95
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1,
      y: 0,
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

  const stageItem = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div 
        className="min-h-[100vh] w-full overflow-x-hidden relative bg-center bg-no-repeat bg-cover flex items-center justify-center"
        style={{ backgroundImage: `url(${bgimg.src})` }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-[100vh] w-full overflow-x-hidden relative bg-center bg-no-repeat bg-cover flex items-center justify-center"
        style={{ backgroundImage: `url(${bgimg.src})` }}
      >
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl backdrop-blur-sm bg-opacity-90 border border-blue-200 text-center"
        >
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <motion.button
            whileHover={buttonHover}
            whileTap={buttonTap}
            onClick={() => router.push('/track')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const stageOrder = ['pending', 'processing', 'out-for-delivery', 'delivered'];
  const currentStageIndex = stageOrder.indexOf(order.status);

  return (
    <div 
      className="min-h-[100vh] w-full overflow-x-hidden relative bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: `url(${bgimg.src})` }}
    >
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm bg-opacity-90 border border-blue-200"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <motion.h2 
                  variants={fadeIn}
                  className="text-2xl md:text-3xl font-bold mb-2"
                >
                  Order Tracking
                </motion.h2>
                <motion.p 
                  variants={fadeIn}
                  className="text-blue-100"
                >
                  Tracking Number: <span className="font-mono font-semibold">{order.trackingNumber}</span>
                </motion.p>
              </div>
              <motion.div 
                variants={fadeIn}
                className="bg-white/20 rounded-lg px-3 py-1 text-sm"
              >
                Order #{order._id.slice(-6).toUpperCase()}
              </motion.div>
            </div>
          </div>

          {/* Progress Tracking */}
          <motion.div 
            variants={staggerContainer}
            className="p-6 space-y-6"
          >
            <motion.h3 
              variants={fadeIn}
              className="text-xl font-semibold text-gray-800"
            >
              Delivery Status
            </motion.h3>

            <motion.div 
              variants={staggerContainer}
              className="space-y-4"
            >
              {statusStages.map((stage, index) => (
                <motion.div 
                  key={stage.key}
                  custom={index}
                  variants={stageItem}
                  className="flex items-center"
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index <= currentStageIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                      {index <= currentStageIndex ? (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs text-gray-600">{index + 1}</span>
                      )}
                    </div>
                    {index < statusStages.length - 1 && (
                      <div className={`absolute h-12 w-0.5 left-1/2 -translate-x-1/2 top-8 ${
                        index < currentStageIndex ? 'bg-blue-600' : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>
                  <div className="ml-4">
                    <p className={`text-lg ${
                      index <= currentStageIndex ? 'text-gray-800 font-semibold' : 'text-gray-500'
                    }`}>
                      {stage.label}
                    </p>
                    {index === currentStageIndex && (
                      <p className="text-sm text-gray-500 mt-1">
                        {order.status === 'pending' && 'Your order has been placed and is awaiting processing'}
                        {order.status === 'processing' && 'We are preparing your parcel for delivery'}
                        {order.status === 'out-for-delivery' && 'Your parcel is on its way to the destination'}
                        {order.status === 'delivered' && 'Your parcel has been successfully delivered'}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Order Details Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup Information */}
              <motion.div 
                variants={fadeIn}
                className="bg-blue-50 rounded-xl p-5"
              >
                <div className="flex items-center mb-4">
                  <FaMapMarkerAlt className="text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Pickup Information</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Building</p>
                    <p className="font-medium">{order.pickupBuilding}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Apartment/Office</p>
                    <p className="font-medium">{order.pickupApartment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Area</p>
                    <p className="font-medium">{order.pickupArea}, {order.pickupEmirate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="font-medium">{order.pickupContact}</p>
                  </div>
                </div>
              </motion.div>

              {/* Delivery Information */}
              <motion.div 
                variants={fadeIn}
                className="bg-green-50 rounded-xl p-5"
              >
                <div className="flex items-center mb-4">
                  <FaMapMarkerAlt className="text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Delivery Information</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Building</p>
                    <p className="font-medium">{order.dropBuilding}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Apartment/Office</p>
                    <p className="font-medium">{order.dropApartment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Area</p>
                    <p className="font-medium">{order.dropArea}, {order.dropEmirate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="font-medium">{order.dropContact}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Notes Section */}
            {order.notes && (
              <motion.div 
                variants={fadeIn}
                className="bg-yellow-50 rounded-xl p-5 mt-4"
              >
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Special Instructions</h4>
                <p className="text-gray-700">{order.notes}</p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div 
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 mt-8"
            >
              <motion.button
                whileHover={buttonHover}
                whileTap={buttonTap}
                onClick={() => router.push('/send-parcel')}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                Send Another Parcel
              </motion.button>
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 20px rgba(191, 219, 254, 0.5)"
                }}
                whileTap={buttonTap}
                className="flex-1 bg-blue-100 text-blue-800 px-6 py-3 rounded-lg font-medium"
              >
                Contact Support
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
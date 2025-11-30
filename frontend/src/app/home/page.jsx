"use client"

import { FaBox, FaCreditCard, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Head from 'next/head';
import Nav from '../nav/page';
import bg from '../../../public/images/bg.png';
import ProfessionalFAQ from '../faqs/page';
import Footer from '../components/footer/Footer';
import dashboard from '../../../src/assets/dashboard.jpeg';
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const Button = ({ children, variant = 'primary', ...props }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`
      px-8 py-4 rounded-lg font-semibold text-lg transition-all
      ${variant === 'primary' 
        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
        : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200'
      }
    `}
    {...props}
  >
    {children}
  </motion.button>
);

const HeroSection = () => {
  return (
    <section className="w-full bg-[#f7f8ff] py-20 px-6 md:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-[#2A2A42] mb-6">
            Simplify parcel deliveries with everything in one place
          </h1>

          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-lg text-gray-700">
                Enjoy peace of mind with our reliable doorstep pickup and delivery.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              <p className="text-lg text-gray-700">
                We pick, pack, and deliver your parcels quickly and safely.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              </div>
              <p className="text-lg text-gray-700">
                Track every shipment in real-time and grow your business stress-free.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full">
          <Image
            src={dashboard}
            alt="Delivery dashboard showing parcel tracking interface"
            className="w-full rounded-xl shadow-xl border border-gray-100"
            placeholder="blur"
          />
        </div>
      </div>
    </section>
  );
};

const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export default function Main() {
  const blurRef = useRef(null);
  const frameRef = useRef(0);
  const targetPositionRef = useRef({ x: 0, y: 0 });
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const lerp = (start, end, t) => start * (1 - t) + end * t;
    
    const updateBlurPosition = () => {
      if (!blurRef.current) return;
      
      const style = window.getComputedStyle(blurRef.current);
      const matrix = new DOMMatrixReadOnly(style.transform);
      
      const newX = lerp(matrix.m41, targetPositionRef.current.x, 0.1);
      const newY = lerp(matrix.m42, targetPositionRef.current.y, 0.1);
      
      blurRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
      frameRef.current = requestAnimationFrame(updateBlurPosition);
    };

    const handleMouseMove = (e) => {
      targetPositionRef.current = {
        x: e.clientX - 64,
        y: e.clientY - 64
      };
    };

    const throttledMouseMove = throttle(handleMouseMove, 16);
    
    frameRef.current = requestAnimationFrame(updateBlurPosition);
    window.addEventListener('mousemove', throttledMouseMove);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('mousemove', throttledMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden relative bg-white">
      <Head>
        <title>Fast Delivery Service | End-to-End Parcel Delivery</title>
        <meta name="description" content="Simplify parcel deliveries with our reliable doorstep pickup and delivery service. Track shipments in real-time and grow your business stress-free." />
        <meta name="keywords" content="delivery, parcel, logistics, shipping, courier" />
      </Head>

      <div 
        className="absolute inset-0"
        style={{ 
          backgroundImage: `url(${bg.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <Nav />

      <div
        ref={blurRef}
        className="fixed w-32 h-32 bg-blue-500/60 rounded-full blur-[80px] pointer-events-none z-0"
        style={{ 
          transform: 'translate(-100px, -100px)',
          willChange: 'transform'
        }}
      />

      <div className="relative z-10">
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full pt-32 pb-20 px-4 text-center relative"
          aria-labelledby="main-heading"
        >
          {!imagesLoaded && (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          <motion.h1 
            variants={itemVariants}
            id="main-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mt-8 mb-6 leading-tight max-w-5xl mx-auto"
          >
            No Warehouses. No Dark Stores.<br />
            <span className="text-blue-600">No Last Mile Headaches.</span><br />
            Just True End-to-End Delivery.
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            We're redefining delivery by eliminating the clutter — no warehouses, no dark stores, no last-mile chaos. Our end-to-end platform connects businesses directly to customers, replacing outdated logistics with a smarter, faster, and more efficient 24 hrs delivery.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20"
          >
            <Link href="/send-parcel">
              <Button 
                variant="primary"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
              >
                Send Parcel
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary">
                Sign Up
              </Button>
            </Link>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="max-w-5xl mx-auto mt-24"
          >
            <div className="grid md:grid-cols-3 gap-6 relative">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="absolute -top-4 left-8 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    1
                  </div>
                  
                  <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-4 mt-2">
                    <FaBox className="text-3xl text-blue-600" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Send Parcel Details
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Enter pickup and delivery addresses with package information
                  </p>
                </div>

                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <FaArrowRight className="text-2xl text-blue-300" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="absolute -top-4 left-8 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    2
                  </div>
                  
                  <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center mb-4 mt-2">
                    <FaCreditCard className="text-3xl text-purple-600" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Make Payment
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Secure payment with multiple options available
                  </p>
                </div>

                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <FaArrowRight className="text-2xl text-blue-300" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="absolute -top-4 left-8 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    3
                  </div>
                  
                  <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mb-4 mt-2">
                    <FaCheckCircle className="text-3xl text-green-600" />
                  </div>

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

        <HeroSection />

        <section className="relative w-full bg-[#1F3A93] flex items-center justify-center overflow-hidden py-20">
          <div className="absolute right-0 bottom-0 transform translate-x-1/3 translate-y-1/3 opacity-90">
            <div className="grid grid-cols-2 gap-3">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="w-24 h-24 bg-[#FFB84C] rotate-45 rounded-md"
                  ></div>
                ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center px-4"
          >
            <h1 className="text-4xl md:text-5xl font-semibold text-[#C7E8FF] mb-10">
              Power Your Deliveries With Fast, Reliable Logistics
            </h1>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button 
                variant="primary"
                className="bg-[#2d0c62] hover:bg-[#3e1386] text-white"
              >
                Get Started Today
              </Button>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-md border border-[#2d0c62] text-white font-medium hover:bg-[#2d0c62] hover:text-white transition"
              >
                Book a Pickup
              </motion.button>
            </div>
          </motion.div>
        </section>

        <ProfessionalFAQ/>
        <Footer/>
      </div>
    </div>
  );
}
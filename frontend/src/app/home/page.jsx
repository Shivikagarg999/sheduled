"use client"

import { FaGlobe, FaChevronDown } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import bgimg from "../../../public/images/bg.png"
import cent from "../../../public/images/cent.png"
import Nav from '../nav/page';

export default function Main() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  
  // Cursor blur effect refs
  const blurRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);
  const targetPositionRef = useRef({ x: 0, y: 0 });

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 10);
  });

  // Smooth cursor follower effect
  useEffect(() => {
    const lerp = (start, end, t) => start * (1 - t) + end * t;
    
    const updateBlurPosition = () => {
      if (!blurRef.current) return;
      
      const currentX = parseFloat(blurRef.current.style.transform.split('(')[1].split(',')[0]) || 0;
      const currentY = parseFloat(blurRef.current.style.transform.split(',')[1].split(')')[0]) || 0;
      
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 100
      }
    }
  };

  const menuItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 100
      }
    })
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
      className="min-h-[100vh] w-full overflow-x-hidden relative bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: `url(${bgimg.src})` }}
    >
      {/* Smooth blue blur cursor effect */}
      <div
        ref={blurRef}
        className="fixed w-32 h-32 bg-blue-500/60 rounded-full blur-[80px] pointer-events-none -z-0"
        style={{ 
          transform: 'translate(-100px, -100px)',
          willChange: 'transform'
        }}
      />

      <div className="relative z-10">
        <Nav/>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="fixed top-24 left-4 right-4 mx-auto max-w-7xl bg-white rounded-xl shadow-lg z-40 border-2 border-blue-300 px-6 py-4 backdrop-blur-sm bg-opacity-90"
            >
              <motion.ul 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex flex-col space-y-4 text-gray-700 font-medium"
              >
                {['About', 'Send Parcel', 'Track Order'].map((item, i) => (
                  <motion.li 
                    key={item}
                    custom={i}
                    variants={menuItemVariants}
                    whileHover={{ x: 5 }}
                    className="cursor-pointer hover:text-blue-600 transition-colors py-2 border-b border-gray-100"
                    onClick={toggleMobileMenu}
                  >
                    {item}
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div 
                variants={fadeIn}
                className="mt-4 pt-4 border-t border-gray-200 flex flex-col space-y-3"
              >
                <motion.div 
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  className="flex items-center justify-center space-x-1 border border-gray-200 rounded-full px-3 py-2 text-sm text-gray-700 cursor-pointer"
                >
                  <FaGlobe className="text-blue-600" />
                  <span>English (EN)</span>
                  <FaChevronDown className="text-xs text-gray-400" />
                </motion.div>

                <motion.button 
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  className="w-full text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-full hover:bg-blue-50"
                >
                  Log in
                </motion.button>

                <motion.button 
                  whileHover={{ 
                    scale: 1.02,
                    background: "linear-gradient(to right, #3b82f6, #2563eb)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-full shadow-md"
                >
                  Get Started
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.section 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="w-full py-36 px-4 text-center relative z-10"
        >
          {/* Top text */}
          <motion.p 
            variants={fadeIn}
            className="text-sm text-blue-600 font-semibold tracking-wide uppercase"
          >
            Built to Simplify Your Shipping
          </motion.p>

          {/* Main headline */}
          <motion.h1 
            variants={fadeIn}
            className="text-4xl md:text-5xl text-black mt-2 mb-4"
          >
           No Warehouses. No Dark Stores. No Last Mile Headaches. Just True End-to-End Delivery.
          </motion.h1>

          {/* Description */}
          <motion.p 
            variants={fadeIn}
            className="text-gray-500 max-w-2xl mx-auto mb-8 text-sm md:text-base"
          >
           We’re redefining delivery by eliminating the clutter — no warehouses, no dark stores, no last-mile chaos. Our end-to-end platform connects businesses directly to customers, replacing outdated logistics with a smarter, faster, and more efficient 24 hrs delivery.
          </motion.p>

       <motion.div 
  variants={fadeIn}
  className="flex justify-center items-center gap-4 mb-12"
>
  <Link href="/send-parcel">
    <motion.button 
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)"
      }}
      whileTap={{ scale: 0.95 }}
      className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-md shadow-md font-medium"
    >
      Send Parcel
    </motion.button>
  </Link>

  <Link href="/signup">
    <motion.button 
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 10px 20px rgba(191, 219, 254, 0.5)"
      }}
      whileTap={{ scale: 0.95 }}
      className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-6 py-3 rounded-md shadow-md font-medium"
    >
      Sign Up
    </motion.button>
  </Link>
</motion.div>

          {/* Image Card */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="w-full flex justify-center"
          >
            <motion.div 
              whileHover={{ 
                scale: 1.01,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
              }}
            >
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                src={cent.src}
                alt="Tracking App UI"
                className="rounded-2xl w-full h-auto"
              />
            </motion.div>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
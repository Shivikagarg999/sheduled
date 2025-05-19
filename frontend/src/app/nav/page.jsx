'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaGlobe, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => pathname === path;

  const buttonHover = { scale: 1.05 };
  const buttonTap = { scale: 0.95 };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.nav
        initial="hidden"
        animate="visible"
        className={`fixed top-4 left-4 right-4 mx-auto max-w-6xl bg-white rounded-xl shadow-lg z-50 transition-all duration-300 ${
          scrolled ? 'py-2 border-gray-300' : 'py-3 border-gray-300'
        } border-2 px-4 sm:px-6 flex justify-between items-center backdrop-blur-sm bg-opacity-90`}
      >
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.6 }}
            className="w-12 h-10 sm:w-17 sm:p-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold"
          >
            Logo
          </motion.div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex space-x-9 text-gray-700 font-medium text-sm">
            <motion.li
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer hover:text-blue-600 transition-colors relative group"
            >
              About
              <motion.span
                className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"
                layoutId="underline"
              />
            </motion.li>

            <Link href="/send-parcel">
              <motion.li
                whileHover={{ scale: 1.05 }}
                className={`cursor-pointer hover:text-blue-600 transition-colors relative group ${
                  isActive('/send-parcel') ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                Send Parcel
                <motion.span
                  className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all ${
                    isActive('/send-parcel') ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                  layoutId="underline"
                />
              </motion.li>
            </Link>

            <motion.li
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer hover:text-blue-600 transition-colors relative group"
            >
              Track Order
              <motion.span
                className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"
                layoutId="underline"
              />
            </motion.li>
          </ul>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={buttonHover}
            whileTap={buttonTap}
            className="hidden sm:flex items-center space-x-1 border border-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-700 hover:border-blue-400 transition-colors cursor-pointer group"
          >
            <FaGlobe className="text-blue-600 group-hover:text-blue-700 transition-colors" />
            <span>EN</span>
            <FaChevronDown className="text-xs text-gray-400 group-hover:text-blue-600 transition-colors" />
          </motion.div>

          <Link href="/login">
            <motion.button
              whileHover={buttonHover}
              whileTap={buttonTap}
              className="hidden sm:block text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-full hover:bg-blue-50"
            >
              Log in
            </motion.button>
          </Link>

          <Link href="/signup">
            <motion.button
              whileHover={{
                scale: 1.05,
                background: "linear-gradient(to right, #3b82f6, #2563eb)"
              }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:block text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-full shadow-md"
            >
              Get Started
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <FaTimes className="w-6 h-6" />
            ) : (
              <FaBars className="w-6 h-6" />
            )}
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 left-4 right-4 mx-auto max-w-6xl bg-white rounded-xl shadow-lg z-40 border-2 border-gray-300 px-6 py-4 backdrop-blur-sm bg-opacity-90"
          >
            <ul className="flex flex-col space-y-4 text-gray-700 font-medium">
              <motion.li
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer hover:text-blue-600 transition-colors py-2"
              >
                About
              </motion.li>

              <Link href="/send-parcel">
                <motion.li
                  whileHover={{ scale: 1.02 }}
                  className={`cursor-pointer hover:text-blue-600 transition-colors py-2 ${
                    isActive('/send-parcel') ? 'text-blue-600 font-semibold' : ''
                  }`}
                >
                  Send Parcel
                </motion.li>
              </Link>

              <motion.li
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer hover:text-blue-600 transition-colors py-2"
              >
                Track Order
              </motion.li>

              <div className="pt-4 border-t border-gray-200 mt-2">
                <motion.div
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  className="flex items-center justify-center space-x-1 border border-gray-200 rounded-full px-3 py-2 text-sm text-gray-700 hover:border-blue-400 transition-colors cursor-pointer group my-2"
                >
                  <FaGlobe className="text-blue-600 group-hover:text-blue-700 transition-colors" />
                  <span>EN</span>
                  <FaChevronDown className="text-xs text-gray-400 group-hover:text-blue-600 transition-colors" />
                </motion.div>

                <Link href="/login">
                  <motion.button
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    className="w-full text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-full hover:bg-blue-50 my-2"
                  >
                    Log in
                  </motion.button>
                </Link>

                <Link href="/signup">
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      background: "linear-gradient(to right, #3b82f6, #2563eb)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-full shadow-md my-2"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, 
  FiPackage, 
  FiMap, 
  FiClock, 
  FiUser, 
  FiHelpCircle,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiX,
  FiLogOut
} from 'react-icons/fi';
import Logo from '../../../assets/Logo.png';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const Sidebar = ({ collapsed, setCollapsed, mobileMenuOpen, setMobileMenuOpen }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const menuItems = [
    { name: 'Home', path: '/', icon: <FiHome /> },
    { name: 'Send Parcel', path: '/send-parcel', icon: <FiPackage /> },
    { name: 'My Orders', path: '/user/orders', icon: <FiPackage /> },
    { name: 'Track Parcel', path: '/track', icon: <FiMap /> },
    { name: 'Profile', path: '/user/profile', icon: <FiUser /> },
    { name: 'Support', path: '/user/support', icon: <FiHelpCircle /> },
  ];

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

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 100
      }
    })
  };

  const handleLogout = () => {
    if (isMounted) {
      localStorage.removeItem('token');
    }
    router.push('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div 
        initial={{ width: collapsed ? 80 : 256 }}
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ type: "spring", damping: 20 }}
        className={`hidden md:flex flex-col h-screen bg-white text-gray-800 border-r border-gray-200 fixed z-20 shadow-sm`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          {!collapsed && (
            <Image
              src={Logo}
              alt="User Panel Logo"
              width={240}      
              height={100}
              className="object-contain"
              priority
            />
          )}

          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <FiChevronRight className="h-5 w-5" />
            ) : (
              <FiChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex-1 overflow-y-auto py-4 bg-white"
        >
          <ul className="space-y-1">
            {menuItems.map((item, i) => (
              <motion.li 
                key={item.name}
                custom={i}
                variants={itemVariants}
              >
                <Link
                  href={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                    pathname === item.path
                      ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className={`${collapsed ? 'mx-auto' : 'mr-3'} text-lg ${
                    pathname === item.path ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </Link>
              </motion.li>
            ))}
            
            {/* Logout Button */}
            <motion.li 
              custom={menuItems.length}
              variants={itemVariants}
            >
              <button
                onClick={handleLogout}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900`}
                aria-label="Logout"
              >
                <span className={`${collapsed ? 'mx-auto' : 'mr-3'} text-lg text-gray-500`}>
                  <FiLogOut />
                </span>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Logout
                  </motion.span>
                )}
              </button>
            </motion.li>
          </ul>
        </motion.div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 text-center text-xs text-gray-500 bg-white">
          {!collapsed ? (
            <>
              <p>v1.0.0</p>
              <p className="mt-1">© {new Date().getFullYear()} Sheduled</p>
            </>
          ) : (
            <p>v1</p>
          )}
        </div>
      </motion.div>

      {/* Mobile Header with Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-30 shadow-sm">
        <Image
          src={Logo}
          alt="User Panel Logo"
          width={120}
          height={50}
          className="object-contain"
          priority
        />
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <FiX className="h-6 w-6" />
          ) : (
            <FiMenu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-40 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="md:hidden fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white border-r border-gray-200 z-50"
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <Image
                  src={Logo}
                  alt="User Panel Logo"
                  width={120}
                  height={50}
                  className="object-contain"
                />
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="py-4 bg-white h-[calc(100%-130px)] overflow-y-auto"
              >
                <ul className="space-y-1">
                  {menuItems.map((item, i) => (
                    <motion.li 
                      key={item.name}
                      custom={i}
                      variants={itemVariants}
                    >
                      <Link
                        href={item.path}
                        className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                          pathname === item.path
                            ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="mr-3 text-lg">
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </Link>
                    </motion.li>
                  ))}
                  
                  {/* Mobile Logout Button */}
                  <motion.li 
                    custom={menuItems.length}
                    variants={itemVariants}
                  >
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm font-medium transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <span className="mr-3 text-lg">
                        <FiLogOut />
                      </span>
                      <span>Logout</span>
                    </button>
                  </motion.li>
                </ul>
              </motion.div>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 text-center text-xs text-gray-500 bg-white">
                <p>v1.0.0</p>
                <p className="mt-1">© {new Date().getFullYear()} Sheduled</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
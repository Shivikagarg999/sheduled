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
import Logo from '../../../assets/Logo.png'
import Image from 'next/image';


const Sidebar = ({ collapsed, setCollapsed, mobileMenuOpen, setMobileMenuOpen }) => {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiHome /> },
    { name: 'Send Parcel', path: '/send-parcel', icon: <FiPackage /> },
    { name: 'My Orders', path: '/user/orders', icon: <FiPackage /> },
    { name: 'Track Parcel', path: '/track', icon: <FiMap /> },
    { name: 'Order History', path: '/user/history', icon: <FiClock /> },
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
    // Remove token from localStorage
    localStorage.removeItem('token');
    // Redirect to login page
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
                    pathname.startsWith(item.path)
                      ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className={`${collapsed ? 'mx-auto' : 'mr-3'} text-lg ${
                    pathname.startsWith(item.path) ? 'text-blue-600' : 'text-gray-500'
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
              <p className="mt-1">© {new Date().getFullYear()} ParcelX</p>
            </>
          ) : (
            <p>v1</p>
          )}
        </div>
      </motion.div>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg z-30"
      >
        <FiMenu className="h-6 w-6" />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="md:hidden fixed inset-0 z-40 bg-black/80"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div 
              className="h-full w-4/5 max-w-sm bg-white border-r border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <h2 className="text-xl font-bold text-blue-600">USER PANEL</h2>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="py-4 bg-white"
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
                          pathname.startsWith(item.path)
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

              <div className="p-4 border-t border-gray-200 text-center text-xs text-gray-500 bg-white">
                <p>v1.0.0</p>
                <p className="mt-1">© {new Date().getFullYear()} ParcelX</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
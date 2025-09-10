'use client'
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import bgimg from "../../../../public/images/bg.png";
import { FaBox, FaMapMarkerAlt, FaMoneyBillWave, FaCreditCard, FaPhone, FaCalendarAlt, FaTruck, FaMap } from 'react-icons/fa';
import Sidebar from '@/app/dashboard/sidebar/page';
import Nav from '@/app/nav/page';

const statusStages = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'processing', label: 'Processing' },
  { key: 'out-for-delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' }
];

// Mock live tracking data
const mockTrackingData = {
  currentLocation: {
    lat: 25.2048,
    lng: 55.2708,
    address: "Dubai Marina, Dubai, UAE"
  },
  pickupLocation: {
    lat: 25.1972,
    lng: 55.2744,
    address: "JBR, Dubai, UAE"
  },
  deliveryLocation: {
    lat: 25.2138,
    lng: 55.2708,
    address: "Dubai Marina Mall, Dubai, UAE"
  },
  estimatedArrival: "15-20 minutes",
  driverName: "Ahmed Hassan",
  driverPhone: "+971 50 123 4567",
  vehicleNumber: "DXB-A-12345"
};

export default function TrackOrderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [trackingData, setTrackingData] = useState(mockTrackingData);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Check for authentication token
  useEffect(() => {
    const token = localStorage.getItem('token') || 
                  document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    setHasToken(!!token);
  }, []);

  // Initialize Mapbox
  useEffect(() => {
    const initializeMapbox = async () => {
      try {
        if (typeof window !== 'undefined' && !window.mapboxgl) {
          // Load Mapbox GL JS
          const mapboxScript = document.createElement('script');
          mapboxScript.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
          mapboxScript.async = true;
          document.head.appendChild(mapboxScript);

          // Load Mapbox CSS
          const mapboxCSS = document.createElement('link');
          mapboxCSS.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
          mapboxCSS.rel = 'stylesheet';
          document.head.appendChild(mapboxCSS);

          await new Promise((resolve) => {
            mapboxScript.onload = resolve;
          });
        }
        
        if (window.mapboxgl && process.env.NEXT_PUBLIC_MAPBOX_API_KEY) {
          window.mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;
          setMapLoaded(true);
        }
      } catch (error) {
        console.error('Error loading Mapbox:', error);
      }
    };

    initializeMapbox();
  }, []);

  // Initialize map when container is available and mapbox is loaded
  useEffect(() => {
    if (mapLoaded && mapContainer.current && !map.current && window.mapboxgl) {
      try {
        map.current = new window.mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [trackingData.currentLocation.lng, trackingData.currentLocation.lat],
          zoom: 13
        });

        map.current.on('load', () => {
          // Add route layer
          const coordinates = [
            [trackingData.pickupLocation.lng, trackingData.pickupLocation.lat],
            [trackingData.deliveryLocation.lng, trackingData.deliveryLocation.lat]
          ];

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates
                }
              }
            },
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 4,
              'line-dasharray': [2, 2]
            }
          });

          // Add pickup marker
          new window.mapboxgl.Marker({ color: '#10B981' })
            .setLngLat([trackingData.pickupLocation.lng, trackingData.pickupLocation.lat])
            .setPopup(new window.mapboxgl.Popup().setHTML(`
              <div class="p-2">
                <h4 class="font-semibold text-green-600">Pickup Location</h4>
                <p class="text-sm">${trackingData.pickupLocation.address}</p>
              </div>
            `))
            .addTo(map.current);

          // Add delivery marker
          new window.mapboxgl.Marker({ color: '#EF4444' })
            .setLngLat([trackingData.deliveryLocation.lng, trackingData.deliveryLocation.lat])
            .setPopup(new window.mapboxgl.Popup().setHTML(`
              <div class="p-2">
                <h4 class="font-semibold text-red-600">Delivery Location</h4>
                <p class="text-sm">${trackingData.deliveryLocation.address}</p>
              </div>
            `))
            .addTo(map.current);

          // Add current location marker (delivery vehicle)
          const currentLocationMarker = new window.mapboxgl.Marker({ 
            color: '#3B82F6',
            scale: 1.2,
            rotation: 45
          })
            .setLngLat([trackingData.currentLocation.lng, trackingData.currentLocation.lat])
            .setPopup(new window.mapboxgl.Popup().setHTML(`
              <div class="p-2">
                <h4 class="font-semibold text-blue-600 flex items-center">
                  <span class="mr-2">🚚</span> Delivery Vehicle
                </h4>
                <p class="text-sm">${trackingData.currentLocation.address}</p>
                <p class="text-xs text-gray-600 mt-1">Driver: ${trackingData.driverName}</p>
                <p class="text-xs text-gray-600">Vehicle: ${trackingData.vehicleNumber}</p>
              </div>
            `))
            .addTo(map.current);

          // Fit map to show all markers
          const bounds = new window.mapboxgl.LngLatBounds();
          bounds.extend([trackingData.pickupLocation.lng, trackingData.pickupLocation.lat]);
          bounds.extend([trackingData.deliveryLocation.lng, trackingData.deliveryLocation.lat]);
          bounds.extend([trackingData.currentLocation.lng, trackingData.currentLocation.lat]);
          
          map.current.fitBounds(bounds, { padding: 100, maxZoom: 15 });

          // Simulate movement along the route
          const startPoint = {
            lng: trackingData.pickupLocation.lng,
            lat: trackingData.pickupLocation.lat
          };
          const endPoint = {
            lng: trackingData.deliveryLocation.lng,
            lat: trackingData.deliveryLocation.lat
          };
          
          let progress = 0;
          const totalSteps = 20;
          const updateInterval = setInterval(() => {
            progress += 1/totalSteps;
            
            if (progress >= 1) {
              clearInterval(updateInterval);
              return;
            }
            
            const newLng = startPoint.lng + (endPoint.lng - startPoint.lng) * progress;
            const newLat = startPoint.lat + (endPoint.lat - startPoint.lat) * progress;
            const variedLng = newLng + (Math.random() - 0.5) * 0.001;
            const variedLat = newLat + (Math.random() - 0.5) * 0.001;
            
            currentLocationMarker.setLngLat([variedLng, variedLat]);
            
            setTrackingData(prev => ({
              ...prev,
              currentLocation: {
                ...prev.currentLocation,
                lng: variedLng,
                lat: variedLat,
                address: `Moving towards destination (${Math.round(progress * 100)}%)`
              }
            }));
          }, 3000);

          return () => clearInterval(updateInterval);
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapLoaded, trackingData]);

  // Fetch order data
  useEffect(() => {
    if (!id) {
      setError('No tracking ID provided');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`http://72.60.111.193:5000/api/orders/track/${id}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch order details');
        }

        const data = await res.json();
        if (!data?.trackingNumber) {
          throw new Error('Invalid order data received');
        }

        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Animation variants
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full relative bg-center bg-no-repeat bg-cover" 
           style={{ backgroundImage: `url(${bgimg.src})` }}>
        {hasToken ? (
          <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        ) : (
          <Nav />
        )}
        
        <div className={`flex items-center justify-center min-h-screen px-4 ${
          hasToken ? (sidebarCollapsed ? 'ml-0 lg:ml-16' : 'ml-0 lg:ml-64') : 'ml-0'
        } transition-all duration-300`}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full relative bg-center bg-no-repeat bg-cover" 
           style={{ backgroundImage: `url(${bgimg.src})` }}>
        {hasToken ? (
          <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        ) : (
          <Nav />
        )}
        
        <div className={`flex items-center justify-center min-h-screen px-4 ${
          hasToken ? (sidebarCollapsed ? 'ml-0 lg:ml-16' : 'ml-0 lg:ml-64') : 'ml-0'
        } transition-all duration-300`}>
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-xl backdrop-blur-sm bg-opacity-90 border border-blue-200 text-center"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-red-600">Error</h2>
            <p className="text-gray-700 mb-6 text-sm sm:text-base">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <motion.button
                whileHover={buttonHover}
                whileTap={buttonTap}
                onClick={() => router.push('/enter-tracking')}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-medium"
              >
                Enter Tracking Number
              </motion.button>
              <motion.button
                whileHover={buttonHover}
                whileTap={buttonTap}
                onClick={() => router.refresh()}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-800 rounded-lg text-sm sm:text-base font-medium"
              >
                Refresh Page
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-center bg-no-repeat bg-cover" 
         style={{ backgroundImage: `url(${bgimg.src})` }}>
      {hasToken ? (
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      ) : (
        <Nav />
      )}
      
      <div className={`min-h-screen ${
        hasToken ? (sidebarCollapsed ? 'ml-0 lg:ml-16' : 'ml-0 lg:ml-64') : 'ml-0'
      } transition-all duration-300`}>
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex justify-center">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm bg-opacity-90 border border-blue-200"
            >
              {/* Header Section */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 text-white">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1">
                    <motion.h2 
                      variants={fadeIn}
                      className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2"
                    >
                      Order Tracking
                    </motion.h2>
                    <motion.p 
                      variants={fadeIn}
                      className="text-blue-100 text-sm sm:text-base break-all sm:break-normal"
                    >
                      Tracking Number: <span className="font-mono font-semibold">{order.trackingNumber}</span>
                    </motion.p>
                  </div>
                  <div className="flex flex-col lg:items-end">
                    <motion.div 
                      variants={fadeIn}
                      className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium w-fit ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'out-for-delivery' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status.replace(/-/g, ' ').toUpperCase()}
                    </motion.div>
                    <motion.p 
                      variants={fadeIn}
                      className="text-blue-100 text-xs sm:text-sm mt-1"
                    >
                      Updated: {formatDate(order.updatedAt)}
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* Map Section */}
              <div className="p-4 sm:p-6">
                <motion.h3 
                  variants={fadeIn}
                  className="text-lg sm:text-xl font-semibold text-gray-800 mb-4"
                >
                  Delivery Map
                </motion.h3>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Driver Info Card */}
                  <motion.div 
                    variants={fadeIn}
                    className="bg-blue-50 rounded-xl p-4 lg:col-span-1"
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {trackingData.driverName.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold text-sm">{trackingData.driverName}</h4>
                        <p className="text-xs text-gray-600">Your Driver</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center">
                        <FaPhone className="mr-2 text-blue-600" />
                        <span>{trackingData.driverPhone}</span>
                      </div>
                      <div className="flex items-center">
                        <FaTruck className="mr-2 text-blue-600" />
                        <span>{trackingData.vehicleNumber}</span>
                      </div>
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-blue-600" />
                        <span className="truncate">{trackingData.currentLocation.address}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Map Container */}
                  <div className="lg:col-span-3">
                    <div className="bg-gray-100 rounded-xl overflow-hidden relative" style={{ height: '300px' }}>
                      {mapLoaded ? (
                        <>
                          <div ref={mapContainer} className="w-full h-full" />
                          {error && (
                            <div className="absolute inset-0 bg-red-50 bg-opacity-80 flex items-center justify-center">
                              <div className="text-center p-4">
                                <svg className="w-10 h-10 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-red-600 font-medium">Map loading failed</p>
                                <button 
                                  onClick={() => setMapLoaded(false)}
                                  className="mt-3 px-3 py-1 bg-red-100 text-red-600 rounded text-sm"
                                >
                                  Retry
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"
                            />
                            <p className="text-sm text-gray-600">Loading map...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <motion.div 
                  variants={fadeIn}
                  className="bg-green-50 rounded-xl p-4 mt-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                      <div>
                        <p className="font-medium text-sm">Current Status: {order.status.replace(/-/g, ' ')}</p>
                        <p className="text-xs text-gray-600">{trackingData.currentLocation.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-green-600">ETA: {trackingData.estimatedArrival}</p>
                      <p className="text-xs text-gray-600">Last updated: just now</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Order Details Sections */}
              <motion.div 
                variants={staggerContainer}
                className="p-4 sm:p-6 space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Pickup Information */}
                  <motion.div 
                    variants={fadeIn}
                    className="bg-blue-50 rounded-xl p-4 sm:p-5"
                  >
                    <div className="flex items-center mb-4">
                      <FaMapMarkerAlt className="text-blue-600 mr-2 text-sm sm:text-base" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">Pickup Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Building</p>
                        <p className="font-medium text-sm sm:text-base break-words">{order.pickupBuilding}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Apartment/Office</p>
                        <p className="font-medium text-sm sm:text-base break-words">{order.pickupApartment}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Area</p>
                        <p className="font-medium text-sm sm:text-base break-words">{order.pickupArea}, {order.pickupEmirate}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Contact Number</p>
                        <p className="font-medium text-sm sm:text-base">{order.pickupContact}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Delivery Information */}
                  <motion.div 
                    variants={fadeIn}
                    className="bg-green-50 rounded-xl p-4 sm:p-5"
                  >
                    <div className="flex items-center mb-4">
                      <FaMapMarkerAlt className="text-green-600 mr-2 text-sm sm:text-base" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">Delivery Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Building</p>
                        <p className="font-medium text-sm sm:text-base break-words">{order.dropBuilding}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Apartment/Office</p>
                        <p className="font-medium text-sm sm:text-base break-words">{order.dropApartment}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Area</p>
                        <p className="font-medium text-sm sm:text-base break-words">{order.dropArea}, {order.dropEmirate}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500">Contact Number</p>
                        <p className="font-medium text-sm sm:text-base">{order.dropContact}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Order Summary */}
                <motion.div 
                  variants={fadeIn}
                  className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mt-4"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <FaBox className="text-blue-500 mr-2 text-sm" />
                        <span className="text-xs sm:text-sm text-gray-500">Delivery Type</span>
                      </div>
                      <p className="font-medium capitalize text-sm sm:text-base">{order.deliveryType.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <FaCreditCard className="text-blue-500 mr-2 text-sm" />
                        <span className="text-xs sm:text-sm text-gray-500">Payment Method</span>
                      </div>
                      <p className="font-medium capitalize text-sm sm:text-base">{order.paymentMethod}</p>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <FaMoneyBillWave className="text-blue-500 mr-2 text-sm" />
                        <span className="text-xs sm:text-sm text-gray-500">Amount</span>
                      </div>
                      <p className="font-medium text-sm sm:text-base">AED {order.amount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <FaCalendarAlt className="text-blue-500 mr-2 text-sm" />
                        <span className="text-xs sm:text-sm text-gray-500">Order Date</span>
                      </div>
                      <p className="font-medium text-sm sm:text-base">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <FaPhone className="text-blue-500 mr-2 text-sm" />
                        <span className="text-xs sm:text-sm text-gray-500">Customer Support</span>
                      </div>
                      <p className="font-medium text-sm sm:text-base">+971 50 123 4567</p>
                    </div>
                  </div>
                </motion.div>

                {/* Notes Section */}
                {order.notes && (
                  <motion.div 
                    variants={fadeIn}
                    className="bg-yellow-50 rounded-xl p-4 sm:p-5 mt-4"
                  >
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Special Instructions</h4>
                    <p className="text-gray-700 text-sm sm:text-base break-words">{order.notes}</p>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div 
                  variants={fadeIn}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8"
                >
                  <motion.button
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    onClick={() => router.push('/enter-tracking')}
                    className="flex-1 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base"
                  >
                    Track Another Package
                  </motion.button>
                  <motion.button
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 10px 20px rgba(191, 219, 254, 0.5)"
                    }}
                    whileTap={buttonTap}
                    onClick={() => router.push('/send-parcel')}
                    className="flex-1 bg-blue-100 text-blue-800 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base"
                  >
                    Send New Package
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
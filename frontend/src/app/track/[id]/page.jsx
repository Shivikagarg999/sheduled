'use client'

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import bgimg from "../../../../public/images/bg.png";
import { 
  FaBox, 
  FaMapMarkerAlt, 
  FaMoneyBillWave, 
  FaCreditCard, 
  FaPhone, 
  FaCalendarAlt, 
  FaTruck, 
  FaMap, 
  FaRoute,
  FaSearch,
  FaShippingFast,
  FaUser,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaLocationArrow,
  FaMapPin,
  FaInfoCircle
} from 'react-icons/fa';
import Sidebar from '@/app/dashboard/sidebar/page';
import Nav from '@/app/nav/page';
import { io } from "socket.io-client";

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
  const [hasToken, setHasToken] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [socket, setSocket] = useState(null);
  const [userId] = useState(() => `user_${Date.now()}`);
  
  // Driver tracking states
  const [driverDetails, setDriverDetails] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [estimatedDistance, setEstimatedDistance] = useState(null);
  const [estimatedDuration, setEstimatedDuration] = useState(null);
  
  // Map states
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const currentLocationMarkerRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const deliveryMarkerRef = useRef(null);
  const routeSourceRef = useRef(null);

  // Default zoom configuration
  const [mapZoom, setMapZoom] = useState(12);
  const [mapCenter, setMapCenter] = useState([55.2758, 25.2098]); // Default Dubai coordinates

  // Check for authentication token
  useEffect(() => {
    const token = localStorage.getItem('token') || 
                  document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    setHasToken(!!token);
  }, []);

  // Initialize Socket.IO
  useEffect(() => {
    const newSocket = io("http://72.60.111.193:5000", {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      newSocket.emit("join", { userId: userId });
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setTrackingActive(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  // Listen for driver location updates
  useEffect(() => {
    if (!socket || !id) return;

    const handleDriverData = (data) => {
      console.log("🚚 Driver data received:", data);
      
      if (data.error) {
        console.warn("❌ Error:", data.error);
        return;
      }

      if (data.trackingNumber === id || !data.trackingNumber) {
        if (data.location) {
          const newLocation = {
            lat: data.location.latitude,
            lng: data.location.longitude
          };
          
          setDriverLocation(newLocation);
          setLastUpdate(new Date());
          setTrackingActive(true);
          
          console.log("📍 Driver location updated:", newLocation);
        }

        if (data.driverId && order?.driver?._id) {
          setDriverDetails({
            id: data.driverId,
            ...order.driver
          });
        }
      }
    };

    socket.on("driverdata", handleDriverData);

    // Request driver location when order is loaded
    if (order && order.driver) {
      console.log("📤 Requesting driver location for:", id);
      socket.emit("tracknum", { 
        trackingnum: id,
        driverId: order.driver._id 
      });
    }

    return () => {
      socket.off("driverdata", handleDriverData);
    };
  }, [socket, id, order]);

  // Initialize Mapbox
  useEffect(() => {
    const initializeMapbox = async () => {
      try {
        if (typeof window !== 'undefined' && !window.mapboxgl) {
          const mapboxScript = document.createElement('script');
          mapboxScript.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
          mapboxScript.async = true;
          document.head.appendChild(mapboxScript);

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

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(2);
  };

  // Fetch route from Mapbox Directions API
  const fetchRoute = async (start, end, current = null) => {
    if (!process.env.NEXT_PUBLIC_MAPBOX_API_KEY) return null;

    try {
      const coordinates = current 
        ? `${current[0]},${current[1]};${end[0]},${end[1]}`
        : `${start[0]},${start[1]};${end[0]},${end[1]}`;

      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          geometry: route.geometry,
          distance: (route.distance / 1000).toFixed(2), // Convert to km
          duration: Math.ceil(route.duration / 60) // Convert to minutes
        };
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
    return null;
  };

  // Initialize map with default zoom
  useEffect(() => {
    if (!mapLoaded || !mapContainer.current || map.current || !window.mapboxgl || !order) return;

    try {
      // Get coordinates
      const pickupCoords = order.pickupLocation?.coordinates || [55.2708, 25.2048];
      const dropCoords = order.dropLocation?.coordinates || [55.2808, 25.2148];

      // Ensure coordinates are in [lng, lat] format
      const pickupLng = Array.isArray(pickupCoords) ? pickupCoords[0] : pickupCoords.longitude || 55.2708;
      const pickupLat = Array.isArray(pickupCoords) ? pickupCoords[1] : pickupCoords.latitude || 25.2048;
      const dropLng = Array.isArray(dropCoords) ? dropCoords[0] : dropCoords.longitude || 55.2808;
      const dropLat = Array.isArray(dropCoords) ? dropCoords[1] : dropCoords.latitude || 25.2148;

      const centerLng = (pickupLng + dropLng) / 2;
      const centerLat = (pickupLat + dropLat) / 2;

      console.log("🗺️ Initializing map with:", { pickupLng, pickupLat, dropLng, dropLat });

      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [centerLng, centerLat],
        zoom: mapZoom, // Use state variable for zoom
        minZoom: 10, // Minimum zoom level
        maxZoom: 18  // Maximum zoom level
      });

      // Add navigation controls with zoom buttons
      map.current.addControl(new window.mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true
      }), 'top-right');

      // Add scale control
      map.current.addControl(new window.mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
      }));

      map.current.on('load', async () => {
        console.log("🗺️ Map loaded successfully");

        // Fetch and add route
        const routeData = await fetchRoute(
          [pickupLng, pickupLat],
          [dropLng, dropLat]
        );

        if (routeData) {
          setEstimatedDistance(routeData.distance);
          setEstimatedDuration(routeData.duration);

          // Add route layer
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: routeData.geometry
            }
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 5,
              'line-opacity': 0.75
            }
          });

          // Add route outline
          map.current.addLayer({
            id: 'route-outline',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#1e40af',
              'line-width': 7,
              'line-opacity': 0.4
            }
          }, 'route');

          routeSourceRef.current = 'route';
        } else {
          // Fallback: simple straight line
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [[pickupLng, pickupLat], [dropLng, dropLat]]
              }
            }
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
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

          routeSourceRef.current = 'route';
        }

        // Create custom pickup marker element
        const pickupEl = document.createElement('div');
        pickupEl.className = 'custom-marker';
        pickupEl.innerHTML = `
          <div style="
            background-color: #10B981;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            color: white;
            font-size: 18px;
          ">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
            </svg>
          </div>
        `;

        // Add pickup marker
        pickupMarkerRef.current = new window.mapboxgl.Marker({ 
          element: pickupEl,
          anchor: 'bottom'
        })
          .setLngLat([pickupLng, pickupLat])
          .setPopup(new window.mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-3">
              <h4 class="font-bold text-green-600 mb-2 flex items-center">
                <FaMapPin className="mr-2" />
                Pickup Location
              </h4>
              <p class="text-sm font-medium">${order.pickupBuilding}</p>
              <p class="text-xs text-gray-600">${order.pickupApartment}</p>
              <p class="text-xs text-gray-600">${order.pickupArea}, ${order.pickupEmirate}</p>
              <p class="text-xs text-blue-600 mt-2 flex items-center">
                <FaPhone className="mr-1" /> ${order.pickupContact}
              </p>
            </div>
          `))
          .addTo(map.current);

        // Create custom delivery marker element
        const deliveryEl = document.createElement('div');
        deliveryEl.className = 'custom-marker';
        deliveryEl.innerHTML = `
          <div style="
            background-color: #EF4444;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            color: white;
            font-size: 18px;
          ">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
            </svg>
          </div>
        `;

        // Add delivery marker
        deliveryMarkerRef.current = new window.mapboxgl.Marker({ 
          element: deliveryEl,
          anchor: 'bottom'
        })
          .setLngLat([dropLng, dropLat])
          .setPopup(new window.mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-3">
              <h4 class="font-bold text-red-600 mb-2 flex items-center">
                <FaMapPin className="mr-2" />
                Delivery Location
              </h4>
              <p class="text-sm font-medium">${order.dropBuilding}</p>
              <p class="text-xs text-gray-600">${order.dropApartment}</p>
              <p class="text-xs text-gray-600">${order.dropArea}, ${order.dropEmirate}</p>
              <p class="text-xs text-blue-600 mt-2 flex items-center">
                <FaPhone className="mr-1" /> ${order.dropContact}
              </p>
            </div>
          `))
          .addTo(map.current);

        // Fit map to show all markers with padding
        const bounds = new window.mapboxgl.LngLatBounds();
        bounds.extend([pickupLng, pickupLat]);
        bounds.extend([dropLng, dropLat]);
        
        map.current.fitBounds(bounds, { 
          padding: { top: 100, bottom: 100, left: 100, right: 100 },
          maxZoom: 14,
          duration: 1000
        });

        // Update zoom state after fitBounds
        setTimeout(() => {
          if (map.current) {
            setMapZoom(map.current.getZoom());
          }
        }, 1200);
      });

      // Track zoom changes
      map.current.on('zoom', () => {
        if (map.current) {
          setMapZoom(map.current.getZoom());
        }
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to load map');
    }

    return () => {
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.remove();
      }
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.remove();
      }
      if (deliveryMarkerRef.current) {
        deliveryMarkerRef.current.remove();
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapLoaded, order]);

  // Update driver location marker and route
  useEffect(() => {
    if (!map.current || !driverLocation || !window.mapboxgl || !order) return;

    try {
      const driverLng = driverLocation.lng;
      const driverLat = driverLocation.lat;

      console.log("📍 Updating driver location:", { driverLng, driverLat });

      if (!currentLocationMarkerRef.current) {
        // Create custom driver marker element
        const driverEl = document.createElement('div');
        driverEl.className = 'driver-marker';
        driverEl.innerHTML = `
          <div style="
            background-color: #3B82F6;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 4px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.5);
            color: white;
            font-size: 20px;
            animation: pulse 2s infinite;
          ">
            <FaTruck />
          </div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          </style>
        `;

        currentLocationMarkerRef.current = new window.mapboxgl.Marker({ 
          element: driverEl,
          anchor: 'center'
        })
          .setLngLat([driverLng, driverLat])
          .setPopup(new window.mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-3">
              <h4 class="font-bold text-blue-600 mb-2 flex items-center">
                <FaTruck className="mr-2" />
                Driver Location
              </h4>
              <p class="text-sm font-medium">${driverDetails?.name || 'Driver'}</p>
              <p class="text-xs text-gray-600">Vehicle: ${driverDetails?.vehicleNumber || 'N/A'}</p>
              <p class="text-xs text-gray-600 flex items-center">
                <FaPhone className="mr-1" /> ${driverDetails?.phone || 'N/A'}
              </p>
              <div class="mt-2 pt-2 border-t border-gray-200">
                <p class="text-xs text-green-600 font-medium flex items-center">
                  <span class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Live Tracking Active
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  Updated: ${new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          `))
          .addTo(map.current);

        console.log("✅ Driver marker created");
      } else {
        // Smoothly animate marker to new position
        currentLocationMarkerRef.current.setLngLat([driverLng, driverLat]);
        
        // Update popup
        const popup = currentLocationMarkerRef.current.getPopup();
        if (popup) {
          popup.setHTML(`
            <div class="p-3">
              <h4 class="font-bold text-blue-600 mb-2 flex items-center">
                <FaTruck className="mr-2" />
                Driver Location
              </h4>
              <p class="text-sm font-medium">${driverDetails?.name || 'Driver'}</p>
              <p class="text-xs text-gray-600">Vehicle: ${driverDetails?.vehicleNumber || 'N/A'}</p>
              <p class="text-xs text-gray-600 flex items-center">
                <FaPhone className="mr-1" /> ${driverDetails?.phone || 'N/A'}
              </p>
              <div class="mt-2 pt-2 border-t border-gray-200">
                <p class="text-xs text-green-600 font-medium flex items-center">
                  <span class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Live Tracking Active
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  Updated: ${new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          `);
        }
        
        console.log("✅ Driver marker updated");
      }

      // Update route from driver's current location to delivery
      const dropCoords = order.dropLocation?.coordinates || [55.2808, 25.2148];
      const dropLng = Array.isArray(dropCoords) ? dropCoords[0] : dropCoords.longitude || 55.2808;
      const dropLat = Array.isArray(dropCoords) ? dropCoords[1] : dropCoords.latitude || 25.2148;

      // Fetch new route from current driver location to drop location
      fetchRoute(
        null,
        [dropLng, dropLat],
        [driverLng, driverLat]
      ).then(routeData => {
        if (routeData && map.current.getSource('active-route')) {
          map.current.getSource('active-route').setData({
            type: 'Feature',
            properties: {},
            geometry: routeData.geometry
          });
          
          setEstimatedDistance(routeData.distance);
          setEstimatedDuration(routeData.duration);
        } else if (routeData && !map.current.getSource('active-route')) {
          // Add active route layer
          map.current.addSource('active-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: routeData.geometry
            }
          });

          map.current.addLayer({
            id: 'active-route',
            type: 'line',
            source: 'active-route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#10B981',
              'line-width': 5,
              'line-opacity': 0.9
            }
          });

          // Add animated dash
          map.current.addLayer({
            id: 'active-route-dash',
            type: 'line',
            source: 'active-route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#fff',
              'line-width': 2,
              'line-dasharray': [0, 4, 3],
              'line-opacity': 0.8
            }
          });

          setEstimatedDistance(routeData.distance);
          setEstimatedDuration(routeData.duration);
        }
      });

      // Calculate distance to delivery
      const distance = calculateDistance(driverLat, driverLng, dropLat, dropLng);
      console.log(`📏 Distance to delivery: ${distance} km`);

      // Smoothly pan to driver location
      map.current.easeTo({
        center: [driverLng, driverLat],
        duration: 1000
      });

      // Fit bounds to show driver and delivery location
      const bounds = new window.mapboxgl.LngLatBounds();
      bounds.extend([driverLng, driverLat]);
      bounds.extend([dropLng, dropLat]);
      
      map.current.fitBounds(bounds, { 
        padding: { top: 100, bottom: 100, left: 100, right: 100 },
        maxZoom: 14,
        duration: 1000
      });

    } catch (error) {
      console.error('Error updating driver marker:', error);
    }
  }, [driverLocation, driverDetails, order]);

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
        const res = await fetch(`https://backend.sheduled.com/api/orders/track/${id}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch order details');
        }

        const data = await res.json();
        if (!data?.trackingNumber) {
          throw new Error('Invalid order data received');
        }

        setOrder(data);
        
        if (data.driver) {
          setDriverDetails({
            id: data.driver._id,
            name: data.driver.name,
            phone: data.driver.phone,
            vehicleNumber: data.driver.vehicleNumber
          });
        }

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

  if (error && !order) {
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
            className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-blue-200 text-center"
          >
            <div className="flex justify-center mb-4">
              <FaExclamationTriangle className="text-red-500 text-4xl" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-red-600">Error</h2>
            <p className="text-gray-700 mb-6 text-sm sm:text-base">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <motion.button
                whileHover={buttonHover}
                whileTap={buttonTap}
                onClick={() => router.push('/track')}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-medium flex items-center justify-center"
              >
                <FaSearch className="mr-2" />
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
    <div className="min-h-screen w-full mt-18 relative bg-center bg-no-repeat bg-cover" 
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
                      className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 flex items-center"
                    >
                      <FaRoute className="mr-3" />
                      Live Order Tracking
                    </motion.h2>
                    <motion.p 
                      variants={fadeIn}
                      className="text-blue-100 text-sm sm:text-base break-all sm:break-normal flex items-center"
                    >
                      <FaMap className="mr-2" />
                      Tracking Number: <span className="font-mono font-semibold ml-1">{order.trackingNumber}</span>
                    </motion.p>
                  </div>
                  <div className="flex flex-col lg:items-end gap-2">
                    <motion.div 
                      variants={fadeIn}
                      className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium w-fit flex items-center ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'out-for-delivery' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status === 'delivered' && <FaCheckCircle className="mr-1" />}
                      {order.status === 'out-for-delivery' && <FaTruck className="mr-1" />}
                      {order.status === 'processing' && <FaClock className="mr-1" />}
                      {order.status === 'pending' && <FaClock className="mr-1" />}
                      {order.status.replace(/-/g, ' ').toUpperCase()}
                    </motion.div>
                    {estimatedDuration && estimatedDistance && (
                      <motion.div 
                        variants={fadeIn}
                        className="bg-white bg-opacity-20 px-3 py-1 rounded-lg text-xs flex items-center"
                      >
                        <FaMapMarkerAlt className="mr-1" />
                        {estimatedDistance} km • 
                        <FaClock className="ml-2 mr-1" />
                        {estimatedDuration} min
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Map Section */}
              <div className="p-4 sm:p-6">
                <motion.div 
                  variants={fadeIn}
                  className="flex justify-between items-center mb-4"
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                    <FaRoute className="mr-2 text-blue-600" />
                    Live Delivery Route
                  </h3>
                  {trackingActive && (
                    <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs sm:text-sm text-green-600 font-medium">Live Tracking</span>
                    </div>
                  )}
                </motion.div>

                {/* Map Legend */}
                <motion.div 
                  variants={fadeIn}
                  className="mb-4 bg-gray-50 rounded-lg p-3 flex flex-wrap gap-4 text-xs"
                >
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-2 flex items-center justify-center text-white text-xs">
                      <FaMapPin />
                    </div>
                    <span className="text-gray-700">Pickup Location</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2 flex items-center justify-center text-white text-xs">
                      <FaMapPin />
                    </div>
                    <span className="text-gray-700">Delivery Location</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-2 flex items-center justify-center text-white text-xs">
                      <FaTruck />
                    </div>
                    <span className="text-gray-700">Driver Location</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-1 bg-blue-500 mr-2"></div>
                    <span className="text-gray-700">Planned Route</span>
                  </div>
                  {trackingActive && (
                    <div className="flex items-center">
                      <div className="w-8 h-1 bg-green-500 mr-2"></div>
                      <span className="text-gray-700">Active Route</span>
                    </div>
                  )}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Map Container */}
                  <div className="lg:col-span-3">
                    <div className="bg-gray-100 rounded-xl overflow-hidden relative shadow-lg" style={{ height: '500px' }}>
                      {mapLoaded ? (
                        <div ref={mapContainer} className="w-full h-full" />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-blue-100">
                          <div className="text-center">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                            />
                            <p className="text-sm text-gray-600 font-medium">Loading interactive map...</p>
                            <p className="text-xs text-gray-500 mt-2 flex items-center justify-center">
                              <FaMap className="mr-1" />
                              Preparing route visualization
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Status Bar */}
                <motion.div 
                  variants={fadeIn}
                  className={`rounded-xl p-4 mt-4 shadow-md ${
                    trackingActive 
                      ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200' 
                      : 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center flex-1">
                      <div className={`w-4 h-4 rounded-full mr-3 shadow-lg ${
                        trackingActive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="font-bold text-sm mb-1 flex items-center">
                          {order.status === 'delivered' && <FaCheckCircle className="mr-2 text-green-600" />}
                          {order.status === 'out-for-delivery' && <FaTruck className="mr-2 text-blue-600" />}
                          {order.status === 'processing' && <FaClock className="mr-2 text-yellow-600" />}
                          {order.status === 'pending' && <FaClock className="mr-2 text-gray-600" />}
                          {order.status.replace(/-/g, ' ').toUpperCase()}
                        </p>
                        {driverLocation && (
                          <>
                            <p className="text-xs text-gray-600 flex items-center">
                              <FaLocationArrow className="mr-1" />
                              Lat: {driverLocation.lat.toFixed(6)}, Lng: {driverLocation.lng.toFixed(6)}
                            </p>
                            {estimatedDistance && (
                              <p className="text-xs text-gray-600 mt-1 flex items-center">
                                <FaMapMarkerAlt className="mr-1" />
                                {estimatedDistance} km from destination
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {trackingActive ? (
                        <>
                          <p className="font-bold text-sm text-green-700 flex items-center justify-end">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            <FaCheckCircle className="mr-1" />
                            Live Tracking Active
                          </p>
                          {estimatedDuration && (
                            <p className="text-xs text-green-600 mt-1 flex items-center justify-end">
                              <FaClock className="mr-1" />
                              ETA: ~{estimatedDuration} minutes
                            </p>
                          )}
                          <p className="text-xs text-gray-600 mt-1 flex items-center justify-end">
                            <FaInfoCircle className="mr-1" />
                            Last update: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'N/A'}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-sm text-yellow-700 flex items-center justify-end">
                            <FaClock className="mr-1" />
                            Waiting for driver
                          </p>
                          <p className="text-xs text-gray-600 mt-1">Location updates will appear here</p>
                        </>
                      )}
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
                    className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-5 shadow-md border border-green-200"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl shadow-md">
                        <FaMapPin />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 ml-3">Pickup Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Building</p>
                        <p className="font-semibold text-sm sm:text-base break-words">{order.pickupBuilding}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Apartment/Office</p>
                        <p className="font-semibold text-sm sm:text-base break-words">{order.pickupApartment}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Area</p>
                        <p className="font-semibold text-sm sm:text-base break-words">{order.pickupArea}, {order.pickupEmirate}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Contact Number</p>
                        <p className="font-semibold text-sm sm:text-base flex items-center">
                          <FaPhone className="mr-2 text-green-600" />
                          {order.pickupContact}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Delivery Information */}
                  <motion.div 
                    variants={fadeIn}
                    className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 sm:p-5 shadow-md border border-red-200"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white text-xl shadow-md">
                        <FaMapPin />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 ml-3">Delivery Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Building</p>
                        <p className="font-semibold text-sm sm:text-base break-words">{order.dropBuilding}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Apartment/Office</p>
                        <p className="font-semibold text-sm sm:text-base break-words">{order.dropApartment}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Area</p>
                        <p className="font-semibold text-sm sm:text-base break-words">{order.dropArea}, {order.dropEmirate}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Contact Number</p>
                        <p className="font-semibold text-sm sm:text-base flex items-center">
                          <FaPhone className="mr-2 text-red-600" />
                          {order.dropContact}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Order Summary */}
                <motion.div 
                  variants={fadeIn}
                  className="bg-white border-2 border-blue-200 rounded-xl p-4 sm:p-5 mt-4 shadow-md"
                >
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <FaBox className="mr-2 text-blue-600" />
                    Order Summary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <FaBox className="text-blue-500 mr-2 text-sm" />
                        <span className="text-xs sm:text-sm text-gray-500">Delivery Type</span>
                      </div>
                      <p className="font-bold capitalize text-sm sm:text-base">{order.deliveryType?.replace('-', ' ')}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <FaCreditCard className="text-blue-500 mr-2 text-sm" />
                        <span className="text-xs sm:text-sm text-gray-500">Payment Method</span>
                      </div>
                      <p className="font-bold capitalize text-sm sm:text-base">{order.paymentMethod}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <FaMoneyBillWave className="text-blue-500 mr-2 text-sm" />
                        <span className="text-xs sm:text-sm text-gray-500">Amount</span>
                      </div>
                      <p className="font-bold text-sm sm:text-base text-green-600">AED {order.amount?.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <FaCalendarAlt className="text-blue-500 mr-2 text-sm" />
                        <span className="text-xs sm:text-sm text-gray-500">Order Date</span>
                      </div>
                      <p className="font-bold text-sm sm:text-base">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Notes Section */}
                {order.notes && (
                  <motion.div 
                    variants={fadeIn}
                    className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4 sm:p-5 mt-4 shadow-md"
                  >
                    <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <FaInfoCircle className="mr-2" />
                      Special Instructions
                    </h4>
                    <p className="text-gray-700 text-sm sm:text-base break-words bg-white rounded-lg p-3">{order.notes}</p>
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
                    onClick={() => router.push('/track')}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                  >
                    <FaSearch className="mr-2" />
                    Track Another Package
                  </motion.button>
                  <motion.button
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    onClick={() => router.push('/send-parcel')}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                  >
                    <FaShippingFast className="mr-2" />
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
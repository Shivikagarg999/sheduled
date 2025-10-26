'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import bgimg from "../../../public/images/bg.png";
import Nav from '../nav/page';
import Sidebar from '../dashboard/sidebar/page';
import { io } from "socket.io-client";

export default function EnterTrackingPage() {
  const [trackingId, setTrackingId] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState("1346435");

  // driver details
  const [driverDetails, setDriverDetails] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);

  const router = useRouter();

  // connect socket
  useEffect(() => {
    const newSocket = io("http://72.60.111.193:5000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      newSocket.emit("join", { userId: userId });
    });

    newSocket.on("message", (data) => {
      console.log("📩 Message from server:", data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // check token
  useEffect(() => {
    const token = localStorage.getItem('token') || 
                  document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    setHasToken(!!token);
  }, []);

  // listen for driver location updates
  useEffect(() => {
    if (!socket || !trackingId) return;

    const trackNum = trackingId.trim().toUpperCase();

    socket.on(`driverLocation-${trackNum}`, (data) => {
      console.log("🚚 Driver live location:", data);
      setDriverLocation({ lat: data.latitude, lng: data.longitude });
    });

    return () => {
      socket.off(`driverLocation-${trackNum}`);
    };
  }, [socket, trackingId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    const trackNum = trackingId.trim().toUpperCase();
    setTrackingId(trackNum);

    if (socket && socket.connected) {
      // emit tracking number
      socket.emit("tracknum", { trackingnum: trackNum , userId: userId});

      // receive driver details
      socket.on("driverdata", (data) => {
        if (data.error) {
          console.warn("❌", data.error);
        } else {
          console.log("📦 Driver data:", data);
          setDriverDetails(data.driverDetails);
        }
      });
      console.log("📤 Emitted to server:", trackNum);
    } else {
      console.warn("⚠️ Socket not connected!");
    }

    router.push(`/track/${trackNum}`);
  };

  return (
    <div
      className="min-h-[100vh] w-full overflow-x-hidden relative bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: `url(${bgimg.src})` }}
    >
      {hasToken ? (
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      ) : (
        <Nav />
      )}

      <div
        className={`flex items-center justify-center transition-all duration-300 min-h-[100vh] ${
          hasToken ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : 'ml-0'
        }`}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-md mx-auto p-8 bg-transparent border border-blue-200"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">
            Track Your Order
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="AExxx"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                pattern="[A-Za-z0-9]+"
                title="Please enter a valid tracking number"
              />
            </div>

            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:scale-105 transition-transform"
              >
                Track Order
              </button>

              <button
                type="button"
                className="w-full bg-blue-100 text-blue-800 font-medium px-6 py-3 rounded-lg shadow-md hover:scale-105 transition-transform"
                onClick={() => router.push('/send-parcel')}
              >
                Send a Parcel Instead
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Need help?{' '}
              <span className="text-blue-600 cursor-pointer hover:underline">
                Contact our support
              </span>
            </p>
          </div>

          {/* Driver Info & Location */}
          {driverDetails && (
            <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-white">
              <h3 className="font-semibold text-lg mb-2">Driver Details</h3>
              <p><strong>Name:</strong> {driverDetails.name}</p>
              <p><strong>Phone:</strong> {driverDetails.phone}</p>
              <p><strong>Vehicle:</strong> {driverDetails.vehicleNumber}</p>

              {driverLocation && (
                <div className="mt-4 p-2 border border-gray-200 rounded">
                  <p><strong>Live Location:</strong></p>
                  <p>Latitude: {driverLocation.lat}</p>
                  <p>Longitude: {driverLocation.lng}</p>
                  {/* Replace this with Google Maps / Leaflet for actual map */}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

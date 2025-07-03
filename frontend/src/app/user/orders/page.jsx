'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../dashboard/sidebar/page';
import { FiBox, FiMapPin, FiClock } from 'react-icons/fi';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const userId = localStorage.getItem('userId'); // Update if using cookies/session
      if (!userId) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/user/allOrders/${userId}`);
        setOrders(res.data);
      } catch (err) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
   <div className="flex min-h-screen bg-gray-100">
  {/* Fixed Sidebar */}
  <div className="fixed top-0 left-0 h-full w-64 z-30">
    <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
  </div>

  {/* Main content with left margin to avoid overlapping sidebar */}
  <main className="ml-64 flex-1 p-6 overflow-auto flex justify-center">
    <div className="max-w-3xl w-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">My Orders</h1>

      {loading && <div className="text-center">Loading orders...</div>}
      {error && <div className="text-red-600 text-center">{error}</div>}
      {!loading && !error && orders.length === 0 && (
        <div className="text-center text-gray-600">No orders found.</div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order._id}
              className="bg-white shadow rounded-lg p-4 border border-gray-200"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-500">
                  <FiClock className="inline mr-1" />
                  {new Date(order.createdAt).toLocaleString()}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  order.status === 'delivered'
                    ? 'bg-green-100 text-green-700'
                    : order.status === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
              <div className="text-lg font-semibold flex items-center gap-2">
                <FiBox />
                Tracking ID: {order.trackingId}
              </div>
              <div className="text-sm text-gray-600 mt-2 flex flex-col md:flex-row md:items-center md:gap-4">
                <div><FiMapPin className="inline mr-1" /> From: {order.from}</div>
                <div><FiMapPin className="inline mr-1" /> To: {order.to}</div>
              </div>
              <div className="text-sm text-gray-500 mt-1">Cost: ₹{order.cost || 'N/A'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  </main>
</div>
  );
};

export default OrdersPage;
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../dashboard/sidebar/page';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiEdit, 
  FiSave,
  FiClock,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiX
} from 'react-icons/fi';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    addresses: []
  });
  const [newAddress, setNewAddress] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await axios.get('/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(response.data.user);
        setFormData({
          name: response.data.user.name || '',
          phone: response.data.user.phone || '',
          addresses: response.data.user.addresses || []
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAddress = () => {
    if (newAddress.trim()) {
      setFormData(prev => ({
        ...prev,
        addresses: [...prev.addresses, newAddress.trim()]
      }));
      setNewAddress('');
    }
  };

  const handleRemoveAddress = (index) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        '/api/user/edit-profile',
        {
          name: formData.name,
          phone: formData.phone,
          addresses: formData.addresses
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUser(response.data.user);
      setEditing(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />

      <main className={`
        flex-1 transition-all duration-300
        ${collapsed ? 'md:ml-20' : 'md:ml-64'}
        ${mobileMenuOpen ? 'ml-64' : 'ml-0'}
      `}>
        <div className="p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Profile Settings</h1>
                <p className="text-gray-500">Manage your personal information</p>
              </div>
              
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FiEdit /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: user.name || '',
                        phone: user.phone || '',
                        addresses: user.addresses || []
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <FiX /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                    disabled={loading}
                  >
                    <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden fixed bottom-6 right-6 bg-gray-800 text-white p-3 rounded-full shadow-lg z-20 hover:bg-gray-700"
            >
              <FiUser />
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-gray-700">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && !user && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400"></div>
              </div>
            )}

            {/* Profile Content */}
            {user && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Profile Summary */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <FiUser className="text-gray-600 text-xl" />
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-gray-800">{user.name || 'Your Profile'}</h2>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <h3 className="text-base font-medium text-gray-800 flex items-center gap-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      Personal Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                        {editing ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full rounded border-gray-300 focus:border-gray-500 focus:ring-gray-500 p-2 border"
                          />
                        ) : (
                          <p className="text-gray-800 p-2">{user.name || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                        <p className="text-gray-800 p-2">{user.email}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                        {editing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full rounded border-gray-300 focus:border-gray-500 focus:ring-gray-500 p-2 border"
                          />
                        ) : (
                          <p className="text-gray-800 p-2">{user.phone || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-6">
                    <h3 className="text-base font-medium text-gray-800 flex items-center gap-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      Your Addresses
                    </h3>

                    {editing ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          {formData.addresses.map((address, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={address}
                                onChange={(e) => {
                                  const newAddresses = [...formData.addresses];
                                  newAddresses[index] = e.target.value;
                                  setFormData(prev => ({ ...prev, addresses: newAddresses }));
                                }}
                                className="flex-1 rounded border-gray-300 focus:border-gray-500 focus:ring-gray-500 p-2 border"
                              />
                              <button
                                onClick={() => handleRemoveAddress(index)}
                                className="text-gray-500 hover:text-gray-700 p-2"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newAddress}
                            onChange={(e) => setNewAddress(e.target.value)}
                            placeholder="Add new address"
                            className="flex-1 rounded border-gray-300 focus:border-gray-500 focus:ring-gray-500 p-2 border"
                          />
                          <button
                            onClick={handleAddAddress}
                            className="bg-gray-800 text-white p-2 rounded hover:bg-gray-700"
                          >
                            <FiPlus />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {user.addresses?.length > 0 ? (
                          user.addresses.map((address, index) => (
                            <div key={index} className="p-3 border border-gray-200 rounded flex items-start gap-2">
                              <FiMapPin className="text-gray-500 mt-1 flex-shrink-0" />
                              <p className="text-gray-800">{address}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center border-2 border-dashed border-gray-300 rounded text-gray-500">
                            <FiMapPin className="mx-auto mb-2" />
                            No addresses saved
                          </div>
                        )}
                      </div>
                    )}

                    {/* Account Info */}
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-base font-medium text-gray-800 flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        Account Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm">
                          <FiClock className="text-gray-500" />
                          <div>
                            <p className="text-gray-500">Member since</p>
                            <p className="text-gray-800">
                              {new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        {user.updatedAt && (
                          <div className="flex items-center gap-3 text-sm">
                            <FiClock className="text-gray-500" />
                            <div>
                              <p className="text-gray-500">Last updated</p>
                              <p className="text-gray-800">
                                {new Date(user.updatedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
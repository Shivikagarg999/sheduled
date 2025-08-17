'use client'
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Nav from '../nav/page';
import bgimg from '../../../public/images/bg.png';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Sidebar from '../dashboard/sidebar/page';

// Initialize Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

export default function SendParcel() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Added sidebar state

  useEffect(() => {
    // Check for token in localStorage or cookies
    const token = localStorage.getItem('token') || 
                  document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    setHasToken(!!token);
  }, []);
  
  // Location state
  const [pickupMapCenter, setPickupMapCenter] = useState({ lat: 25.2048, lng: 55.2708 }); // Dubai coordinates
  const [dropMapCenter, setDropMapCenter] = useState({ lat: 25.2048, lng: 55.2708 });
  const [pickupMarkerPosition, setPickupMarkerPosition] = useState(null);
  const [dropMarkerPosition, setDropMarkerPosition] = useState(null);
  const [pickupSearchQuery, setPickupSearchQuery] = useState('');
  const [dropSearchQuery, setDropSearchQuery] = useState('');
  const [pickupSearchResults, setPickupSearchResults] = useState([]);
  const [dropSearchResults, setDropSearchResults] = useState([]);
  const [showPickupResults, setShowPickupResults] = useState(false);
  const [showDropResults, setShowDropResults] = useState(false);
  
  const pickupMapRef = useRef(null);
  const dropMapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropMarkerRef = useRef(null);
  
  const [formData, setFormData] = useState({
    // Pickup Location Fields
    pickupBuilding: '',
    pickupApartment: '',
    pickupEmirate: '', 
    pickupArea: '',
    pickupLat: '',
    pickupLng: '',
    
    // Drop Location Fields
    dropBuilding: '',
    dropApartment: '',
    dropEmirate: '', 
    dropArea: '',
    dropLat: '',
    dropLng: '',
    
    // Contact Fields
    pickupContact: '',
    dropContact: '',
    
    // Delivery Options
    deliveryType: 'standard',
    returnType: 'no-return',
    
    // Payment
    paymentMethod: 'card',
    amount: 0,
    
    // Optional field
    notes: ''
  });

  const emirates = [
    'Abu Dhabi',
    'Dubai',
    'Sharjah',
    'Ajman',
    'Umm Al Quwain',
    'Ras Al Khaimah',
    'Fujairah',
    'Abu-Dhabi',
    'Umm-Al-Quwain',
    'Ras-Al-Khaimah'
  ];

  // Initialize Pickup Map
  useEffect(() => {
    if (!pickupMapRef.current || !pickupMapCenter) return;

    const map = new mapboxgl.Map({
      container: pickupMapRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [pickupMapCenter.lng, pickupMapCenter.lat],
      zoom: 14
    });

    // Add marker if position exists
    if (pickupMarkerPosition) {
      pickupMarkerRef.current = new mapboxgl.Marker()
        .setLngLat([pickupMarkerPosition.lng, pickupMarkerPosition.lat])
        .addTo(map);
    }

    // Add click event to set marker
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      
      // Remove existing marker
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.remove();
      }
      
      // Add new marker
      pickupMarkerRef.current = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map);
      
      setPickupMarkerPosition({ lat, lng });
      setFormData(prev => ({
        ...prev,
        pickupLat: lat,
        pickupLng: lng
      }));
      
      // Reverse geocode to get address
      reverseGeocode(lng, lat, true);
    });

    return () => map.remove();
  }, [pickupMapCenter]);

  // Initialize Drop Map
  useEffect(() => {
    if (!dropMapRef.current || !dropMapCenter) return;

    const map = new mapboxgl.Map({
      container: dropMapRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [dropMapCenter.lng, dropMapCenter.lat],
      zoom: 14
    });

    // Add marker if position exists
    if (dropMarkerPosition) {
      dropMarkerRef.current = new mapboxgl.Marker()
        .setLngLat([dropMarkerPosition.lng, dropMarkerPosition.lat])
        .addTo(map);
    }

    // Add click event to set marker
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      
      // Remove existing marker
      if (dropMarkerRef.current) {
        dropMarkerRef.current.remove();
      }
      
      // Add new marker
      dropMarkerRef.current = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map);
      
      setDropMarkerPosition({ lat, lng });
      setFormData(prev => ({
        ...prev,
        dropLat: lat,
        dropLng: lng
      }));
      
      // Reverse geocode to get address
      reverseGeocode(lng, lat, false);
    });

    return () => map.remove();
  }, [dropMapCenter]);

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lng, lat, isPickup) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}&types=address,poi,neighborhood,place`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const location = data.features[0];
        const emirate = location.context?.find(c => emirates.includes(c.text))?.text || '';
        const area = location.text || '';
        
        if (isPickup) {
          setPickupSearchQuery(location.place_name);
          setFormData(prev => ({
            ...prev,
            pickupArea: area,
            pickupEmirate: emirate
          }));
        } else {
          setDropSearchQuery(location.place_name);
          setFormData(prev => ({
            ...prev,
            dropArea: area,
            dropEmirate: emirate
          }));
        }
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
    }
  };

  // Search for pickup locations
  const searchPickupLocations = async (query) => {
    if (!query) {
      setPickupSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}&autocomplete=true&country=AE&limit=5`
      );
      const data = await response.json();
      setPickupSearchResults(data.features || []);
    } catch (err) {
      console.error('Mapbox search error:', err);
      setPickupSearchResults([]);
    }
  };

  // Search for drop locations
  const searchDropLocations = async (query) => {
    if (!query) {
      setDropSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}&autocomplete=true&country=AE&limit=5`
      );
      const data = await response.json();
      setDropSearchResults(data.features || []);
    } catch (err) {
      console.error('Mapbox search error:', err);
      setDropSearchResults([]);
    }
  };

  // Handle pickup location selection
  const handlePickupLocationSelect = (location) => {
    const [lng, lat] = location.center;
    const emirate = location.context?.find(c => emirates.includes(c.text))?.text || '';
    const area = location.text || '';
    
    setPickupSearchQuery(location.place_name);
    setPickupMapCenter({ lat, lng });
    setPickupMarkerPosition({ lat, lng });
    setShowPickupResults(false);
    
    setFormData(prev => ({
      ...prev,
      pickupBuilding: '',
      pickupArea: area,
      pickupEmirate: emirate,
      pickupLat: lat,
      pickupLng: lng
    }));
  };

  // Handle drop location selection
  const handleDropLocationSelect = (location) => {
    const [lng, lat] = location.center;
    const emirate = location.context?.find(c => emirates.includes(c.text))?.text || '';
    const area = location.text || '';
    
    setDropSearchQuery(location.place_name);
    setDropMapCenter({ lat, lng });
    setDropMarkerPosition({ lat, lng });
    setShowDropResults(false);
    
    setFormData(prev => ({
      ...prev,
      dropBuilding: '',
      dropArea: area,
      dropEmirate: emirate,
      dropLat: lat,
      dropLng: lng
    }));
  };

  // Handle manual changes (for apartment numbers, etc.)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (step === 1) {
      if (!formData.pickupBuilding || !formData.pickupApartment || !formData.pickupEmirate || !formData.pickupArea ||
          !formData.dropBuilding || !formData.dropApartment || !formData.dropEmirate || !formData.dropArea) {
        setError('Please fill all location fields');
        return;
      }
    } else if (step === 2) {
      if (!formData.pickupContact || !formData.dropContact) {
        setError('Please provide both contact numbers');
        return;
      }
    }
    
    setError(null);
    
    // Calculate price before moving to next step
    if (step === 3) {
      const price = calculatePrice();
      setFormData(prev => ({ ...prev, amount: price }));
    }
    setStep(step + 1);
  };
  
  const prevStep = () => setStep(step - 1);

  const calculatePrice = () => {
    let basePrice = 0;
    
    if (formData.deliveryType === 'standard') {
      basePrice = 30;
    } else if (formData.deliveryType === 'express') {
      basePrice = 45;
    } else {
      basePrice = 20; // default for next-day
    }
    
    if (formData.returnType === 'with-return') {
      basePrice += 10;
    }
    
    return basePrice;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    // Get token from storage
    const token = localStorage.getItem('token') || 
                  document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    // Calculate final price 
    const price = calculatePrice();
    const orderData = {
      pickupBuilding: formData.pickupBuilding,
      pickupApartment: formData.pickupApartment,
      pickupEmirate: formData.pickupEmirate,
      pickupArea: formData.pickupArea,
      pickupLat: formData.pickupLat,
      pickupLng: formData.pickupLng,
      dropBuilding: formData.dropBuilding,
      dropApartment: formData.dropApartment,
      dropEmirate: formData.dropEmirate,
      dropArea: formData.dropArea,
      dropLat: formData.dropLat,
      dropLng: formData.dropLng,
      pickupContact: formData.pickupContact,
      dropContact: formData.dropContact,
      deliveryType: formData.deliveryType,
      returnType: formData.returnType,
      paymentMethod: formData.paymentMethod,
      amount: price,
      notes: formData.notes || ''
    };

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('https://sheduled-8umy.onrender.com/api/orders/create-order', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create order');
    }

    // Update state with order details
    setOrderDetails({
      orderId: data.orderId,
      trackingNumber: data.trackingNumber
    });
    
    // Redirect based on payment method
    if (formData.paymentMethod === 'cash') {
      // For cash on delivery, go directly to success page with order ID
      router.push(`/successpay?order_id=${data.orderId}`);
    } else {
      // For card payments, go to payment page
      router.push(`/payment/${data.orderId}`);
    }
    
  } catch (err) {
    console.error('Order creation error:', err);
    setError(err.message || 'Failed to create order. Please try again.');
  } finally {
    setLoading(false);
  }
};
  
  const handleCont = (e) => {
    const { name, value } = e.target;
    // Remove non-digit characters and limit to 10 digits
    const filtered = value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({
      ...prev,
      [name]: filtered,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundImage: `url(${bgimg.src})` }}>
      {/* Fixed Sidebar/Nav rendering with proper props */}
      {hasToken ? (
        <Sidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
        />
      ) : (
        <Nav />
      )}
      
      <Head>
        <title>Send Parcel | Delivery App</title>
        <meta name="description" content="Send parcels across UAE" />
      </Head>

      {/* Main content with proper margins when sidebar is present */}
      <main 
        className={` className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 transition-all duration-300 ml-0 ${
          hasToken 
            ? sidebarCollapsed 
              ? 'ml-16' // Collapsed sidebar width
              : 'ml-64' // Full sidebar width
            : 'ml-0' // No sidebar
        }`}
      >
        {/* Header */}
        <div className="text-center mb-8 pt-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Send a Parcel</h1>
          <p className="text-gray-600">Fast and reliable delivery across UAE</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
            {orderDetails && (
              <div className="mt-2 text-sm">
                <p>Order ID: {orderDetails.orderId}</p>
                <p>Tracking Number: {orderDetails.trackingNumber}</p>
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 transition-all duration-300" 
              style={{ width: `${(step-1)*33.33}%` }}
            ></div>
            
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex flex-col items-center">
                <button
                  onClick={() => stepNumber < step && setStep(stepNumber)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center
                    ${step === stepNumber ? 'bg-blue-600 text-white border-2 border-blue-600' : 
                      step > stepNumber ? 'bg-green-100 text-green-600 border-2 border-green-500' : 
                      'bg-white text-gray-400 border-2 border-gray-300'}`}
                >
                  {step > stepNumber ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : stepNumber}
                </button>
                <span className={`text-xs mt-2 font-medium ${step >= stepNumber ? 'text-gray-900' : 'text-gray-400'}`}>
                  {stepNumber === 1 && 'Locations'}
                  {stepNumber === 2 && 'Contacts'}
                  {stepNumber === 3 && 'Options'}
                  {stepNumber === 4 && 'Confirm'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg text-black shadow-sm border border-gray-200 overflow-hidden">
          {step === 1 && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-800">Pickup & Delivery Locations</h2>
                <p className="text-gray-500 text-sm mt-1">Select addresses on the map or search below</p>
              </div>
              
              <div className="space-y-6">
                {/* Pickup Location Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">1</span>
                    Pickup Location
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <label htmlFor="pickupSearch" className="block text-sm font-medium text-gray-700 mb-1">
                        Search for pickup location
                      </label>
                      <input
                        type="text"
                        id="pickupSearch"
                        value={pickupSearchQuery}
                        onChange={(e) => {
                          setPickupSearchQuery(e.target.value);
                          searchPickupLocations(e.target.value);
                        }}
                        onFocus={() => setShowPickupResults(true)}
                        onBlur={() => setTimeout(() => setShowPickupResults(false), 200)}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search pickup address"
                      />
                      {showPickupResults && pickupSearchResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
                          {pickupSearchResults.map((location, index) => (
                            <div
                              key={index}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handlePickupLocationSelect(location)}
                            >
                              <div className="font-medium">{location.place_name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Map for Pickup Location */}
                    <div className="h-64 w-full rounded-md overflow-hidden border border-gray-300">
                      <div ref={pickupMapRef} className="w-full h-full" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="pickupBuilding" className="block text-sm font-medium text-gray-700 mb-1">
                          Building/Villa
                        </label>
                        <input
                          type="text"
                          id="pickupBuilding"
                          name="pickupBuilding"
                          value={formData.pickupBuilding}
                          onChange={handleChange}
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Building name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="pickupApartment" className="block text-sm font-medium text-gray-700 mb-1">
                          Apartment/Villa Number
                        </label>
                        <input
                          type="text"
                          id="pickupApartment"
                          name="pickupApartment"
                          value={formData.pickupApartment}
                          onChange={handleChange}
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g. 234a"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="pickupEmirate" className="block text-sm font-medium text-gray-700 mb-1">
                          Emirate
                        </label>
                        <input
                          type="text"
                          id="pickupEmirate"
                          name="pickupEmirate"
                          value={formData.pickupEmirate}
                          onChange={handleChange}
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Select emirate"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="pickupArea" className="block text-sm font-medium text-gray-700 mb-1">
                          Area
                        </label>
                        <input
                          type="text"
                          id="pickupArea"
                          name="pickupArea"
                          value={formData.pickupArea}
                          onChange={handleChange}
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter area"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Delivery Location Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">2</span>
                    Delivery Location
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <label htmlFor="dropSearch" className="block text-sm font-medium text-gray-700 mb-1">
                        Search for delivery location
                      </label>
                      <input
                        type="text"
                        id="dropSearch"
                        value={dropSearchQuery}
                        onChange={(e) => {
                          setDropSearchQuery(e.target.value);
                          searchDropLocations(e.target.value);
                        }}
                        onFocus={() => setShowDropResults(true)}
                        onBlur={() => setTimeout(() => setShowDropResults(false), 200)}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search delivery address"
                      />
                      {showDropResults && dropSearchResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
                          {dropSearchResults.map((location, index) => (
                            <div
                              key={index}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleDropLocationSelect(location)}
                            >
                              <div className="font-medium">{location.place_name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Map for Drop Location */}
                    <div className="h-64 w-full rounded-md overflow-hidden border border-gray-300">
                      <div ref={dropMapRef} className="w-full h-full" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="dropBuilding" className="block text-sm font-medium text-gray-700 mb-1">
                          Building/Villa
                        </label>
                        <input
                          type="text"
                          id="dropBuilding"
                          name="dropBuilding"
                          value={formData.dropBuilding}
                          onChange={handleChange}
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Building name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="dropApartment" className="block text-sm font-medium text-gray-700 mb-1">
                          Apartment/Villa Number
                        </label>
                        <input
                          type="text"
                          id="dropApartment"
                          name="dropApartment"
                          value={formData.dropApartment}
                          onChange={handleChange}
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g. 101b"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="dropEmirate" className="block text-sm font-medium text-gray-700 mb-1">
                          Emirate
                        </label>
                        <input
                          type="text"
                          id="dropEmirate"
                          name="dropEmirate"
                          value={formData.dropEmirate}
                          onChange={handleChange}
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Select emirate"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="dropArea" className="block text-sm font-medium text-gray-700 mb-1">
                          Area
                        </label>
                        <input
                          type="text"
                          id="dropArea"
                          name="dropArea"
                          value={formData.dropArea}
                          onChange={handleChange}
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter area"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Continue to Contacts
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-800">Contact Information</h2>
                <p className="text-gray-500 text-sm mt-1">Who should we contact for pickup and delivery?</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">1</span>
                    Pickup Contact
                  </h3>
                  <div className="relative">
                    <input
                      type="tel"
                      id="pickupContact"
                      inputMode="numeric"  
                      pattern="\d{1,10}"        
                      maxLength={10}     
                      name="pickupContact"
                      value={formData.pickupContact}
                      onChange={handleCont}
                      className="block w-full border border-gray-300 rounded-md py-2 px-3 pl-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter contact"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">2</span>
                    Delivery Contact
                  </h3>
                  <div className="relative">
                    <input
                      type="tel"
                      id="dropContact"
                      name="dropContact"
                      value={formData.dropContact}
                      onChange={handleCont}
                      inputMode="numeric"  
                      pattern="\d{1,10}"        
                      maxLength={10}  
                      className="block w-full border border-gray-300 rounded-md py-2 px-3 pl-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter contact"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center justify-center py-2 px-5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Continue to Options
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-800">Delivery Options</h2>
                <p className="text-gray-500 text-sm mt-1">Choose your delivery speed and type</p>
              </div>
              
              <div className="space-y-4">
                {/* Delivery Type Selection */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">1</span>
                    Delivery Type
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`block p-3 border rounded-md cursor-pointer transition-all ${formData.deliveryType === 'standard' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}>
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="standard"
                          checked={formData.deliveryType === 'standard'}
                          onChange={handleChange}
                          className="mt-0.5 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <div className="ml-2">
                          <span className={`block text-sm font-medium ${formData.deliveryType === 'standard' ? 'text-blue-700' : 'text-gray-700'}`}>
                            Standard (24hr)
                          </span>
                          <span className="block text-xs text-gray-500 mt-1">30 AED</span>
                        </div>
                      </div>
                    </label>
                    
                    <label className={`block p-3 border rounded-md cursor-pointer transition-all ${formData.deliveryType === 'express' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}>
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="express"
                          checked={formData.deliveryType === 'express'}
                          onChange={handleChange}
                          className="mt-0.5 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <div className="ml-2">
                          <span className={`block text-sm font-medium ${formData.deliveryType === 'express' ? 'text-blue-700' : 'text-gray-700'}`}>
                            Express (4hr)
                          </span>
                          <span className="block text-xs text-gray-500 mt-1">45 AED</span>
                        </div>
                      </div>
                    </label>

                    <label className={`block p-3 border rounded-md cursor-pointer transition-all ${formData.deliveryType === 'next-day' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}>
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="next-day"
                          checked={formData.deliveryType === 'next-day'}
                          onChange={handleChange}
                          className="mt-0.5 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <div className="ml-2">
                          <span className={`block text-sm font-medium ${formData.deliveryType === 'next-day' ? 'text-blue-700' : 'text-gray-700'}`}>
                            Next Day
                          </span>
                          <span className="block text-xs text-gray-500 mt-1">20 AED</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* Return Option */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">2</span>
                    Return Option
                  </h3>
                  
                  <div className="space-y-2">
                    <label className={`block p-3 border rounded-md cursor-pointer transition-all ${formData.returnType === 'no-return' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}>
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="returnType"
                          value="no-return"
                          checked={formData.returnType === 'no-return'}
                          onChange={handleChange}
                          className="mt-0.5 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <div className="ml-2">
                          <span className={`block text-sm font-medium ${formData.returnType === 'no-return' ? 'text-blue-700' : 'text-gray-700'}`}>
                            One-way Delivery
                          </span>
                        </div>
                      </div>
                    </label>
                    
                    <label className={`block p-3 border rounded-md cursor-pointer transition-all ${formData.returnType === 'with-return' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}>
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="returnType"
                          value="with-return"
                          checked={formData.returnType === 'with-return'}
                          onChange={handleChange}
                          className="mt-0.5 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <div className="ml-2">
                          <span className={`block text-sm font-medium ${formData.returnType === 'with-return' ? 'text-blue-700' : 'text-gray-700'}`}>
                            With Return (+10 AED)
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">3</span>
                    Payment Method
                  </h3>
                  
                  <div className="space-y-2">
                    <label className={`block p-3 border rounded-md cursor-pointer transition-all ${formData.paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}>
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={formData.paymentMethod === 'card'}
                          onChange={handleChange}
                          className="mt-0.5 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <div className="ml-2">
                          <span className={`block text-sm font-medium ${formData.paymentMethod === 'card' ? 'text-blue-700' : 'text-gray-700'}`}>
                            Credit/Debit Card
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">4</span>
                    Price Summary
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Price:</span>
                      <span className="font-medium">
                        {formData.deliveryType === 'standard' && '30 AED'}
                        {formData.deliveryType === 'express' && '45 AED'}
                        {formData.deliveryType === 'next-day' && '20 AED'}
                      </span>
                    </div>
                    
                    {formData.returnType === 'with-return' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Return Fee:</span>
                        <span className="font-medium">10 AED</span>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span className="text-blue-600">{calculatePrice()} AED</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center justify-center py-2 px-5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Continue to Review
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-800">Review & Confirm</h2>
                <p className="text-gray-500 text-sm mt-1">Review your order details</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-3">Order Summary</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">
                      {formData.deliveryType === 'standard' && 'Standard Delivery (24hr)'}
                      {formData.deliveryType === 'express' && 'Express Delivery (4hr)'}
                      {formData.deliveryType === 'next-day' && 'Next Day Delivery'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Return Option:</span>
                    <span className="font-medium">
                      {formData.returnType === 'with-return' ? 'With Return' : 'One-way'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">From:</span>
                    <span className="font-medium text-right">
                      {formData.pickupBuilding}, {formData.pickupArea}, {formData.pickupEmirate}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">To:</span>
                    <span className="font-medium text-right">
                      {formData.dropBuilding}, {formData.dropArea}, {formData.dropEmirate}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pickup Contact:</span>
                    <span className="font-medium">{formData.pickupContact}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Contact:</span>
                    <span className="font-medium">{formData.dropContact}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 mt-3 pt-3">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-blue-600">{calculatePrice()} AED</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center justify-center py-2 px-5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    `Confirm Order (${calculatePrice()} AED)`
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
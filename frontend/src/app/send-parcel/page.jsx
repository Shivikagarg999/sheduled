'use client'
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Nav from '../nav/page';
import bgimg from '../../../public/images/bg.png';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Sidebar from '../dashboard/sidebar/page';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

export default function SendParcel() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token') || 
                  document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    setHasToken(!!token);

    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const [pickupMapCenter, setPickupMapCenter] = useState({ lat: 25.2048, lng: 55.2708 });
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
    pickupBuilding: '',
    pickupApartment: '',
    pickupEmirate: '', 
    pickupArea: '',
    pickupLat: '',
    pickupLng: '',
    dropBuilding: '',
    dropApartment: '',
    dropEmirate: '', 
    dropArea: '',
    dropLat: '',
    dropLng: '',
    pickupContact: '',
    dropContact: '',
    deliveryType: 'standard',
    returnType: 'no-return',
    paymentMethod: 'card',
    amount: 0,
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

    if (pickupMarkerPosition) {
      pickupMarkerRef.current = new mapboxgl.Marker()
        .setLngLat([pickupMarkerPosition.lng, pickupMarkerPosition.lat])
        .addTo(map);
    }

    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.remove();
      }
      
      pickupMarkerRef.current = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map);
      
      setPickupMarkerPosition({ lat, lng });
      setFormData(prev => ({
        ...prev,
        pickupLat: lat,
        pickupLng: lng
      }));
      
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

    if (dropMarkerPosition) {
      dropMarkerRef.current = new mapboxgl.Marker()
        .setLngLat([dropMarkerPosition.lng, dropMarkerPosition.lat])
        .addTo(map);
    }

    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      
      if (dropMarkerRef.current) {
        dropMarkerRef.current.remove();
      }
      
      dropMarkerRef.current = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map);
      
      setDropMarkerPosition({ lat, lng });
      setFormData(prev => ({
        ...prev,
        dropLat: lat,
        dropLng: lng
      }));
      
      reverseGeocode(lng, lat, false);
    });

    return () => map.remove();
  }, [dropMapCenter]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => {
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
      basePrice = 20; 
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
      const token = localStorage.getItem('token') || 
                    document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

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

      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://72.60.111.193:5000/api/orders/create-order', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      setOrderDetails({
        orderId: data.orderId,
        trackingNumber: data.trackingNumber
      });
      
      if (formData.paymentMethod === 'cash') {
        router.push(`/successpay?order_id=${data.orderId}`);
      } else {
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
    const filtered = value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({
      ...prev,
      [name]: filtered,
    }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ 
      backgroundImage: `url(${bgimg.src})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-white/80 to-indigo-50/90 backdrop-blur-sm"></div>
      
      {hasToken ? (
        <Sidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />
      ) : (
        <Nav />
      )}
      
      <Head>
        <title>Send Parcel | Delivery App</title>
        <meta name="description" content="Send parcels across UAE" />
      </Head>

      <main 
        className={`relative z-10 w-full max-w-5xl py-8 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          hasToken && !isMobile
            ? sidebarCollapsed 
              ? 'md:ml-16' 
              : 'md:ml-64' 
            : 'mx-auto'
        } ${isMobile ? 'mt-16' : 'mt-0'}`}
      >
        {/* Header Section */}
        <div className="text-center mb-10 pt-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl mb-4 transform hover:scale-105 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Send a Parcel
          </h1>
          <p className="text-gray-600 text-lg font-medium">Fast and reliable delivery across UAE</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl shadow-lg animate-fade-in">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-green-800">{success}</p>
                {orderDetails && (
                  <div className="mt-2 text-sm text-green-700 space-y-1">
                    <p className="flex items-center">
                      <span className="font-medium mr-2">Order ID:</span> 
                      <span className="bg-white px-2 py-1 rounded">{orderDetails.orderId}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium mr-2">Tracking Number:</span> 
                      <span className="bg-white px-2 py-1 rounded">{orderDetails.trackingNumber}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-xl shadow-lg animate-fade-in">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Stepper */}
        <div className="mb-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line Background */}
            <div className="absolute top-8 left-0 right-0 h-2 bg-gray-200 rounded-full -z-0"></div>
            {/* Progress Line Active */}
            <div 
              className="absolute top-8 left-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full -z-0 transition-all duration-500 ease-out" 
              style={{ width: `${((step-1)/3)*100}%` }}
            ></div>
            
            {[
              { num: 1, label: 'Locations', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
              { num: 2, label: 'Contacts', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
              { num: 3, label: 'Options', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
              { num: 4, label: 'Confirm', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
            ].map((stepItem) => (
              <div key={stepItem.num} className="flex flex-col items-center z-10 relative">
                <button
                  onClick={() => stepItem.num < step && setStep(stepItem.num)}
                  disabled={stepItem.num > step}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg
                    ${step === stepItem.num 
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white scale-110 shadow-blue-500/50' 
                      : step > stepItem.num 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/50' 
                        : 'bg-white text-gray-400 border-2 border-gray-200'
                    }`}
                >
                  {step > stepItem.num ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stepItem.icon} />
                    </svg>
                  )}
                </button>
                <span className={`text-xs md:text-sm mt-3 font-semibold transition-all duration-300 ${
                  step >= stepItem.num ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {stepItem.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          
          {/* Step 1: Locations */}
          {step === 1 && (
            <div className="p-6 md:p-10 space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Pickup & Delivery Locations
                </h2>
                <p className="text-gray-500 text-base mt-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Select addresses on the map or search below
                </p>
              </div>
              
              <div className="space-y-8">
                {/* Pickup Location Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl w-8 h-8 flex items-center justify-center mr-3 text-sm shadow-lg">1</span>
                    Pickup Location
                  </h3>
                  
                  <div className="space-y-5">
                    <div className="relative">
                      <label htmlFor="pickupSearch" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-1.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search for pickup location
                      </label>
                      <div className="relative">
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
                          className="block w-full border-2 border-gray-200 rounded-xl py-3 px-4 pl-11 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:border-blue-300"
                          placeholder="Search pickup address..."
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                      {showPickupResults && pickupSearchResults.length > 0 && (
                        <div className="absolute z-20 mt-2 w-full bg-white shadow-2xl rounded-xl border-2 border-blue-100 max-h-72 overflow-auto">
                          {pickupSearchResults.map((location, index) => (
                            <div
                              key={index}
                              className="px-5 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                              onClick={() => handlePickupLocationSelect(location)}
                            >
                              <div className="flex items-start">
                                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                <div className="font-medium text-gray-800">{location.place_name}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="h-72 w-full rounded-2xl overflow-hidden border-4 border-white shadow-xl ring-1 ring-gray-200">
                      <div ref={pickupMapRef} className="w-full h-full" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="pickupBuilding" className="block text-sm font-semibold text-gray-700 mb-2">
                          Building/Villa
                        </label>
                        <input
                          type="text"
                          id="pickupBuilding"
                          name="pickupBuilding"
                          value={formData.pickupBuilding}
                          onChange={handleChange}
                          className="block w-full border-2 border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:border-blue-300"
                          placeholder="Building name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="pickupApartment" className="block text-sm font-semibold text-gray-700 mb-2">
                          Apartment/Villa Number
                        </label>
                        <input
                          type="text"
                          id="pickupApartment"
                          name="pickupApartment"
                          value={formData.pickupApartment}
                          onChange={handleChange}
                          className="block w-full border-2 border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:border-blue-300"
                          placeholder="e.g. 234a"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="pickupEmirate" className="block text-sm font-semibold text-gray-700 mb-2">
                          Emirate
                        </label>
                        <input
                          type="text"
                          id="pickupEmirate"
                          name="pickupEmirate"
                          value={formData.pickupEmirate}
                          onChange={handleChange}
                          className="block w-full border-2 border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:border-blue-300"
                          placeholder="Select emirate"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="pickupArea" className="block text-sm font-semibold text-gray-700 mb-2">
                          Area
                        </label>
                        <input
                          type="text"
                          id="pickupArea"
                          name="pickupArea"
                          value={formData.pickupArea}
                          onChange={handleChange}
                          className="block w-full border-2 border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:border-blue-300"
                          placeholder="Enter area"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Delivery Location Section */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl w-8 h-8 flex items-center justify-center mr-3 text-sm shadow-lg">2</span>
                    Delivery Location
                  </h3>
                  
                  <div className="space-y-5">
                    <div className="relative">
                      <label htmlFor="dropSearch" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-1.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search for delivery location
                      </label>
                      <div className="relative">
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
                          className="block w-full border-2 border-gray-200 rounded-xl py-3 px-4 pl-11 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:border-purple-300"
                          placeholder="Search delivery address..."
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                      {showDropResults && dropSearchResults.length > 0 && (
                        <div className="absolute z-20 mt-2 w-full bg-white shadow-2xl rounded-xl border-2 border-purple-100 max-h-72 overflow-auto">
                          {dropSearchResults.map((location, index) => (
                            <div
                              key={index}
                              className="px-5 py-3 hover:bg-purple-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                              onClick={() => handleDropLocationSelect(location)}
                            >
                              <div className="flex items-start">
                                <svg className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                <div className="font-medium text-gray-800">{location.place_name}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="h-72 w-full rounded-2xl overflow-hidden border-4 border-white shadow-xl ring-1 ring-gray-200">
                      <div ref={dropMapRef} className="w-full h-full" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="dropBuilding" className="block text-sm font-semibold text-gray-700 mb-2">
                          Building/Villa
                        </label>
                        <input
                          type="text"
                          id="dropBuilding"
                          name="dropBuilding"
                          value={formData.dropBuilding}
                          onChange={handleChange}
                          className="block w-full border-2 border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:border-purple-300"
                          placeholder="Building name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="dropApartment" className="block text-sm font-semibold text-gray-700 mb-2">
                          Apartment/Villa Number
                        </label>
                        <input
                          type="text"
                          id="dropApartment"
                          name="dropApartment"
                          value={formData.dropApartment}
                          onChange={handleChange}
                          className="block w-full border-2 border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:border-purple-300"
                          placeholder="e.g. 101b"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="dropEmirate" className="block text-sm font-semibold text-gray-700 mb-2">
                          Emirate
                        </label>
                        <input
                          type="text"
                          id="dropEmirate"
                          name="dropEmirate"
                          value={formData.dropEmirate}
                          onChange={handleChange}
                          className="block w-full border-2 border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:border-purple-300"
                          placeholder="Select emirate"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="dropArea" className="block text-sm font-semibold text-gray-700 mb-2">
                          Area
                        </label>
                        <input
                          type="text"
                          id="dropArea"
                          name="dropArea"
                          value={formData.dropArea}
                          onChange={handleChange}
                          className="block w-full border-2 border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:border-purple-300"
                          placeholder="Enter area"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center group"
                >
                  Continue to Contacts
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Contacts */}
          {step === 2 && (
            <div className="p-6 md:p-10 space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Contact Information
                </h2>
                <p className="text-gray-500 text-base mt-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Who should we contact for pickup and delivery?
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl w-8 h-8 flex items-center justify-center mr-3 text-sm shadow-lg">1</span>
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
                      onChange={handleChange}
                      className="block w-full border-2 border-gray-200 rounded-xl py-4 px-5 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:border-blue-300 text-lg"
                      placeholder="Enter contact number"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl w-8 h-8 flex items-center justify-center mr-3 text-sm shadow-lg">2</span>
                    Delivery Contact
                  </h3>
                  <div className="relative">
                    <input
                      type="tel"
                      id="dropContact"
                      name="dropContact"
                      value={formData.dropContact}
                      onChange={handleChange}
                      inputMode="numeric"  
                      pattern="\d{1,10}"        
                      maxLength={10}  
                      className="block w-full border-2 border-gray-200 rounded-xl py-4 px-5 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:border-purple-300 text-lg"
                      placeholder="Enter contact number"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center justify-center py-3.5 px-8 border-2 border-gray-300 shadow-sm text-base font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex justify-center py-3.5 px-8 border border-transparent shadow-lg text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:scale-[1.02] transition-all duration-200 group"
                >
                  Continue to Options
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Options */}
          {step === 3 && (
            <div className="p-6 md:p-10 space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Delivery Options
                </h2>
                <p className="text-gray-500 text-base mt-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Choose your delivery speed and type
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
                    <span className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl w-8 h-8 flex items-center justify-center mr-3 text-sm shadow-lg">1</span>
                    Delivery Type
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className={`relative block p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      formData.deliveryType === 'standard' 
                        ? 'border-blue-500 bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg shadow-blue-200' 
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                    }`}>
                      <input
                        type="radio"
                        name="deliveryType"
                        value="standard"
                        checked={formData.deliveryType === 'standard'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <span className={`block text-base font-bold mb-1 ${formData.deliveryType === 'standard' ? 'text-blue-700' : 'text-gray-700'}`}>
                          Standard
                        </span>
                        <span className="block text-xs text-gray-500 mb-2">24 hours</span>
                        <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${formData.deliveryType === 'standard' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                          30 AED
                        </span>
                      </div>
                      {formData.deliveryType === 'standard' && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                    
                    <label className={`relative block p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      formData.deliveryType === 'express' 
                        ? 'border-blue-500 bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg shadow-blue-200' 
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                    }`}>
                      <input
                        type="radio"
                        name="deliveryType"
                        value="express"
                        checked={formData.deliveryType === 'express'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 bg-indigo-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <span className={`block text-base font-bold mb-1 ${formData.deliveryType === 'express' ? 'text-blue-700' : 'text-gray-700'}`}>
                          Express
                        </span>
                        <span className="block text-xs text-gray-500 mb-2">4 hours</span>
                        <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${formData.deliveryType === 'express' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                          45 AED
                        </span>
                      </div>
                      {formData.deliveryType === 'express' && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>

                    <label className={`relative block p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      formData.deliveryType === 'next-day' 
                        ? 'border-blue-500 bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg shadow-blue-200' 
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                    }`}>
                      <input
                        type="radio"
                        name="deliveryType"
                        value="next-day"
                        checked={formData.deliveryType === 'next-day'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className={`block text-base font-bold mb-1 ${formData.deliveryType === 'next-day' ? 'text-blue-700' : 'text-gray-700'}`}>
                          Next Day
                        </span>
                        <span className="block text-xs text-gray-500 mb-2">Tomorrow</span>
                        <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${formData.deliveryType === 'next-day' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                          20 AED
                        </span>
                      </div>
                      {formData.deliveryType === 'next-day' && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
                    <span className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl w-8 h-8 flex items-center justify-center mr-3 text-sm shadow-lg">2</span>
                    Return Option
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`relative block p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      formData.returnType === 'no-return' 
                        ? 'border-purple-500 bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg shadow-purple-200' 
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                    }`}>
                      <input
                        type="radio"
                        name="returnType"
                        value="no-return"
                        checked={formData.returnType === 'no-return'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex items-start">
                        <div className="w-10 h-10 mr-3 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <span className={`block text-base font-bold ${formData.returnType === 'no-return' ? 'text-purple-700' : 'text-gray-700'}`}>
                            One-way Delivery
                          </span>
                          <span className="block text-xs text-gray-500 mt-1">Deliver only, no return</span>
                        </div>
                      </div>
                      {formData.returnType === 'no-return' && (
                        <div className="absolute top-3 right-3">
                          <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                    
                    <label className={`relative block p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      formData.returnType === 'with-return' 
                        ? 'border-purple-500 bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg shadow-purple-200' 
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                    }`}>
                      <input
                        type="radio"
                        name="returnType"
                        value="with-return"
                        checked={formData.returnType === 'with-return'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex items-start">
                        <div className="w-10 h-10 mr-3 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <span className={`block text-base font-bold ${formData.returnType === 'with-return' ? 'text-purple-700' : 'text-gray-700'}`}>
                            With Return
                          </span>
                          <span className="block text-xs text-gray-500 mt-1">+10 AED extra</span>
                        </div>
                      </div>
                      {formData.returnType === 'with-return' && (
                        <div className="absolute top-3 right-3">
                          <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
                    <span className="bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-xl w-8 h-8 flex items-center justify-center mr-3 text-sm shadow-lg">3</span>
                    Payment Method
                  </h3>
                  
                  <label className={`relative block p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    formData.paymentMethod === 'card' 
                      ? 'border-green-500 bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg shadow-green-200' 
                      : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className="w-12 h-12 mr-4 bg-green-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <span className={`block text-base font-bold ${formData.paymentMethod === 'card' ? 'text-green-700' : 'text-gray-700'}`}>
                          Credit/Debit Card
                        </span>
                        <span className="block text-xs text-gray-500 mt-1">Secure online payment</span>
                      </div>
                      {formData.paymentMethod === 'card' && (
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </label>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200 shadow-md">
                  <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
                    <span className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl w-8 h-8 flex items-center justify-center mr-3 text-sm shadow-lg">4</span>
                    Price Summary
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                      <span className="text-gray-600 font-medium">Base Price:</span>
                      <span className="font-bold text-gray-800 text-lg">
                        {formData.deliveryType === 'standard' && '30 AED'}
                        {formData.deliveryType === 'express' && '45 AED'}
                        {formData.deliveryType === 'next-day' && '20 AED'}
                      </span>
                    </div>
                    
                    {formData.returnType === 'with-return' && (
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                        <span className="text-gray-600 font-medium">Return Fee:</span>
                        <span className="font-bold text-gray-800 text-lg">10 AED</span>
                      </div>
                    )}
                    
                    <div className="border-t-2 border-yellow-300 pt-3 mt-3">
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl">
                        <span className="font-bold text-gray-800 text-lg">Total Amount:</span>
                        <span className="font-black text-2xl bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                          {calculatePrice()} AED
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center justify-center py-3.5 px-8 border-2 border-gray-300 shadow-sm text-base font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex justify-center py-3.5 px-8 border border-transparent shadow-lg text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:scale-[1.02] transition-all duration-200 group"
                >
                  Continue to Review
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div className="p-6 md:p-10 space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Review & Confirm
                </h2>
                <p className="text-gray-500 text-base mt-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Please review your order details before confirming
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-2xl border-2 border-indigo-200 shadow-xl">
                <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center">
                  <span className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl w-10 h-10 flex items-center justify-center mr-3 shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </span>
                  Order Summary
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                      <span className="text-gray-600 font-semibold flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Service Type:
                      </span>
                      <span className="font-bold text-gray-800 text-right bg-blue-100 px-3 py-1 rounded-lg">
                        {formData.deliveryType === 'standard' && 'Standard (24hr)'}
                        {formData.deliveryType === 'express' && 'Express (4hr)'}
                        {formData.deliveryType === 'next-day' && 'Next Day'}
                      </span>
                    </div>
                    
                    <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                      <span className="text-gray-600 font-semibold flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Return Option:
                      </span>
                      <span className="font-bold text-gray-800 bg-purple-100 px-3 py-1 rounded-lg">
                        {formData.returnType === 'with-return' ? 'With Return' : 'One-way'}
                      </span>
                    </div>
                    
                    <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                      <span className="text-gray-600 font-semibold flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        Pickup From:
                      </span>
                      <span className="font-medium text-gray-800 text-right max-w-xs bg-green-50 px-3 py-1 rounded-lg">
                        {formData.pickupBuilding}, {formData.pickupArea}, {formData.pickupEmirate}
                      </span>
                    </div>
                    
                    <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                      <span className="text-gray-600 font-semibold flex items-center">
                        <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        Deliver To:
                      </span>
                      <span className="font-medium text-gray-800 text-right max-w-xs bg-red-50 px-3 py-1 rounded-lg">
                        {formData.dropBuilding}, {formData.dropArea}, {formData.dropEmirate}
                      </span>
                    </div>
                    
                    <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                      <span className="text-gray-600 font-semibold flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Pickup Contact:
                      </span>
                      <span className="font-bold text-gray-800 bg-blue-50 px-3 py-1 rounded-lg">{formData.pickupContact}</span>
                    </div>
                    
                    <div className="flex items-start justify-between">
                      <span className="text-gray-600 font-semibold flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Delivery Contact:
                      </span>
                      <span className="font-bold text-gray-800 bg-purple-50 px-3 py-1 rounded-lg">{formData.dropContact}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-yellow-100 p-6 rounded-xl shadow-lg border-2 border-yellow-300">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xl text-gray-800 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Total Payment:
                      </span>
                      <span className="font-black text-3xl bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent animate-pulse">
                        {calculatePrice()} AED
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center justify-center py-3.5 px-8 border-2 border-gray-300 shadow-sm text-base font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center items-center py-4 px-10 border border-transparent shadow-2xl text-lg font-black rounded-xl text-white bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Confirm Order ({calculatePrice()} AED)
                    </>
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
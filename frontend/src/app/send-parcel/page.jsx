"use client"
import { useState } from 'react';
import Head from 'next/head';
import Nav from '../nav/page';
import bgimg from '../../../public/images/bg.png'

export default function SendParcel() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Pickup Location Fields
    pickupBuilding: '',
    pickupApartment: '',
    pickupEmirate: '',
    pickupArea: '',
    
    // Drop Location Fields
    dropBuilding: '',
    dropApartment: '',
    dropEmirate: '',
    dropArea: '',
    
    // Contact Fields
    pickupContact: '',
    dropContact: '',
    
    // Delivery Options
    deliveryType: 'delivery', // Changed default to 'delivery'
    returnType: 'no-return', // Added return option
    
    // Payment
    paymentMethod: 'card'
  });

  const emirates = [
    'Select Emirate',
    'Abu Dhabi',
    'Dubai',
    'Sharjah',
    'Ajman',
    'Umm Al Quwain',
    'Ras Al Khaimah',
    'Fujairah'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const calculatePrice = () => {
    let basePrice = 0;
    
    // Base price based on delivery type
    if (formData.deliveryType === 'standard') {
      basePrice = 30;
    } else if (formData.deliveryType === 'express') {
      basePrice = 45;
    } else {
      basePrice = 20; // default for next-day
    }
    
    // Add return fee if needed
    if (formData.returnType === 'with-return') {
      basePrice += 10;
    }
    
    return basePrice;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Booking confirmed!');
  };

  return (
    <div className="min-h-screen bg-gray-50"
     style={{ backgroundImage: `url(${bgimg.src})` }}
    >

      <Nav/>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Send a Parcel</h1>
          <p className="text-gray-600">Fast and reliable delivery across UAE</p>
        </div>

        {/* Progress Steps - Modern Design */}
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
                  {stepNumber === 4 && 'Payment'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {step === 1 && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-800">Pickup & Delivery Locations</h2>
                <p className="text-gray-500 text-sm mt-1">Enter addresses for pickup and delivery</p>
              </div>
              
              <div className="space-y-6">
                {/* Pickup Location Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">1</span>
                    Pickup Location
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="pickupBuilding" className="block text-sm font-medium text-gray-700 mb-1">
                        Building/Villa and Street Name
                      </label>
                      <input
                        type="text"
                        id="pickupBuilding"
                        name="pickupBuilding"
                        value={formData.pickupBuilding}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Burj Daman"
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="pickupEmirate" className="block text-sm font-medium text-gray-700 mb-1">
                          Emirate
                        </label>
                        <select
                          id="pickupEmirate"
                          name="pickupEmirate"
                          value={formData.pickupEmirate}
                          onChange={handleChange}
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          {emirates.map((emirate, index) => (
                            <option key={index} value={emirate} disabled={index === 0}>{emirate}</option>
                          ))}
                        </select>
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
                          placeholder="e.g. Downtown Dubai"
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
                    <div>
                      <label htmlFor="dropBuilding" className="block text-sm font-medium text-gray-700 mb-1">
                        Building/Villa and Street Name
                      </label>
                      <input
                        type="text"
                        id="dropBuilding"
                        name="dropBuilding"
                        value={formData.dropBuilding}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Marina Plaza"
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="dropEmirate" className="block text-sm font-medium text-gray-700 mb-1">
                          Emirate
                        </label>
                        <select
                          id="dropEmirate"
                          name="dropEmirate"
                          value={formData.dropEmirate}
                          onChange={handleChange}
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          {emirates.map((emirate, index) => (
                            <option key={index} value={emirate} disabled={index === 0}>{emirate}</option>
                          ))}
                        </select>
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
                          placeholder="e.g. Dubai Marina"
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
                      name="pickupContact"
                      value={formData.pickupContact}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md py-2 px-3 pl-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. +971 50 123 4567"
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
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md py-2 px-3 pl-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. +971 50 123 4567"
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
                    <label className={`block p-3 border rounded-md cursor-pointer transition-all ${formData.deliveryType === 'delivery' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}>
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="delivery"
                          checked={formData.deliveryType === 'delivery'}
                          onChange={handleChange}
                          className="mt-0.5 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <div className="ml-2">
                          <span className={`block text-sm font-medium ${formData.deliveryType === 'delivery' ? 'text-blue-700' : 'text-gray-700'}`}>
                            One-way Delivery
                          </span>
                        </div>
                      </div>
                    </label>
                    
                    <label className={`block p-3 border rounded-md cursor-pointer transition-all ${formData.deliveryType === 'return' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}>
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="return"
                          checked={formData.deliveryType === 'return'}
                          onChange={handleChange}
                          className="mt-0.5 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <div className="ml-2">
                          <span className={`block text-sm font-medium ${formData.deliveryType === 'return' ? 'text-blue-700' : 'text-gray-700'}`}>
                            Return Delivery
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* Delivery Speed Selection */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">2</span>
                    Delivery Speed
                  </h3>
                  
                  <div className="space-y-2">
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
                        <div className="ml-2 flex-1">
                          <div className="flex justify-between">
                            <span className={`block text-sm font-medium ${formData.deliveryType === 'standard' ? 'text-blue-700' : 'text-gray-700'}`}>
                              Standard
                            </span>
                            <span className="text-sm font-medium">30 AED</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Delivery within 24 hours</p>
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
                        <div className="ml-2 flex-1">
                          <div className="flex justify-between">
                            <span className={`block text-sm font-medium ${formData.deliveryType === 'express' ? 'text-blue-700' : 'text-gray-700'}`}>
                              Express
                            </span>
                            <span className="text-sm font-medium">45 AED</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Delivery within 4 hours</p>
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
                        <div className="ml-2 flex-1">
                          <div className="flex justify-between">
                            <span className={`block text-sm font-medium ${formData.deliveryType === 'next-day' ? 'text-blue-700' : 'text-gray-700'}`}>
                              Next Day
                            </span>
                            <span className="text-sm font-medium">20 AED</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Delivery within 1-2 business days</p>
                        </div>
                      </div>
                    </label>
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
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-800">Payment Details</h2>
                <p className="text-gray-500 text-sm mt-1">Review your order and complete payment</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-3">Order Summary</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">
                      {formData.deliveryType === 'next-day' && 'Next Day Delivery'}
                      {formData.deliveryType === 'return' && 'Return Delivery'}
                      {formData.deliveryType === 'standard' && 'Standard Delivery (24hr)'}
                      {formData.deliveryType === 'express' && 'Express Delivery (4hr)'}
                    </span>
                  </div>
                  {formData.deliveryType === 'return' && formData.returnType === 'with-return' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Return Service:</span>
                      <span className="font-medium">With Return (+10 AED)</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">From:</span>
                    <span className="font-medium text-right">{formData.pickupBuilding}, {formData.pickupArea}, {formData.pickupEmirate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To:</span>
                    <span className="font-medium text-right">{formData.dropBuilding}, {formData.dropArea}, {formData.dropEmirate}</span>
                  </div>
                  <div className="border-t border-gray-200 mt-3 pt-3">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-blue-600">{calculatePrice()} AED</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Payment Method</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <label className={`block p-3 border rounded-md cursor-pointer transition-all ${formData.paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                      <span className="ml-2 block text-sm font-medium">Credit/Debit Card</span>
                    </div>
                  </label>
                  
                  <label className={`block p-3 border rounded-md cursor-pointer transition-all ${formData.paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                      <span className="ml-2 block text-sm font-medium">Cash on Delivery</span>
                    </div>
                  </label>
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
                  className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Confirm & Pay {calculatePrice()} AED
                </button>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
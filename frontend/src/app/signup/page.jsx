"use client"
import React from 'react';
import bgimg from '../../../public/images/bg.png'
import Nav from '../nav/page';

export default function Signup() {
  return (
   <>
    <Nav/>
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100 bg-no-repeat bg-bottom"
       style={{ backgroundImage: `url(${bgimg.src})` }}
    >
      <div className="bg-white shadow-lg rounded-lg p-10 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          {/* <img src="/logo.svg" alt="Logo" className="h-8 mr-2" /> */}
          <h1 className="text-2xl font-bold text-blue-800">Sheduled</h1>
        </div>

        <h2 className="text-xl mb-4 font-semibold text-gray-700 text-center">Register</h2>

        <label className="block mb-2 text-sm font-medium text-gray-600">Email</label>
        <input
          type="email"
          placeholder="email@address.com"
          className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <label className="block mb-2 text-sm font-medium text-gray-600">Password</label>
        <input
          type="password"
          placeholder="password"
          className="w-full p-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button className="w-full bg-yellow-400 text-white py-2 rounded hover:bg-yellow-500 font-semibold">
          Register
        </button>

        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <span className="text-purple-600 hover:underline cursor-pointer">Login</span>
        </p>
      </div>
    </div>
   </>
  );
}

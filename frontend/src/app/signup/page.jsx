'use client';
import React, { useState } from 'react';
import bgimg from '../../../public/images/bg.png';
import Nav from '../nav/page';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        alert('Registered successfully!');
        console.log('User data:', data.user);
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong!');
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        const res = await fetch('http://localhost:5000/api/user/google-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userInfo.data.name,
            email: userInfo.data.email,
            googleId: userInfo.data.sub
          })
        });

        const data = await res.json();
        if (res.ok) {
          alert('Google login successful!');
          console.log('User data:', data.user);
        } else {
          alert(data.message || 'Google login failed');
        }
      } catch (err) {
        console.error('Google login error:', err);
        alert('Google login failed');
      }
    },
    onError: (error) => {
      console.error('Google Login Error:', error);
      alert('Google login failed');
    }
  });

  return (
    <>
      <Nav />
      <div
        className="min-h-screen flex items-center justify-center bg-gray-100 bg-no-repeat bg-bottom"
        style={{ backgroundImage: `url(${bgimg.src})` }}
      >
        <div className="bg-white shadow-lg rounded-lg p-10 m-28 w-full max-w-md">
          <h1 className="text-2xl font-bold text-blue-800 text-center mb-4">Sheduled</h1>
          <h2 className="text-xl mb-6 font-semibold text-gray-700 text-center">Create Account</h2>
          
          <form onSubmit={handleRegister}>
            {['name', 'email', 'phone', 'password'].map((field) => (
              <div key={field} className="mb-4">
                <label className="block mb-1 text-sm font-medium text-gray-600 capitalize">
                  {field}
                </label>
                <input
                  type={field === 'password' ? 'password' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={`Enter ${field}`}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required={field !== 'phone'}
                />
              </div>
            ))}

            <button
              type="submit"
              className="w-full bg-yellow-400 text-white py-2 rounded hover:bg-yellow-500 font-semibold mb-4"
            >
              Register
            </button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 font-semibold flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-4 text-sm text-center text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-purple-600 hover:underline">Login</a>
          </p>
        </div>
      </div>
    </>
  );
}
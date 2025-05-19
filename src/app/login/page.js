"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import Navbar from '../Components/Navbar';
import { useRouter } from 'next/navigation';
require('dotenv').config();

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const PROJECT_KEY = "krushigowrava";


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://oauth4-0.on.shiper.app/api/users/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,      // Use email from state
          password: formData.password, // Use password from state
          project: PROJECT_KEY,        // Use project key
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Store username and project URL in session storage
        sessionStorage.setItem('username', data.username);
        const projectUrl = data.project_url || '/'; // Redirect to project URL
        router.push(projectUrl);
      } else {
        setMessage(data.error || "An error occurred.");
      }
    } catch (error) {
      setMessage("Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <motion.div
        className="flex items-center justify-center min-h-screen bg-white dark:bg-black"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white dark:bg-black p-8 rounded-lg shadow-lg w-full max-w-sm"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-black dark:text-white mb-6 text-center">Log In</h2>
          {message && <p className="text-center text-red-500">{message}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-black dark:text-white mb-2" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring focus:ring-black dark:focus:ring-white"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-black dark:text-white mb-2" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring focus:ring-black dark:focus:ring-white"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full py-2 ${loading ? 'bg-gray-400' : 'bg-black'} text-white rounded hover:bg-gray-800 transition duration-200`}
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </form>
          <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
            Don't have an account? <a href="/shop" className="text-black dark:text-white hover:underline">Sign up</a>
          </p>
        </motion.div>
      </motion.div>
    </>
  );
};

export default LoginForm;
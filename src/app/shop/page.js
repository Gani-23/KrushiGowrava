"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "../Components/Navbar";
import { useRouter } from "next/navigation"; // Correct import for Next.js 13+ and later

require("dotenv").config();

const SignupURL = process.env.REGISTER_URL;

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const projects = ["krushigowrava"]; // Changed to array
  const role = "user";
  const [loading, setLoading] = useState(false);

  const router = useRouter(); // Move `useRouter` to the top level of the component

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

    const userData = { ...formData, role, projects };

    try {
      const response = await fetch(
        "https://oauth4-0.on.shiper.app/api/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      if (data.success) {
        localStorage.clear(); // Clear the storage on successful registration
        setMessage(data.message || "Registration successful!");

        router.push("/login"); // Navigate to login page after success
      } else {
        setMessage(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during registration submission:", error);
      setMessage("Failed to submit. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
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
          <h2 className="text-2xl font-bold text-black dark:text-white mb-6 text-center">
            Sign Up
          </h2>
          {message && <p className="text-center text-red-500">{message}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-sm text-black dark:text-white mb-2"
                htmlFor="name"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring focus:ring-black dark:focus:ring-white"
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-sm text-black dark:text-white mb-2"
                htmlFor="username"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring focus:ring-black dark:focus:ring-white"
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-sm text-black dark:text-white mb-2"
                htmlFor="email"
              >
                Email
              </label>
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
              <label
                className="block text-sm text-black dark:text-white mb-2"
                htmlFor="password"
              >
                Password
              </label>
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
              className={`w-full py-2 ${
                loading ? "bg-gray-400" : "bg-black"
              } text-white rounded hover:bg-gray-800 transition duration-200`}
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
          <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-black dark:text-white hover:underline"
            >
              Log in
            </a>
          </p>
        </motion.div>
      </motion.div>
    </>
  );
};

export default SignupForm;
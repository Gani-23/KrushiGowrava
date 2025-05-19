'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../Components/Navbar';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    if (formData.name && formData.email && formData.message) {
      setIsSubmitted(true);
      setIsError(false);
    } else {
      setIsError(true);
    }
  };

  return (
    <>
    <Navbar></Navbar>
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/bg-header.jpg')" }}></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen text-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="max-w-4xl"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Contact Us</h1>
            <p className="text-lg md:text-xl mb-6">
              We'd love to hear from you! Whether you have questions, feedback, or ideas, feel free to reach out.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-6 bg-black text-white">
        <div className="container mx-auto text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2 py-10 ">Details</h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="max-w-4xl mx-auto"
          >
            
            {isSubmitted ? (
              <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold">Thank you for your message!</h2>
                <p>We'll get back to you shortly.</p>
              </div>
            ) : (
              <>
                {isError && (
                  <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg mb-6">
                    <p>Please fill in all fields before submitting!</p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      className="w-full p-4 bg-white text-black rounded-lg shadow-md"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your Email"
                      className="w-full p-4 bg-white text-black rounded-lg shadow-md"
                    />
                  </div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your Message"
                    className="w-full p-4 bg-white text-black rounded-lg shadow-md"
                    rows="6"
                  />
                  <motion.button
                    type="submit"
                    className="w-full md:w-auto px-8 py-4 bg-white text-black font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Send Message
                  </motion.button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-6 bg-black text-white">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-lg mb-6">
              You can also contact us via email or phone. We're here to assist you!
            </p>
            <div className="space-y-4">
              <p className="text-xl">
                <strong>Email:</strong> <a href="mailto:support@krushigowrava.com" className="underline">support@krushigowrava.com</a>
              </p>
              <p className="text-xl">
                <strong>Phone:</strong> <span className="underline">+91 9182345999 </span>
              </p>
              <p className="text-xl">
                <strong>Location:</strong> Krushi Gowrava, Bengaluru, Karnataka, India
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Google Map */}
      <section className="py-16 px-6 bg-black text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Location</h2>
          <div className="w-full h-96 mb-6">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3836.5856585425726!2d77.59456631537178!3d12.971598099999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15f8a2e5fdad%3A0x953fe6cfe78e68ae!2sKrushi%20Gowrava!5e0!3m2!1sen!2sin!4v1678505748360!5m2!1sen!2sin"
              width="100%"
              height="100%"
              allowFullScreen=""
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;

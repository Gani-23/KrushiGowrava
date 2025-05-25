'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../Components/Navbar';
import { useEffect, useRef } from 'react';

const About = () => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.classList.toggle('bounce');
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/bg-header.jpg')" }}></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen text-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="max-w-4xl"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4">About Us</h1>
            <p className="text-lg md:text-xl mb-6">
              At Krushi Gowrava, we focus on bringing the most natural products to your doorstep. 
              From fresh, organic food to pure oil extracts, we are committed to offering sustainable, healthy alternatives.
            </p>
            <Link href="/">
              <span className="inline-block px-6 py-3 text-lg font-semibold bg-white text-black rounded-lg shadow-lg hover:bg-gray-200 transition duration-300 cursor-pointer">
                Learn More
              </span>
            </Link>
            <div ref={scrollRef} className="mt-6">
              <div className="arrow bounce">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-auto text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="8 12 12 16 16 12" />
                </svg>
              </div>
            </div>
          </motion.div>   
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 px-6 bg-black text-white">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Founder</h2>
            <p className="text-lg md:text-xl mb-6">
              Krushi Gowrava was founded by <strong>Viswas Prabhu</strong>, an entrepreneur passionate about bringing fresh, organic products directly from the farm to the customer’s doorstep.
            </p>
            <div className="flex justify-center">
              <div className="w-75 h-75 rounded-full overflow-hidden border-4 border-white mb-6">
                <Image
                  src="/images/founders/gani.png"
                  alt="Viswas Prabhu"
                  width={250}
                  height={250}
                  className="object-cover"
                />
              </div>
            </div>
            <p className="text-lg">
              With a strong background in agriculture and a passion for sustainability, Saiganesh’s mission is to bridge the gap between local farmers and the global consumer. 
              Krushi Gowrava represents his vision for a more sustainable, healthier world where everyone can access the best natural products.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-black text-white">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg md:text-xl mb-6">
              At Krushi Gowrava, we strive to deliver fresh, organic food and pure, natural oil extracts to your doorstep. 
              We connect consumers with farmers, ensuring the highest quality while promoting sustainable practices.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="bg-white text-black p-8 rounded-lg shadow-lg hover:scale-105 transform transition duration-300"
              >
                <h3 className="text-xl font-semibold mb-4">Sustainability First</h3>
                <p>We believe in sustainable farming and eco-friendly practices. All our products are sourced directly from local farms, ensuring fairness and reducing environmental impact.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="bg-white text-black p-8 rounded-lg shadow-lg hover:scale-105 transform transition duration-300"
              >
                <h3 className="text-xl font-semibold mb-4">Healthy Living</h3>
                <p>Our products are all-natural, free from harmful chemicals, and packed with nutrients. We’re committed to improving the health and well-being of our customers with every delivery.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 px-6 bg-black text-white">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Core Values</h2>
            <p className="text-lg mb-6">
              At Krushi Gowrava, we believe in cultivating a movement for sustainable agriculture and healthy living. 
              These values guide every aspect of our work and define our commitment to both the environment and our customers.
            </p>
          </motion.div>
          
          <div className="flex justify-between flex-wrap gap-8 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1 bg-white text-black p-8 rounded-lg shadow-lg hover:scale-105 transform transition duration-300"
            >
              <h3 className="text-xl font-semibold mb-4">Transparency</h3>
              <p>We believe in complete transparency. From the farm to your table, you can track the journey of every product we deliver.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex-1 bg-white text-black p-8 rounded-lg shadow-lg hover:scale-105 transform transition duration-300"
            >
              <h3 className="text-xl font-semibold mb-4">Sustainability</h3>
              <p>We use eco-friendly methods in farming and packaging to ensure that we’re contributing to a healthier planet for future generations.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex-1 bg-white text-black p-8 rounded-lg shadow-lg hover:scale-105 transform transition duration-300"
            >
              <h3 className="text-xl font-semibold mb-4">Community</h3>
              <p>We believe in supporting local farmers and giving back to the community by creating opportunities and building partnerships that help everyone thrive.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6 bg-black text-white">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Our Customers Say</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              {testimonials.map(testimonial => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="bg-white text-black p-8 rounded-lg shadow-lg"
                >
                  <p className="text-lg italic mb-4">"{testimonial.message}"</p>
                  <p className="text-lg font-semibold">{testimonial.name}</p>
                  <p className="text-gray-500">{testimonial.location}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

// Sample data for team members (Founder)
const teamMembers = [
  {
    id: 1,
    name: 'Saiganesh Angadi',
    position: 'Founder & CEO',
    image: '/images/founders/gani.png',
    delay: 0.2,
  }
];

// Sample data for testimonials
const testimonials = [
  {
    name: 'Arun Kumar',
    message: 'Krushi Gowrava has the freshest produce I have ever had. Their cold-pressed oils are amazing!',
    location: 'Bangalore, India',
  },
  {
    name: 'Priya Patel',
    message: 'I love how I can get organic food delivered to my door. It’s so convenient and healthy.',
    location: 'Chennai, India',
  },
];
// source code belongs to sole developer of the project 
// Saiganesh Angadi
export default About;
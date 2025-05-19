// components/Location.jsx
'use client';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import Navbar from '../Components/Navbar';

const Location = () => {
  useEffect(() => {
    // Load Google Maps script
    const loadMap = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    loadMap();
    window.initMap = initMap; // Make the initMap function available globally

    return () => {
      const script = document.querySelector('script[src*="maps.googleapis.com"]');
      if (script) script.remove(); // Cleanup the script on component unmount
    };
  }, []);

  const initMap = () => {
    const map = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: 14.7000, lng: 76.8667 }, // Converted coordinates
      zoom: 15,
      mapTypeId: 'roadmap',
    });

    // Add a marker at your location
    new window.google.maps.Marker({
      position: { lat: 14.7000, lng: 76.8667 }, // Converted coordinates
      map: map,
      title: 'Krushi Gowrava',
    });
  };

  return (
    <section className="relative bg-black text-white overflow-hidden">
      <Navbar />

      <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Our Location</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Find us at the location below. We look forward to seeing you!
          </p>
        </motion.div>

        <div id="map" className="w-full max-w-3xl h-96 rounded-lg shadow-lg"></div>
      </div>
    </section>
  );
};

export default Location;
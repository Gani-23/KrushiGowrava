'use client';
import Navbar from './Components/Navbar';
import { motion } from 'framer-motion';
import Head from 'next/head'; // For additional styles if needed
import HomePage from './Components/HomePage';

const Home = () => {
  return (
    <>
      <Head>
        <title>Krushi Gowarava</title>
        <meta name="description" content="Health brought to you" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
        >
          <source src="/Videos/revamp18.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 10, repeat: Infinity }}
        >
          <div className="absolute inset-0 bg-black opacity-50" />
        </motion.div>
        <motion.div
          className="relative flex flex-col items-center justify-center text-center text-white z-10 px-4 sm:px-8 lg:px-16"
          initial={{ opacity: 0, y: 50, scale: 1.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold">Krushi Gowrava.</h1>
          <p className="text-lg sm:text-xl lg:text-2xl mt-4">Harvested by Nature, Delivered to You.</p>
        </motion.div>
      </div>
      <HomePage />
    </>
  );
};

export default Home;
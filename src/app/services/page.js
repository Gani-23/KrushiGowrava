"use client"; // Ensure this component is a Client Component

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../Components/Navbar";

const Services = () => {
  return (
    <>
      <Navbar />

      {/* Main Section: "Our Services" */}
      <section className="relative bg-black text-white overflow-hidden py-12 px-6">
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient">
              Our Services
            </h1>
            <p className="text-lg md:text-xl mb-6">
              Discover how we can help you achieve your goals with our expert services.
            </p>
            <Link href="/contact">
              <span className="inline-block px-8 py-4 text-lg font-semibold bg-white text-black rounded-lg shadow-lg hover:bg-gray-200 transition duration-300">
                Get In Touch
              </span>
            </Link>
          </motion.div>

          {/* Scroll down button */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6 cursor-pointer flex items-center justify-center"
            onClick={() =>
              window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
            }
            aria-label="Scroll Down"
          >
            <Image
              src="/images/down.png"
              alt="Scroll Down"
              width={40}
              height={40}
              className="animate-bounce"
            />
          </motion.div>
        </div>
      </section>

      {/* Home Content Section */}
      <section className="flex flex-col items-center justify-center space-y-12 p-6 bg-black text-white">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 text-center">
          Our Expertise
        </h2>

        {/* First Section: Photo on the left and content on the right */}
        <motion.div
          className="flex flex-col md:flex-row items-center w-full max-w-4xl space-y-8 md:space-y-0"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.img
            src="/images/puddle.png"
            alt="Honey Extraction"
            className="w-full md:w-1/2 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05, rotate: 2 }}
          />
          <div className="w-full md:w-1/2 md:pl-8 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-3">
              Honey Extraction
            </h2>
            <p className="leading-relaxed">
              Our honey extraction process is second to none, utilizing state-of-the-art equipment to ensure the highest quality and purity. We carefully harvest honeycombs and use a gentle cold extraction method to preserve its natural enzymes and antioxidants. Committed to sustainability, we partner with local beekeepers who practice ethical methods, supporting both bee health and product quality. The result is a rich, flavorful honey that’s perfect for drizzling over pancakes, sweetening tea, or enhancing your favorite recipes.
            </p>
          </div>
        </motion.div>

        {/* Second Section: Photo on the right and content on the left */}
        <motion.div
          className="flex flex-col-reverse md:flex-row items-center w-full max-w-4xl space-y-8 md:space-y-0 md:space-x-8"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="w-full md:w-1/2 md:pr-8 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-3">
              Oil Manufacturing
            </h2>
            <p className="leading-relaxed">
              Experience the purity of our cold-pressed oils, crafted to preserve the natural flavors and nutrients of the source ingredients. Our careful extraction process involves pressing seeds and nuts at low temperatures, ensuring that every drop is rich in essential fatty acids, vitamins, and antioxidants. Free from artificial enhancements, our oils deliver unparalleled flavor and quality, perfect for enhancing your culinary creations or adding a healthy touch to your diet. Embrace the essence of nature with our premium cold-pressed oils.
            </p>
          </div>
          <motion.img
            src="/images/Coldpress.png"
            alt="Cold Pressed Oils"
            className="w-full md:w-1/2 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05, rotate: -2 }}
          />
        </motion.div>

        <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 text-center">
          Our Motive
        </h2>

        {/* Single Div with Photo */}
        <motion.div
          className="w-full max-w-2xl text-center"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.img
            src="/images/Hazards.png"
            alt="Team Work"
            className="w-full rounded-lg shadow-lg"
            whileHover={{ scale: 1.05, rotate: 2 }}
          />
          <h2 className="text-2xl sm:text-3xl font-semibold mt-4">Hygiene Food</h2>
          <p className="leading-relaxed">
            Collaboration is key to our success. Our dedicated team works together to deliver exceptional results and ensure your satisfaction.
          </p>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="max-w-2xl mx-auto mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
              Why Choose Us?
            </h2>
            <p className="text-lg mb-6">
              Our commitment to excellence and customer satisfaction sets us apart from the competition.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                className="bg-gray-800 p-6 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 transform-gpu hover:bg-gradient-to-br from-purple-500 to-blue-500"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: feature.delay }}
              >
                <div className="mb-4 flex justify-center">
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: feature.delay }}
                  >
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      width={150}
                      height={150}
                      className="mx-auto"
                    />
                  </motion.div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

// Sample data for features
const features = [
  {
    id: 1,
    title: "Direct Association",
    description: "We associate directly with farmers to ensure the best quality products.",
    icon: "/images/Association.png",
    delay: 0.1,
  },
  {
    id: 2,
    title: "Bio Friendly",
    description: "Eco-friendly practices to protect the environment and customer.",
    icon: "/images/BioFriendly.png",
    delay: 0.2,
  },
  {
    id: 3,
    title: "Packaging",
    description: "Carefully packed products to ensure freshness and quality.",
    icon: "/images/Packaging.png",
    delay: 0.3,
  },
  {
    id: 4,
    title: "Delivery",
    description: "We deliver products to your doorstep with care and efficiency.",
    icon: "/images/Delivery.png",
    delay: 0.4,
  },
];

export default Services;
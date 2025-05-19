"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import ChatBot from "../Components/Chatbot";
import { X, ShoppingCart, Heart, Search, Plus, Minus, Moon, Sun, Menu, ShoppingBag, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useDebouncedCallback } from "use-debounce";

const Navbar = dynamic(() => import("../Components/Navbar"), { ssr: false });

const ProductPage = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [username, setUsername] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const categories = ["all", "essentials", "oils", "organic", "food"];

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("https://oauth4-0.on.shiper.app/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    
    // Load cart and wishlist from localStorage if available
    const savedCart = localStorage.getItem("cart");
    const savedWishlist = localStorage.getItem("wishlist");
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    
    fetchProducts();
  }, [fetchProducts]);
  
  // Save cart and wishlist to localStorage when they change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const handleSearch = useDebouncedCallback((value) => {
    setSearchTerm(value);
  }, 500);

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Show cart when adding first item
        if (prevCart.length === 0) {
          setIsCartOpen(true);
        }
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(id);
      return;
    }
    
    setCart((prevCart) => 
      prevCart.map((item) => 
        item._id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleAddToWishlist = (product) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.find((item) => item._id === product._id);
      if (exists) {
        return prevWishlist.filter(item => item._id !== product._id);
      } else {
        return [...prevWishlist, product];
      }
    });
  };

  const handleRemoveFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== id));
  };

  const handleRemoveFromWishlist = (id) => {
    setWishlist((prevWishlist) => prevWishlist.filter((item) => item._id !== id));
  };

  const isInWishlist = (id) => {
    return wishlist.some(item => item._id === id);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                            (product.category && product.category.toLowerCase() === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const calculateItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const sendOrderSummary = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const orderSummary = cart
      .map(
        (item) =>
          `${item.title} (x${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`
      )
      .join("\n");
    const whatsappNumber = "9182345999";
    const message = `Order Summary:\n${orderSummary}\nTotal: ₹${calculateTotal()}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappLink, "_blank");
  };

  // Product Card Component
  const ProductCard = ({ product }) => {
    const isWishlisted = isInWishlist(product._id);
    
    return (
      <motion.div
        className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="aspect-square relative overflow-hidden rounded-t-2xl">
          <Image
            src={product.imgSrc}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToWishlist(product);
              }}
              className={`p-2 rounded-full ${isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/80 text-gray-800 dark:bg-gray-700/80 dark:text-gray-200'} backdrop-blur-sm transition-all hover:scale-110`}
              aria-label="Add to wishlist"
            >
              <Heart size={18} className={isWishlisted ? 'fill-white' : ''} />
            </button>
          </div>
        </div>
        
        <div className="p-4 flex flex-col h-40">
          <h3 className="font-medium text-gray-900 dark:text-white text-lg line-clamp-1">{product.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-grow line-clamp-2">{product.description}</p>
          
          <div className="flex items-center justify-between mt-4">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">₹{product.price}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
              className="bg-black dark:bg-white text-white dark:text-black rounded-full py-2 px-4 flex items-center gap-2 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              <Plus size={16} />
              Add
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Cart Item Component
  const CartItem = ({ item }) => (
    <div className="flex items-start gap-3 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
        <Image
          src={item.imgSrc}
          alt={item.title}
          width={80}
          height={80}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-grow">
        <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">{item.description}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="font-semibold text-gray-900 dark:text-white">₹{item.price}</span>
          
          <div className="flex items-center">
            <button 
              onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
              className="p-1 rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <Minus size={14} />
            </button>
            <span className="mx-2 w-6 text-center">{item.quantity}</span>
            <button 
              onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
              className="p-1 rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => handleRemoveFromCart(item._id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      >
        <X size={18} />
      </button>
    </div>
  );

  // Wishlist Item Component
  const WishlistItem = ({ item }) => (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
        <Image
          src={item.imgSrc}
          alt={item.title}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-grow">
        <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">₹{item.price}</p>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={() => handleAddToCart(item)}
          className="p-2 rounded-full bg-black dark:bg-white text-white dark:text-black"
        >
          <ShoppingCart size={16} />
        </button>
        <button 
          onClick={() => handleRemoveFromWishlist(item._id)}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );

  // Cart Drawer Component
  const CartDrawer = () => (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsCartOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-xl z-50 overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <ShoppingBag size={18} /> Your Cart
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto py-2 px-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <ShoppingCart size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Add items to your cart to checkout</p>
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      setActiveTab("products");
                    }}
                    className="bg-black dark:bg-white text-white dark:text-black py-2 px-6 rounded-full font-medium"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => <CartItem key={item._id} item={item} />)
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal ({calculateItemCount()} items)</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{calculateTotal()}</span>
                </div>
                <button
                  onClick={sendOrderSummary}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full py-3 flex items-center justify-center gap-2 font-medium"
                >
                  Checkout via WhatsApp <ChevronRight size={16} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Main header component
  const Header = () => (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
                <span className="text-white dark:text-black font-semibold text-xs">KG</span>
              </div>
              <span className="font-semibold text-lg text-gray-900 dark:text-white">Krushi Gowrava</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setActiveTab("products")}
              className={`font-medium text-sm ${activeTab === "products" ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
            >
              Shop
            </button>
            <button 
              onClick={() => setActiveTab("wishlist")}
              className={`font-medium text-sm ${activeTab === "wishlist" ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
            >
              Wishlist
            </button>
         
          </div>
          
          <div className="flex items-center gap-3">
           
            
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-xs font-medium rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                  {calculateItemCount()}
                </span>
              )}
            </button>
            
            {username && (
              <div className="hidden sm:block text-sm text-gray-700 dark:text-gray-300">
                Hi, {username}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <div className="px-4 py-3 space-y-1">
              <button 
                onClick={() => {
                  setActiveTab("products");
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
              >
                Shop
              </button>
              <button 
                onClick={() => {
                  setActiveTab("wishlist");
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
              >
                Wishlist
              </button>
              <a href="#" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
                About
              </a>
              <a href="#" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
                Contact
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-950">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-black dark:border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-950 px-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl max-w-md w-full text-center">
          <h3 className="text-red-600 dark:text-red-400 font-medium text-lg mb-2">Something went wrong</h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button 
            onClick={fetchProducts}
            className="mt-4 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <CartDrawer />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero section - only show on products tab */}
        {activeTab === "products" && (
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                  Directly from nature for a toxic free lifestyle
                </h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                  Discover our premium collection of organic and natural products sourced from sustainable farms.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search products..."
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                    <Search 
                      size={18} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    />
                  </div>
                  <button 
                    onClick={() => setFilterModalOpen(true)}
                    className="py-3 px-6 bg-gray-100 dark:bg-gray-800 rounded-full font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Filter
                  </button>
                </div>
              </div>
              
              <div className="relative h-64 sm:h-80 md:h-full rounded-2xl overflow-hidden">
                <Image src="/images/NaturalFarming.webp"
                  alt="Natural products"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="font-semibold text-xl">Organic Collection</p>
                  <p className="text-sm text-white/80 mt-1">Pure and natural ingredients</p>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Category navigation - only show on products tab */}
        {activeTab === "products" && (
          <div className="mb-8 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-4 min-w-max">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Main content area */}
        {activeTab === "products" && (
          <>
            <h2 className="text-lg md:text-xl font-medium text-gray-900 dark:text-white mb-6">
              {selectedCategory === "all" 
                ? "All Products" 
                : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products`}
              <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
                ({filteredProducts.length} items)
              </span>
            </h2>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Wishlist content */}
        {activeTab === "wishlist" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Heart size={20} /> Your Wishlist
            </h2>
            
            {wishlist.length === 0 ? (
              <div className="text-center py-12">
                <Heart size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Save items you love for later</p>
                <button 
                  onClick={() => setActiveTab("products")}
                  className="bg-black dark:bg-white text-white dark:text-black py-2 px-6 rounded-full font-medium"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {wishlist.map((item) => (
                  <WishlistItem key={item._id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} Krushi Gowrava. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <ChatBot />
    </div>
  );
};

export default ProductPage;
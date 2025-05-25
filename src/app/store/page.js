"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import ChatBot from "../Components/Chatbot";
import { X, ShoppingCart, Heart, Search, Plus, Minus, Menu, ShoppingBag, ChevronRight, Star, StarHalf, LogOut } from "lucide-react";
import dynamic from "next/dynamic";
import { useDebouncedCallback } from "use-debounce";
import { useRouter } from "next/navigation";

const Navbar = dynamic(() => import("../Components/Navbar"), { ssr: false });

const API_URL = "https://oauth4-0.on.shiper.app/api/products";

// Helper function to generate MongoDB-compatible ObjectId
const generateObjectId = () => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
  const machineId = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
  const processId = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
  const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
  return timestamp + machineId + processId + counter;
};

// Isolated Review Textarea Component to prevent re-renders
const ReviewTextarea = memo(({ value, onChange }) => {
  console.log("ReviewTextarea rendering");
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder="Share your experience with this product..."
      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      rows={4}
    />
  );
});

ReviewTextarea.displayName = "ReviewTextarea";

// Memoized Rating Stars Component
const RatingStars = memo(({ rating, size = 16, interactive = false, onChange = null }) => {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (interactive) {
        stars.push(
          <button 
            key={i}
            onClick={() => onChange(i)}
            className={`text-${i <= rating ? 'yellow-400' : 'gray-300'} hover:text-yellow-500 transition-colors`}
          >
            <Star size={size} className={i <= rating ? 'fill-yellow-400' : ''} />
          </button>
        );
      } else {
        if (i <= fullStars) {
          stars.push(<Star key={i} size={size} className="fill-yellow-400 text-yellow-400" />);
        } else if (i === fullStars + 1 && hasHalfStar) {
          stars.push(<StarHalf key={i} size={size} className="fill-yellow-400 text-yellow-400" />);
        } else {
          stars.push(<Star key={i} size={size} className="text-gray-300 dark:text-gray-600" />);
        }
      }
    }
    return stars;
  };
  
  return (
    <div className="flex items-center gap-0.5">
      {renderStars()}
    </div>
  );
});

RatingStars.displayName = "RatingStars";

const ProductPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("products");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(""); 
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [categories, setCategories] = useState(["all"]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [ratingStats, setRatingStats] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  
  // Use a ref to store the review text to prevent re-renders
  const reviewTextRef = useRef("");

  // Extract categories from products
  const extractCategories = useCallback((productList) => {
    if (!productList || productList.length === 0) return ["all"];
    
    // Extract unique categories from products
    const uniqueCategories = [...new Set(productList.map(product => product.category))];
    
    // Filter out undefined or empty categories
    const validCategories = uniqueCategories.filter(category => category && category.trim() !== "");
    
    // Add "all" as the first option
    return ["all", ...validCategories];
  }, []);

  // Fetch products with filters
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (minRating > 0) params.append("minRating", minRating);
      if (sortBy) {
        params.append("sortBy", sortBy);
        params.append("order", sortOrder);
      }
      if (priceRange.min > 0) params.append("minPrice", priceRange.min);
      if (priceRange.max < 1000) params.append("maxPrice", priceRange.max);
      
      const queryString = params.toString();
      let url;
      
      if (searchTerm) {
        // Use search endpoint when there's a search term
        url = `${API_URL}/search?q=${encodeURIComponent(searchTerm)}&${queryString}`;
      } else {
        url = `${API_URL}${queryString ? `?${queryString}` : ''}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      
      // Handle different response formats
      const productList = data.products || data;
      setProducts(productList);
      
      // Extract categories from products
      const extractedCategories = extractCategories(productList);
      setCategories(extractedCategories);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, minRating, sortBy, sortOrder, priceRange, searchTerm, extractCategories]);

  // Fetch product rating statistics
  const fetchRatingStats = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/${productId}/ratings`);
      if (!response.ok) throw new Error("Failed to fetch rating statistics");
      const data = await response.json();
      setRatingStats(data);
    } catch (err) {
      console.error("Error fetching rating stats:", err);
    }
  };

  // Check authentication status and ensure valid userId
  const checkAuth = useCallback(() => {
    const storedUsername = sessionStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
      
      // Get userId from sessionStorage or generate a MongoDB-compatible ObjectId
      let storedUserId = sessionStorage.getItem("userId");
      
      // If no userId exists or it's not in the correct format, create a new one
      if (!storedUserId || storedUserId.length !== 24) {
        storedUserId = generateObjectId();
        sessionStorage.setItem("userId", storedUserId);
      }
      
      setUserId(storedUserId);
      return true;
    }
    return false;
  }, []);

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userId");
    setUsername("");
    setUserId("");
    router.push("/login");
  };

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = checkAuth();
    
    // Load cart and wishlist from localStorage if available
    const savedCart = localStorage.getItem("cart");
    const savedWishlist = localStorage.getItem("wishlist");
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    
    // Fetch products
    fetchProducts();
  }, [fetchProducts, checkAuth]);
  
  // Save cart and wishlist to localStorage when they change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Refetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, minRating, sortBy, sortOrder, priceRange, fetchProducts]);

  const handleSearch = useDebouncedCallback((value) => {
    setSearchTerm(value);
    fetchProducts();
  }, 500);

  // Filter products by search term (client-side filtering for immediate feedback)
  const getFilteredProducts = () => {
    if (!searchTerm.trim()) return products;
    
    return products.filter(product => 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

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

    window.open(whatsappLink, "_blank")
  };

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
    // Fetch rating statistics for this product
    fetchRatingStats(product._id);
  };

  const openRatingModal = (product) => {
    // Check if user is logged in
    if (!username) {
      alert("Please log in to rate products");
      router.push("/login");
      return;
    }
    
    setSelectedProduct(product);
    
    // Check if user already rated this product
    const existingRating = product.ratings?.find(r => r.userId === userId);
    if (existingRating) {
      setRatingValue(existingRating.rating);
      setReviewText(existingRating.review || '');
      reviewTextRef.current = existingRating.review || '';
    } else {
      setRatingValue(5);
      setReviewText('');
      reviewTextRef.current = '';
    }
    
    // Open modal after setting the values
    setIsRatingModalOpen(true);
  };

  // Optimized review text change handler that doesn't trigger re-renders
  const handleReviewTextChange = useCallback((e) => {
    const newValue = e.target.value;
    reviewTextRef.current = newValue;
    setReviewText(newValue);
  }, []);

  // Submit rating function
  const submitRating = async () => {
    if (!selectedProduct || !userId) {
      alert("You must be logged in to submit a rating");
      return;
    }
    
    if (submittingRating) return; // Prevent multiple submissions
    
    try {
      setSubmittingRating(true);
      
      // Use the ref value to ensure we have the latest text
      const currentReviewText = reviewTextRef.current;
      
      console.log(`Submitting rating for product: ${selectedProduct._id}`);
      console.log("Rating payload:", { userId, rating: ratingValue, review: currentReviewText });
      
      const response = await fetch(`${API_URL}/${selectedProduct._id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          rating: ratingValue,
          review: currentReviewText
        }),
      });
      
      const responseText = await response.text();
      console.log("Response status:", response.status);
      console.log("Response text:", responseText);
      
      if (!response.ok) {
        let errorMessage = "Failed to submit rating";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If the response is not valid JSON, use the text as the error message
          if (responseText) errorMessage = responseText;
        }
        throw new Error(errorMessage);
      }
      
      let updatedProduct;
      try {
        updatedProduct = JSON.parse(responseText);
      } catch (e) {
        console.error("Error parsing response:", e);
        throw new Error("Invalid response from server");
      }
      
      console.log("Rating submitted successfully, updated product:", updatedProduct);
      
      // Update product in the state
      setProducts(prev => 
        prev.map(p => p._id === updatedProduct._id ? updatedProduct : p)
      );
      
      // Update selected product if it's the one being rated
      if (selectedProduct._id === updatedProduct._id) {
        setSelectedProduct(updatedProduct);
      }
      
      setIsRatingModalOpen(false);
      
      // Refresh rating statistics
      fetchRatingStats(selectedProduct._id);
      
      // Show success notification
      alert('Rating submitted successfully!');
    } catch (err) {
      console.error('Rating submission error:', err);
      alert(`Failed to submit rating: ${err.message}`);
    } finally {
      setSubmittingRating(false);
    }
  };

  // Product Card Component
  const ProductCard = memo(({ product }) => {
    const isWishlisted = isInWishlist(product._id);
    
    return (
      <motion.div
        className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => openProductDetails(product)}
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
          
          {/* Category badge */}
          {product.category && (
            <div className="absolute top-3 left-3 z-10">
              <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm">
                {product.category}
              </span>
            </div>
          )}
          
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">Out of Stock</span>
            </div>
          )}
        </div>
        
        <div className="p-4 flex flex-col h-40">
          <h3 className="font-medium text-gray-900 dark:text-white text-lg line-clamp-1">{product.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-grow line-clamp-2">{product.description}</p>
          
          {/* Rating display */}
          <div className="flex items-center mt-2 mb-2">
            <RatingStars rating={product.avgRating || 0} size={14} />
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
              {product.avgRating ? product.avgRating.toFixed(1) : 'New'} 
              {product.totalRatings > 0 && ` (${product.totalRatings})`}
            </span>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">₹{product.price}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                if (product.stock > 0) {
                  handleAddToCart(product);
                } else {
                  alert("This product is out of stock");
                }
              }}
              className={`rounded-full py-2 px-4 flex items-center gap-2 text-sm font-medium ${
                product.stock > 0 
                  ? "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200" 
                  : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
              } transition-colors`}
              disabled={product.stock <= 0}
            >
              <Plus size={16} />
              Add
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  });

  ProductCard.displayName = "ProductCard";

  // Cart Item Component
  const CartItem = memo(({ item }) => (
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
              disabled={item.quantity >= item.stock}
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
  ));

  CartItem.displayName = "CartItem";

  // Wishlist Item Component
  const WishlistItem = memo(({ item }) => (
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
        <div className="flex items-center mt-1">
          {item.category && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full mr-2">
              {item.category}
            </span>
          )}
          <RatingStars rating={item.avgRating || 0} size={12} />
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-2">₹{item.price}</p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={() => item.stock > 0 ? handleAddToCart(item) : alert("This product is out of stock")}
          className={`p-2 rounded-full ${
            item.stock > 0 
              ? "bg-black dark:bg-white text-white dark:text-black" 
              : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
          }`}
          disabled={item.stock <= 0}
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
  ));

  WishlistItem.displayName = "WishlistItem";

  // Cart Drawer Component
  const CartDrawer = memo(() => (
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
  ));

  CartDrawer.displayName = "CartDrawer";

  // User Menu Component
  const UserMenu = memo(() => (
    <AnimatePresence>
      {isUserMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50"
        >
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">ID: {userId}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
          >
            <LogOut size={16} className="mr-2" />
            Log Out
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  ));

  UserMenu.displayName = "UserMenu";

  // Main header component
  const Header = memo(() => (
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
            
            {username ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm text-gray-700 dark:text-gray-300">
                    {username}
                  </span>
                </button>
                <UserMenu />
              </div>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
              >
                Log In
              </button>
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
              {username ? (
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                >
                  Log Out
                </button>
              ) : (
                <button 
                  onClick={() => router.push("/login")}
                  className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                >
                  Log In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  ));

  Header.displayName = "Header";

  // Filter Modal Component
  const FilterModal = memo(() => (
    <AnimatePresence>
      {filterModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setFilterModalOpen(false)}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl z-50 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters & Sort</h3>
              <button
                onClick={() => setFilterModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Categories */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category, index) => (
                    <button
                      key={`${category}-${index}`}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        selectedCategory === category
                          ? "bg-black dark:bg-white text-white dark:text-black"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {category === "all" ? "All Categories" : category}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Price Range</h4>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value) || 0})}
                      className="w-full p-2 pl-8 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      min="0"
                    />
                    <span className="absolute left-3 top-2 text-gray-400">₹</span>
                  </div>
                  <span className="text-gray-500">to</span>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value) || 0})}
                      className="w-full p-2 pl-8 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      min="0"
                    />
                    <span className="absolute left-3 top-2 text-gray-400">₹</span>
 </div>
                </div>
              </div>
              
              {/* Sort options */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sort By</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Latest", value: "createdAt", order: "desc" },
                    { label: "Price: Low to High", value: "price", order: "asc" },
                    { label: "Price: High to Low", value: "price", order: "desc" },
                    { label: "Rating: High to Low", value: "avgRating", order: "desc" },
                  ].map((option) => (
                    <button
                      key={option.value + option.order}
                      onClick={() => {
                        setSortBy(option.value);
                        setSortOrder(option.order);
                      }}
                      className={`py-2 px-3 rounded-lg text-sm text-center ${
                        sortBy === option.value && sortOrder === option.order
                          ? "bg-black dark:bg-white text-white dark:text-black"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Rating filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Minimum Rating</h4>
                <div className="flex items-center space-x-2">
                  {[0, 1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`flex items-center justify-center h-10 w-10 rounded-full 
                        ${minRating === rating 
                          ? "bg-black dark:bg-white text-white dark:text-black" 
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        }`}
                    >
                      {rating === 0 ? "All" : rating + "★"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => {
                  setMinRating(0);
                  setSortBy("createdAt");
                  setSortOrder("desc");
                  setPriceRange({ min: 0, max: 1000 });
                  setSelectedCategory("all");
                }}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  fetchProducts();
                  setFilterModalOpen(false);
                }}
                className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  ));

  FilterModal.displayName = "FilterModal";

  // Product Details Modal
  const ProductDetailsModal = memo(() => (
    <AnimatePresence>
      {isProductModalOpen && selectedProduct && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsProductModalOpen(false)}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="relative">
              <div className="aspect-square w-full">
                <Image
                  src={selectedProduct.imgSrc}
                  alt={selectedProduct.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              >
                <X size={20} />
              </button>
              
              {/* Category badge */}
              {selectedProduct.category && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 bg-black/70 text-white text-sm rounded-full backdrop-blur-sm">
                    {selectedProduct.category}
                  </span>
                </div>
              )}
              
              {selectedProduct.stock <= 0 && (
                <div className="absolute top-16 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Out of Stock
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedProduct.title}</h2>
                <span className="text-xl font-bold text-gray-900 dark:text-white">₹{selectedProduct.price}</span>
              </div>
              
              <div className="flex items-center mt-2 mb-1">
                <RatingStars rating={selectedProduct.avgRating || 0} size={16} />
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {selectedProduct.avgRating ? selectedProduct.avgRating.toFixed(1) : 'New'} 
                  {selectedProduct.totalRatings > 0 && ` (${selectedProduct.totalRatings} reviews)`}
                </span>
                <button 
                  onClick={() => openRatingModal(selectedProduct)}
                  className="ml-auto text-sm text-blue-600 dark:text-blue-400"
                >
                  Rate this product
                </button>
              </div>
              
              {/* Stock information */}
              <p className="text-sm mb-4">
                {selectedProduct.stock > 0 ? (
                  <span className="text-green-600 dark:text-green-400">In Stock: {selectedProduct.stock} available</span>
                ) : (
                  <span className="text-red-500">Out of Stock</span>
                )}
              </p>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">{selectedProduct.description}</p>
              
              {/* Seller information */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Seller Information</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Seller:</span> {selectedProduct.sellerName}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Location:</span> {selectedProduct.sellerAddress}
                </p>
              </div>
              
              {/* Rating distribution if available */}
              {ratingStats && ratingStats.totalRatings > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Rating Distribution</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(star => (
                      <div key={star} className="flex items-center">
                        <span className="w-8 text-sm text-gray-600 dark:text-gray-400">{star} ★</span>
                        <div className="flex-grow mx-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-yellow-400 h-full rounded-full"
                            style={{ 
                              width: `${ratingStats.totalRatings > 0 
                                ? (ratingStats.ratingCounts[star] / ratingStats.totalRatings) * 100 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {ratingStats.ratingCounts[star] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Reviews section */}
              {selectedProduct.ratings && selectedProduct.ratings.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Customer Reviews</h3>
                  <div className="space-y-4">
                    {selectedProduct.ratings
                      .filter(rating => rating.review && rating.review.trim() !== "")
                      .slice(0, 3)
                      .map((rating, index) => (
                        <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                          <div className="flex items-center mb-1">
                            <RatingStars rating={rating.rating} size={14} />
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{rating.review}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    handleAddToWishlist(selectedProduct);
                  }}
                  className={`flex-1 py-3 rounded-full ${
                    isInWishlist(selectedProduct._id)
                      ? "bg-rose-500 text-white"
                      : "border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <Heart size={18} className="inline-block mr-2" />
                  {isInWishlist(selectedProduct._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                </button>
                <button
                  onClick={() => {
                    if (selectedProduct.stock > 0) {
                      handleAddToCart(selectedProduct);
                      setIsProductModalOpen(false);
                    } else {
                      alert("This product is out of stock");
                    }
                  }}
                  className={`flex-1 py-3 ${
                    selectedProduct.stock > 0
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  } rounded-full font-medium`}
                  disabled={selectedProduct.stock <= 0}
                >
                  {selectedProduct.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  ));

  ProductDetailsModal.displayName = "ProductDetailsModal";

  // Rating Modal - FIXED to prevent re-rendering on review text input
  const RatingModal = () => {
    console.log("RatingModal rendering");
    
    if (!isRatingModalOpen || !selectedProduct) return null;
    
    return (
      <AnimatePresence>
        <motion.div
          key="rating-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50"
          onClick={() => setIsRatingModalOpen(false)}
        />
        <motion.div
          key="rating-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl z-50 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Rate this product</h3>
            <button
              onClick={() => setIsRatingModalOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                <Image
                  src={selectedProduct.imgSrc}
                  alt={selectedProduct.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{selectedProduct.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{selectedProduct.description}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Rating</label>
              <div className="flex justify-center">
                <RatingStars 
                  rating={ratingValue} 
                  size={32} 
                  interactive={true} 
                  onChange={setRatingValue} 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Review (Optional)</label>
              <ReviewTextarea value={reviewText} onChange={handleReviewTextChange} />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setIsRatingModalOpen(false)}
              className="flex-1 py-3 border border-gray-300 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={submitRating}
              disabled={submittingRating}
              className={`flex-1 py-3 ${
                submittingRating 
                  ? "bg-gray-400 dark:bg-gray-600" 
                  : "bg-black dark:bg-white text-white dark:text-black"
              } rounded-full font-medium`}
            >
              {submittingRating ? "Submitting..." : "Submit Rating"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Get filtered products
  const filteredProducts = getFilteredProducts();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab navigation for mobile */}
        <div className="flex md:hidden mb-6 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 py-3 text-center text-sm font-medium ${
              activeTab === "products"
                ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Shop
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`flex-1 py-3 text-center text-sm font-medium ${
              activeTab === "wishlist"
                ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Wishlist
          </button>
        </div>
        
        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shop Products</h1>
              
              <div className="flex w-full sm:w-auto gap-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  onClick={() => setFilterModalOpen(true)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium"
                >
                  Filter
                </button>
              </div>
            </div>
            
            {/* Category Pills */}
            <div className="flex overflow-x-auto pb-2 mb-6 gap-2 hide-scrollbar">
              {categories.map((category, index) => (
                <button
                  key={`${category}-${index}`}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {category === "all" ? "All Categories" : category}
                </button>
              ))}
            </div>
            
            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No products found. Try adjusting your filters.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setMinRating(0);
                    setSortBy("createdAt");
                    setSortOrder("desc");
                    setPriceRange({ min: 0, max: 1000 });
                    fetchProducts();
                  }}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Wishlist Tab */}
        {activeTab === "wishlist" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Wishlist</h1>
            </div>
            
            {wishlist.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
                <Heart size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Save items you like to your wishlist</p>
                <button 
                  onClick={() => setActiveTab("products")}
                  className="bg-black dark:bg-white text-white dark:text-black py-2 px-6 rounded-full font-medium"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                {wishlist.map((item) => (
                  <WishlistItem key={item._id} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Modals and Drawers */}
      <CartDrawer />
      <ProductDetailsModal />
      <RatingModal />
      <FilterModal />
      
      {/* Chatbot */}
      <ChatBot />
    </div>
  );
};

export default ProductPage;
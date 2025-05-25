import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Loader2, ChevronLeft, Camera, Image as ImageIcon } from "lucide-react";

const FLASK_API_URL = "http://localhost:5000/api/chat";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: "bot", timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  const handleSendMessage = async () => {
    if (inputValue.trim() === "" && !imagePreview) return;
    
    let userMessage;
    let userMessageId = Date.now();
    
    if (imagePreview) {
      // Add user image message
      userMessage = {
        id: userMessageId,
        type: "image",
        image: imagePreview,
        sender: "user",
        timestamp: new Date()
      };
    } else {
      // Add user text message
      userMessage = {
        id: userMessageId,
        type: "text",
        text: inputValue,
        sender: "user",
        timestamp: new Date()
      };
    }
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setImagePreview(null);
    setIsTyping(true);
    
    try {
      let response;
      
      if (userMessage.type === "image") {
        setIsUploading(true);
        response = await fetch(FLASK_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "image",
            image: userMessage.image
          }),
        });
      } else {
        response = await fetch(FLASK_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "text",
            message: userMessage.text
          }),
        });
      }
      
      setIsUploading(false);
      
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      
      const data = await response.json();
      
      // Add bot response message
      setMessages(prev => [
        ...prev,
        { 
          id: userMessageId + 1, 
          text: data.response, 
          sender: "bot", 
          timestamp: new Date(),
          productInfo: data.product_info || null // Will be present for image responses
        }
      ]);
      
    } catch (error) {
      console.error("Error:", error);
      // Add error message
      setMessages(prev => [
        ...prev,
        { 
          id: userMessageId + 1, 
          text: "Sorry, I'm having trouble processing your request. Please try again later.", 
          sender: "bot", 
          timestamp: new Date() 
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      alert("Please select an image file");
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Please select an image less than 5MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    e.target.value = null;
  };
  
  // Quick reply buttons
  const quickReplies = [
    { id: 1, text: "Products" },
    { id: 2, text: "Shipping" },
    { id: 3, text: "Returns" },
    { id: 4, text: "Payment" },
    { id: 5, text: "Contact" }
  ];
  
  const handleQuickReply = (text) => {
    setInputValue(text);
    // Add a slight delay to allow for state update
    setTimeout(() => {
      handleSendMessage();
    }, 10);
  };
  
  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const clearImagePreview = () => {
    setImagePreview(null);
  };
  
  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg flex items-center justify-center z-30 hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open chat"
      >
        <MessageSquare size={24} />
      </motion.button>
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden z-40 flex flex-col"
          >
            {/* Chat Header */}
            <div className="bg-black dark:bg-white text-white dark:text-black py-4 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChevronLeft 
                  size={20} 
                  className="cursor-pointer" 
                  onClick={() => setIsOpen(false)} 
                />
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageSquare size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">Krushi Assistant</h3>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-xs opacity-80">Online</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-1"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex mb-4 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-black text-white dark:bg-white dark:text-black rounded-br-none"
                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-bl-none"
                    }`}
                  >
                    {message.type === "image" ? (
                      <div className="relative">
                        <img 
                          src={message.image} 
                          alt="User uploaded" 
                          className="w-full h-auto rounded-lg max-h-48 object-contain bg-gray-100 dark:bg-gray-800" 
                        />
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
                          Photo
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm">{message.text}</p>
                    )}
                    
                    {/* If this is a bot message with product info, we can show additional info */}
                    {message.productInfo && (
                      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                        <div className="font-medium">{message.productInfo.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{message.productInfo.price}</div>
                      </div>
                    )}
                    
                    <span className="text-xs opacity-70 mt-1 block text-right">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="max-w-[75%] p-3 rounded-2xl bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-bl-none">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse"></span>
                      <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse delay-75"></span>
                      <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse delay-150"></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="p-3 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-32 object-contain rounded-lg" 
                  />
                  <button 
                    onClick={clearImagePreview}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
            
            {/* Quick Replies - only show when not uploading image */}
            {!imagePreview && (
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                  <div className="flex gap-2 py-2 min-w-max">
                    {quickReplies.map((reply) => (
                      <button
                        key={reply.id}
                        onClick={() => handleQuickReply(reply.text)}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {reply.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {/* Chat Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Camera size={18} />
                </button>
                
                <input
                  type="text"
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={isUploading}
                  className="flex-1 py-2 px-3 bg-gray-100 dark:bg-gray-800 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-gray-900 dark:text-white disabled:opacity-60"
                />
                
                <button
                  onClick={handleSendMessage}
                  disabled={(inputValue.trim() === "" && !imagePreview) || isUploading}
                  className={`p-2 rounded-full ${
                    (inputValue.trim() === "" && !imagePreview) || isUploading
                      ? "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                  } transition-colors`}
                >
                  {isTyping || isUploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
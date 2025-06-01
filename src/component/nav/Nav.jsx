import React, { useState } from 'react'
import { Users, LogOut, X, Home, Search, Folder } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const navigate=useNavigate();

  const logout=async () => {
    try {
      const res=await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/logout`,{},{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      localStorage.removeItem("token");
      console.log("logout successfull");
    } catch (error) {
    console.error("Error during logout:", error.message);
    }
  }

  const menuVariants = {
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    }
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  

  return (
    <header className="bg-white shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <h1 className="text-xl font-bold text-blue-600">devLab</h1>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 cursor-pointer">
              <Home size={16} />
              Home
            </Link>
            <Link to="/followers" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 cursor-pointer">
              <Users size={16} />
              Followers
            </Link>
            <Link to="/followings" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 cursor-pointer">
              <Users size={16} />
              Following
            </Link>
            <Link to="/coders" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 cursor-pointer">
              <Users size={16} />
             All Coders
            </Link>
            <Link to="/projects" className="flex items-center gap-1 text-gray-600 hover:text-blue-600 cursor-pointer">
              <Folder size={16} />
              All Projects
            </Link>
            
            
            <button onClick={logout} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 cursor-pointer">
              <LogOut size={16} />
              Logout
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden text-gray-600 hover:text-blue-600 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={toggleMenu}
            />
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="md:hidden fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl z-50"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-blue-600">Menu</h2>
                  <button 
                    onClick={toggleMenu}
                    className="text-gray-600 cursor-pointer hover:text-blue-600"
                  >
                    <X size={24} />
                  </button>
                </div>
                <nav className="flex flex-col gap-4">
                  <motion.button 
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer"
                  >
                    <Users size={20} />
                    Followers
                  </motion.button>
                  <motion.button 
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer"
                  >
                    <Users size={20} />
                    Following
                  </motion.button>
                  <motion.button 
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer"
                  >
                    <Users size={20} />
                    Find Coders
                  </motion.button>
                  <div className="relative">
                    <motion.button 
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer"
                    >
                      <Search size={20} />
                      Find Projects
                    </motion.button>
                  </div>
                  <motion.button 
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-2 text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    <LogOut size={20} />
                    Logout
                  </motion.button>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    
    </header>
  )
}

export default Nav
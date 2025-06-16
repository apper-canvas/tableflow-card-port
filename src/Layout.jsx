import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { routeArray } from '@/config/routes';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const currentRoute = routeArray.find(route => route.path === location.pathname) || routeArray[0];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-white border-b border-gray-200 z-40">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ApperIcon name="Utensils" className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-heading font-bold text-secondary">TableFlow</h1>
            </div>
            <div className="hidden md:block w-px h-6 bg-gray-300" />
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">Live Sync Active</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="hidden md:flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-primary transition-colors">
              <ApperIcon name="Bell" className="w-5 h-5" />
              <span className="text-sm">3 New</span>
            </button>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary transition-colors"
            >
              <ApperIcon name={isMobileMenuOpen ? "X" : "Menu"} className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-shrink-0 h-14 bg-white border-b border-gray-200">
        <nav className="flex items-center px-4 space-x-1">
          {routeArray.map((route) => (
            <NavLink
              key={route.id}
              to={route.path}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`
              }
            >
              <ApperIcon name={route.icon} className="w-4 h-4" />
              <span>{route.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="md:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Menu */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isMobileMenuOpen ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="md:hidden fixed top-16 left-0 w-64 h-full bg-white border-r border-gray-200 z-50"
      >
        <nav className="p-4 space-y-2">
          {routeArray.map((route) => (
            <NavLink
              key={route.id}
              to={route.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`
              }
            >
              <ApperIcon name={route.icon} className="w-5 h-5" />
              <span>{route.label}</span>
            </NavLink>
          ))}
        </nav>
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden flex-shrink-0 bg-white border-t border-gray-200">
        <nav className="flex">
          {routeArray.map((route) => (
            <NavLink
              key={route.id}
              to={route.path}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 px-1 text-xs transition-all duration-200 ${
                  isActive
                    ? 'text-primary'
                    : 'text-gray-500 hover:text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <ApperIcon 
                    name={route.icon} 
                    className={`w-5 h-5 mb-1 ${isActive ? 'text-primary' : 'text-gray-500'}`} 
                  />
                  <span className={isActive ? 'text-primary font-medium' : 'text-gray-500'}>
                    {route.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
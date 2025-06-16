import React from 'react';
import { motion } from 'framer-motion';

const FilterTabs = ({ tabs, activeTab, onTabChange, className = '' }) => {
  return (
    <div className={`flex bg-gray-100 rounded-lg p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTab === tab.id
              ? 'text-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTabBackground"
              className="absolute inset-0 bg-white rounded-md shadow-sm"
              initial={false}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
            />
          )}
          <span className="relative z-10 flex items-center justify-center">
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.id 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
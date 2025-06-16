import React, { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Input = ({ 
  label, 
  type = 'text', 
  error, 
  icon, 
  className = '', 
  required = false,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(e.target.value.length > 0);
  };

  const inputClasses = `
    w-full px-3 py-2 border rounded-lg transition-all duration-200
    ${icon ? 'pl-10' : ''}
    ${error 
      ? 'border-error focus:border-error focus:ring-error' 
      : 'border-gray-300 focus:border-primary focus:ring-primary'
    }
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    ${className}
  `.trim();

  const labelClasses = `
    absolute left-3 transition-all duration-200 pointer-events-none
    ${icon ? 'left-10' : 'left-3'}
    ${isFocused || hasValue || props.value
      ? 'top-0 text-xs bg-white px-1 text-primary -translate-y-1/2'
      : 'top-1/2 text-gray-500 -translate-y-1/2'
    }
  `.trim();

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <ApperIcon name={icon} className="w-4 h-4" />
        </div>
      )}
      
      <input
        type={type}
        className={inputClasses}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-error flex items-center">
          <ApperIcon name="AlertCircle" className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
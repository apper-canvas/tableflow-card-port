import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';

const OrderCard = ({ order, onSelect, className = '' }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'preparing': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'Clock';
      case 'preparing': return 'ChefHat';
      case 'completed': return 'CheckCircle';
      case 'cancelled': return 'XCircle';
      default: return 'Circle';
    }
  };

  const formatOrderTime = (dateString) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const getItemsSummary = (items) => {
    if (items.length <= 2) {
      return items.map(item => `${item.quantity}x ${item.name}`).join(', ');
    }
    return `${items[0].name}, ${items[1].name} +${items.length - 2} more`;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(order)}
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200 ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-900">{order.orderNumber}</span>
          <Badge variant={getStatusColor(order.status)} size="sm">
            <ApperIcon name={getStatusIcon(order.status)} className="w-3 h-3 mr-1" />
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
        <span className="text-sm text-gray-500">{formatOrderTime(order.createdAt)}</span>
      </div>

      <div className="flex items-center space-x-2 mb-3">
        <ApperIcon name="MapPin" className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">Table {order.tableNumber}</span>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-600 line-clamp-2">
          {getItemsSummary(order.items)}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <ApperIcon name="ShoppingBag" className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{order.items.length} items</span>
        </div>
        <span className="font-semibold text-primary">${order.totalAmount.toFixed(2)}</span>
      </div>

      {order.status === 'pending' && (
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-2 left-2 w-2 h-2 bg-warning rounded-full"
        />
      )}
    </motion.div>
  );
};

export default OrderCard;
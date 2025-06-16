import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { orderService } from '@/services';

const OrderModal = ({ order, isOpen, onClose, onOrderUpdate }) => {
  const [status, setStatus] = useState(order?.status || 'pending');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);
  const [bill, setBill] = useState(null);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'preparing', label: 'Preparing', color: 'info' },
    { value: 'completed', label: 'Completed', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' }
  ];

  const handleStatusUpdate = async () => {
    if (!order || status === order.status) return;

    setIsUpdating(true);
    try {
      const updatedOrder = await orderService.update(order.id, { status });
      onOrderUpdate(updatedOrder);
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update order status');
      setStatus(order.status);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGenerateBill = async () => {
    if (!order) return;

    setIsGeneratingBill(true);
    try {
      const generatedBill = await orderService.generateBill(order.id);
      setBill(generatedBill);
      toast.success('Bill generated successfully');
    } catch (error) {
      toast.error('Failed to generate bill');
    } finally {
      setIsGeneratingBill(false);
    }
  };

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  if (!order) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{order.orderNumber}</h2>
                  <p className="text-sm text-gray-600">Table {order.tableNumber}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>

              {/* Order Details */}
              <div className="p-6 space-y-6">
                {/* Status and Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant={status} size="lg">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Ordered: {formatDateTime(order.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Status Update */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Update Status</h3>
                  <div className="flex items-center space-x-3">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={handleStatusUpdate}
                      loading={isUpdating}
                      disabled={status === order.status}
                    >
                      Update
                    </Button>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center space-x-3">
                          <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <span className="text-gray-900">{item.name}</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Total Amount</span>
                    <span className="text-xl font-bold text-primary">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Bill Section */}
                {bill ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Generated Bill</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${bill.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (10%):</span>
                        <span>${bill.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium text-base border-t pt-2">
                        <span>Total:</span>
                        <span>${bill.total.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Generated on: {formatDateTime(bill.generatedAt)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleGenerateBill}
                    loading={isGeneratingBill}
                    variant="outline"
                    icon="FileText"
                    className="w-full"
                  >
                    Generate Bill
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OrderModal;
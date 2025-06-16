import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { orderService, menuItemService } from '@/services';

const OrderModal = ({ order, isOpen, onClose, onOrderUpdate, isCreateMode = false }) => {
  const [status, setStatus] = useState(order?.status || 'pending');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);
  const [bill, setBill] = useState(null);
  
  // Create mode state
  const [tableNumber, setTableNumber] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'preparing', label: 'Preparing', color: 'info' },
    { value: 'completed', label: 'Completed', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' }
];

  // Load menu items when in create mode
  React.useEffect(() => {
    if (isCreateMode && isOpen) {
      loadMenuItems();
      // Reset form when opening in create mode
      setTableNumber('');
      setSelectedItems([]);
      setBill(null);
    } else if (order && !isCreateMode) {
      setStatus(order.status || 'pending');
    }
  }, [isCreateMode, isOpen, order]);

  const loadMenuItems = async () => {
    setIsLoadingMenu(true);
    try {
      const items = await menuItemService.getAll();
      const availableItems = items.filter(item => item.available);
      setMenuItems(availableItems);
    } catch (error) {
      toast.error('Failed to load menu items');
    } finally {
      setIsLoadingMenu(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!order || status === order.status) return;

    setIsUpdating(true);
    try {
      const updatedOrder = await orderService.update(order.Id, { status });
      onOrderUpdate(updatedOrder);
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update order status');
      setStatus(order.status);
    } finally {
      setIsUpdating(false);
    }
  };

const handleCreateOrder = async () => {
    if (!tableNumber || selectedItems.length === 0) {
      toast.error('Please fill in table number and select at least one item');
      return;
    }

    setIsCreating(true);
    try {
      const orderData = {
        table_number: parseInt(tableNumber),
        items: JSON.stringify(selectedItems),
        status: 'pending',
        total_amount: calculateTotal(),
        Name: `Table ${tableNumber} Order`
      };

      const newOrder = await orderService.create(orderData);
      onOrderUpdate(newOrder);
      toast.success('Order created successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to create order');
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateBill = async () => {
    if (!order) return;

    setIsGeneratingBill(true);
    try {
      const generatedBill = await orderService.generateBill(order.Id);
      setBill(generatedBill);
      toast.success('Bill generated successfully');
    } catch (error) {
      toast.error('Failed to generate bill');
    } finally {
      setIsGeneratingBill(false);
    }
  };

  const addMenuItem = (menuItem) => {
    const existingItem = selectedItems.find(item => item.id === menuItem.Id);
    if (existingItem) {
      setSelectedItems(prev => prev.map(item => 
        item.id === menuItem.Id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSelectedItems(prev => [...prev, {
        id: menuItem.Id,
        name: menuItem.Name,
        price: menuItem.price,
        quantity: 1
      }]);
    }
  };

  const updateItemQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      setSelectedItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setSelectedItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
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
                  <h2 className="text-xl font-bold text-gray-900">
                    {isCreateMode ? 'Create New Order' : order?.order_number || 'Order Details'}
                  </h2>
                  {!isCreateMode && order && (
                    <p className="text-sm text-gray-600">Table {order.table_number}</p>
                  )}
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
                {isCreateMode ? (
                  <>
                    {/* Create Order Form */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Table Number
                        </label>
                        <input
                          type="number"
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          placeholder="Enter table number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        />
                      </div>

                      {/* Menu Items Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Menu Items
                        </label>
                        {isLoadingMenu ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">Loading menu items...</p>
                          </div>
                        ) : (
                          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                            {menuItems.map((item) => (
                              <div key={item.Id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{item.Name}</h4>
                                  <p className="text-sm text-gray-600">{item.category}</p>
                                  <p className="text-sm font-medium text-primary">${item.price?.toFixed(2)}</p>
                                </div>
                                <Button
                                  onClick={() => addMenuItem(item)}
                                  size="sm"
                                  variant="outline"
                                >
                                  Add
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Selected Items */}
                      {selectedItems.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selected Items
                          </label>
                          <div className="space-y-2 border border-gray-200 rounded-lg p-3">
                            {selectedItems.map((item) => (
                              <div key={item.id} className="flex items-center justify-between">
                                <span className="text-gray-900">{item.name}</span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                    className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center">{item.quantity}</span>
                                  <button
                                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                    className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
                                  >
                                    +
                                  </button>
                                  <span className="font-medium text-gray-900 ml-2">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Total */}
                      {selectedItems.length > 0 && (
                        <div className="bg-primary/5 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">Total Amount</span>
                            <span className="text-xl font-bold text-primary">
                              ${calculateTotal().toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Create Button */}
                      <Button
                        onClick={handleCreateOrder}
                        loading={isCreating}
                        disabled={!tableNumber || selectedItems.length === 0}
                        className="w-full"
                      >
                        Create Order
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* View/Edit Mode - Existing Order Details */}
                    {/* Status and Time */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant={status} size="lg">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Ordered: {formatDateTime(order.CreatedOn)}
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
                        {(typeof order.items === 'string' ? JSON.parse(order.items) : order.items || []).map((item, index) => (
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
                          ${order.total_amount?.toFixed(2)}
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
                  </>
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
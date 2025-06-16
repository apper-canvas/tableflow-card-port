import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import { inventoryService } from '@/services';

const InventoryModal = ({ item, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: '',
    lowStockThreshold: 0
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditMode = !!item;

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          name: item.name || '',
          quantity: item.quantity || 0,
          unit: item.unit || '',
          lowStockThreshold: item.lowStockThreshold || 0
        });
      } else {
        setFormData({
          name: '',
          quantity: 0,
          unit: '',
          lowStockThreshold: 0
        });
      }
      setErrors({});
    }
  }, [isOpen, item]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }
    
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }
    
    if (formData.lowStockThreshold < 0) {
      newErrors.lowStockThreshold = 'Low stock threshold cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let savedItem;
      if (isEditMode) {
        savedItem = await inventoryService.update(item.id, formData);
        toast.success('Item updated successfully');
      } else {
        savedItem = await inventoryService.create(formData);
        toast.success('Item added successfully');
      }
      
      onSave(savedItem);
      onClose();
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update item' : 'Failed to add item');
      console.error('Error saving item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    const value = field === 'quantity' || field === 'lowStockThreshold' 
      ? parseInt(e.target.value) || 0 
      : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Item Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                error={errors.name}
                icon="Package"
                placeholder="Enter item name"
                required
                disabled={loading}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Current Stock"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange('quantity')}
                  error={errors.quantity}
                  icon="Hash"
                  placeholder="0"
                  min="0"
                  required
                  disabled={loading}
                />

                <Input
                  label="Unit"
                  value={formData.unit}
                  onChange={handleInputChange('unit')}
                  error={errors.unit}
                  placeholder="kg, pcs, liters"
                  required
                  disabled={loading}
                />
              </div>

              <Input
                label="Low Stock Threshold"
                type="number"
                value={formData.lowStockThreshold}
                onChange={handleInputChange('lowStockThreshold')}
                error={errors.lowStockThreshold}
                icon="AlertTriangle"
                placeholder="Minimum stock level"
                min="0"
                required
                disabled={loading}
              />

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  icon={isEditMode ? "Save" : "Plus"}
                >
                  {isEditMode ? 'Update Item' : 'Add Item'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InventoryModal;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import EmptyState from '@/components/organisms/EmptyState';
import ErrorState from '@/components/organisms/ErrorState';
import ApperIcon from '@/components/ApperIcon';
import { menuItemService } from '@/services';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ['all', 'Appetizers', 'Main Course', 'Pizza', 'Salads', 'Beverages'];

  useEffect(() => {
    loadMenuItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [menuItems, selectedCategory, searchTerm]);

  const loadMenuItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await menuItemService.getAll();
      setMenuItems(items);
    } catch (err) {
      setError(err.message || 'Failed to load menu items');
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...menuItems];

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by category and name
    filtered.sort((a, b) => {
      if (a.category === b.category) {
        return a.name.localeCompare(b.name);
      }
      return a.category.localeCompare(b.category);
    });

    setFilteredItems(filtered);
  };

  const toggleAvailability = async (itemId, currentAvailability) => {
    try {
      const updatedItem = await menuItemService.update(itemId, { 
        available: !currentAvailability 
      });
      setMenuItems(prev => prev.map(item => 
        item.id === itemId ? updatedItem : item
      ));
      toast.success(`Item ${updatedItem.available ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error('Failed to update item availability');
    }
};

  const handleAddMenuItem = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleMenuItemCreated = (newItem) => {
    setMenuItems(prev => [...prev, newItem]);
    setIsModalOpen(false);
    toast.success('Menu item added successfully');
  };

  const getCategoryCount = (category) => {
    if (category === 'all') return menuItems.length;
    return menuItems.filter(item => item.category === category).length;
  };

  if (error) {
    return <ErrorState message={error} onRetry={loadMenuItems} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-1">Manage menu items, prices, and availability</p>
        </div>
<Button icon="Plus" variant="primary" onClick={handleAddMenuItem}>
          Add Menu Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Items' : category}
              <span className="ml-2 text-xs opacity-75">
                ({getCategoryCount(category)})
              </span>
            </button>
          ))}
        </div>
        
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Search menu items..."
          className="w-full lg:w-80"
        />
      </div>

      {/* Menu Items */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon="ChefHat"
            title={searchTerm ? "No items found" : "No menu items"}
            description={
              searchTerm 
                ? "Try adjusting your search terms"
                : "Add your first menu item to get started"
            }
            actionLabel={!searchTerm ? "Add Menu Item" : undefined}
          />
        ) : (
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
          >
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.01, y: -2 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <Badge variant={item.category === 'Main Course' ? 'primary' : 'default'} size="sm">
                        {item.category}
                      </Badge>
                      <Badge 
                        variant={item.available ? 'success' : 'error'} 
                        size="sm"
                      >
                        {item.available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-xl font-bold text-primary">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleAvailability(item.id, item.available)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            item.available
                              ? 'text-success hover:bg-success/10'
                              : 'text-error hover:bg-error/10'
                          }`}
                          title={item.available ? 'Disable item' : 'Enable item'}
                        >
                          <ApperIcon 
                            name={item.available ? 'Eye' : 'EyeOff'} 
                            className="w-4 h-4" 
                          />
                        </button>
                        
                        <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200">
                          <ApperIcon name="Edit2" className="w-4 h-4" />
                        </button>
                        
                        <button className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-all duration-200">
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
</div>

      {/* Add Menu Item Modal */}
      <MenuItemModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onItemCreated={handleMenuItemCreated}
        categories={categories.filter(cat => cat !== 'all')}
      />
    </div>
  );
};

// Menu Item Modal Component
const MenuItemModal = ({ isOpen, onClose, onItemCreated, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Appetizers',
    price: '',
    available: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const newItem = await menuItemService.create({
        ...formData,
        price: parseFloat(formData.price)
      });
      onItemCreated(newItem);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'Appetizers',
        price: '',
        available: true
      });
      setErrors({});
    } catch (error) {
      toast.error('Failed to create menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Appetizers',
      price: '',
      available: true
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add Menu Item</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="X" className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <input
              type="text"
              placeholder="Item Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                errors.name ? 'border-error focus:border-error' : 'border-gray-300 focus:border-primary'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-error flex items-center">
                <ApperIcon name="AlertCircle" className="w-4 h-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ${
                errors.description ? 'border-error focus:border-error' : 'border-gray-300 focus:border-primary'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error flex items-center">
                <ApperIcon name="AlertCircle" className="w-4 h-4 mr-1" />
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                errors.price ? 'border-error focus:border-error' : 'border-gray-300 focus:border-primary'
              }`}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-error flex items-center">
                <ApperIcon name="AlertCircle" className="w-4 h-4 mr-1" />
                {errors.price}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => handleInputChange('available', e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="available" className="text-sm text-gray-700">
              Available for ordering
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              icon="Plus"
            >
              Add Item
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Menu;
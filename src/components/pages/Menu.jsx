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
        <Button icon="Plus" variant="primary">
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
    </div>
  );
};

export default Menu;
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";
import EmptyState from "@/components/organisms/EmptyState";
import ErrorState from "@/components/organisms/ErrorState";
import InventoryModal from "@/components/organisms/InventoryModal";
import ApperIcon from "@/components/ApperIcon";
import { inventoryService } from "@/services";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'low-stock', 'in-stock'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const filters = [
    { id: 'all', label: 'All Items' },
    { id: 'low-stock', label: 'Low Stock' },
    { id: 'in-stock', label: 'In Stock' }
  ];

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inventory, filterType, searchTerm]);

  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const inventoryData = await inventoryService.getAll();
      setInventory(inventoryData);
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...inventory];

    // Apply stock filter
    if (filterType === 'low-stock') {
      filtered = filtered.filter(item => item.quantity <= item.lowStockThreshold);
    } else if (filterType === 'in-stock') {
      filtered = filtered.filter(item => item.quantity > item.lowStockThreshold);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.unit.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredInventory(filtered);
  };

  const getStockStatus = (item) => {
    if (item.quantity <= item.lowStockThreshold) {
      return { status: 'low', color: 'error', label: 'Low Stock' };
    } else if (item.quantity <= item.lowStockThreshold * 1.5) {
      return { status: 'medium', color: 'warning', label: 'Medium Stock' };
    } else {
      return { status: 'good', color: 'success', label: 'In Stock' };
    }
  };

  const getStockIcon = (status) => {
    switch (status) {
      case 'low': return 'AlertTriangle';
      case 'medium': return 'AlertCircle';
      case 'good': return 'CheckCircle';
      default: return 'Package';
    }
  };

  const getFilterCount = (filterId) => {
    switch (filterId) {
      case 'all':
        return inventory.length;
      case 'low-stock':
        return inventory.filter(item => item.quantity <= item.lowStockThreshold).length;
      case 'in-stock':
        return inventory.filter(item => item.quantity > item.lowStockThreshold).length;
      default:
        return 0;
    }
};

  const handleAddItem = () => {
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleSaveItem = (savedItem) => {
    if (selectedItem) {
      // Update existing item
      setInventory(prev => prev.map(item => 
        item.id === savedItem.id ? savedItem : item
      ));
    } else {
      // Add new item
      setInventory(prev => [...prev, savedItem]);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 0) return;
    
    try {
      const updatedItem = await inventoryService.update(itemId, { 
        quantity: newQuantity 
      });
      setInventory(prev => prev.map(item => 
        item.id === itemId ? updatedItem : item
      ));
      toast.success('Quantity updated successfully');
    } catch (err) {
      toast.error('Failed to update quantity');
    }
  };
  const formatLastUpdated = (dateString) => {
    return format(new Date(dateString), 'MMM dd, HH:mm');
  };

  if (error) {
    return <ErrorState message={error} onRetry={loadInventory} />;
  }

return (
    <div className="space-y-6">
        {/* Header */}
        <div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold font-heading text-gray-900">Inventory</h1>
                <p className="text-gray-600 mt-1">Track stock levels and manage inventory items</p>
            </div>
            <Button icon="Plus" variant="primary" onClick={handleAddItem}>Add Item
                        </Button>
        </div>
        {/* Filters */}
        <div
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
                {filters.map(filter => <button
                    key={filter.id}
                    onClick={() => setFilterType(filter.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filterType === filter.id ? "bg-primary text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {filter.label}
                    <span className="ml-2 text-xs opacity-75">({getFilterCount(filter.id)})
                                      </span>
                </button>)}
            </div>
            <SearchBar
                onSearch={setSearchTerm}
                placeholder="Search inventory items..."
                className="w-full lg:w-80" />
        </div>
        {/* Inventory Table */}
        <div className="min-h-[400px]">
            {loading ? <div
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 space-y-4">
                    {Array.from({
                        length: 8
                    }).map((_, index) => <div
                        key={index}
                        className="animate-pulse flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                <div className="h-3 bg-gray-200 rounded w-16"></div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                            <div className="h-8 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>)}
                </div>
            </div> : filteredInventory.length === 0 ? <EmptyState
                icon="Package"
                title={searchTerm ? "No items found" : "No inventory items"}
                description={searchTerm ? "Try adjusting your search terms" : "Add your first inventory item to get started"}
                actionLabel={!searchTerm ? "Add Item" : undefined}
                onAction={!searchTerm ? handleAddItem : undefined} /> : <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: {
                        opacity: 0
                    },

                    visible: {
                        opacity: 1,

                        transition: {
                            staggerChildren: 0.03
                        }
                    }
                }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div
                        className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm font-medium text-gray-600">
                        <div className="md:col-span-2">Item</div>
                        <div>Current Stock</div>
                        <div>Status</div>
                        <div>Actions</div>
                    </div>
                </div>
                {/* Table Body */}
                <div className="divide-y divide-gray-100">
                    {filteredInventory.map(item => {
                        const stockInfo = getStockStatus(item);

                        return (
                            <motion.div
                                key={item.id}
                                variants={{
                                    hidden: {
                                        opacity: 0,
                                        y: 20
                                    },

                                    visible: {
                                        opacity: 1,
                                        y: 0
                                    }
                                }}
                                className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                    {/* Item Info */}
                                    <div className="md:col-span-2 flex items-center space-x-3">
                                        <div
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${stockInfo.status === "low" ? "bg-error/10" : stockInfo.status === "medium" ? "bg-warning/10" : "bg-success/10"}`}>
                                            <ApperIcon
                                                name={getStockIcon(stockInfo.status)}
                                                className={`w-5 h-5 ${stockInfo.status === "low" ? "text-error" : stockInfo.status === "medium" ? "text-warning" : "text-success"}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                                            <p className="text-sm text-gray-500">Updated: {formatLastUpdated(item.lastUpdated)}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Current Stock */}
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg font-semibold text-gray-900">
                                                {item.quantity}
                                            </span>
                                            <span className="text-sm text-gray-500">{item.unit}</span>
                                        </div>
                                        <p className="text-xs text-gray-400">Min: {item.lowStockThreshold} {item.unit}
                                        </p>
                                    </div>
                                    {/* Status */}
                                    <div>
                                        <Badge variant={stockInfo.color} size="sm">
                                            <ApperIcon name={getStockIcon(stockInfo.status)} className="w-3 h-3 mr-1" />
                                            {stockInfo.label}
                                        </Badge>
                                    </div>
                                    {/* Actions */}
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                                                disabled={item.quantity <= 0}>
                                                <ApperIcon name="Minus" className="w-4 h-4" />
                                            </button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={e => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                                className="w-16 px-2 py-1 text-center text-sm border-0 focus:outline-none"
                                                min="0" />
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                                                <ApperIcon name="Plus" className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleEditItem(item)}
                                            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200">
                                            <ApperIcon name="Edit2" className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>}
        </div>
        {/* Inventory Modal */}
        <InventoryModal
            item={selectedItem}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSaveItem} />
    </div>
  );
export default Inventory;
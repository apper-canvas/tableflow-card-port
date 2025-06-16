import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import FilterTabs from "@/components/molecules/FilterTabs";
import SearchBar from "@/components/molecules/SearchBar";
import OrderCard from "@/components/organisms/OrderCard";
import OrderModal from "@/components/organisms/OrderModal";
import SkeletonCard from "@/components/molecules/SkeletonCard";
import EmptyState from "@/components/organisms/EmptyState";
import ErrorState from "@/components/organisms/ErrorState";
import ApperIcon from "@/components/ApperIcon";
import { orderService } from "@/services";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
const [activeFilter, setActiveFilter] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterTabs = [
    { id: 'today', label: 'Today', count: 0 },
    { id: 'pending', label: 'Pending', count: 0 },
    { id: 'preparing', label: 'Preparing', count: 0 },
    { id: 'completed', label: 'Completed', count: 0 }
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, activeFilter, searchTerm]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const ordersData = await orderService.getAll();
      setOrders(ordersData);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Apply status/date filter
    if (activeFilter === 'today') {
const today = new Date().toDateString();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.CreatedOn || order.createdAt).toDateString();
        return orderDate === today;
      });
    } else {
      filtered = filtered.filter(order => order.status === activeFilter);
    }

    // Apply search filter
if (searchTerm) {
      filtered = filtered.filter(order => {
        const orderNumber = order.order_number || order.orderNumber || '';
        const tableNumber = (order.table_number || order.tableNumber || '').toString();
        const items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []);
        
        return orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
               tableNumber.includes(searchTerm) ||
               items.some(item => 
                 (item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
               );
      });
    }
// Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.CreatedOn || b.createdAt) - new Date(a.CreatedOn || a.createdAt));

    setFilteredOrders(filtered);
  };

  const getFilterCounts = () => {
    const today = new Date().toDateString();
    return {
today: orders.filter(order => {
        const orderDate = new Date(order.CreatedOn || order.createdAt).toDateString();
        return orderDate === today;
      }).length,
      pending: orders.filter(order => order.status === 'pending').length,
      preparing: orders.filter(order => order.status === 'preparing').length,
      completed: orders.filter(order => order.status === 'completed').length
    };
  };

const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setIsCreateMode(false);
    setIsModalOpen(true);
  };

  const handleCreateOrder = () => {
    setSelectedOrder(null);
    setIsCreateMode(true);
    setIsModalOpen(true);
  };

  const handleOrderUpdate = (updatedOrder) => {
    if (isCreateMode) {
      // Add new order to the list
      setOrders(prev => [updatedOrder, ...prev]);
      toast.success('Order created successfully');
    } else {
      // Update existing order
      setOrders(prev => prev.map(order => 
        order.Id === updatedOrder.Id ? updatedOrder : order
      ));
      setSelectedOrder(updatedOrder);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setIsCreateMode(false);
  };

  if (error) {
    return <ErrorState message={error} onRetry={loadOrders} />;
  }

  const counts = getFilterCounts();
  const tabsWithCounts = filterTabs.map(tab => ({
    ...tab,
    count: counts[tab.id] || 0
  }));

  return (
    <div className="space-y-6">
    {/* Header */}
    <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900">Orders</h1>
            <p className="text-gray-600 mt-1">Manage all restaurant orders and track their status</p>
</div>
        <div className="flex items-center space-x-4">
            <button
                onClick={handleCreateOrder}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 font-medium"
            >
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                New Order
            </button>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span>Live updates</span>
            </div>
        </div>
    </div>
    {/* Filters and Search */}
    <div
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <FilterTabs
            tabs={tabsWithCounts}
            activeTab={activeFilter}
            onTabChange={setActiveFilter}
            className="flex-1 lg:flex-none lg:w-auto" />
        <SearchBar
            onSearch={setSearchTerm}
            placeholder="Search orders, table, or items..."
            className="w-full lg:w-80" />
    </div>
    {/* Orders Grid */}
    <div className="min-h-[400px]">
        {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({
                length: 6
            }).map((_, index) => <SkeletonCard key={index} />)}
        </div> : filteredOrders.length === 0 ? <EmptyState
            icon="ClipboardList"
            title={searchTerm ? "No orders found" : `No ${activeFilter} orders`}
            description={searchTerm ? "Try adjusting your search terms" : `No orders match the ${activeFilter} filter`} /> : <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {
                    opacity: 0
                },

                visible: {
                    opacity: 1,

                    transition: {
                        staggerChildren: 0.1
                    }
                }
            }}>
            {filteredOrders.map(order => <motion.div
                key={order.id}
                variants={{
                    hidden: {
                        opacity: 0,
                        y: 20
                    },

                    visible: {
                        opacity: 1,
                        y: 0
                    }
                }}>
                <OrderCard order={order} onSelect={handleOrderSelect} />
            </motion.div>)}
        </motion.div>}
    </div>
{/* Order Details Modal */}
    <OrderModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onOrderUpdate={handleOrderUpdate}
        isCreateMode={isCreateMode} />
</div>
  );
};

export default Orders;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import MetricCard from '@/components/molecules/MetricCard';
import SkeletonCard from '@/components/molecules/SkeletonCard';
import EmptyState from '@/components/organisms/EmptyState';
import ErrorState from '@/components/organisms/ErrorState';
import ApperIcon from '@/components/ApperIcon';
import { orderService, reservationService, inventoryService } from '@/services';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    todaysRevenue: 0,
    activeOrders: 0,
    upcomingReservations: 0,
    lowStockItems: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [orders, reservations, inventory] = await Promise.all([
        orderService.getAll(),
        reservationService.getTodaysReservations(),
        inventoryService.getLowStockItems()
      ]);

      // Calculate metrics
      const todaysOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt).toDateString();
        const today = new Date().toDateString();
        return orderDate === today;
      });

      const todaysRevenue = todaysOrders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.totalAmount, 0);

      const activeOrders = orders.filter(order => 
        order.status === 'pending' || order.status === 'preparing'
      ).length;

      setMetrics({
        todaysRevenue,
        activeOrders,
        upcomingReservations: reservations.length,
        lowStockItems: inventory.length
      });

      // Set recent orders (last 5)
      const sortedOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentOrders(sortedOrders);

      // Set upcoming reservations
      setUpcomingReservations(reservations.slice(0, 5));

    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-warning';
      case 'preparing': return 'text-info';
      case 'completed': return 'text-success';
      case 'cancelled': return 'text-error';
      default: return 'text-gray-500';
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboardData} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ApperIcon name="Calendar" className="w-4 h-4" />
          <span>{format(new Date(), 'EEEE, MMMM dd, yyyy')}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
        ) : (
          <>
            <MetricCard
              title="Today's Revenue"
              value={`$${metrics.todaysRevenue.toFixed(2)}`}
              icon="DollarSign"
              color="success"
              trend="up"
              trendValue="+12.5%"
            />
            <MetricCard
              title="Active Orders"
              value={metrics.activeOrders}
              icon="ClipboardList"
              color="primary"
              trend="neutral"
              trendValue="3 pending"
            />
            <MetricCard
              title="Today's Reservations"
              value={metrics.upcomingReservations}
              icon="Calendar"
              color="info"
              trend="up"
              trendValue="+2 from yesterday"
            />
            <MetricCard
              title="Low Stock Alerts"
              value={metrics.lowStockItems}
              icon="AlertTriangle"
              color={metrics.lowStockItems > 0 ? "warning" : "success"}
              trend={metrics.lowStockItems > 0 ? "up" : "neutral"}
              trendValue={metrics.lowStockItems > 0 ? "Needs attention" : "All good"}
            />
          </>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <ApperIcon name="Clock" className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <EmptyState
                icon="ClipboardList"
                title="No recent orders"
                description="Orders will appear here as they come in"
              />
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <ApperIcon name="ShoppingBag" className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">Table {order.tableNumber} • {formatTime(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${order.totalAmount.toFixed(2)}</p>
                      <p className={`text-sm ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Reservations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Today's Reservations</h2>
              <ApperIcon name="Calendar" className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : upcomingReservations.length === 0 ? (
              <EmptyState
                icon="Calendar"
                title="No reservations today"
                description="Today's reservations will appear here"
              />
            ) : (
              <div className="space-y-4">
                {upcomingReservations.map((reservation) => (
                  <motion.div
                    key={reservation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                        <ApperIcon name="Users" className="w-5 h-5 text-info" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{reservation.customerName}</p>
                        <p className="text-sm text-gray-600">
                          {formatTime(reservation.dateTime)} • {reservation.partySize} people
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{reservation.phone}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
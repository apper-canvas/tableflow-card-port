import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import EmptyState from '@/components/organisms/EmptyState';
import ErrorState from '@/components/organisms/ErrorState';
import ApperIcon from '@/components/ApperIcon';
import { reservationService } from '@/services';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dateFilters = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'tomorrow', label: 'Tomorrow' },
    { id: 'week', label: 'This Week' }
  ];

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reservations, selectedDate, searchTerm]);

  const loadReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const reservationsData = await reservationService.getAll();
      setReservations(reservationsData);
    } catch (err) {
      setError(err.message || 'Failed to load reservations');
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reservations];

    // Apply date filter
    if (selectedDate !== 'all') {
      const now = new Date();
      filtered = filtered.filter(reservation => {
        const resDate = parseISO(reservation.dateTime);
        switch (selectedDate) {
          case 'today':
            return isToday(resDate);
          case 'tomorrow':
            return isTomorrow(resDate);
          case 'week':
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            return resDate >= now && resDate <= weekFromNow;
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(reservation =>
        reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.phone.includes(searchTerm) ||
        reservation.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date/time
    filtered.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    setFilteredReservations(filtered);
  };

  const formatReservationDate = (dateString) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd, yyyy');
  };

  const formatReservationTime = (dateString) => {
    return format(parseISO(dateString), 'HH:mm');
  };

  const getDateFilterCount = (filterId) => {
    if (filterId === 'all') return reservations.length;
    
    const now = new Date();
    return reservations.filter(reservation => {
      const resDate = parseISO(reservation.dateTime);
      switch (filterId) {
        case 'today':
          return isToday(resDate);
        case 'tomorrow':
          return isTomorrow(resDate);
        case 'week':
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          return resDate >= now && resDate <= weekFromNow;
        default:
          return false;
      }
    }).length;
  };

  if (error) {
    return <ErrorState message={error} onRetry={loadReservations} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Reservations</h1>
          <p className="text-gray-600 mt-1">Manage customer reservations and table bookings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button icon="Plus" variant="primary">
            New Reservation
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {dateFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedDate(filter.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedDate === filter.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
              <span className="ml-2 text-xs opacity-75">
                ({getDateFilterCount(filter.id)})
              </span>
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-4">
          <SearchBar
            onSearch={setSearchTerm}
            placeholder="Search reservations..."
            className="w-full lg:w-80"
          />
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ApperIcon name="List" className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'calendar'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ApperIcon name="Calendar" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Reservations List */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-36"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredReservations.length === 0 ? (
          <EmptyState
            icon="Calendar"
            title={searchTerm ? "No reservations found" : "No reservations"}
            description={
              searchTerm 
                ? "Try adjusting your search terms"
                : "Reservations will appear here as they are booked"
            }
            actionLabel={!searchTerm ? "New Reservation" : undefined}
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
            {filteredReservations.map((reservation) => (
              <motion.div
                key={reservation.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.01, y: -2 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {reservation.customerName}
                      </h3>
                      <Badge variant="info" size="sm">
                        <ApperIcon name="Users" className="w-3 h-3 mr-1" />
                        {reservation.partySize} {reservation.partySize === 1 ? 'guest' : 'guests'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <ApperIcon name="Calendar" className="w-4 h-4" />
                        <span className="text-sm">
                          {formatReservationDate(reservation.dateTime)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-600">
                        <ApperIcon name="Clock" className="w-4 h-4" />
                        <span className="text-sm">
                          {formatReservationTime(reservation.dateTime)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-600">
                        <ApperIcon name="Phone" className="w-4 h-4" />
                        <span className="text-sm">{reservation.phone}</span>
                      </div>
                    </div>
                    
                    {reservation.notes && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex items-start space-x-2">
                          <ApperIcon name="StickyNote" className="w-4 h-4 text-gray-400 mt-0.5" />
                          <p className="text-sm text-gray-600">{reservation.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200">
                      <ApperIcon name="Edit2" className="w-4 h-4" />
                    </button>
                    
                    <button className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-all duration-200">
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </button>
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

export default Reservations;
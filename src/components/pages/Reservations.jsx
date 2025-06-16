import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";
import EmptyState from "@/components/organisms/EmptyState";
import ErrorState from "@/components/organisms/ErrorState";
import ApperIcon from "@/components/ApperIcon";
import { reservationService } from "@/services";

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
        const resDate = parseISO(reservation.date_time || reservation.dateTime);
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
      filtered = filtered.filter(reservation => {
        const customerName = reservation.customer_name || reservation.customerName || '';
        const phone = reservation.phone || '';
        const notes = reservation.notes || '';
        
        return customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               phone.includes(searchTerm) ||
               notes.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Sort by date/time
    filtered.sort((a, b) => new Date(a.date_time || a.dateTime) - new Date(b.date_time || b.dateTime));

    setFilteredReservations(filtered);
  };

  const handleNewReservation = () => {
    setShowModal(true);
  };

  const handleReservationSubmit = async (reservationData) => {
    try {
      const newReservation = await reservationService.create(reservationData);
      setReservations(prev => [...prev, newReservation]);
      toast.success('Reservation created successfully');
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to create reservation');
      throw err;
    }
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
      const resDate = parseISO(reservation.date_time || reservation.dateTime);
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
    <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900">Reservations</h1>
            <p className="text-gray-600 mt-1">Manage customer reservations and table bookings</p>
        </div>
        <div className="flex items-center space-x-2">
            <Button icon="Plus" variant="primary" onClick={handleNewReservation}>New Reservation
                          </Button>
        </div>
    </div>
    {/* Filters and Controls */}
    <div
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
            {dateFilters.map(filter => <button
                key={filter.id}
                onClick={() => setSelectedDate(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedDate === filter.id ? "bg-primary text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {filter.label}
                <span className="ml-2 text-xs opacity-75">({getDateFilterCount(filter.id)})
                                  </span>
            </button>)}
        </div>
        <div className="flex items-center space-x-4">
            <SearchBar
                onSearch={setSearchTerm}
                placeholder="Search reservations..."
                className="w-full lg:w-80" />
            <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all duration-200 ${viewMode === "list" ? "bg-white shadow-sm text-primary" : "text-gray-600 hover:text-gray-900"}`}>
                    <ApperIcon name="List" className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setViewMode("calendar")}
                    className={`p-2 rounded-md transition-all duration-200 ${viewMode === "calendar" ? "bg-white shadow-sm text-primary" : "text-gray-600 hover:text-gray-900"}`}>
                    <ApperIcon name="Calendar" className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
    {/* Reservations List */}
    <div className="min-h-[400px]">
        {loading ? <div className="space-y-4">
            {Array.from({
                length: 5
            }).map((_, index) => <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
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
            </div>)}
        </div> : filteredReservations.length === 0 ? <EmptyState
            icon="Calendar"
            title={searchTerm ? "No reservations found" : "No reservations"}
            description={searchTerm ? "Try adjusting your search terms" : "Reservations will appear here as they are booked"}
            actionLabel={!searchTerm ? "New Reservation" : undefined} /> : <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {
                    opacity: 0
                },

                visible: {
                    opacity: 1,

                    transition: {
                        staggerChildren: 0.05
                    }
                }
            }}>
            {filteredReservations.map(reservation => <motion.div
                key={reservation.id}
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
                whileHover={{
                    scale: 1.01,
                    y: -2
                }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all duration-200">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {reservation.customer_name || reservation.customerName}
                            </h3>
                            <Badge variant="info" size="sm">
                                <ApperIcon name="Users" className="w-3 h-3 mr-1" />
                                {reservation.party_size || reservation.partySize} {(reservation.party_size || reservation.partySize) === 1 ? "guest" : "guests"}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-gray-600">
                                <ApperIcon name="Calendar" className="w-4 h-4" />
                                <span className="text-sm">
                                    {formatReservationDate(reservation.date_time || reservation.dateTime)}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <ApperIcon name="Clock" className="w-4 h-4" />
                                <span className="text-sm">
                                    {formatReservationTime(reservation.date_time || reservation.dateTime)}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <ApperIcon name="Phone" className="w-4 h-4" />
                                <span className="text-sm">{reservation.phone}</span>
                            </div>
                        </div>
                        {reservation.notes && <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <div className="flex items-start space-x-2">
                                <ApperIcon name="StickyNote" className="w-4 h-4 text-gray-400 mt-0.5" />
                                <p className="text-sm text-gray-600">{reservation.notes}</p>
                            </div>
                        </div>}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                        <button
                            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200">
                            <ApperIcon name="Edit2" className="w-4 h-4" />
                        </button>
                        <button
                            className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-all duration-200">
                            <ApperIcon name="Trash2" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>)}
        </motion.div>}
    </div>
    {/* Reservation Modal */}
    <ReservationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleReservationSubmit} />
</div>
  );
};

// Reservation Modal Component
const ReservationModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    dateTime: '',
    partySize: 2,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.dateTime) {
      newErrors.dateTime = 'Date and time are required';
    } else {
      const selectedDate = new Date(formData.dateTime);
      const now = new Date();
      if (selectedDate < now) {
        newErrors.dateTime = 'Cannot book a reservation in the past';
      }
    }
    
    if (formData.partySize < 1 || formData.partySize > 20) {
      newErrors.partySize = 'Party size must be between 1 and 20';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
setIsSubmitting(true);
    try {
      await onSubmit({
        customerName: formData.customerName,
        phone: formData.phone,
        dateTime: formData.dateTime,
        partySize: parseInt(formData.partySize),
        notes: formData.notes
      });
      
      // Reset form
      setFormData({
        customerName: '',
        phone: '',
        dateTime: '',
        partySize: 2,
        notes: ''
      });
      setErrors({});
    } catch (err) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        customerName: '',
        phone: '',
        dateTime: '',
        partySize: 2,
        notes: ''
      });
      setErrors({});
      onClose();
    }
  };

  // Get minimum date/time (current time + 1 hour)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: isOpen ? 1 : 0.95, opacity: isOpen ? 1 : 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">New Reservation</h2>
            <p className="text-sm text-gray-600 mt-1">Create a new table reservation</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <ApperIcon name="X" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.customerName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter customer name"
              disabled={isSubmitting}
            />
            {errors.customerName && (
              <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter phone number"
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) => handleInputChange('dateTime', e.target.value)}
              min={getMinDateTime()}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.dateTime ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.dateTime && (
              <p className="text-red-500 text-sm mt-1">{errors.dateTime}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Party Size *
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.partySize}
              onChange={(e) => handleInputChange('partySize', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.partySize ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.partySize && (
              <p className="text-red-500 text-sm mt-1">{errors.partySize}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Any special requests or notes..."
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              icon={isSubmitting ? "Loader2" : "Check"}
            >
              {isSubmitting ? 'Creating...' : 'Create Reservation'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Reservations;
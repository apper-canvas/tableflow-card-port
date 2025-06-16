import { toast } from 'react-toastify';

class ReservationService {
  constructor() {
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getAll() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'customer_name', 'phone', 'date_time', 'party_size', 'notes']
      };
      
      const response = await this.apperClient.fetchRecords('reservation', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to fetch reservations');
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'customer_name', 'phone', 'date_time', 'party_size', 'notes']
      };
      
      const response = await this.apperClient.getRecordById('reservation', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching reservation with ID ${id}:`, error);
      return null;
    }
  }

  async create(reservationData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Only include updateable fields
      const params = {
        records: [{
          Name: reservationData.customerName || reservationData.customer_name,
          customer_name: reservationData.customerName || reservationData.customer_name,
          phone: reservationData.phone,
          date_time: reservationData.dateTime || reservationData.date_time,
          party_size: parseInt(reservationData.partySize || reservationData.party_size),
          notes: reservationData.notes || ''
        }]
      };
      
      const response = await this.apperClient.createRecord('reservation', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Only include updateable fields
      const recordData = {
        Id: parseInt(id)
      };
      
      if (updateData.customerName !== undefined) recordData.customer_name = updateData.customerName;
      if (updateData.customer_name !== undefined) recordData.customer_name = updateData.customer_name;
      if (updateData.name !== undefined) recordData.Name = updateData.name;
      if (updateData.Name !== undefined) recordData.Name = updateData.Name;
      if (updateData.phone !== undefined) recordData.phone = updateData.phone;
      if (updateData.dateTime !== undefined) recordData.date_time = updateData.dateTime;
      if (updateData.date_time !== undefined) recordData.date_time = updateData.date_time;
      if (updateData.partySize !== undefined) recordData.party_size = parseInt(updateData.partySize);
      if (updateData.party_size !== undefined) recordData.party_size = parseInt(updateData.party_size);
      if (updateData.notes !== undefined) recordData.notes = updateData.notes;
      
      const params = {
        records: [recordData]
      };
      
      const response = await this.apperClient.updateRecord('reservation', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('reservation', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting reservation:', error);
      throw error;
    }
  }

  async getTodaysReservations() {
    try {
      const allReservations = await this.getAll();
      const today = new Date().toDateString();
      return allReservations.filter(res => {
        const resDate = new Date(res.date_time).toDateString();
        return resDate === today;
      });
    } catch (error) {
      console.error('Error fetching today\'s reservations:', error);
      return [];
    }
  }
}

export default new ReservationService();
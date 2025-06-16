import { toast } from 'react-toastify';

class OrderService {
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
        Fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'order_number', 'table_number', 'items', 'status', 'total_amount', 'completed_at']
      };
      
      const response = await this.apperClient.fetchRecords('order', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'order_number', 'table_number', 'items', 'status', 'total_amount', 'completed_at']
      };
      
      const response = await this.apperClient.getRecordById('order', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching order with ID ${id}:`, error);
      return null;
    }
  }

  async create(orderData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Generate order number if not provided
      const orderNumber = orderData.orderNumber || `ORD-${Date.now().toString().slice(-6)}`;
      
      // Only include updateable fields
      const params = {
        records: [{
          Name: orderData.name || orderNumber,
          order_number: orderNumber,
          table_number: parseInt(orderData.tableNumber || orderData.table_number),
          items: typeof orderData.items === 'string' ? orderData.items : JSON.stringify(orderData.items),
          status: orderData.status || 'pending',
          total_amount: parseFloat(orderData.totalAmount || orderData.total_amount)
        }]
      };
      
      const response = await this.apperClient.createRecord('order', params);
      
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
      console.error('Error creating order:', error);
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
      
      if (updateData.name !== undefined) recordData.Name = updateData.name;
      if (updateData.Name !== undefined) recordData.Name = updateData.Name;
      if (updateData.order_number !== undefined) recordData.order_number = updateData.order_number;
      if (updateData.table_number !== undefined) recordData.table_number = parseInt(updateData.table_number);
      if (updateData.tableNumber !== undefined) recordData.table_number = parseInt(updateData.tableNumber);
      if (updateData.items !== undefined) {
        recordData.items = typeof updateData.items === 'string' ? updateData.items : JSON.stringify(updateData.items);
      }
      if (updateData.status !== undefined) {
        recordData.status = updateData.status;
        // Auto-set completed_at when status changes to completed
        if (updateData.status === 'completed') {
          recordData.completed_at = new Date().toISOString();
        }
      }
      if (updateData.total_amount !== undefined) recordData.total_amount = parseFloat(updateData.total_amount);
      if (updateData.totalAmount !== undefined) recordData.total_amount = parseFloat(updateData.totalAmount);
      if (updateData.completed_at !== undefined) recordData.completed_at = updateData.completed_at;
      
      const params = {
        records: [recordData]
      };
      
      const response = await this.apperClient.updateRecord('order', params);
      
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
      console.error('Error updating order:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('order', params);
      
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
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  async getByStatus(status) {
    try {
      const allOrders = await this.getAll();
      return allOrders.filter(order => order.status === status);
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      return [];
    }
  }

  async getTodaysOrders() {
    try {
      const allOrders = await this.getAll();
      const today = new Date().toDateString();
      return allOrders.filter(order => {
        const orderDate = new Date(order.CreatedOn).toDateString();
        return orderDate === today;
      });
    } catch (error) {
      console.error('Error fetching today\'s orders:', error);
      return [];
    }
  }

  async generateBill(orderId) {
    try {
      const order = await this.getById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      const subtotal = order.total_amount;
      const tax = Math.round(subtotal * 0.1 * 100) / 100;
      const total = Math.round((subtotal + tax) * 100) / 100;

      const bill = {
        orderId: order.Id,
        orderNumber: order.order_number,
        tableNumber: order.table_number,
        items: items,
        subtotal: subtotal,
        tax: tax,
        total: total,
        generatedAt: new Date().toISOString()
      };

      return bill;
    } catch (error) {
      console.error('Error generating bill:', error);
      throw error;
    }
  }
}

export default new OrderService();
import { toast } from "react-toastify";
import React from "react";

class MenuItemService {
  constructor() {
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    if (typeof window !== 'undefined' && window.apperClient) {
      this.apperClient = window.apperClient;
    }
  }

  async getAll() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'price', 'category', 'available', 'description']
      };
      
      const response = await this.apperClient.fetchRecords('menu_item', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to fetch menu items');
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'price', 'category', 'available', 'description']
      };
      
      const response = await this.apperClient.getRecordById('menu_item', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching menu item with ID ${id}:`, error);
      return null;
    }
  }

  async create(itemData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Only include updateable fields
      const params = {
        records: [{
          Name: itemData.name || itemData.Name,
          price: parseFloat(itemData.price),
          category: itemData.category,
          available: itemData.available,
          description: itemData.description
        }]
      };
      
      const response = await this.apperClient.createRecord('menu_item', params);
      
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
      console.error('Error creating menu item:', error);
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
      if (updateData.price !== undefined) recordData.price = parseFloat(updateData.price);
      if (updateData.category !== undefined) recordData.category = updateData.category;
      if (updateData.available !== undefined) recordData.available = updateData.available;
      if (updateData.description !== undefined) recordData.description = updateData.description;
      
      const params = {
        records: [recordData]
      };
      
      const response = await this.apperClient.updateRecord('menu_item', params);
      
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
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord('menu_item', params);
      
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
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }

  async getByCategory(category) {
    try {
      const allItems = await this.getAll();
      return allItems.filter(item => item.category === category);
    } catch (error) {
      console.error('Error fetching menu items by category:', error);
      return [];
    }
  }
}

export default new MenuItemService();
import inventoryData from '../mockData/inventory.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class InventoryService {
  constructor() {
    this.inventory = [...inventoryData];
  }

  async getAll() {
    await delay(300);
    return [...this.inventory];
  }

  async getById(id) {
    await delay(200);
    const item = this.inventory.find(item => item.id === id);
    return item ? { ...item } : null;
  }

  async create(itemData) {
    await delay(400);
    const newItem = {
      ...itemData,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString()
    };
    this.inventory.push(newItem);
    return { ...newItem };
  }

  async update(id, updateData) {
    await delay(300);
    const index = this.inventory.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Inventory item not found');
    }
    
    this.inventory[index] = { 
      ...this.inventory[index], 
      ...updateData,
      lastUpdated: new Date().toISOString()
    };
    
    return { ...this.inventory[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.inventory.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Inventory item not found');
    }
    const deletedItem = this.inventory.splice(index, 1)[0];
    return { ...deletedItem };
  }

  async getLowStockItems() {
    await delay(250);
    return this.inventory.filter(item => item.quantity <= item.lowStockThreshold).map(item => ({ ...item }));
  }
}

export default new InventoryService();
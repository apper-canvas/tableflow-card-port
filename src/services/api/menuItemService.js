import menuItemsData from '../mockData/menuItems.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class MenuItemService {
  constructor() {
    this.menuItems = [...menuItemsData];
  }

  async getAll() {
    await delay(300);
    return [...this.menuItems];
  }

  async getById(id) {
    await delay(200);
    const item = this.menuItems.find(item => item.id === id);
    return item ? { ...item } : null;
  }

  async create(itemData) {
    await delay(400);
    const newItem = {
      ...itemData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    this.menuItems.push(newItem);
    return { ...newItem };
  }

  async update(id, updateData) {
    await delay(300);
    const index = this.menuItems.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Menu item not found');
    }
    
    this.menuItems[index] = { 
      ...this.menuItems[index], 
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.menuItems[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.menuItems.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Menu item not found');
    }
    const deletedItem = this.menuItems.splice(index, 1)[0];
    return { ...deletedItem };
  }

  async getByCategory(category) {
    await delay(250);
    return this.menuItems.filter(item => item.category === category).map(item => ({ ...item }));
  }
}

export default new MenuItemService();
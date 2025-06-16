import ordersData from '../mockData/orders.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class OrderService {
  constructor() {
    this.orders = [...ordersData];
  }

  async getAll() {
    await delay(300);
    return [...this.orders];
  }

  async getById(id) {
    await delay(200);
    const order = this.orders.find(order => order.id === id);
    return order ? { ...order } : null;
  }

  async create(orderData) {
    await delay(400);
    const newOrder = {
      ...orderData,
      id: Date.now().toString(),
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    this.orders.push(newOrder);
    return { ...newOrder };
  }

  async update(id, updateData) {
    await delay(300);
    const index = this.orders.findIndex(order => order.id === id);
    if (index === -1) {
      throw new Error('Order not found');
    }
    
    this.orders[index] = { 
      ...this.orders[index], 
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    if (updateData.status === 'completed' && !this.orders[index].completedAt) {
      this.orders[index].completedAt = new Date().toISOString();
    }
    
    return { ...this.orders[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.orders.findIndex(order => order.id === id);
    if (index === -1) {
      throw new Error('Order not found');
    }
    const deletedOrder = this.orders.splice(index, 1)[0];
    return { ...deletedOrder };
  }

  async getByStatus(status) {
    await delay(250);
    return this.orders.filter(order => order.status === status).map(order => ({ ...order }));
  }

  async getTodaysOrders() {
    await delay(300);
    const today = new Date().toDateString();
    return this.orders.filter(order => {
      const orderDate = new Date(order.createdAt).toDateString();
      return orderDate === today;
    }).map(order => ({ ...order }));
  }

  async generateBill(orderId) {
    await delay(200);
    const order = await this.getById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const bill = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      items: order.items,
      subtotal: order.totalAmount,
      tax: Math.round(order.totalAmount * 0.1 * 100) / 100,
      total: Math.round(order.totalAmount * 1.1 * 100) / 100,
      generatedAt: new Date().toISOString()
    };

    return bill;
  }
}

export default new OrderService();
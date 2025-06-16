import reservationsData from '../mockData/reservations.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ReservationService {
  constructor() {
    this.reservations = [...reservationsData];
  }

  async getAll() {
    await delay(300);
    return [...this.reservations];
  }

  async getById(id) {
    await delay(200);
    const reservation = this.reservations.find(res => res.id === id);
    return reservation ? { ...reservation } : null;
  }

  async create(reservationData) {
    await delay(400);
    const newReservation = {
      ...reservationData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    this.reservations.push(newReservation);
    return { ...newReservation };
  }

  async update(id, updateData) {
    await delay(300);
    const index = this.reservations.findIndex(res => res.id === id);
    if (index === -1) {
      throw new Error('Reservation not found');
    }
    
    this.reservations[index] = { 
      ...this.reservations[index], 
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.reservations[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.reservations.findIndex(res => res.id === id);
    if (index === -1) {
      throw new Error('Reservation not found');
    }
    const deletedReservation = this.reservations.splice(index, 1)[0];
    return { ...deletedReservation };
  }

  async getTodaysReservations() {
    await delay(300);
    const today = new Date().toDateString();
    return this.reservations.filter(res => {
      const resDate = new Date(res.dateTime).toDateString();
      return resDate === today;
    }).map(res => ({ ...res }));
  }
}

export default new ReservationService();
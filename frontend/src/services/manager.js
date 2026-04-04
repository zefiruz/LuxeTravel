import api from './api';

class ManagerService {
  // === Бронирования ===
  async getBookings() {
    return api.get('/manager/bookings');
  }

  async getBooking(id) {
    return api.get(`/manager/bookings/${id}`);
  }

  async updateBookingStatus(id, status) {
    return api.put(`/manager/bookings/${id}/status`, { status });
  }

  // === Типы комнат ===
  async createRoomType(data) {
    return api.post('/manager/room-types', data);
  }

  // === Отели ===
  async updateHotel(id, data) {
    return api.put(`/manager/hotels/${id}`, data);
  }
}

export default new ManagerService();

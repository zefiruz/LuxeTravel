import api from './api';

class AdminService {
  // === Пользователи ===
  async getAllUsers() {
    return api.get('/admin/users');
  }

  async updateUserRole(userId, roleId) {
    return api.put(`/admin/users/${userId}/role`, { role_id: roleId });
  }

  async getRoles() {
    return api.get('/admin/roles');
  }

  // === Маршруты ===
  async getAllRoutes() {
    return api.get('/admin/routes');
  }

  async getRoute(id) {
    return api.get(`/admin/routes/${id}`);
  }

  async deleteRoute(id) {
    return api.delete(`/admin/routes/${id}`);
  }

  async updateRouteStatus(id, status) {
    return api.put(`/admin/routes/${id}/status`, { status });
  }

  // === Города ===
  async getCities() {
    return api.get('/cities');
  }

  async createCity(data) {
    return api.post('/admin/cities', data);
  }

  async updateCity(id, data) {
    return api.put(`/admin/cities/${id}`, data);
  }

  async deleteCity(id) {
    return api.delete(`/admin/cities/${id}`);
  }

  // === Отели ===
  async getHotels() {
    return api.get('/admin/hotels');
  }

  async createHotel(data) {
    return api.post('/admin/hotels', data);
  }

  async updateHotel(id, data) {
    return api.put(`/admin/hotels/${id}`, data);
  }

  async deleteHotel(id) {
    return api.delete(`/admin/hotels/${id}`);
  }

  // === Менеджеры отелей ===
  async assignManager(userId, hotelId) {
    return api.post('/admin/hotel-managers', { user_id: userId, hotel_id: hotelId });
  }

  async removeManager(userId, hotelId) {
    return api.delete(`/admin/hotel-managers/${userId}/${hotelId}`);
  }
}

export default new AdminService();

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

  // === Маршруты (админские эндпоинты) ===
  async getAllRoutes() {
    return api.get('/admin/routes');
  }

  async getRoute(id) {
    return api.get(`/routes/${id}`);
  }

  async deleteRoute(id) {
    return api.delete(`/routes/${id}`);
  }

  // === Менеджеры отелей ===
  async assignManager(userId, hotelId) {
    return api.post('/admin/hotel-managers', { user_id: userId, hotel_id: hotelId });
  }
}

export default new AdminService();

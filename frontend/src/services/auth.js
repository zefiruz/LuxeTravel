import api from './api';

class AuthService {
    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.response?.data || error.message };
        }
    }

    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            const data = response; 

            if (data && data.token) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user', JSON.stringify({ email: email }));
                return { success: true, data: data };
            } else {
                throw new Error("Токен не найден в ответе сервера");
            }
        } catch (error) {
            return { success: false, error: error.message || 'Ошибка при входе' };
        }
    }

    getUser() {
        const user = localStorage.getItem('user');
        if (!user || user === "undefined") { 
            return null;
        }
        try {
            return JSON.parse(user);
        } catch (e) {
            console.error("Ошибка парсинга пользователя из localStorage", e);
            localStorage.removeItem('user');
            return null;
        }
    }

    async getProfile() {
        try {
            const response = await api.get('/auth/profile');
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.response?.data };
        }
    }

    async updateProfile(profileData) {
        try {
            const response = await api.put('/auth/profile', profileData);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getToken() {
        return localStorage.getItem('auth_token');
    }

    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_email');
    }

    isAuthenticated() {
        return !!this.getToken();
    }
}

export default new AuthService();
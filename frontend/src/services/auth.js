import api from './api';

class AuthService {
    async register(userData) {
        try {
            // 1. Собираем все поля, которые ввел пользователь в форму
            // Имена ключей должны В ТОЧНОСТИ совпадать с JSON-тегами в Go
            const requestData = {
                lastName: userData.lastName,
                firstName: userData.firstName,
                middleName: userData.middleName,
                email: userData.email,
                phone: userData.phone,
                password: userData.password,
            };

            // 2. Если в api.js baseURL НЕ включает /v1, добавь его здесь: '/v1/auth/register'
            const response = await api.post('/auth/register', requestData);

            // Сохраняем данные профиля (без пароля) для удобства
            localStorage.setItem('user', JSON.stringify(response));

            return { success: true, data: response };
        } catch (error) {
            console.error('Registration error:', error);
            // Пытаемся вытащить сообщение об ошибке от бэкенда
            const message = error.response?.data || error.message || 'Ошибка при регистрации';
            return {
                success: false,
                error: message
            };
        }
    }

    async login(email, password) {
        try {
            const requestData = {
                email: email, // Бэкенд теперь ждет 'email', а не 'login'
                password: password,
            };

            const response = await api.post('/auth/login', requestData);

            // Сохраняем токен в localStorage
            if (response.token) {
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('user_email', email);
            }

            return { success: true, data: response };
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data || 'Неверный email или пароль';
            return {
                success: false,
                error: message
            };
        }
    }

    // Остальные методы (logout, getToken и т.д.) остаются без изменений
    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_email');
    }

    getToken() {
        return localStorage.getItem('auth_token');
    }

    isAuthenticated() {
        return !!this.getToken();
    }
}

export default new AuthService();
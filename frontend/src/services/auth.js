import api from './api';

class AuthService {
    async register(userData) {
        try {
            // Преобразуем данные из формы в формат, ожидаемый бэкендом
            const requestData = {
                login: userData.email, // Используем email как login
                email: userData.email,
                password: userData.password,
            };

            const response = await api.post('/auth/register', requestData);

            // Сохраняем данные пользователя в localStorage если нужно
            localStorage.setItem('user', JSON.stringify(response));

            return { success: true, data: response };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.message || 'Ошибка при регистрации'
            };
        }
    }

    async login(email, password) {
        try {
            const requestData = {
                login: email,
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
            return {
                success: false,
                error: error.message || 'Неверный email или пароль'
            };
        }
    }

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

    getUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    }
}

export default new AuthService();
import { Hotel } from 'lucide-react';
import api from './api';

class hotelService {
    
    async getCityList() {
        try {
            const response = await api.get('/cities');
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.response?.data };
        }
    }

    async getCityInfo(cityId) {
        try {
            const response = await api.get(`/city/${cityId}`);
            return { success: true, data: response };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export default new hotelService();
class HttpClient {
  constructor() {
    this.baseURL = 'http://localhost:8080/api';
    this.interceptors = {
      request: [],
      response: []
    };
  }

  addInterceptor(type, interceptor) {
    this.interceptors[type].push(interceptor);
  }

  async request(endpoint, options = {}) {
    let config = {
      url: `${this.baseURL}${endpoint}`,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Применяем request interceptors
    for (const interceptor of this.interceptors.request) {
      config = await interceptor(config);
    }

    try {
      let response = await fetch(config.url, config);

      // Применяем response interceptors
      for (const interceptor of this.interceptors.response) {
        response = await interceptor(response);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Создаем экземпляр
const httpClient = new HttpClient();

// Добавляем перехватчик для авторизации
httpClient.addInterceptor('request', async (config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }
  return config;
});

// Добавляем перехватчик для обработки ошибок
httpClient.addInterceptor('response', async (response) => {
  if (response.status === 401) {
    // Токен истек или невалидный
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  }
  return response;
});

export default httpClient;  
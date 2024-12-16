import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://172.20.10.209:8000',
  headers: {
    'Accept': 'application/json'
  }
});

// Ajout des intercepteurs par défaut
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
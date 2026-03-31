import axios from 'axios';

// Base configuration for Axios
const apiClient = axios.create({
  // Connect to Spring Boot backend
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for handling errors globally (optional but good practice)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;

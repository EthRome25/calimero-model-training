// CNN Network PoC API Configuration
export const CNN_API_URL = import.meta.env.VITE_CNN_API_URL || 'http://localhost:8000';

// CNN API endpoints
export const CNN_ENDPOINTS = {
  PREDICT: '/predict',
  RETRAIN: '/retrain',
  HEALTH: '/',
} as const;

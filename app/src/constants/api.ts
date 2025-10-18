// CNN Network PoC API Configuration
export const CNN_API_URL = import.meta.env.VITE_CNN_API_URL || 'http://localhost:8000';

// Calimero Node Configuration
export const CALIMERO_NODE_URL = import.meta.env.VITE_CALIMERO_NODE_URL || 'http://node1.127.0.0.1.nip.io';

// CNN API endpoints
export const CNN_ENDPOINTS = {
  PREDICT: '/predict',
  RETRAIN: '/retrain',
  HEALTH: '/',
} as const;

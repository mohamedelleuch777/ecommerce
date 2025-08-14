// API Configuration
// This uses Vite's environment variables system
// Variables prefixed with VITE_ are available in the browser

const getApiBaseUrl = () => {
  // Try environment variable first (for production builds)
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envUrl) {
    return envUrl;
  }
  
  // Fallback for development
  return 'http://localhost:7953/api';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 10000, // 10 seconds
};

// Export for backward compatibility and convenience
export const API_BASE_URL = API_CONFIG.BASE_URL;
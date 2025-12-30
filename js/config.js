// API Configuration
// Note: API calls are now handled by backend proxy at /api/chat
// The API key is stored securely on the server and never exposed to the browser

const CONFIG = {
  // Backend proxy endpoint (handles API key securely)
  API_ENDPOINT: '/api/chat'
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}


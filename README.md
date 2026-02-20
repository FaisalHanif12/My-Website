# Faisal Hanif Portfolio Website

A modern, responsive portfolio website featuring a secure, AI-powered chatbot assistant. This project showcases frontend design skills using HTML5, CSS3, and JavaScript, coupled with a robust Node.js backend for API proxying and security.

## Project Structure

The project is organized into two main directories:

*   **`frontend/`**: Contains the static website files (HTML, CSS, JS, images).
    *   `index.html`: The main entry point for the portfolio.
    *   `css/`: Stylesheets for layout and animations.
    *   `js/`: JavaScript files for interactivity and API communication.
*   **`backend/`**: A Node.js/Express server that acts as a secure proxy for the OpenRouter API.
    *   `server.js`: The main application file handling API requests, rate limiting, and CORS.

## Tech Stack

*   **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
*   **Backend:** Node.js, Express.js
*   **AI Integration:** OpenRouter API (Access to LLMs)
*   **Security:** Express Rate Limit, CORS, Helmet (implied best practice)

## Key Features

*   **AI Chatbot:** An intelligent assistant that answers questions about Faisal's portfolio, skills, and experience.
*   **Secure API Proxy:** The backend hides the OpenRouter API key from the client-side, preventing unauthorized usage.
*   **Rate Limiting:** Protects the API from abuse by limiting requests per IP address (4 requests/day).
*   **Memory Protection:** The rate limit store has a maximum size and auto-pruning to prevent memory exhaustion (DoS protection).
*   **Strict CORS Policy:** In production, the API only accepts requests from allowed origins.

## Setup Instructions

### Prerequisites

*   Node.js (v14 or higher)
*   npm (Node Package Manager)

### Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env` file in the `backend/` directory with your API credentials:
    ```env
    PORT=3000
    OPENROUTER_API_KEY=your_openrouter_api_key_here
    OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
    OPENROUTER_MODEL=openai/gpt-3.5-turbo
    NODE_ENV=development
    ```

4.  Start the server:
    ```bash
    npm start
    ```
    The server will run on `http://localhost:3000`.

### Frontend Setup

1.  Serve the `frontend/` directory using a static file server (e.g., Live Server in VS Code, `http-server`, or Nginx).
2.  Ensure the frontend is running on `http://localhost:5500` or updated in the `allowedOrigins` array in `backend/server.js`.

## Deployment

For production deployment (e.g., on a VPS or cloud instance):

1.  **Nginx Reverse Proxy:** Configure Nginx to serve static files from `frontend/` and proxy `/api/` requests to `http://localhost:3000`.
2.  **Process Management:** Use PM2 to keep the Node.js backend running:
    ```bash
    pm2 start backend/server.js --name "portfolio-backend"
    ```
3.  **Environment:** Set `NODE_ENV=production` in your `.env` file to enable strict security checks.

## Security Note

This project implements strict security measures:
*   **Rate Limiting:** Limits are based on IP address to prevent bypass via browser ID rotation.
*   **Origin Check:** Requests without an `Origin` header are blocked in production to prevent bot abuse.

## License

This project is open-source and available for educational purposes.

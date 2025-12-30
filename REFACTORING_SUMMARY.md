# Chatbot API Refactoring Summary

## Overview
This refactoring moves the chatbot API key from the frontend to a secure backend proxy, ensuring the API key is never exposed to the browser.

## Changes Made

### 1. Backend Proxy Server (`backend/`)
- **`server.js`**: Express.js server that handles `/api/chat` POST requests
  - Reads API key from `.env` file (never exposed)
  - Implements CORS for `faisalhanif.work` and `www.faisalhanif.work`
  - Rate limiting: 20 requests per 15 minutes per IP
  - Forwards requests to OpenRouter API securely
  - Returns `{ reply: "..." }` format

- **`package.json`**: Node.js dependencies (express, cors, express-rate-limit, dotenv)

- **`nginx.conf`**: Nginx reverse proxy configuration template
  - Routes `/api/chat` requests to Node.js backend on port 3000

- **`SETUP.md`**: Complete VPS deployment guide
  - Node.js installation
  - PM2 process manager setup
  - Nginx configuration
  - SSL/HTTPS setup with Certbot

- **`env.example`**: Template for environment variables

### 2. Frontend Changes

- **`index.html`**: Updated `getBotResponse()` function
  - Changed from direct OpenRouter API call to `/api/chat` endpoint
  - Removed API key from request headers
  - Sends `{ message, conversationHistory, systemPrompt }` to backend
  - Receives `{ reply }` from backend
  - All UI functionality remains unchanged

- **`js/config.js`**: Removed API key
  - Removed `API_KEY` and `API_URL` constants
  - Kept `API_ENDPOINT: '/api/chat'` for reference (not currently used)

### 3. Security Improvements

- **`.gitignore`**: Added at root level
  - Excludes `.env` files from git
  - Excludes `node_modules/`
  - Excludes other sensitive/temporary files

- **API Key Security**:
  - ✅ API key stored only in backend `.env` file
  - ✅ `.env` excluded from git
  - ✅ API key never sent to browser
  - ✅ CORS restricted to your domains
  - ✅ Rate limiting enabled

## Deployment Checklist

### On Your VPS:
1. ✅ Install Node.js 18.x
2. ✅ Create `/var/www/chatbot-proxy` directory
3. ✅ Upload backend files (`server.js`, `package.json`)
4. ✅ Install dependencies: `npm install`
5. ✅ Create `.env` file with your API key
6. ✅ Install and configure PM2
7. ✅ Configure Nginx reverse proxy
8. ✅ Setup SSL with Certbot (recommended)

### Static Files (Hostinger):
1. ✅ Upload updated `index.html` (no API key)
2. ✅ Upload updated `js/config.js` (no API key)
3. ✅ Upload all other static files as before
4. ✅ Ensure `.env` is NOT uploaded to Hostinger

## Testing

### Local Testing (Before Deployment):
1. Start backend: `cd backend && npm install && npm start`
2. Test endpoint: `curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"message":"Hello"}'`
3. Test frontend locally (ensure it calls `/api/chat`)

### Production Testing:
1. Verify backend is running: `pm2 status`
2. Test health endpoint: `curl https://faisalhanif.work/api/chat` (should return error for GET, but confirms endpoint exists)
3. Test from browser console on your website
4. Verify chatbot works end-to-end

## Important Notes

1. **API Key**: The API key in `config.js` has been removed. Make sure to add it to `backend/.env` on your VPS.

2. **Static Files**: Your HTML/JS/CSS files remain static and can be uploaded to Hostinger as before. Only the backend runs on your VPS.

3. **Nginx Configuration**: The `/api/` path must be proxied to your Node.js backend. Static files are served normally.

4. **Functionality**: All existing chatbot functionality remains the same:
   - Same UI/UX
   - Same conversation history
   - Same system prompt
   - Same fallback responses
   - Same error handling

## File Structure

```
My-Website/
├── backend/                 # Backend proxy (runs on VPS)
│   ├── server.js           # Express server
│   ├── package.json        # Dependencies
│   ├── env.example         # Environment template
│   ├── nginx.conf          # Nginx config template
│   ├── SETUP.md            # Deployment guide
│   └── .gitignore          # Backend-specific ignores
├── index.html              # Updated to use /api/chat
├── js/
│   └── config.js           # API key removed
├── .gitignore              # Root-level gitignore
└── [other static files]    # Upload to Hostinger as before
```

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs chatbot-proxy`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify `.env` file exists and has correct API key
4. Test backend directly: `curl http://localhost:3000/health`
5. Verify Nginx proxy: `curl https://faisalhanif.work/api/chat` (should proxy to backend)


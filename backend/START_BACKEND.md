# Quick Start Guide for Local Development

## Step 1: Create .env file

Create a `.env` file in the `backend/` folder with your API credentials:

```bash
cd backend
cp env.example .env
nano .env  # or use your preferred editor
```

Add your actual values:
```
OPENROUTER_API_KEY=sk-or-v1-0a856fc6f0ac16842650ddd48fa5dd685fd331
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
OPENROUTER_MODEL=openai/gpt-4o-mini
PORT=3000
NODE_ENV=development
```

## Step 2: Install Dependencies (if not already done)

```bash
cd backend
npm install
```

## Step 3: Start the Backend Server

```bash
cd backend
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Step 4: Start Your Frontend

Open your website on `http://localhost:5500` (or whatever port you're using)

## Step 5: Test the Chatbot

1. Open browser console (F12)
2. Click the chat button
3. Send a message
4. Check console for any errors

## Troubleshooting

### Backend not starting?
- Check if port 3000 is already in use: `lsof -i :3000`
- Make sure `.env` file exists and has correct values
- Check `npm install` completed successfully

### CORS errors?
- Make sure backend is running on port 3000
- Check that `http://localhost:5500` is in the allowed origins in `server.js`

### API errors?
- Verify `.env` file has correct `OPENROUTER_API_KEY`
- Check backend console logs for error messages
- Make sure API key is valid and has credits

### Chatbot not responding?
- Open browser console (F12) and check for errors
- Verify backend is running: `curl http://localhost:3000/health`
- Check network tab to see if requests are reaching backend


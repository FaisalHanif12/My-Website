const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - only allow your domains
const allowedOrigins = [
  'https://faisalhanif.work',
  'https://www.faisalhanif.work',
  'http://localhost:3000', // For local testing
  'http://localhost:5500', // Common local dev server
  'http://127.0.0.1:5500'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests) - but restrict in production
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Trust proxy to get correct IP address (important for rate limiting)
app.set('trust proxy', true);

app.use(cors(corsOptions));
app.use(express.json());

// Daily rate limiting - 4 requests per day per IP
// Store: { ip: { count: number, date: string } }
const dailyLimitStore = new Map();

// Helper function to get today's date string (YYYY-MM-DD)
function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

// Helper function to get client IP
function getClientIP(req) {
  // Check for forwarded IP (when behind proxy/load balancer)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Check for real IP header
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }
  
  // Fallback to connection IP
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         '127.0.0.1';
}

// Daily rate limit middleware
function dailyRateLimit(req, res, next) {
  const clientIP = getClientIP(req);
  const today = getTodayDateString();
  const dailyLimit = 4; // 4 requests per day

  // Get or initialize user's daily record
  const userRecord = dailyLimitStore.get(clientIP);
  
  if (!userRecord || userRecord.date !== today) {
    // New day or new user - reset count
    dailyLimitStore.set(clientIP, { count: 1, date: today });
    return next();
  }

  // Check if limit exceeded
  if (userRecord.count >= dailyLimit) {
    return res.status(429).json({
      error: 'Daily limit reached',
      message: 'You have reached your daily limit of 4 interactions. Please try again tomorrow.',
      limit: dailyLimit,
      resetDate: today
    });
  }

  // Increment count
  userRecord.count++;
  dailyLimitStore.set(clientIP, userRecord);
  
  next();
}

// Clean up old entries daily (keep store size manageable)
setInterval(() => {
  const today = getTodayDateString();
  for (const [ip, record] of dailyLimitStore.entries()) {
    if (record.date !== today) {
      dailyLimitStore.delete(ip);
    }
  }
}, 24 * 60 * 60 * 1000); // Run once per day

// Apply daily rate limiting to chat endpoint
app.use('/api/chat', dailyRateLimit);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [], systemPrompt } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message is required and must be a non-empty string' 
      });
    }

    // Get API key and URL from environment
    const apiKey = process.env.OPENROUTER_API_KEY;
    const apiUrl = process.env.OPENROUTER_API_URL;
    const model = process.env.OPENROUTER_MODEL;
    
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY is not set in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error. Please contact the administrator.' 
      });
    }
    
    if (!apiUrl) {
      console.error('OPENROUTER_API_URL is not set in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error. Please contact the administrator.' 
      });
    }
    
    if (!model) {
      console.error('OPENROUTER_MODEL is not set in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error. Please contact the administrator.' 
      });
    }

    // Prepare messages array
    const messages = [];
    
    // Add system prompt if provided
    if (systemPrompt && typeof systemPrompt === 'string') {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    // Add conversation history (last 10 messages for context)
    if (Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory.slice(-10));
    }
    
    // Add current user message
    messages.push({ role: 'user', content: message.trim() });

    // Call OpenRouter API
    const openRouterResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': req.get('origin') || 'https://faisalhanif.work',
        'X-Title': 'Faisal Hanif Portfolio'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.6, // Balanced temperature: focused for specific questions, creative for others
        max_tokens: 500,
        top_p: 0.9, // Nucleus sampling for better understanding
        frequency_penalty: 0.1, // Slight penalty to avoid repetition
        presence_penalty: 0.1 // Slight penalty to encourage diverse responses
      })
    });

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.json().catch(() => ({}));
      console.error('OpenRouter API Error:', errorData);
      return res.status(openRouterResponse.status).json({
        error: errorData.error?.message || 'Failed to get response from AI service'
      });
    }

    const data = await openRouterResponse.json();
    const reply = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

    // Return response in the format expected by frontend
    res.json({ reply });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ 
      error: 'An unexpected error occurred. Please try again later.' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Chat proxy server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});


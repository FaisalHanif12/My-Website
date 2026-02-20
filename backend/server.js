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
    // FIX: Strict Origin Policy
    // Allow requests with no origin ONLY if NOT in production
    // This blocks headless scripts/bots in production
    const isProduction = process.env.NODE_ENV === 'production';

    if (!origin) {
      if (isProduction) {
        return callback(new Error('Not allowed by CORS'));
      }
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Browser-ID']
};

// Trust proxy to get correct IP address (important for rate limiting)
app.set('trust proxy', true);

app.use(cors(corsOptions));
app.use(express.json());

// Daily rate limiting - 4 messages per day per user
// Store: { ip: { count: number, date: string, firstMessageTime: string } }
const dailyLimitStore = new Map();
// FIX: Memory Protection
const MAX_STORE_SIZE = 10000; // Limit max entries to prevent OOM DoS

// Helper function to get today's date string (YYYY-MM-DD)
function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

// FIX: Rate Limiting Key Strategy
// Use IP address as the primary key instead of client-provided ID
function getRateLimitKey(req) {
  // trust proxy is enabled, so req.ip should be the client IP
  return req.ip;
}

// Daily rate limit middleware
function dailyRateLimit(req, res, next) {
  // Only apply to POST requests
  if (req.method !== 'POST') {
    return next();
  }

  const clientIp = getRateLimitKey(req);
  const browserId = req.headers['x-browser-id'] || (req.body && req.body.browserId) || 'unknown';

  console.log(`[Rate Limit] Middleware triggered for ${req.method} ${req.path}`);
  console.log(`[Rate Limit] Client IP: ${clientIp}, Browser ID (Log only): ${browserId.substring(0, 20)}...`);

  // FIX: Memory Protection - Check size before adding new entry
  if (dailyLimitStore.size >= MAX_STORE_SIZE && !dailyLimitStore.has(clientIp)) {
    console.warn('[Rate Limit] Store limit reached. Pruning old entries...');
    const today = getTodayDateString();

    // Prune entries not from today first
    for (const [key, record] of dailyLimitStore.entries()) {
      if (record.date !== today) {
        dailyLimitStore.delete(key);
      }
    }

    // If still full, clear all to ensure stability (fail-safe)
    if (dailyLimitStore.size >= MAX_STORE_SIZE) {
      console.warn('[Rate Limit] Store still full after prune. Clearing all to prevent OOM.');
      dailyLimitStore.clear();
    }
  }

  const today = getTodayDateString();
  const dailyLimit = 4; // 4 messages per day per user

  // Get or initialize user's daily record
  let userRecord = dailyLimitStore.get(clientIp);
  
  // Reset if new day or new user
  if (!userRecord || userRecord.date !== today) {
    userRecord = { count: 0, date: today, firstMessageTime: null };
    console.log(`[Rate Limit] ✅ New user/day detected. IP: ${clientIp}, Date: ${today}`);
  }

  // Log current request count for debugging
  console.log(`[Rate Limit] 📊 IP: ${clientIp}, Current count: ${userRecord.count}/${dailyLimit}, Date: ${today}`);

  // Check if limit exceeded BEFORE incrementing
  if (userRecord.count >= dailyLimit) {
    console.log(`[Rate Limit] 🚫 BLOCKED - IP: ${clientIp} has reached daily limit of ${dailyLimit} messages`);
    const resetTime = new Date(today);
    resetTime.setDate(resetTime.getDate() + 1);
    resetTime.setHours(0, 0, 0, 0);
    
    return res.status(429).json({
      error: 'Daily limit reached',
      message: 'You have reached your daily limit of 4 messages. Please try again tomorrow.',
      limit: dailyLimit,
      resetDate: today,
      resetTime: resetTime.toISOString()
    });
  }

  // Increment count for this request and record first message time
  userRecord.count++;
  if (!userRecord.firstMessageTime) {
    userRecord.firstMessageTime = new Date().toISOString();
  }
  dailyLimitStore.set(clientIp, userRecord);
  console.log(`[Rate Limit] ✅ ALLOWED - IP: ${clientIp}, Count incremented to: ${userRecord.count}/${dailyLimit}`);
  
  // Allow the request
  next();
}

// Clean up old entries periodically (keep store size manageable)
// FIX: Run more frequently (hourly instead of daily)
setInterval(() => {
  const today = getTodayDateString();
  let deletedCount = 0;
  for (const [key, record] of dailyLimitStore.entries()) {
    if (record.date !== today) {
      dailyLimitStore.delete(key);
      deletedCount++;
    }
  }
  if (deletedCount > 0) {
    console.log(`[Rate Limit] Cleanup: Removed ${deletedCount} old entries.`);
  }
}, 60 * 60 * 1000); // Run once per hour

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
        temperature: 0.7, // Slightly higher for better understanding and more natural responses
        max_tokens: 800, // Increased for more detailed, comprehensive responses
        top_p: 0.95, // Higher nucleus sampling for better context understanding
        frequency_penalty: 0.2, // Reduced repetition
        presence_penalty: 0.2 // Encourages more diverse and contextual responses
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

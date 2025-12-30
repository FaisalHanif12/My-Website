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

app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting - 20 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all requests
app.use('/api/', limiter);

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
        temperature: 0.7,
        max_tokens: 500
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


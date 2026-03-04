const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - only allow your domains
const allowedOrigins = [
  'https://faisalhanif.work',
  'https://www.faisalhanif.work',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://localhost:5501',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5501'
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

// ─── Email transporter (lazily created so missing creds don't crash startup) ───
function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) throw new Error('EMAIL_USER or EMAIL_PASS not set in .env');
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr || dateStr === 'Not specified') return dateStr || 'Not specified';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch (_) { return dateStr; }
}

function parseTimes(raw) {
  if (!raw) return 'Not specified';
  try { if (raw.startsWith('[')) return JSON.parse(raw).join(', '); } catch (_) {}
  return raw;
}

// ─── HTML email builders ──────────────────────────────────────────────────────
function ownerEmailHtml(d) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body{margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif}
    .wrap{max-width:620px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1)}
    .hdr{background:linear-gradient(135deg,#0a4f42,#0e6655 50%,#10b981);padding:36px 40px;text-align:center}
    .hdr h1{color:#fff;margin:0;font-size:26px;font-weight:700}
    .hdr p{color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px}
    .body{padding:36px 40px}
    .badge{display:inline-block;background:#f0fdf4;color:#065f46;border:1px solid #bbf7d0;border-radius:20px;padding:6px 16px;font-size:13px;font-weight:600;margin-bottom:24px}
    table.details{width:100%;border-collapse:collapse;margin-bottom:24px}
    table.details td{padding:12px 14px;font-size:14px;border-bottom:1px solid #f1f5f9}
    table.details tr:last-child td{border-bottom:none}
    table.details .lbl{color:#6b7280;font-weight:600;width:40%;vertical-align:top}
    table.details .val{color:#1f2937;font-weight:500}
    .ftr{background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af}
  </style></head><body>
  <div class="wrap">
    <div class="hdr">
      <h1>📅 New Booking Received</h1>
      <p>A client just booked a session with you</p>
    </div>
    <div class="body">
      <span class="badge">Session ID: ${d.sessionId}</span>
      <table class="details">
        <tr><td class="lbl">👤 Client Name</td><td class="val">${d.clientName}</td></tr>
        <tr><td class="lbl">📧 Email</td><td class="val"><a href="mailto:${d.clientEmail}" style="color:#0e6655">${d.clientEmail}</a></td></tr>
        <tr><td class="lbl">📞 Phone</td><td class="val">${d.clientPhone || '—'}</td></tr>
        <tr><td class="lbl">🏢 Company</td><td class="val">${d.clientCompany || '—'}</td></tr>
        <tr><td class="lbl">🗂️ Session Type</td><td class="val">${d.sessionType}</td></tr>
        <tr><td class="lbl">⏱️ Duration</td><td class="val">${d.duration} × ${d.hours} session(s)</td></tr>
        <tr><td class="lbl">💰 Amount</td><td class="val">$${d.amount || '—'} (Optional)</td></tr>
        <tr><td class="lbl">📆 Date</td><td class="val">${d.formattedDate}</td></tr>
        <tr><td class="lbl">🕐 Time(s)</td><td class="val">${d.times}</td></tr>
        <tr><td class="lbl">🌍 Timezone</td><td class="val">${d.timezone}</td></tr>
        <tr><td class="lbl">📹 Platform</td><td class="val">${d.platform}</td></tr>
        <tr><td class="lbl">📝 Notes</td><td class="val">${d.sessionNotes || 'None'}</td></tr>
      </table>
      <p style="font-size:13px;color:#6b7280;margin:0">
        Remember to send the meeting link to the client at least <strong>30 minutes before</strong> the session.
      </p>
    </div>
    <div class="ftr">faisalhanif.work &nbsp;·&nbsp; Booking Notification</div>
  </div>
</body></html>`;
}

function clientEmailHtml(d) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body{margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif}
    .wrap{max-width:620px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1)}
    .hdr{background:linear-gradient(135deg,#0a4f42,#0e6655 50%,#10b981);padding:36px 40px;text-align:center}
    .hdr h1{color:#fff;margin:0;font-size:26px;font-weight:700}
    .hdr p{color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px}
    .body{padding:36px 40px}
    .greeting{font-size:15px;color:#374151;line-height:1.7;margin:0 0 28px}
    .badge{display:inline-block;background:#f0fdf4;color:#065f46;border:1px solid #bbf7d0;border-radius:20px;padding:6px 16px;font-size:13px;font-weight:600;margin-bottom:24px}
    table.details{width:100%;border-collapse:collapse;margin-bottom:24px}
    table.details td{padding:12px 14px;font-size:14px;border-bottom:1px solid #f1f5f9}
    table.details tr:last-child td{border-bottom:none}
    table.details .lbl{color:#6b7280;font-weight:600;width:40%;vertical-align:top}
    table.details .val{color:#1f2937;font-weight:500}
    .note{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 18px;margin-bottom:24px}
    .note p{margin:0;color:#065f46;font-size:14px;line-height:1.6}
    .contact{background:#f9fafb;border-radius:10px;padding:16px 18px;border:1px solid #e5e7eb}
    .contact p{margin:0;color:#6b7280;font-size:13px;line-height:1.7}
    .contact a{color:#0e6655;font-weight:600;text-decoration:none}
    .ftr{background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af}
    .ftr a{color:#0e6655;text-decoration:none}
  </style></head><body>
  <div class="wrap">
    <div class="hdr">
      <h1>&#x2705; Booking Confirmed!</h1>
      <p>Your session with Faisal Hanif is all set</p>
    </div>
    <div class="body">
      <p class="greeting">
        Hi <strong>${d.clientName}</strong>,<br><br>
        Thank you for booking a session! Your meeting has been confirmed and all the details are listed below.
        We look forward to connecting with you.
      </p>
      <span class="badge">Session ID: ${d.sessionId}</span>
      <table class="details">
        <tr><td class="lbl">&#x1F5C2;&#xFE0F; Session Type</td><td class="val">${d.sessionType}</td></tr>
        <tr><td class="lbl">&#x23F1;&#xFE0F; Duration</td><td class="val">${d.duration} &times; ${d.hours} session(s)</td></tr>
        <tr><td class="lbl">&#x1F4C6; Date</td><td class="val">${d.formattedDate}</td></tr>
        <tr><td class="lbl">&#x1F550; Time(s)</td><td class="val">${d.times}</td></tr>
        <tr><td class="lbl">&#x1F30D; Timezone</td><td class="val">${d.timezone}</td></tr>
        <tr><td class="lbl">&#x1F4F9; Platform</td><td class="val">${d.platform}</td></tr>
      </table>
      <div class="note">
        <p>
          &#x1F517; <strong>Meeting Link:</strong> Your ${d.platform} meeting link will be shared with you
          <strong>at least 30 minutes before</strong> the session start time via email.
          Please keep an eye on your inbox (and spam folder just in case).
        </p>
      </div>
      <div class="contact">
        <p>
          Have questions or need to reschedule? Feel free to reply to this email or reach out at
          <a href="mailto:mehrfaisal111@gmail.com">mehrfaisal111@gmail.com</a>.<br>
          Please mention your Session ID <strong>${d.sessionId}</strong> in any correspondence.
        </p>
      </div>
    </div>
    <div class="ftr">
      <a href="https://faisalhanif.work">faisalhanif.work</a> &nbsp;&middot;&nbsp; Faisal Hanif &ndash; Software Engineer &nbsp;&middot;&nbsp; Lahore, Pakistan
    </div>
  </div>
</body></html>`;
}

// ─── Booking endpoint ─────────────────────────────────────────────────────────
app.post('/api/booking', async (req, res) => {
  try {
    const {
      clientName, clientEmail, clientPhone, clientCompany,
      sessionType, sessionDate, sessionTimes, timezone,
      meetingMode, sessionNotes, duration, hours, amount,
      sessionId
    } = req.body;

    if (!clientEmail || !clientName || !sessionType) {
      return res.status(400).json({ error: 'Missing required fields: clientName, clientEmail, sessionType' });
    }

    const d = {
      clientName: clientName || '—',
      clientEmail: clientEmail || '—',
      clientPhone: clientPhone || '—',
      clientCompany: clientCompany || '—',
      sessionType: sessionType || '—',
      duration: duration || '30',
      hours: hours || '1',
      amount: amount || '—',
      formattedDate: formatDate(sessionDate),
      times: parseTimes(sessionTimes),
      timezone: timezone || 'Not specified',
      platform: meetingMode === 'zoom' ? 'Zoom' : 'Google Meet',
      sessionNotes: sessionNotes || 'None',
      sessionId: sessionId || ('SES-' + Date.now().toString().slice(-8))
    };

    let transporter;
    try {
      transporter = createTransporter();
      await transporter.verify();
    } catch (err) {
      console.error('[Booking] Email transporter error:', err.message);
      return res.status(503).json({
        error: 'Email service not configured. Please set EMAIL_USER and EMAIL_PASS in .env',
        hint: 'See env.example for setup instructions.'
      });
    }

    const ownerEmail = process.env.EMAIL_USER; // send from and to the same Gmail account

    // Send to owner
    await transporter.sendMail({
      from: `"Faisal Portfolio" <${ownerEmail}>`,
      to: ownerEmail,
      replyTo: d.clientEmail,
      subject: `📅 BOOKING: ${d.sessionType} – ${d.clientName}`,
      html: ownerEmailHtml(d)
    });
    console.log(`[Booking] ✅ Owner notification sent for session ${d.sessionId}`);

    // Send confirmation to client
    await transporter.sendMail({
      from: `"Faisal Hanif" <${ownerEmail}>`,
      to: d.clientEmail,
      replyTo: ownerEmail,
      subject: `✅ Booking Confirmed – ${d.sessionType} with Faisal Hanif`,
      html: clientEmailHtml(d)
    });
    console.log(`[Booking] ✅ Client confirmation sent to ${d.clientEmail}`);

    res.json({ success: true, message: 'Booking confirmed. Emails sent to both parties.', sessionId: d.sessionId });

  } catch (error) {
    console.error('[Booking] Error:', error);
    res.status(500).json({ error: 'Failed to send booking emails. Please try again.' });
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

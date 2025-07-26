const express = require('express');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Email configuration with SendGrid (more reliable than Gmail SMTP)
let transporter;
let emailMode = 'gmail'; // 'sendgrid', 'gmail', or 'console'

// Configure SendGrid API key (you'll need to set SENDGRID_API_KEY in .env)
if (process.env.SENDGRID_API_KEY && emailMode === 'sendgrid') {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  transporter = {
    sendMail: async (mailOptions) => {
      const msg = {
        to: mailOptions.to,
        from: process.env.EMAIL_USER || 'mehrfaisal111@gmail.com',
        subject: mailOptions.subject,
        html: mailOptions.html
      };
      
      try {
        const result = await sgMail.send(msg);
        console.log('SendGrid email sent successfully:', result[0].statusCode);
        return { messageId: 'sendgrid-' + Date.now() };
      } catch (error) {
        console.error('SendGrid error details:', {
          message: error.message,
          code: error.code,
          response: error.response?.body
        });
        throw error;
      }
    }
  };
  console.log('Email service configured with SendGrid API');
} else if (process.env.EMAIL_USER && process.env.EMAIL_PASS && emailMode === 'gmail') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    pool: true,
    maxConnections: 5,
    maxMessages: 10
  });
  console.log('Email transporter configured for Gmail with TLS on port 587');
} else {
  // Mock transporter for development/testing
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('\n=== EMAIL WOULD BE SENT ===');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Content: Email content prepared successfully');
      console.log('=== EMAIL SIMULATION COMPLETE ===\n');
      return { messageId: 'mock-' + Date.now() };
    }
  };
  console.log('Email service configured in CONSOLE MODE (emails will be logged)');
}

// Generate meeting link based on platform
function generateMeetingLink(platform, bookingData) {
  // Create a unique session identifier based on booking data
  const timestamp = Date.now();
  const sessionHash = Buffer.from(`${bookingData.clientEmail}-${bookingData.sessionDate}-${bookingData.sessionTime}-${timestamp}`).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
  
  if (platform === 'google-meet') {
    // Create a new Google Meet room (this will generate a valid meeting room)
    // Users will be able to join this room when the meeting starts
    return `https://meet.google.com/new`;
  } else if (platform === 'zoom') {
    // For Zoom, direct users to create a personal meeting room
    // In production, you would integrate with Zoom API to create scheduled meetings
    return `https://zoom.us/start/webmeeting`;
  }
  
  // Default to Google Meet
  return `https://meet.google.com/new`;
}

// Format date and time for email
function formatDateTime(date, time, timezone) {
  // Handle time format conversion (12:00 PM -> 12:00)
  let timeIn24Hour = time;
  if (time.includes('AM') || time.includes('PM')) {
    const [timePart, period] = time.split(' ');
    const [hours, minutes] = timePart.split(':');
    let hour24 = parseInt(hours);
    
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    timeIn24Hour = `${hour24.toString().padStart(2, '0')}:${minutes}`;
  }
  
  // Create proper ISO date string
  const meetingDate = new Date(`${date}T${timeIn24Hour}:00`);
  
  // Check if date is valid
  if (isNaN(meetingDate.getTime())) {
    // Fallback: return the original values if parsing fails
    return {
      date: date,
      time: time
    };
  }
  
  return {
    date: meetingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    time: meetingDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  };
}

// Email template for client
function getClientEmailTemplate(bookingData, meetingLink) {
  const sessionTime = Array.isArray(bookingData.sessionTimes) ? bookingData.sessionTimes[0] : bookingData.sessionTime;
  const { date, time } = formatDateTime(bookingData.sessionDate, sessionTime, bookingData.timezone);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0e6655, #10b981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .meeting-link { background: #0e6655; color: white; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .meeting-link a { color: white; text-decoration: none; font-weight: bold; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #0e6655; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Session Confirmed!</h1>
          <p>Your session with Faisal Hanif has been successfully booked</p>
        </div>
        
        <div class="content">
          <h2>Hello ${bookingData.clientName},</h2>
          <p>Thank you for booking a session! Your payment has been processed and your session is confirmed.</p>
          
          <div class="meeting-link">
            <h3>📅 Join Your Session</h3>
            <a href="${meetingLink}" target="_blank">Click here to join the meeting</a>
            <p style="margin: 10px 0 0 0; font-size: 14px;">Meeting Link: ${meetingLink}</p>
          </div>
          
          <div class="details">
            <h3>Session Details:</h3>
            <div class="detail-row">
              <span class="label">Session Type:</span>
              <span>${bookingData.sessionType}</span>
            </div>
            <div class="detail-row">
              <span class="label">Duration:</span>
              <span>${bookingData.duration}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span>${date}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span>${time} (${bookingData.timezone})</span>
            </div>
            <div class="detail-row">
              <span class="label">Platform:</span>
              <span>${bookingData.meetingMode === 'google-meet' ? 'Google Meet' : 'Zoom'}</span>
            </div>
            ${bookingData.sessionNotes ? `
            <div class="detail-row">
              <span class="label">Notes:</span>
              <span>${bookingData.sessionNotes}</span>
            </div>` : ''}
          </div>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>Please join the meeting 5 minutes before the scheduled time</li>
            <li>Ensure you have a stable internet connection</li>
            <li>Test your camera and microphone beforehand</li>
            <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
          </ul>
          
          <p>Looking forward to our session!</p>
          <p>Best regards,<br><strong>Faisal Hanif</strong></p>
        </div>
        
        <div class="footer">
          <p>If you have any questions, please reply to this email or contact us directly.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Email template for business owner
function getOwnerEmailTemplate(bookingData, meetingLink) {
  const sessionTime = Array.isArray(bookingData.sessionTimes) ? bookingData.sessionTimes[0] : bookingData.sessionTime;
  const { date, time } = formatDateTime(bookingData.sessionDate, sessionTime, bookingData.timezone);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0e6655, #10b981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .client-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #0e6655; }
        .meeting-link { background: #0e6655; color: white; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .meeting-link a { color: white; text-decoration: none; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Session Booked!</h1>
          <p>A client has booked a session with you</p>
        </div>
        
        <div class="content">
          <h2>Hello Faisal,</h2>
          <p>You have a new session booking! Here are the details:</p>
          
          <div class="client-info">
            <h3>Client Information:</h3>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span>${bookingData.clientName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span>${bookingData.clientEmail}</span>
            </div>
          </div>
          
          <div class="client-info">
            <h3>Session Details:</h3>
            <div class="detail-row">
              <span class="label">Session Type:</span>
              <span>${bookingData.sessionType}</span>
            </div>
            <div class="detail-row">
              <span class="label">Duration:</span>
              <span>${bookingData.duration}</span>
            </div>
            <div class="detail-row">
              <span class="label">Number of Sessions:</span>
              <span>${bookingData.numberOfSessions}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span>${date}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span>${time} (${bookingData.timezone})</span>
            </div>
            <div class="detail-row">
              <span class="label">Platform:</span>
              <span>${bookingData.meetingMode === 'google-meet' ? 'Google Meet' : 'Zoom'}</span>
            </div>
            ${bookingData.sessionNotes ? `
            <div class="detail-row">
              <span class="label">Client Notes:</span>
              <span>${bookingData.sessionNotes}</span>
            </div>` : ''}
          </div>
          
          <div class="meeting-link">
            <h3>📅 Meeting Link</h3>
            <a href="${meetingLink}" target="_blank">${meetingLink}</a>
          </div>
          
          <p><strong>Action Items:</strong></p>
          <ul>
            <li>Add this session to your calendar</li>
            <li>Prepare any materials needed for the session</li>
            <li>Test the meeting link before the session</li>
            <li>Send a reminder email to the client 24 hours before (optional)</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('Request body:', req.body);
  }
  next();
});

// API endpoint to handle booking
app.post('/api/book-session', async (req, res) => {
  console.log('Booking endpoint hit with data:', req.body);
  try {
    const bookingData = req.body;
    
    // Generate meeting link
    const meetingLink = generateMeetingLink(bookingData.meetingMode, bookingData);
    
    // Email to client
    const clientMailOptions = {
      from: process.env.EMAIL_USER || 'mehrfaisal111@gmail.com',
      to: bookingData.clientEmail,
      subject: `Session Confirmed - ${bookingData.sessionType} with Faisal Hanif`,
      html: getClientEmailTemplate(bookingData, meetingLink)
    };
    
    // Email to business owner
    const ownerMailOptions = {
      from: process.env.EMAIL_USER || 'mehrfaisal111@gmail.com',
      to: 'mehrfaisal111@gmail.com',
      subject: `New Session Booking - ${bookingData.clientName}`,
      html: getOwnerEmailTemplate(bookingData, meetingLink)
    };
    
    // Send response immediately and handle emails asynchronously for better performance
    res.json({ 
      success: true, 
      message: 'Session booked successfully!',
      meetingLink: meetingLink
    });
    
    // Send emails asynchronously (non-blocking)
    Promise.all([
      transporter.sendMail(clientMailOptions).catch(err => {
        console.warn('Client email failed:', err.message);
        return { error: 'Client email failed' };
      }),
      transporter.sendMail(ownerMailOptions).catch(err => {
        console.warn('Owner email failed:', err.message);
        return { error: 'Owner email failed' };
      })
    ]).then(results => {
      const clientResult = results[0];
      const ownerResult = results[1];
      
      if (clientResult.error || ownerResult.error) {
        console.log('Some emails failed to send, but booking was successful');
      } else {
        console.log('All emails sent successfully');
      }
    }).catch(err => {
      console.warn('Email sending process failed:', err.message);
    });
    
  } catch (error) {
    console.error('Error booking session:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to book session. Please try again.' 
    });
  }
});

// Handle API routes for /My-Website/ prefix
app.post('/My-Website/api/book-session', async (req, res) => {
  console.log('Booking endpoint hit via /My-Website/ prefix with data:', req.body);
  try {
    const bookingData = req.body;
    
    // Generate meeting link
    const meetingLink = generateMeetingLink(bookingData.meetingMode, bookingData);
    
    // Email to client
    const clientMailOptions = {
      from: process.env.EMAIL_USER || 'mehrfaisal111@gmail.com',
      to: bookingData.clientEmail,
      subject: `Session Confirmed - ${bookingData.sessionType} with Faisal Hanif`,
      html: getClientEmailTemplate(bookingData, meetingLink)
    };
    
    // Email to business owner
    const ownerMailOptions = {
      from: process.env.EMAIL_USER || 'mehrfaisal111@gmail.com',
      to: 'mehrfaisal111@gmail.com',
      subject: `New Session Booking - ${bookingData.clientName}`,
      html: getOwnerEmailTemplate(bookingData, meetingLink)
    };
    
    // Send response immediately and handle emails asynchronously for better performance
    res.json({ 
      success: true, 
      message: 'Session booked successfully!',
      meetingLink: meetingLink
    });
    
    // Send emails asynchronously (non-blocking)
    Promise.all([
      transporter.sendMail(clientMailOptions).catch(err => {
        console.warn('Client email failed:', err.message);
        return { error: 'Client email failed' };
      }),
      transporter.sendMail(ownerMailOptions).catch(err => {
        console.warn('Owner email failed:', err.message);
        return { error: 'Owner email failed' };
      })
    ]).then(results => {
      const clientResult = results[0];
      const ownerResult = results[1];
      
      if (clientResult.error || ownerResult.error) {
        console.log('Some emails failed to send, but booking was successful');
      } else {
        console.log('All emails sent successfully');
      }
    }).catch(err => {
      console.warn('Email sending process failed:', err.message);
    });
    
  } catch (error) {
    console.error('Error booking session:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to book session. Please try again.' 
    });
  }
});

// Handle /My-Website/ prefix routes for static files
app.get('/My-Website/*', (req, res) => {
  const fileName = req.params[0];
  const filePath = path.join(__dirname, fileName);
  res.sendFile(filePath);
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view your website`);
});
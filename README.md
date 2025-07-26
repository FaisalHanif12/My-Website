# Custom Booking System with Email Integration

This project features a custom booking system that replaces the default Calendly integration with a beautiful, intuitive design. The system includes email notifications for both clients and the business owner.

## Features

✅ **Custom Booking Form**
- Multi-step booking process
- Email collection
- Date and time selection (Monday-Friday, 9 AM-9 PM)
- Timezone selection
- Meeting platform choice (Google Meet or Zoom)
- Additional notes field

✅ **Email Integration**
- Automatic email notifications to clients with meeting details
- Business owner notifications with client information
- Professional HTML email templates
- Meeting link generation

✅ **Beautiful UI/UX**
- Modern, responsive design
- Smooth animations and transitions
- Mobile-friendly interface
- Professional styling

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Email Settings

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Set up Gmail App Password:
   - Go to your Google Account settings
   - Enable 2-Factor Authentication
   - Navigate to Security > App passwords
   - Generate a new app password for this application
   - Copy the 16-character password (without spaces)

3. Update the `.env` file:
   ```env
   EMAIL_USER=mehrfaisal111@gmail.com
   EMAIL_PASS=your_16_character_app_password_here
   PORT=3001
   ```

### 3. Start the Server
```bash
node server.js
```

The server will start on `http://localhost:3001`

## How It Works

### Booking Process
1. **Payment**: Client completes payment on the payment page
2. **Success**: Payment success page shows "Book Session" button
3. **Step 1**: Client enters email and full name
4. **Step 2**: Client selects date, time, and timezone
5. **Step 3**: Client chooses meeting platform and adds notes
6. **Confirmation**: System sends emails and shows success page

### Email Notifications

**Client Email Includes:**
- Meeting link (Google Meet or Zoom)
- Session details (type, duration, date, time)
- Professional formatting with instructions
- Contact information

**Business Owner Email Includes:**
- Client information (name, email)
- Session details
- Meeting link
- Action items and reminders

### Meeting Link Generation
- **Google Meet**: Generates meet.google.com links
- **Zoom**: Generates zoom.us meeting links
- Links are unique for each session

## File Structure

```
├── server.js              # Node.js server with email integration
├── payment.html           # Main payment and booking page
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (create from .env.example)
├── .env.example          # Environment variables template
└── README.md             # This file
```

## API Endpoints

### POST `/api/book-session`
Books a session and sends email notifications.

**Request Body:**
```json
{
  "clientEmail": "client@example.com",
  "clientName": "John Doe",
  "sessionDate": "2024-01-15",
  "sessionTime": "14:00",
  "timezone": "America/New_York",
  "meetingMode": "google-meet",
  "sessionNotes": "Optional notes",
  "sessionType": "Technical Deep Dive",
  "duration": "60 minutes",
  "numberOfSessions": "1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session booked successfully and emails sent!",
  "meetingLink": "https://meet.google.com/session-id"
}
```

## Customization

### Email Templates
Email templates are defined in `server.js`:
- `getClientEmailTemplate()` - Client notification email
- `getOwnerEmailTemplate()` - Business owner notification email

### Styling
All styles are contained within `payment.html` in the `<style>` section. Key classes:
- `.booking-container` - Main booking form container
- `.form-step` - Individual form steps
- `.meeting-option` - Meeting platform selection
- `.booking-success` - Success page styling

### Time Slots
Time slots are generated in the `generateTimeSlots()` function (9 AM - 9 PM).

## Troubleshooting

### Email Not Sending
1. Verify Gmail App Password is correct
2. Ensure 2FA is enabled on Gmail account
3. Check `.env` file configuration
4. Review server logs for error messages

### Server Not Starting
1. Ensure all dependencies are installed: `npm install`
2. Check if port 3001 is available
3. Verify Node.js version compatibility

### Booking Form Issues
1. Check browser console for JavaScript errors
2. Ensure server is running and accessible
3. Verify API endpoint is responding

## Production Deployment

1. Set up a production email service (SendGrid, Mailgun, etc.)
2. Configure environment variables for production
3. Set up SSL certificates
4. Use a process manager like PM2
5. Configure reverse proxy (Nginx)

## Support

For issues or questions, please contact: mehrfaisal111@gmail.com

---

**Note**: Remember to replace the Gmail App Password in the `.env` file with your actual password before using the email functionality.
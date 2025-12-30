# Backend Proxy Setup Guide for Ubuntu VPS

This guide will help you set up the chatbot proxy backend on your Hostinger VPS running Ubuntu.

## Prerequisites

- Ubuntu VPS (Hostinger)
- SSH access to your VPS
- Domain: faisalhanif.work (already configured)

## Step 1: Install Node.js

```bash
# Update package list
sudo apt update

# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 2: Create Application Directory

```bash
# Create app directory
sudo mkdir -p /var/www/chatbot-proxy
sudo chown $USER:$USER /var/www/chatbot-proxy

# Navigate to directory
cd /var/www/chatbot-proxy
```

## Step 3: Upload Backend Files

Upload the following files to `/var/www/chatbot-proxy/`:
- `server.js`
- `package.json`
- `env.example` (reference file)

You can use:
- **SCP**: `scp -r backend/* user@your-vps-ip:/var/www/chatbot-proxy/`
- **SFTP**: Use FileZilla or similar
- **Git**: Clone your repo and copy files

## Step 4: Install Dependencies

```bash
cd /var/www/chatbot-proxy
npm install
```

## Step 5: Configure Environment Variables

```bash
# Create .env file from example (or create manually)
cp env.example .env

# Edit .env file
nano .env
```

Add your OpenRouter API configuration:
```
OPENROUTER_API_KEY=sk-or-v1-0a856fc6f0ac16842650ddd48fa5dd685fd331
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
OPENROUTER_MODEL=openai/gpt-4o-mini
PORT=3000
NODE_ENV=production
```

**Replace `sk-or-v1-0a856fc6f0ac16842650ddd48fa5dd685fd331` with your actual API key!**
**The `OPENROUTER_API_URL` should match your OpenRouter API endpoint.**

Save and exit (Ctrl+X, then Y, then Enter).

**IMPORTANT**: Never commit `.env` to git or expose it publicly! The `.env` file is already in `.gitignore`.

## Step 6: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the application
cd /var/www/chatbot-proxy
pm2 start server.js --name chatbot-proxy

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions shown (usually run a sudo command)
```

## Step 7: Configure Nginx Reverse Proxy

```bash
# Edit your Nginx configuration
sudo nano /etc/nginx/sites-available/faisalhanif.work
```

Add the following location block inside your server block (or use the provided `nginx.conf`):

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

Test Nginx configuration:
```bash
sudo nginx -t
```

Reload Nginx:
```bash
sudo systemctl reload nginx
```

## Step 8: Setup SSL with Certbot (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d faisalhanif.work -d www.faisalhanif.work

# Certbot will automatically configure Nginx for HTTPS
# Follow the prompts and choose to redirect HTTP to HTTPS
```

## Step 9: Verify Setup

1. **Check PM2 status**:
   ```bash
   pm2 status
   pm2 logs chatbot-proxy
   ```

2. **Test health endpoint**:
   ```bash
   curl http://localhost:3000/health
   ```

3. **Test API endpoint** (from your local machine):
   ```bash
   curl -X POST https://faisalhanif.work/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello"}'
   ```

## Useful PM2 Commands

```bash
# View logs
pm2 logs chatbot-proxy

# Restart application
pm2 restart chatbot-proxy

# Stop application
pm2 stop chatbot-proxy

# Monitor application
pm2 monit
```

## Troubleshooting

### Port 3000 already in use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process or change PORT in .env
```

### Nginx 502 Bad Gateway
- Check if Node.js app is running: `pm2 status`
- Check Node.js logs: `pm2 logs chatbot-proxy`
- Verify proxy_pass URL matches your PORT in .env

### CORS errors
- Verify your domain is in `allowedOrigins` in `server.js`
- Check browser console for exact CORS error

### API key errors
- Verify `.env` file exists and has correct key
- Check file permissions: `ls -la .env`
- Restart PM2: `pm2 restart chatbot-proxy`

## Security Checklist

- ✅ API key stored in `.env` (not in code)
- ✅ `.env` added to `.gitignore`
- ✅ CORS restricted to your domains
- ✅ Rate limiting enabled (20 requests per 15 minutes)
- ✅ SSL/HTTPS configured (via Certbot)
- ✅ PM2 running as non-root user
- ✅ Nginx reverse proxy configured

## Maintenance

To update the backend code:
```bash
cd /var/www/chatbot-proxy
# Upload new files
pm2 restart chatbot-proxy
pm2 logs chatbot-proxy  # Check for errors
```


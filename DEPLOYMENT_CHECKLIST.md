# Quick Deployment Checklist

## ✅ Pre-Deployment Verification

- [ ] API key removed from `js/config.js`
- [ ] Frontend calls `/api/chat` instead of direct API
- [ ] `.gitignore` includes `.env`
- [ ] Backend files created in `backend/` folder

## 🚀 VPS Backend Setup (One-time)

- [ ] SSH into your VPS
- [ ] Install Node.js 18.x
- [ ] Create `/var/www/chatbot-proxy` directory
- [ ] Upload `backend/server.js` and `backend/package.json`
- [ ] Run `npm install` in `/var/www/chatbot-proxy`
- [ ] Create `.env` file with your API key (see `backend/env.example`)
- [ ] Install PM2: `npm install -g pm2`
- [ ] Start backend: `pm2 start server.js --name chatbot-proxy`
- [ ] Save PM2 config: `pm2 save` and `pm2 startup`
- [ ] Configure Nginx to proxy `/api/` to `http://127.0.0.1:3000`
- [ ] Test: `curl http://localhost:3000/health`
- [ ] Setup SSL with Certbot (recommended)

## 📤 Static Files Upload (Hostinger)

- [ ] Upload updated `index.html` (no API key)
- [ ] Upload updated `js/config.js` (no API key)
- [ ] Upload all other static files (CSS, images, etc.)
- [ ] **DO NOT** upload `backend/` folder or `.env` files

## 🧪 Post-Deployment Testing

- [ ] Visit `https://faisalhanif.work`
- [ ] Open browser console (F12)
- [ ] Click chat button
- [ ] Send a test message
- [ ] Verify response appears
- [ ] Check console for any errors
- [ ] Test from different device/browser

## 🔍 Troubleshooting

If chatbot doesn't work:

1. **Check backend is running:**
   ```bash
   pm2 status
   pm2 logs chatbot-proxy
   ```

2. **Test backend directly:**
   ```bash
   curl -X POST http://localhost:3000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"test"}'
   ```

3. **Check Nginx proxy:**
   ```bash
   sudo nginx -t
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Verify .env file:**
   ```bash
   cat /var/www/chatbot-proxy/.env
   # Should show OPENROUTER_API_KEY=sk-or-v1-...
   ```

5. **Check browser console** for CORS or network errors

## 📝 Important Reminders

- ✅ API key is ONLY in `backend/.env` on VPS (never in frontend)
- ✅ Static files go to Hostinger (no backend code)
- ✅ Backend runs on VPS at port 3000
- ✅ Nginx proxies `/api/chat` to backend
- ✅ All chatbot UI/UX remains the same

## 🔐 Security Checklist

- [x] API key removed from frontend code
- [x] `.env` in `.gitignore`
- [x] CORS restricted to your domains
- [x] Rate limiting enabled (20 req/15min)
- [x] SSL/HTTPS configured
- [x] Backend runs as non-root user


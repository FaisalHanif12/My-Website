// PM2 process file for the API on the VPS. Start it with:
//   cd /var/www/faisal-portfolio/backend && npm ci && npm run build
//   pm2 start deploy/ecosystem.config.cjs && pm2 save
// Secrets stay in backend/.env (never in this file).
module.exports = {
  apps: [
    {
      name: 'faisal-portfolio-api',
      cwd: __dirname + '/..',
      script: 'dist/server.js',
      node_args: '--enable-source-maps',
      instances: 1, // one process: rate limits, slot locks and idempotency live in memory
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '300M',
      kill_timeout: 12000, // the server drains requests for up to 10 seconds on SIGTERM
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: '8787',
        TRUST_PROXY: '1',
      },
    },
  ],
};

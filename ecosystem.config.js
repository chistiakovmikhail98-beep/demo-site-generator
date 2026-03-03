// PM2 configuration for FitWebAI
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'next-app',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/next-error.log',
      out_file: './logs/next-out.log',
      merge_logs: true,
    },
    {
      name: 'worker',
      script: 'worker/dist/index.js',
      cwd: './',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '256M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/worker-error.log',
      out_file: './logs/worker-out.log',
      merge_logs: true,
      // Restart on crash with exponential backoff
      restart_delay: 5000,
      max_restarts: 10,
    },
  ],
};

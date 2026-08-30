const path = require('path');

module.exports = {
  apps: [{
    name: 'djamsante-api',
    script: path.join(__dirname, 'scripts/start-api.sh'),
    interpreter: 'bash',
    cwd: __dirname,
    exec_mode: 'fork',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    min_uptime: 3000,
    max_restarts: 15,
    env: {
      NODE_ENV: 'production',
    },
    error_file: path.join(__dirname, 'logs/pm2-error.log'),
    out_file: path.join(__dirname, 'logs/pm2-out.log'),
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }],
};

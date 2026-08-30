const path = require('path');

module.exports = {
  apps: [{
    name: 'djamsante-api',
    script: path.join(__dirname, 'index.js'),
    cwd: __dirname,
    node_args: '--use-system-ca',
    exec_mode: 'fork',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
    },
    error_file: path.join(__dirname, 'logs/pm2-error.log'),
    out_file: path.join(__dirname, 'logs/pm2-out.log'),
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }],
};

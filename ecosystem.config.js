const path = require('path');

/** Par défaut : 1 processus fork (stable sur VPS 2 Go). Cluster via PM2_INSTANCES=2|max */
const instances = process.env.PM2_INSTANCES || '1';
const useCluster = instances !== '1' && instances !== 'fork';

module.exports = {
  apps: [{
    name: 'djamsante-api',
    script: path.join(__dirname, 'index.js'),
    cwd: __dirname,
    exec_mode: useCluster ? 'cluster' : 'fork',
    instances: useCluster ? instances : 1,
    autorestart: true,
    watch: false,
    max_memory_restart: process.env.PM2_MAX_MEMORY || '512M',
    kill_timeout: 5000,
    listen_timeout: 10000,
    env: {
      NODE_ENV: 'production',
    },
    error_file: path.join(__dirname, 'logs/pm2-error.log'),
    out_file: path.join(__dirname, 'logs/pm2-out.log'),
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }],
};

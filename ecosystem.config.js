const path = require('path');
const os = require('os');

const instances = process.env.PM2_INSTANCES || 'max';
const resolvedInstances = instances === 'max' ? os.cpus().length : parseInt(instances, 10) || 1;
const useCluster = resolvedInstances > 1 || instances === 'max';

module.exports = {
  apps: [{
    name: 'djamsante-api',
    script: path.join(__dirname, 'index.js'),
    cwd: __dirname,
    exec_mode: useCluster ? 'cluster' : 'fork',
    instances: useCluster ? instances : 1,
    autorestart: true,
    watch: false,
    max_memory_restart: process.env.PM2_MAX_MEMORY || '768M',
    env: {
      NODE_ENV: 'production',
    },
    error_file: path.join(__dirname, 'logs/pm2-error.log'),
    out_file: path.join(__dirname, 'logs/pm2-out.log'),
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }],
};

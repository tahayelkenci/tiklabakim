/**
 * PM2 Ecosystem Config — Tıkla Bakım
 * Kullanım:
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [
    {
      name: 'tiklabakim',
      script: '.next/standalone/server.js',
      cwd: '/home/tiklabakimcom/tiklabakim',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      watch: false,
      max_memory_restart: '500M',
    },
  ],
}

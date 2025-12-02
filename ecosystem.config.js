module.exports = {
  apps: [{
    name: 'workb',
    script: '.next/standalone/server.js',
    cwd: '/var/www/workb-cms',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3200,
      HOSTNAME: '0.0.0.0'
    },
    // Load .env file automatically
    node_args: '-r dotenv/config',
    env_file: '.env'
  }]
}

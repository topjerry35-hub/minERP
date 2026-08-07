import { spawn } from 'child_process';

console.log('====================================================');
console.log('🚀 Starting minERP Enterprise Ecosystem:');
console.log('1. PostgreSQL REST & JWT Server (Port 5005)');
console.log('2. Vite Frontend Web App');
console.log('====================================================');

const backend = spawn('node', ['server/server.js'], { stdio: 'inherit', shell: true });
const frontend = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });

function cleanup() {
  console.log('\n🛑 Shutting down minERP servers...');
  backend.kill();
  frontend.kill();
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

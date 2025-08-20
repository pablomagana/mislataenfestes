// Temporary server wrapper to run Vite development server
// This bridges the gap between old package.json config and new static setup

import { spawn } from 'child_process';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  console.log('Starting Vite development server...');
  
  // Start Vite dev server
  const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '3000'], {
    cwd: path.join(process.cwd(), 'client'),
    stdio: 'inherit',
    shell: true
  });

  viteProcess.on('error', (error) => {
    console.error('Failed to start Vite server:', error);
    process.exit(1);
  });

  viteProcess.on('close', (code) => {
    console.log(`Vite server exited with code ${code}`);
    process.exit(code || 0);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    viteProcess.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('Shutting down...');
    viteProcess.kill('SIGTERM');
  });
} else {
  console.log('Production mode not implemented - use static hosting');
  process.exit(1);
}
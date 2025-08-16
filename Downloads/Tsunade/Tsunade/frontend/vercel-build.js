#!/usr/bin/env node

// Custom build script for Vercel to bypass permission issues
const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.CI = 'false';
process.env.NODE_ENV = 'production';

// Run the build command directly
const buildProcess = spawn('npx', ['react-scripts', 'build'], {
  stdio: 'inherit',
  cwd: __dirname,
  env: process.env
});

buildProcess.on('close', (code) => {
  console.log(`Build process exited with code ${code}`);
  process.exit(code);
});

buildProcess.on('error', (error) => {
  console.error('Build process error:', error);
  process.exit(1);
});
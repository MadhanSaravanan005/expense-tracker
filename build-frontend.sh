#!/bin/bash
echo "Building frontend for deployment..."
cd frontend
npm install
npm run build
echo "Frontend build completed!"
ls -la build/
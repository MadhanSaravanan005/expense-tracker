#!/bin/bash
echo "Building full application..."
echo "Installing backend dependencies..."
npm install

echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Build completed successfully!"
echo "Backend: Ready"
echo "Frontend: Built to frontend/build/"
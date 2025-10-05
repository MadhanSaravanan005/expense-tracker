# Multi-stage build for React app
FROM node:18-alpine as frontend-build

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Clean npm cache and install dependencies
RUN npm cache clean --force && \
    npm ci --silent || npm install --silent

# Copy frontend source code
COPY frontend/ ./

# Build the React app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci --production --silent

# Copy backend source
COPY backend/ ./backend/

# Copy backend source
COPY backend/ ./backend/

# Copy the built frontend from the previous stage
COPY --from=frontend-build /app/frontend/build ./public

# List the contents of public directory for debugging
RUN echo "Contents of public directory:" && ls -la ./public/ || echo "Public directory is empty"

# Create .env file in production
RUN echo "NODE_ENV=production" > .env

# Show final directory structure
RUN echo "Final app directory structure:" && find . -maxdepth 3 -type f | head -20

EXPOSE 5000

# Use explicit path to ensure we're running the right file
CMD ["node", "./backend/server.js"]
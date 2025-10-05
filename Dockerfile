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

# Copy and install backend dependencies
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies with fallback
RUN npm cache clean --force && \
    (npm ci --silent || npm install --silent) && \
    cd backend && \
    (npm ci --silent || npm install --silent)

# Copy backend source
COPY backend/ ./backend/

# Copy the built frontend from the previous stage
COPY --from=frontend-build /app/frontend/build ./public

# List the contents of public directory for debugging
RUN echo "Contents of public directory:" && ls -la ./public/ || echo "Public directory is empty"

# Create .env file in production
RUN echo "NODE_ENV=production" > .env

EXPOSE 5000

CMD ["node", "backend/server.js"]
# Use official Node.js 20 slim image (small size, production-ready)
FROM node:20-slim

# Set working directory inside the container
WORKDIR /app

# Copy package files first (Docker cache optimization)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

# App listens on port 3000
EXPOSE 3000

# Health check (Kubernetes readiness probe)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode===200?0:1))"

# Start the server
CMD ["node", "server.js"]

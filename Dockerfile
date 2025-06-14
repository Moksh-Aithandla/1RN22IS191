# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package files (we don't need package.json for pure Node.js, but keeping for compatibility)
COPY package-pure.json ./package.json

# Copy application files
COPY server-pure.js ./
COPY test-pure.js ./
COPY README.md ./
COPY API-TESTING-GUIDE.md ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 9876

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
    const req = http.request({hostname: 'localhost', port: 9876, path: '/health', timeout: 2000}, (res) => { \
        if (res.statusCode === 200) { console.log('Health check passed'); process.exit(0); } \
        else { console.log('Health check failed'); process.exit(1); } \
    }); \
    req.on('error', () => { console.log('Health check error'); process.exit(1); }); \
    req.end();"

# Start the application
CMD ["node", "server-pure.js"]
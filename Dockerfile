FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only (plus esbuild/typescript for build step if needed)
# Actually, since we need to build the frontend, we'll install all dependencies, build, then prune.
RUN npm install

# Copy source code
COPY . .

# Build the frontend and backend bundle
RUN npm run build

# Expose port (Render sets PORT env variable, defaulting to 3000)
EXPOSE 3000

# Start the application using the bundled server
CMD ["node", "dist/server.js"]

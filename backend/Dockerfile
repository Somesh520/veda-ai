FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (only production deps if possible, but tsc requires devDependencies)
# We will install all for build
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Expose backend port
EXPOSE 5001

# Start the server
CMD ["npm", "start"]
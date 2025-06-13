FROM node:20-slim

WORKDIR /pdf-merger

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Install serve to run the production build
RUN npm install -g serve

# Expose port 3000
EXPOSE 3100

# Start the production server
CMD ["serve", "-s", "dist", "-l", "3000"] 
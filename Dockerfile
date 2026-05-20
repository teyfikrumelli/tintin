# Stage 1: Build the Vite React application
FROM node:20-alpine as builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application source code
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built assets from the builder stage to Nginx's default public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: Add a custom Nginx configuration if you implement React Router in the future
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the host
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]

# Use Node.js 22 LTS (compatible with sharp)
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose the application port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]




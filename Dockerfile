# Use the official Node.js image from the Docker Hub
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm ci

# Copy the rest of the application files to the container
COPY . .

# Expose the port your app runs on (if applicable, for your bot it's not strictly necessary, but for other apps it could be)
EXPOSE 3000

# Command to start the Telegram bot
CMD ["npm", "start"]

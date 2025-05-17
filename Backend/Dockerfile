FROM node:18-alpine

# Set the working directory

WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY package*.json ./

EXPOSE 3001

CMD ["npm", "run", "server"]
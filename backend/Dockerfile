FROM node:18-slim

WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy source
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads

ENV NODE_ENV=production
EXPOSE 5000

CMD [ "node", "server.js" ]

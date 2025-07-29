# Backend Dockerfile for Agent Floris
#
# This image builds and runs the Node.js backend for the Agent Floris
# application. It installs production dependencies only and exposes port 5000.

FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "app.js"]
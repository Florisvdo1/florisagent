# Frontend Dockerfile for Agent Floris
#
# This image builds the Next.js frontend for the Agent Floris application
# and runs it in production mode. The production build is generated at build
# time using `next build`, then served with `next start`.

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./next.config.js
EXPOSE 3000
CMD ["npm", "start"]
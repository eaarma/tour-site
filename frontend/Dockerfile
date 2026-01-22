# =========================
# 1️⃣ Build stage
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
RUN npm run build



# =========================
# 2️⃣ Runtime stage
# =========================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user (security best practice)
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001

# Copy only required files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./

RUN mkdir -p /app/.next/cache/images \
 && chown -R nextjs:nodejs /app/.next/cache

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]

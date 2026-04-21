FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --frozen-lockfile

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/out ./out
COPY --from=builder /app/public ./public 2>/dev/null || true

RUN npm install -g serve

USER nextjs

EXPOSE 3000

CMD ["serve", "-s", "out", "-l", "3000"]

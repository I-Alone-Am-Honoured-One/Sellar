FROM node:22-alpine
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --frozen-lockfile=false
RUN pnpm --filter @sellar/web build
CMD ["pnpm","--filter","@sellar/web","start"]

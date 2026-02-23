FROM node:22-alpine
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --frozen-lockfile=false
RUN pnpm --filter @sellar/api build
CMD ["pnpm","--filter","@sellar/api","start"]

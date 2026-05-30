FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm \
	PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM deps AS dev
ENV NODE_ENV=development
COPY . .
EXPOSE 5000
CMD ["pnpm", "dev"]

FROM base AS build
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build && pnpm store prune

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
	PORT=5000
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate && apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts && pnpm store prune && rm -f package.json pnpm-lock.yaml
COPY --from=build /app/dist ./dist
COPY database ./database
COPY uploads ./uploads
RUN chown -R node:node /app
USER node
EXPOSE 5000
CMD ["node", "dist/scripts/start.js"]
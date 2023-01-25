FROM node:18-alpine as builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json .
COPY pnpm-lock.yaml .
RUN pnpm i --frozen-lockfile
COPY . .
RUN pnpm build
RUN pnpm prune --prod

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "build", "--experimental-modules"]

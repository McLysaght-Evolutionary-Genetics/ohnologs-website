FROM node:18-alpine as builder
WORKDIR /app
ARG DATABASE_URL
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json .
COPY pnpm-lock.yaml .
RUN pnpm i --frozen-lockfile
COPY . .
RUN pnpm build
RUN pnpm prune --prod

FROM node:18-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/prisma prisma/
COPY --from=builder /app/startup.ash startup.ash
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production

CMD ["ash", "startup.ash"]

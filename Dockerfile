FROM node:24 AS builder
ARG DATABASE_URL
WORKDIR /app
RUN corepack enable
COPY package.json .
COPY pnpm-lock.yaml .
RUN pnpm i --no-frozen-lockfile
COPY . .
RUN pnpm build

FROM node:24
WORKDIR /app
RUN corepack enable
RUN wget https://github.com/bbuchfink/diamond/releases/download/v2.1.12/diamond-linux64.tar.gz
RUN tar -xzf diamond-linux64.tar.gz
RUN mv diamond /usr/bin
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/prisma prisma/
COPY --from=builder /app/startup.bash startup.bash
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production

# entry point
CMD ["sh", "startup.sh"]

FROM node:24 AS builder
ARG DATABASE_URL
WORKDIR /app
RUN corepack enable
COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
RUN pnpm i --no-frozen-lockfile
COPY . .
RUN pnpm build

FROM node:24 AS diamond
WORKDIR /app
RUN apt update
RUN apt -y install build-essential
RUN apt -y install cmake
RUN apt -y install zlib1g-dev
RUN apt -y install libsqlite3-dev
RUN cmake --version
RUN git clone https://github.com/bbuchfink/diamond
WORKDIR /app/diamond
RUN cmake .
RUN make -j 4

FROM node:24
WORKDIR /app
RUN corepack enable
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/prisma prisma/
COPY --from=builder /app/startup.sh startup.sh
COPY --from=diamond /app/diamond/diamond /usr/bin
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production

# entry point
CMD ["sh", "startup.sh"]

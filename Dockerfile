FROM node:18-alpine as builder

# env
ARG DATABASE_URL

# install diamond build deps
RUN apk update
RUN apk add git cmake make g++ zlib-dev

# build diamond
RUN git clone -b v0.9.36 https://github.com/bbuchfink/diamond
WORKDIR /diamond/build
RUN cmake ..
RUN make

# install app build deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json .
COPY pnpm-lock.yaml .
# COPY .npmrc .
RUN pnpm i --frozen-lockfile
COPY . .

# build app
RUN pnpm build
RUN pnpm prune --prod

FROM node:18-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=builder /diamond/build/diamond /usr/bin/
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/prisma prisma/
COPY --from=builder /app/startup.ash startup.ash
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production/

# entry point
CMD ["ash", "startup.ash"]

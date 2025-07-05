FROM node:22 as builder

# env
ARG DATABASE_URL

# install app build deps
WORKDIR /app
COPY package.json .
COPY pnpm-lock.yaml .
# COPY .npmrc .
RUN npm i -g pnpm
RUN pnpm i --no-frozen-lockfile
COPY . .

# build app
RUN pnpm build
RUN pnpm prune --prod

FROM node:22
WORKDIR /app
RUN wget https://github.com/bbuchfink/diamond/releases/download/v2.1.12/diamond-linux64.tar.gz
RUN tar -xzf diamond-linux64.tar.gz
RUN mv diamond /usr/bin
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/prisma prisma/
COPY --from=builder /app/startup.bash startup.bash
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production/

# entry point
CMD ["bash", "startup.bash"]

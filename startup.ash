#! /bin/ash

pnpm prisma migrate
node ./build

#! /bin/ash

pnpm prisma migrate deploy
node ./build

#! /bin/bash

pnpm prisma migrate deploy
node ./build

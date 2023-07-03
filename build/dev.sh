#!/bin/sh

set -e
set -x

tsc --watch --preserveWatchOutput &
node ./build/build.mjs --clean --dev
nodemon -w ./dist/server/server.js -- ./dist/server/server.js &
node ./build/build.mjs --watch --dev

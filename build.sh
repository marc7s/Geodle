#!/usr/bin/env bash

if [[ "$1" == *"-dev"* ]]; then
    tsx src/logDebugOptimizations.ts
fi

TIMEFORMAT='Build time: %0lR'
time npm run $1

#!/bin/sh
set -x

## If no args supplied sleep time defaults to 5 seconds.
if [[ ${#} -eq 0 ]]
then
SLEEP=5
fi

## Repeat command until message broker is ready.
until nc -z -v -w30 broker 5672
do
echo "Waiting for connection to message broker for ${SLEEP} seconds..."

## Wait for 5 seconds before check again.
sleep ${SLEEP}
done

node dist/user-agent/index.js
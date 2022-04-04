#!/bin/sh

## If no args supplied sleep time defaults to 5 seconds.
if [[ ${#} -eq 0 ]]
then
SLEEP=5
fi

## Repeat command until port 3306 on address db is not ready.
until nc -z -v -w30 db 3306
do
echo "Waiting for database connection for ${SLEEP} seconds..."

## Wait for 5 seconds before check again.
sleep ${SLEEP}
done
echo "Database server ready..."

## Repeat command until message broker is ready.
until nc -z -v -w30 broker 5672
do
echo "Waiting for connection to message broker for ${SLEEP} seconds..."

## Wait for 5 seconds before check again.
sleep ${SLEEP}
done

node /dist/issue-resolver/index.js
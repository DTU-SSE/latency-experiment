#!/usr/bin/env bash

# REMEMBER TO START ax IN ANOTHER SHELL

# $1 is number of machines
# $2 is name to use for aggregated csv
# $3 is name to use for ouput plot

rm -rf logs
mkdir logs
npm run start-spawner-silent-multiple-per-process -- -n $1 -c b
npm run collect-logs -- -i logs -o $2
python3 histogram.py -i $2 -o $3
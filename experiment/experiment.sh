#!/usr/bin/env bash

# $1 is number of machines specified by user.
# The script does not run this exact number of machines
# but a number close to.
num_machines_user=$1
log_dir_default="logs"

# remove any existing logs/ directory
rm -rf $log_dir_default
mkdir $log_dir_default

# stop ax, clear its files and run it again
ax_log=ax.output
killall ax &> /dev/null
rm -rf ax-data
ax run &>> $ax_log&
sleep 5 # wait for ax to start. Sleep for 5 seconds to be sure.

# run the machines logging message receptions and emissions
npm run spawn-processes -- -n $num_machines_user

# stop ax
killall ax

# actual number of machines
num_machines_actual="$(find $log_dir_default -maxdepth 1 -type f | wc -l)"

# output files
output_dir="output_${num_machines_actual}"
log_dir="${output_dir}/logs_${num_machines_actual}"
csv_output="${output_dir}/${num_machines_actual}_machines.csv"
pdf_output="${output_dir}/${num_machines_actual}_machines.pdf"
mkdir $output_dir
mv $log_dir_default $log_dir

# aggregate logs and create histogram
npm run collect-logs -- -i $log_dir -o $csv_output
python3 histogram.py -i $csv_output -o $pdf_output -n $num_machines_actual
echo "Output written to ${output_dir}/"

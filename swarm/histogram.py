import csv
import argparse
import sys
from pathlib import Path
import matplotlib.pyplot as plt
from dataclasses import dataclass

@dataclass(frozen=True)
class LogEntry:
    unix_time_stamp_milliseconds: int
    msg_ID: str
    sent_received: str

def read_csv(filename):
    with open(filename, 'r') as file:
        reader = csv.DictReader(file, delimiter=',')
        data = [LogEntry(unix_time_stamp_milliseconds=int(row['unix_time_stamp_milliseconds']), msg_ID=row['msg_ID'], sent_received=row['sent_received']) for row in reader]
    return data

def partition_data(data):
    emitted_msgs = { entry.msg_ID: entry for entry in data if entry.sent_received == 'Emitted' }
    received_msgs = { entry.msg_ID: entry for entry in data if entry.sent_received == 'Received' }
    return {"emitted_msgs": emitted_msgs, "received_msgs": received_msgs}

def main():
    parser = argparse.ArgumentParser(description="Histogram of latencies.")
    parser.add_argument('-i', '--input', type=Path, help='Input csv. Expected format: unix_time_stamp_milliseconds,msg_ID,sent_received')
    parser.add_argument('-o', '--output_filename', type=Path, help='Output filename')
    args = parser.parse_args()

    if not args.input or not args.output_filename:
        parser.print_help()
        sys.exit(1)
    print(read_csv(args.input))


if __name__ == "__main__":
    main()
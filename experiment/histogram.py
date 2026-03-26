import csv
import argparse
import sys
from pathlib import Path
import matplotlib.pyplot as plt
from dataclasses import dataclass
from matplotlib import colors
from matplotlib.ticker import PercentFormatter
import numpy as np

@dataclass(frozen=True)
class LogEntry:
    unix_time_stamp_milliseconds: int
    msg_ID: str
    sent_received: str

@dataclass(frozen=True)
class MessageFlow:
    msg_ID: str
    emitted_timestamp: int
    received_timestamps: int
    latency: int

def read_csv(filename):
    with open(filename, 'r') as file:
        reader = csv.DictReader(file, delimiter=',')
        #for row in reader:
        #    print(row)
        data = [LogEntry(unix_time_stamp_milliseconds=int(row['unix_time_stamp_milliseconds']), msg_ID=row['msg_ID'], sent_received=row['sent_received']) for row in reader]
    return data

def partition_data(data):
    emitted_msgs = { entry.msg_ID: entry for entry in data if entry.sent_received == 'Emitted' }
    received_msgs = {}
    for entry in data:
        if entry.sent_received == 'Received':
            if entry.msg_ID in received_msgs:
                received_msgs[entry.msg_ID].append(entry)
            else:
                received_msgs[entry.msg_ID] = [entry]
    return {"emitted_msgs": emitted_msgs, "received_msgs": received_msgs}

def compute_message_flows(partitioned):
    message_flows = []
    for msg_id, received_entries in partitioned['received_msgs'].items():
        try:
            if msg_id in partitioned['emitted_msgs']:
                emitted_entry = partitioned['emitted_msgs'][msg_id]
                for received_entry in received_entries:
                    latency = received_entry.unix_time_stamp_milliseconds - emitted_entry.unix_time_stamp_milliseconds
                    message_flows.append(MessageFlow(msg_ID=msg_id, emitted_timestamp=emitted_entry.unix_time_stamp_milliseconds, received_timestamps=received_entry.unix_time_stamp_milliseconds, latency=latency))
        except KeyError:
            print(f"Msg ID: {msg_id} was received but not emitted.")

    return message_flows

def histogram_latencies(message_flows, output_filename, number_of_machines):
    latencies = [flow.latency for flow in message_flows]
    n_bins = 20
    total_flows = len(latencies)

    fig, axs = plt.subplots(1, 2, tight_layout=True)
    plt.suptitle(f"Histogram of Message Latencies ({number_of_machines} machines, {len(latencies)} message deliveries)")

    axs[0].hist(latencies, bins=n_bins, edgecolor='black')
    axs[0].set_xlabel('Latency (ms)')
    axs[0].set_ylabel('Frequency')

    # Percentage histogram
    #axs[1].hist(latencies, bins=n_bins, weights=np.ones(len(latencies)) / len(latencies), edgecolor='black')
    #axs[1].yaxis.set_major_formatter(PercentFormatter(xmax=1))
    #axs[1].set_ylabel('Percentage')
    # Cumulative histogram
    axs[1].hist(latencies, bins=n_bins, edgecolor='black', cumulative=True)
    axs[1].set_xlabel('Latency (ms)')
    axs[1].set_ylabel('Cumulative frequency')

    plt.savefig(output_filename)
    plt.close()

def print_messages(messages):
    for entry in messages:
        print(f"Msg ID: {entry.msg_ID}, Timestamp: {entry.unix_time_stamp_milliseconds}, sent/received: {entry.sent_received}")

def print_emitted_received(partitioned):
    print("Emitted messages:")
    for msg_id, entry in partitioned['emitted_msgs'].items():
        print(f"Msg ID: {msg_id}, Timestamp: {entry.unix_time_stamp_milliseconds}, sent/received: {entry.sent_received}")

    print("\nReceived messages:")
    for msg_id, entries in partitioned['received_msgs'].items():
        for entry in entries:
            print(f"Msg ID: {entry.msg_ID},Timestamp: {entry.unix_time_stamp_milliseconds}, sent/received: {entry.sent_received}")

def print_message_flows(message_flows):
    print("Message Flows:")
    for flow in message_flows:
        print(f"Msg ID: {flow.msg_ID}, Emitted Timestamp: {flow.emitted_timestamp}, Received Timestamp: {flow.received_timestamps}, Latency: {flow.latency} ms")

def main():
    parser = argparse.ArgumentParser(description="Histogram of latencies.")
    parser.add_argument('-i', '--input', type=Path, help='Input csv. Expected format: unix_time_stamp_milliseconds,msg_ID,sent_received')
    parser.add_argument('-o', '--output_filename', type=Path, help='Output filename')
    parser.add_argument('-n', '--number_of_machines', type=int, help='Number of machines in experiment')
    args = parser.parse_args()

    if not args.input or not args.output_filename:
        parser.print_help()
        sys.exit(1)
    messages = read_csv(args.input)
    partitioned = partition_data(messages)
    #print_messages(messages)
    #print()
    #print_emitted_received(partitioned)
    #print()
    message_flows = compute_message_flows(partitioned)
    #print_message_flows(message_flows)

    histogram_latencies(message_flows, args.output_filename, str(args.number_of_machines))

if __name__ == "__main__":
    main()
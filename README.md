# Experiment measuring message latency for a swarm application

To run the experiments please make sure that [ax](https://crates.io/crates/ax), [Python](https://www.python.org/downloads/) (>= 3), [Node.js®](https://nodejs.org/en/download) (version >= 20 and with support for [TypeScript](https://www.typescriptlang.org/download/)) is installed on your system.

With the dependencies installed, to run five experiments measuring message latencies for swarms of different sizes please run:
```
cd experiment
npm i && npm run build
bash five_experiments.sh
```

The experiments should take about 10 minutes to run and generate the folders `output_29`, `output_146`, `output_302`, `output_497`, and `output_744` (in `experiments/`) containing histograms showing the message latencies.
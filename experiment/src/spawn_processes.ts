import { execa } from "execa";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import logUpdate from 'log-update';

function clearLineAndPrint(output: string) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(output)
}

function updateStdio(strings: string[]) {
    logUpdate(strings.join(""));
}

async function main() {
    // Parse args
    const argv = await yargs(hideBin(process.argv))
        .option("numMachines", {
            alias: "n",
            type: "number",
            demandOption: true,
            describe: "Number of machines to spawn",
        })
        .strict()
        .parse();

    const N = argv.numMachines;
    let terminatedCount = 0;

    const commands = ["dist/machine_drivers/run_machines.js"]
    const transporterCommand = "dist/machine_drivers/run_two_transporters.js"
    const steelTransportCommand = "dist/machine_drivers/run_steel_transport.js"

    const processes: ReturnType<typeof execa>[] = [];

    // Each time we execute a command we start machinesPerProcess machines
    const machinesPerProcess = 13
    const quotient = Math.floor(N / machinesPerProcess)
    const totalNumProcesses = quotient + 2;
    let machinesSpawned = 0;

    var msg1 = `Spawned processes: ${processes.length}/${totalNumProcesses}. Total number of machines spawned: ${machinesSpawned}`
    var msg2 = ``
    // Spawn processes
    for (let i = 0; i < quotient; i++) {
        const p = execa(`node`, commands, {
            stdout: "ignore",
            stderr: "ignore",
        });
        processes.push(p);
        machinesSpawned = machinesSpawned + machinesPerProcess
        msg1 = `Spawned processes: ${processes.length}/${totalNumProcesses}. Total number of machines spawned: ${machinesSpawned}`
        //updateStdio([msg1, msg2])
        clearLineAndPrint(msg1)
    }
    processes.push(execa(`node`, [transporterCommand], {
        stdout: "ignore",
        stderr: "ignore",
    }));
    machinesSpawned = machinesSpawned + 2
    msg1 = `Spawned processes: ${processes.length}/${totalNumProcesses}. Total number of machines spawned: ${machinesSpawned}`
    //updateStdio([msg1, msg2])
    clearLineAndPrint(msg1);


    setTimeout(() => {
        processes.push(execa(`node`, [steelTransportCommand], {
            stdout: "ignore",
            stderr: "ignore",
        }));
        machinesSpawned = machinesSpawned + 1
        msg1 = `Spawned processes: ${processes.length}/${totalNumProcesses}. Total number of machines spawned: ${machinesSpawned}\n`
        //updateStdio([msg1, msg2])
        clearLineAndPrint(msg1)

    },  25000)

    // Update termination spinner as processes exit
    for (const p of processes) {
        p.then(() => {
            terminatedCount = terminatedCount + 1;
            msg2 = `Terminated count: ${terminatedCount}/${totalNumProcesses}`
            //updateStdio([msg1, msg2])
            clearLineAndPrint(msg2)
            //console.log(terminatedCount)
        }).catch((err) => {
            console.log(`Process failed: ${err}`);
            console.log()
        });
    }
}

main().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
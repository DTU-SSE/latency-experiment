import { execa } from "execa";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

function clearLineAndPrint(output: string) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(output)
}

async function main() {
    // Parse args
    const argv = await yargs(hideBin(process.argv))
        .option("numProcesses", {
            alias: "n",
            type: "number",
            demandOption: true,
            describe: "Number of processes to spawn",
        })
        .strict()
        .parse();

    const N = argv.numProcesses;
    let terminatedCount = 0;

    const first_half_b = "dist/machine_drivers/run_first_half_no_steel_t.js"
    const second_half_b = "dist/machine_drivers/run_second_half.js"
    const commands = [[first_half_b], [second_half_b]]
    if (!commands) { throw Error(`Invalid argument ${argv.choiceAorB} given`)}

    const transporterCommand = "dist/machine_drivers/run_two_transporters.js"
    if (!transporterCommand) { throw Error(`Invalid argument ${argv.choiceAorB} given`)}
    const steelTransportCommand = "dist/machine_drivers/run_steel_transport.js"

    const processes: ReturnType<typeof execa>[] = [];

    // Each time we execute a command we start machinesPerProcess machines
    const machinesPerProcess = 7
    const quotient = Math.floor(N / machinesPerProcess)
    const totalNumProcesses = quotient + 2;
    let processesSpawned = 0;
    let machinesSpawned = 0;
    // Spawn processes
    for (let i = 0; i < quotient; i++) {
        const p = execa(`node`, commands[i % commands.length], {
            stdout: "ignore",
            stderr: "ignore",
        });
        processes.push(p);
        processesSpawned = processesSpawned + 1
        machinesSpawned = machinesSpawned + machinesPerProcess
        clearLineAndPrint(`Spawned processes: ${processesSpawned}/${totalNumProcesses}. Total number of machines spawned: ${machinesSpawned}`)
    }
    processes.push(execa(`node`, [transporterCommand], {
        stdout: "ignore",
        stderr: "ignore",
    }));
    processesSpawned = processesSpawned + 1
    machinesSpawned = machinesSpawned + 2
    clearLineAndPrint(`Spawned processes: ${processesSpawned}/${totalNumProcesses}. Total number of machines spawned: ${machinesSpawned}`)

    setTimeout(() => {
        processes.push(execa(`node`, [steelTransportCommand], {
            stdout: "ignore",
            stderr: "ignore",
        }));
        processesSpawned = processesSpawned + 1
        machinesSpawned = machinesSpawned + 1
        clearLineAndPrint(`Spawned processes: ${processesSpawned}/${totalNumProcesses}. Total number of machines spawned: ${machinesSpawned}`)
        console.log()
    },  25000)


    console.log()
    // Update termination spinner as processes exit
    for (const p of processes) {
        p.then(() => {
            terminatedCount++;
            const msg = terminatedCount < totalNumProcesses ? `Terminated count: ${terminatedCount}/${totalNumProcesses}` : `Terminated count: ${terminatedCount}/${totalNumProcesses}.\n`
            clearLineAndPrint(msg)
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
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

type LogEntry = {
    time?: number;
    msg?: string;
    event?: {
        msgID?: string;
    };
};

// Aggregate logs. Turn a directory of logs into a single csv file extracing timestamps, message IDs and received/emitted.
async function processDirectory(inputDir: string, outputFile: string) {
    const files = fs.readdirSync(inputDir);

    const output = fs.createWriteStream(outputFile);
    output.write("unix_time_stamp_milliseconds,msg_ID,sent_received\n"); // CSV header

    for (const file of files) {
        const fullPath = path.join(inputDir, file);

        if (!fs.statSync(fullPath).isFile()) continue;

        const rl = readline.createInterface({
            input: fs.createReadStream(fullPath),
            crlfDelay: Infinity,
        });

        for await (const line of rl) {
            if (!line.trim()) continue;

            try {
                const json: LogEntry = JSON.parse(line);

                const time = json.time ?? "";
                const msgID = json.event?.msgID ?? "";
                const msg = json.msg ?? "";

                // Escape quotes in CSV fields
                const escapedMsg = msg.replace(/"/g, '""');

                output.write(`${time},${msgID},"${escapedMsg}"\n`);
            } catch (err) {
                console.error("Skipping invalid JSON line:", line);
            }
        }
    }

    output.end();
}

// Command line args
export const getArgs = (): Argv => {
    const argv = yargs(hideBin(process.argv))
        .option("inputDir", {
            alias: "i",
            type: "string",
            description: "Input directory containing logs.",
            demandOption: true
        })
        .option("outputFile", {
            alias: "o",
            type: "string",
            description: "Output csv file.",
            default: "output.csv"
        })
        .parseSync();
    return argv
}

type Argv = {
    inputDir: string;
    outputFile: string;
}


// Run
const argv = getArgs()

processDirectory(argv.inputDir, argv.outputFile)
    .catch((err) => console.error(err));
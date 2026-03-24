import { Actyx } from '@actyx/sdk'
import { createMachineRunnerBT, utils } from '@actyx/machine-runner'
import { Composition, carFactoryProtocol, subsCarFactory, SteelPressProtocol, getArgs, manifestFromArgs } from '../../protocol.js'
import { s0, s1, stamp } from '../../machines/steel_press_protocol/stamp.js';
import { randomUUID } from 'crypto';

// Car parts that the stamp can produce

const getPart = (i: number): string => {
  switch (i) {
    case 0:
      return "frontFrame"
    case 1:
      return Math.random() >= 0.5 ? "loadBed" : "rearFrame"
    case 2:
      return "roof"
    default:
      return ""
  }
}
let index = 0

// Adapted machine. Adapting here has no effect. Except that we can make a verbose machine.
const [stampAdapted, s0Adapted] = Composition.adaptMachine(SteelPressProtocol.stampRole, carFactoryProtocol, 0, subsCarFactory, [stamp, s0]).data!

// Run the adapted machine
export async function main() {
  const argv = getArgs()
  const app = await Actyx.of(manifestFromArgs(argv))
  const tags = Composition.tagWithEntityId(argv.displayName)
  const logFile = `${argv.logDir}/${stampAdapted.machineName}-${randomUUID()}.log`
  const logger = utils.logger.Logger.make(logFile)
  const machine = createMachineRunnerBT(app, tags, s0Adapted, undefined, stampAdapted, logger)

  for await (const state of machine) {
    if (state.isLike(s1)) {
      state.cast().commands()?.pressSteel(getPart(index))
      index = (index + 1) % 3
    }
    if (state.isFinal()) {
      break
    }
  }
  app.dispose()
}

//main()
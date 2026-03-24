import { Actyx } from '@actyx/sdk'
import { createMachineRunnerBT, utils } from '@actyx/machine-runner'
import { Composition, carFactoryProtocol, subsCarFactory, SteelPressProtocol, getArgs, manifestFromArgs } from '../../protocol.js'
import { bodyAssembler, s0, s2 } from '../../machines/steel_press_protocol/body_assembler.js';
import { randomUUID } from 'crypto';

// Adapted machine. Adapting here has no effect. Except that we can make a verbose machine.
const [bodyAssemblerAdapted, s0Adapted] = Composition.adaptMachine(SteelPressProtocol.bodyAssemblerRole, carFactoryProtocol, 0, subsCarFactory, [bodyAssembler, s0]).data!

// Run the adapted machine
export async function main() {
  const argv = getArgs()
  const app = await Actyx.of(manifestFromArgs(argv))
  const tags = Composition.tagWithEntityId(argv.displayName)
  const initialPayload = { parts: [] }
  const logFile = `${argv.logDir}/${bodyAssemblerAdapted.machineName}-${randomUUID()}.log`
  const logger = utils.logger.Logger.make(logFile)
  const machine = createMachineRunnerBT(app, tags, s0Adapted, initialPayload, bodyAssemblerAdapted, logger)

  for await (const state of machine) {
    if (state.isLike(s2)) {
      state.cast().commands()?.assembleBody()
    }
    if (state.isFinal()) {
      break
    }
  }
  app.dispose()
}

//main()
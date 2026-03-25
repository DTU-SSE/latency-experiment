import { Actyx } from '@actyx/sdk'
import { createMachineRunnerBT, utils } from '@actyx/machine-runner'
import { Composition, carFactoryProtocol, subsCarFactory, PaintShopProtocol, getArgs, manifestFromArgs } from '../../protocol.js'
import { painter, s0, s1 } from '../../machines/paint_shop_protocol/painter.js';
import { randomUUID } from 'crypto';

// A car can have one of these colors
const colors = ["red", "blue", "green"]

// Adapted machine. Adapting here has no effect. Except that we can make a verbose machine.
const [painterAdapted, s0Adapted] = Composition.adaptMachine(PaintShopProtocol.painterRole, carFactoryProtocol, 1, subsCarFactory, [painter, s0]).data!

// Run the adapted machine
export async function main() {
  const argv = getArgs()
  const app = await Actyx.of(manifestFromArgs(argv))
  const tags = Composition.tagWithEntityId(argv.displayName)
  const logFile = `${argv.logDir}/${painterAdapted.machineName}-${randomUUID()}.log`
  const logger = utils.logger.Logger.make(logFile)
  const machine = createMachineRunnerBT(app, tags, s0Adapted, undefined, painterAdapted, logger)

  for await (const state of machine) {
    if (state.isLike(s1)) {
      state.cast().commands()?.applyPaint(colors[Math.floor(Math.random() * colors.length)])
    }
    if (state.isFinal()) {
      break
    }
  }
  app.dispose()
}

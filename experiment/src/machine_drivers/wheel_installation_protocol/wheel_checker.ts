import { Actyx } from '@actyx/sdk'
import { createMachineRunnerBT, utils } from '@actyx/machine-runner'
import { Composition, carFactoryProtocol, subsCarFactory, WheelInstallationProtocol, getArgs, manifestFromArgs } from '../../protocol.js'
import { s0, s1, wheelChecker } from '../../machines/wheel_installation_protocol/wheel_checker.js'
import { randomUUID } from 'crypto';

// Adapted machine. Adapting here has no effect. Except that we can make a verbose machine.
const [wheelCheckerAdapted, s0Adapted] = Composition.adaptMachine(WheelInstallationProtocol.wheelCheckerRole, carFactoryProtocol, 4, subsCarFactory, [wheelChecker, s0]).data!

// Run the adapted machine
export async function main() {
  const argv = getArgs()
  const app = await Actyx.of(manifestFromArgs(argv))
  const tags = Composition.tagWithEntityId(argv.displayName)
  const logFile = `${argv.logDir}/${wheelCheckerAdapted.machineName}-${randomUUID()}.log`
  const logger = utils.logger.Logger.make(logFile)
  const machine = createMachineRunnerBT(app, tags, s0Adapted, undefined, wheelCheckerAdapted, logger)

  for await (const state of machine) {
    if (state.isLike(s1)) {
      const currentState = state.cast()
      const shape = currentState.payload.shape
      const numWheels = currentState.payload.numWheels
      if (shape === "truck" && numWheels == 6 ||
          shape === "sedan" && numWheels == 4) {
        currentState.commands()?.wheelsDone()
      }
    }
    if (state.isFinal()) {
      break
    }
  }
  app.dispose()
}
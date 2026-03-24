import { Actyx } from '@actyx/sdk'
import { createMachineRunnerBT, utils } from '@actyx/machine-runner'
import { Composition, carFactoryProtocol, subsCarFactory, printState, WheelInstallationProtocol, getArgs, manifestFromArgs } from '../../protocol.js'
import { s0, s1, s2, wheelInstaller } from '../../machines/wheel_installation_protocol/wheel_installer.js'
import { randomUUID } from 'crypto';

// Adapted machine. Adapting here has no effect. Except that we can make a verbose machine.
const [wheelInstallerAdapted, s0Adapted] = Composition.adaptMachine(WheelInstallationProtocol.wheelInstallerRole, carFactoryProtocol, 4, subsCarFactory, [wheelInstaller, s0]).data!

// Run the adapted machine
export async function main() {
  const argv = getArgs()
  const app = await Actyx.of(manifestFromArgs(argv))
  const tags = Composition.tagWithEntityId(argv.displayName)
  const logFile = `${argv.logDir}/${wheelInstallerAdapted.machineName}-${randomUUID()}.log`
  const logger = utils.logger.Logger.make(logFile)
  const machine = createMachineRunnerBT(app, tags, s0Adapted, undefined, wheelInstallerAdapted, logger)

  for await (const state of machine) {
    if (state.isLike(s1)) {
      const currentState = state.cast()
      const shape = currentState.payload.shape
      const numWheels = currentState.payload.numWheels
      if (shape === "truck" && numWheels < 6 ||
          shape === "sedan" && numWheels < 4) {
        currentState.commands()?.pickUpWheel()
      }
    } else if (state.isLike(s2)) {
      state.cast().commands()?.installWheel()
    }
    if (state.isFinal()) {
      break
    }
  }
  app.dispose()
}

//main()
import { Actyx } from '@actyx/sdk'
import { createMachineRunnerBT, utils } from '@actyx/machine-runner'
import { Composition, carFactoryProtocol, subsCarFactory, EngineInstallationProtocol, getArgs, manifestFromArgs } from '../../protocol.js'
import { engineInstaller, s0, s1, s3 } from '../../machines/engine_installation_protocol/engine_installer.js'
import { randomUUID } from 'crypto';

// Adapted machine. Adapting here has no effect. Except that we can make a verbose machine.
const [engineInstallerAdapted, s0Adapted] = Composition.adaptMachine(EngineInstallationProtocol.engineInstallerRole, carFactoryProtocol, 2, subsCarFactory, [engineInstaller, s0]).data!

// Run the adapted machine
export async function main() {
  const argv = getArgs()
  const app = await Actyx.of(manifestFromArgs(argv))
  const tags = Composition.tagWithEntityId(argv.displayName)
  const logFile = `${argv.logDir}/${engineInstallerAdapted.machineName}-${randomUUID()}.log`
  const logger = utils.logger.Logger.make(logFile)
  const machine = createMachineRunnerBT(app, tags, s0Adapted, undefined, engineInstallerAdapted, logger)

  for await (const state of machine) {
    if (state.isLike(s1)) {
      state.cast().commands()?.requestEngine()
    } else if (state.isLike(s3)) {
      state.cast().commands()?.installEngine()
    }
    if (state.isFinal()) {
      break
    }
  }
  app.dispose()
}
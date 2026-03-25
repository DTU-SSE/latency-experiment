import { randomUUID } from 'crypto';
import { Events, Composition, WheelInstallationProtocol, type WheelInstallationPayload } from './../../protocol.js'
import { checkComposedProjection } from '@actyx/machine-check';

type WheelInstallationStatePayload = { shape: string, color: string, engine: string, numWheels: number }

export const wheelInstaller = Composition.makeMachine(WheelInstallationProtocol.wheelInstallerRole)
export const s0 = wheelInstaller.designEmpty('s0').finish()
export const s1 = wheelInstaller.designState('s1')
    .withPayload<WheelInstallationStatePayload>()
    .command(WheelInstallationProtocol.cmdPickUpWheel, [Events.wheelPickup], (ctx) => {
            return [Events.wheelPickup.make({...ctx.self, msgID: randomUUID()})]
        })
    .finish()
export const s2 = wheelInstaller.designState('s2')
    .withPayload<WheelInstallationStatePayload>()
    .command(WheelInstallationProtocol.cmdInstallWheel, [Events.wheelInstalled], (ctx) => {
            return [Events.wheelInstalled.make({...ctx.self, numWheels: ctx.self.numWheels + 1, msgID: randomUUID()})]
        })
    .finish()
export const s3 = wheelInstaller.designEmpty('s3').finish()

s0.react([Events.engineChecked], s1, (_, event) => { return s1.make(
    { shape: event.payload.shape, color: event.payload.color, engine: event.payload.engine, numWheels: 0}
)})
s1.react([Events.wheelPickup], s2, (_, event) => {
    const {shape, color, engine, numWheels} = event.payload;
    return s2.make({shape, color, engine, numWheels})})
s2.react([Events.wheelInstalled], s1, (_, event) => {
    const {shape, color, engine, numWheels} = event.payload;
    return s1.make({shape, color, engine, numWheels})})
s1.react([Events.wheelsDone], s3, () => { return s3.make()})

// Check that the original machine is a correct implementation. A prerequisite for reusing it.
const checkProjResult = checkComposedProjection([WheelInstallationProtocol.protocol], WheelInstallationProtocol.subscriptions, WheelInstallationProtocol.wheelInstallerRole, wheelInstaller.createJSONForAnalysis(s0))
if (checkProjResult.type == 'ERROR') throw new Error(checkProjResult.errors.join(", \n"))
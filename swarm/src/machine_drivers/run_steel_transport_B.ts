import { main as steelTransportMain } from "./steel_press_protocol/steel_transport.js";
import { runAsyncFunctionsB } from "./call_async_functions.js";

const mainFunctions = [
    steelTransportMain,
]

runAsyncFunctionsB(mainFunctions)
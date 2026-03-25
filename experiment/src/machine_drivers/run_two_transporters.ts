import { main as smartTransportMain } from "./warehouse_protocol/smart_transport.js";
import { main as basicTransportMain } from "./warehouse_protocol/basic_transport.js";

import { runAsyncFunctions } from "./call_async_functions.js";

const mainFunctions = [
    smartTransportMain,
    basicTransportMain,
]

runAsyncFunctions(mainFunctions)
import { main as stampMain } from "./steel_press_protocol/stamp.js";
import { main as bodyAssemblerMain } from "./steel_press_protocol/body_assembler.js";
import { main as carBodyChecker } from "./steel_press_protocol/car_body_checker.js";
import { main as painterMain } from "./paint_shop_protocol/painter.js";
import { main as engineInstallerMain } from "./engine_installation_protocol/engine_installer.js";
import { main as warehouseMain } from "./engine_installation_protocol/warehouse.js";
import { main as engineCheckerMain } from "./engine_installation_protocol/engine_checker.js";
import { main as baseStationMain } from "./warehouse_protocol/base_station.js";
import { main as wheelInstallerMain } from "./wheel_installation_protocol/wheel_installer.js";
import { main as wheelCheckerMain } from "./wheel_installation_protocol/wheel_checker.js";
import { main as windowInstallerMain } from "./window_installation_protocol/window_installer.js";
import { main as windowCheckerMain } from "./window_installation_protocol/window_checker.js";
import { main as qualityControlMain } from "./quality_control_protocol/quality_control.js";
import { runAsyncFunctions } from "./call_async_functions.js";

const mainFunctions = [
    stampMain,
    bodyAssemblerMain,
    carBodyChecker,
    painterMain,
    engineInstallerMain,
    warehouseMain,
    baseStationMain,
    wheelInstallerMain,
    wheelCheckerMain,
    windowInstallerMain,
    windowCheckerMain,
    qualityControlMain,
    engineCheckerMain
]

runAsyncFunctions(mainFunctions)
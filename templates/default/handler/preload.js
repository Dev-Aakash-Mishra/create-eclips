const { contextBridge } = require("electron");
const python = require("./python-dev"); // default, overridden below

const modeArg = process.argv.find(a => a.startsWith("--MODE="));
const MODE = modeArg?.split("=")[1] || "DEV";

console.log("MODE:", MODE);

const runner =
  MODE === "PROD"
    ? require("./python-prod")
    : require("./python-dev");



contextBridge.exposeInMainWorld("backend", {
  call: runner.call
});

const { contextBridge } = require("electron");
const python = require("./python-dev"); // default, overridden below

// 🔑 Read mode from main process
const modeArg = process.argv.find(a => a.startsWith("--MODE="));
const MODE = modeArg?.split("=")[1] || "DEV";

console.log("MODE:", MODE);

// Decide python runner ONLY here
const runner =
  MODE === "PROD"
    ? require("./python-prod")
    : require("./python-dev");

runner.startPython();

contextBridge.exposeInMainWorld("backend", {
  call: runner.call
});

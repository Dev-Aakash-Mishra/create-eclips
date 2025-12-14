const { spawn } = require("child_process");
const path = require("path");

let pyProcess = null;
let buffer = "";
let reqId = 0;
const pending = new Map();

function startPython() {
    if (pyProcess) return pyProcess;

    const exePath = path.join(process.resourcesPath, "app.exe");

    pyProcess = spawn(exePath, [], {
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true
    });

    pyProcess.stdout.on("data", (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
            if (!line.trim()) continue;
            const msg = JSON.parse(line);
            const { id, result, error } = msg;

            if (!pending.has(id)) continue;
            const { resolve, reject } = pending.get(id);
            pending.delete(id);

            error ? reject(error) : resolve(result);
        }
    });

    pyProcess.stderr.on("data", (data) => {
        console.error("[PYTHON]", data.toString());
    });

    pyProcess.on("exit", () => {
        pyProcess = null;
    });

    return pyProcess;
}

function call(method, params = {}) {
    return new Promise((resolve, reject) => {
        if (!pyProcess) startPython();

        const id = ++reqId;
        pending.set(id, { resolve, reject });

        pyProcess.stdin.write(
            JSON.stringify({ id, method, params }) + "\n"
        );
    });
}

module.exports = {
    startPython,
    call
};

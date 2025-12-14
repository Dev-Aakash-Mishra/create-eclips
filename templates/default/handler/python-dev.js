const { spawn } = require("child_process");
const path = require("path");

let pyProcess = null;
let buffer = "";
const pending = new Map();
let reqId = 0;

function startPython() {
    console.log("🔥 startPython() ENTERED");
    if (pyProcess) return pyProcess;

    const scriptPath = path.join(
        __dirname,
        "..",
        "backend",
        "helper",
        "runtime.py"
    );

    const pythonCmd = process.platform === "win32" ? "python" : "python3";

    pyProcess = spawn(pythonCmd, ["-B", "-u", scriptPath], {
        stdio: ["pipe", "pipe", "pipe"]
    });

    // 🔹 STDOUT → RPC ONLY
    pyProcess.stdout.on("data", (chunk) => {
        buffer += chunk.toString();

        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
            if (!line.trim()) continue;

            try {
                const msg = JSON.parse(line);
                const { id, result, error } = msg;

                if (!pending.has(id)) continue;

                const { resolve, reject } = pending.get(id);
                pending.delete(id);

                error ? reject(error) : resolve(result);

            } catch (e) {
                console.error("[PYTHON INVALID JSON]", line);
            }
        }
    });

    // 🔸 STDERR → LOGS
    pyProcess.stderr.on("data", (data) => {
        console.error("[PYTHON]", data.toString().trim());
    });

    pyProcess.on("close", (code) => {
        console.log(`[PYTHON EXITED] code=${code}`);
        pyProcess = null;
    });

    return pyProcess;
}

function call(method, params = {}) {
    return new Promise((resolve, reject) => {

        // 🔴 CRITICAL FIX
        if (!pyProcess) {
            startPython();
        }

        if (!pyProcess || !pyProcess.stdin.writable) {
            reject("Python backend not ready");
            return;
        }

        const id = ++reqId;
        pending.set(id, { resolve, reject });

        try {
            pyProcess.stdin.write(
                JSON.stringify({ id, method, params }) + "\n"
            );
        } catch (err) {
            pending.delete(id);
            reject(err.toString());
        }
    });
}


function stopPython() {
    if (pyProcess) {
        pyProcess.kill("SIGTERM");
        pyProcess = null;
    }
}

module.exports = {
    startPython,
    call,
    stopPython
};

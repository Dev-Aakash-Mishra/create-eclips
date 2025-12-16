const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const { execSync } = require("child_process");

const isProd = app.isPackaged;

const python = isProd
  ? require("./python-prod")
  : require("./python-dev");

let mainWindow = null;
let backendStarted = false;

/* =========================
   BACKEND SHUTDOWN LOGIC
========================= */
function shutdownBackend() {
  if (isProd && process.platform === "win32") {
    // 💀 PROD: kill PyInstaller backend brutally
    try {
      execSync("taskkill /IM app.exe /T /F", { stdio: "ignore" });
    } catch (e) {
      // ignore if already dead
    }
  } else {
    // 🧠 DEV: stop python process cleanly
    try {
      if (python.stopPython) {
        python.stopPython();
      }
    } catch (e) {
      // ignore
    }
  }
}

/* =========================
   WINDOW CREATION
========================= */
function createWindow() {
  const allowDevTools = !isProd || process.argv.includes("-d");

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      sandbox: false,
      contextIsolation: true,
      additionalArguments: [
        `--MODE=${isProd ? "PROD" : "DEV"}`
      ]
    }
  });

  // Remove menu bar completely
  Menu.setApplicationMenu(null);

  // ✅ DevTools behavior unchanged
  if (allowDevTools) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  // ✅ Block DevTools shortcuts in true PROD
  if (isProd && !process.argv.includes("-d")) {
    mainWindow.webContents.on("before-input-event", (event, input) => {
      const blocked =
        input.key === "F12" ||
        (input.control && input.shift && input.key.toLowerCase() === "i");

      if (blocked) {
        event.preventDefault();
      }
    });
  }

  mainWindow.loadFile(
    path.join(__dirname, "..", "frontend", "index.html")
  );

  // 🔥 Window closed → backend shutdown
  mainWindow.on("closed", () => {
    shutdownBackend();
    mainWindow = null;
  });
}

/* =========================
   APP LIFECYCLE
========================= */

app.whenReady().then(() => {
  if (!backendStarted) {
    python.startPython();
    backendStarted = true;
  }
  createWindow();
});

// macOS re-activation (safe everywhere)
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 🔥 Extra safety: quit paths
app.on("before-quit", () => {
  shutdownBackend();
  backendStarted = false;
});

// 🔥 REQUIRED FOR TERMINAL RETURN
app.on("window-all-closed", () => {
  app.quit();
});

app.on("will-quit", () => {
  process.exit(0);
});

const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

function createWindow() {
  const isProd = app.isPackaged;

  const allowDevTools = !isProd || process.argv.includes("-d");

  const win = new BrowserWindow({
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

  // Open DevTools ONLY if explicitly allowed
  if (allowDevTools) {
    win.webContents.openDevTools({ mode: "detach" });
  }

  // Block DevTools shortcuts in true PROD unless -d is used
  if (isProd && !process.argv.includes("-d")) {
    win.webContents.on("before-input-event", (event, input) => {
      const blocked =
        input.key === "F12" ||
        (input.control && input.shift && input.key.toLowerCase() === "i");

      if (blocked) {
        event.preventDefault();
      }
    });
  }

  win.loadFile(path.join(__dirname, "..", "frontend", "index.html"));
}

app.whenReady().then(createWindow);

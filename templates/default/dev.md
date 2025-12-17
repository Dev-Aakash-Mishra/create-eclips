# 🚀 Eclips — Developer Instruction Prompt

This document is a **strict instruction manual / prompt** for any developer or AI agent working inside an **Eclips-generated project**.

Its purpose is to define **how development MUST be done** under the Eclips architecture.
Follow this exactly. Do not assume alternative patterns.

---

## 🧠 Core Mental Model (Read First)

- Eclips = **Electron shell + Python brain**
- Frontend NEVER talks to Python directly
- Communication happens ONLY via **JSON-RPC over stdin/stdout**
- Python owns logic
- Frontend owns UI
- Electron only orchestrates

There is **no backend server**, no HTTP, no WebSocket.

---

## 🧱 Architecture Overview

- **Frontend:** HTML, CSS, JavaScript  
  - No Node.js APIs
  - No filesystem access
- **Backend:** Python  
  - Contains ALL core logic
  - Exposes functions via RPC
- **Runtime:** Electron
- **IPC Layer:** JSON-RPC (stdin/stdout)
- **Dev Mode:** Python runs as script
- **Prod Mode:** Python is bundled into `app.exe`

---

## 📁 Project Structure

```
project/
│
├─ backend/
│  ├─ main.py                # ALL backend logic lives here
│  ├─ eclips.config.json     # PyInstaller config (hidden imports)
│  └─ helper/
│     ├─ __init__.py          
│     ├─ runtime.py          # RPC engine (DO NOT TOUCH)
│     ├─ logs.py             # Logging system (USE THIS)
│     ├─ storage.py          # Persistent data storage (USE THIS)
│     └─ build.py            # Build pipeline (DO NOT MODIFY)
│
├─ frontend/
│  ├─ index.html             # UI markup
│  ├─ style.css              # UI styles
│  └─ script.js              # UI logic (RPC calls only)
│
├─ handler/
│  ├─ main.js                # Electron main process
│  ├─ preload.js             # Secure bridge
│  ├─ python-dev.js          # Python runner (dev)
│  └─ python-prod.js         # Python runner (prod)
│
├─ icon.ico                  # Windows app icon
├─ package.json              # App configuration
└─ dev.md                    # THIS FILE
```

This structure is **non-negotiable**.

---

## 🛠 Development Workflow

### Start development mode

```bash
npm start
```

This will:

- Launch Electron
- Run Python directly (no exe)
- Enable DevTools
- Create logs in `backend/logs/backend.log`

This is the ONLY supported dev mode.

---

## 🐍 Backend Development Rules (Python)

### Entry file

```
backend/main.py
```

### Mandatory startup pattern

```python
from helper.logs import get_logger

logger = get_logger()
logger.info("Backend started")
```

### How to expose functionality

1. Write a pure Python function
2. Register it in the `METHODS` dict
3. Return JSON-serializable data only

Example:

```python
def add(a: int, b: int):
    return a + b

METHODS = {
    "add": add
}
```

### HARD RULES (Violations will break IPC)

❌ Do NOT use `print()`  
❌ Do NOT write to stdout  
❌ Do NOT modify `runtime.py`  
❌ Do NOT start threads that print output  

✔ Use `logger` for ALL logging  
✔ Return only JSON-safe values  

---

## 💾 Persistent Data Storage

Eclips provides a built-in helper for writing persistent data to platform-specific directories.

### Using the storage helper

```python
from helper.storage import DATA_DIR

# Create custom paths
def save_config(config):
    config_file = DATA_DIR / "config.json"
    with open(config_file, 'w') as f:
        json.dump(config, f)
```


### Best practices

✔ Use `DATA_DIR` for all persistent data  
✔ The directory is created automatically  
✔ Works identically in dev and prod modes  
✔ Platform-specific paths are handled for you  

❌ Do NOT hardcode paths  
❌ Do NOT write to the app installation directory  

---

## 🌐 Frontend ↔ Backend Communication Rules

Frontend JavaScript may ONLY call:

```js
window.backend.call(methodName, paramsObject)
```

Example:

```js
const result = await window.backend.call("add", {
  a: 2,
  b: 3
});
```

### Frontend restrictions

❌ No Node.js APIs  
❌ No filesystem  
❌ No direct Python access  
❌ No IPC hacks  

This isolation is intentional.

---

## 🖥 Runtime Modes (Authoritative)

| Mode | Trigger | Python | DevTools |
|----|----|----|----|
DEV | `npm start` | Script | Enabled |
PROD | Installed app | app.exe | Disabled |
PROD+DEBUG | `app.exe -d` | app.exe | Enabled |

- `-d` ONLY controls DevTools
- `-d` does NOT change PROD mode

---

## 📦 Build System Rules

### Full production build

```bash
npm run build
```

Build pipeline:

1. Clean `dist/`, `release/`, `backend/logs/`
2. Build Python → `dist/app.exe`
3. Bundle Electron
4. Generate installer in `/release`

Final artifacts:

```
release/
├─ win-unpacked/App.exe      # Direct runner (debug/testing)
└─ App Setup X.Y.Z.exe       # Installer (ship this)
```

Only ship the installer.

---

## 🔧 Adding Python Dependencies (IMPORTANT)

If PyInstaller fails to include a module:

1. Open `backend/eclips.config.json`
2. Add missing modules under `hidden_imports`

Example:

```json
{
  "hidden_imports": ["playwright.sync_api"]
}
```

Rebuild after every change.

This is REQUIRED for binary stability.

---

## 🧪 Debugging Protocol

- Backend logs → `backend/logs/backend.log`
- Frontend logs → DevTools console
- Electron logs → terminal

If something breaks:
- Check logs FIRST
- Never guess

---

## 🔒 Absolute Constraints (Do Not Violate)

✔ Do NOT edit `runtime.py`  
✔ Do NOT write to stdout from Python  
✔ Do NOT bypass `window.backend.call()`  
✔ All logic lives in `backend/main.py`  
✔ Frontend is UI only  

Breaking these rules breaks the architecture.

---

## 🎯 Final Directive

Eclips is designed for **strict separation**, **predictable builds**, and **binary-safe IPC**.

If you follow this document exactly:
- Development is stable
- Builds are reproducible
- Production behaves identically to dev

If you do not:
- IPC will break
- Builds will fail
- Debugging becomes impossible

This file is the source of truth.

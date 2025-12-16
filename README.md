# ⚡ Eclips

**Eclips** is a production-grade framework for building **desktop applications using Electron + Python**, with a strict and reliable architecture.

It provides:
- A secure Electron shell
- A Python backend (no servers, no HTTP)
- Deterministic JSON-RPC communication over stdin/stdout
- A full build pipeline (Python → EXE → Electron installer)

Eclips is designed to be **boring, predictable, and unbreakable** in production.

---

## 🚀 Quick Start

Create a new Eclips app:

```bash
npm create eclips myapp
```

Then:

```bash
cd myapp
npm install
npm start
```

That’s it.

---

## 🧠 What Problem Does Eclips Solve?

Building desktop apps with Python usually means:
- flaky IPC
- embedded servers
- inconsistent builds
- broken packaging

Eclips removes all of that.

**No HTTP. No WebSockets. No magic.**  
Just a clean Electron shell and a Python process communicating through a strict JSON-RPC contract.

---

## 🧱 Core Architecture

- **Frontend:** HTML, CSS, JavaScript  
  - UI only
  - No Node.js access

- **Backend:** Python  
  - All business logic
  - Exposed as RPC methods

- **IPC:** JSON-RPC over stdin/stdout  
  - Deterministic
  - Binary-safe
  - Cross-platform

- **Runtime:** Electron  
  - Orchestrates processes
  - No logic

---

## 📁 What You Get

Running `npm create eclips` generates a full project with:

```
backend/     # Python logic
frontend/   # UI
handler/    # Electron glue
dev.md      # Strict developer rules
```

Everything is wired and ready.

---

## 🛠 Development & Build Flow

### Development

```bash
npm start
```

- Python runs as a script
- Electron DevTools enabled
- Live logging

### Production build

```bash
npm run build
```

- Python bundled into `app.exe`
- Electron bundled with installer
- Output in `/release`

---
## 📋 Logs
- Electron logs - on terminal
- Python logs - on  `backend/logs/backend.log`
- Fronted logs -  on Console of devtools

## 🔒 Design Principles

✔ No backend servers  
✔ No runtime config hacks  
✔ No hidden IPC  
✔ No magic globals  
✔ No silent failures  

Everything is explicit.

---

## 🧑‍💻 Who Is Eclips For?

- Developers who prefer **Python for logic**
- Teams that want **stable desktop builds**
- Anyone tired of Electron IPC hacks
- AI-assisted development workflows

If you want flexibility everywhere, Eclips is not for you.  
If you want **predictability**, it is.

---

## 📄 Documentation

- `dev.md` (inside generated app): **authoritative development rules**

---

## 📦 Package Info

- npm package: `create-eclips`
- Command: `npm create eclips@latest myapp`
- License: MIT

---


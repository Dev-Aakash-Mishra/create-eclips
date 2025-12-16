import os
import shutil
import subprocess
import sys
import json

def python_exe_exists():
    exe = os.path.join(DIST, "app.exe")
    return os.path.exists(exe)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BACKEND = os.path.join(ROOT, "backend")
DIST = os.path.join(ROOT, "dist")
RELEASE = os.path.join(ROOT, "release")

RUNTIME = os.path.join(BACKEND, "helper", "runtime.py")
CONFIG_PATH = os.path.join(BACKEND, "eclips.config.json")

# 🔒 Framework-owned safe defaults
DEFAULT_HIDDEN_IMPORTS = [
    "logging.handlers",
    "encodings",
    "queue",
    "importlib",
    "inspect",
    "pkgutil",
]

def log(msg):
    print(f"[BUILD] {msg}")

def clean(full=True):
    log("Cleaning previous builds")

    shutil.rmtree(RELEASE, ignore_errors=True)
    shutil.rmtree(os.path.join(BACKEND, "logs"), ignore_errors=True)

    if full:
        shutil.rmtree(DIST, ignore_errors=True)
        os.makedirs(DIST, exist_ok=True)


def load_hidden_imports():
    user_imports = []

    if os.path.exists(CONFIG_PATH):
        log("Loading eclips.config.json")
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            cfg = json.load(f)
            user_imports = cfg.get("hidden_imports", [])

            if not isinstance(user_imports, list):
                raise ValueError("hidden_imports must be a list")

    hidden = sorted(set(DEFAULT_HIDDEN_IMPORTS + user_imports))

    log(f"Hidden imports: {hidden}")
    return hidden

def build_python():
    log("Building Python runtime (app.exe)")

    add_data = f"{BACKEND}{os.pathsep}backend"
    hidden_imports = load_hidden_imports()

    cmd = [
        sys.executable,
        "-m", "PyInstaller",
        "--onefile",
        "--name", "app",
        "--distpath", DIST,
        "--add-data", add_data,
    ]

    for mod in hidden_imports:
        cmd += ["--hidden-import", mod]

    cmd += [
        "--clean",
        "--noconfirm",
        RUNTIME
    ]

    subprocess.check_call(cmd)

    exe = os.path.join(DIST, "app.exe")
    if not os.path.exists(exe):
        raise RuntimeError("Python build failed: app.exe not found")

    log("Python build complete")

def build_electron():
    log("Building Electron app")

    subprocess.check_call(
        ["npx", "electron-builder"],
        cwd=ROOT,
        shell=True
    )

    log("Electron build complete")

def main():
    log("Starting production build")

    if python_exe_exists():
        log("app.exe already exists → skipping Python build")
        clean(full=False)
    else:
        log("app.exe not found → building Python runtime")
        clean(full=True)
        build_python()

    build_electron()

    log("BUILD SUCCESS 🎉")
    log("Check /release for installer")

if __name__ == "__main__":
    main()

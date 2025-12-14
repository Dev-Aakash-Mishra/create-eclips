import sys
import json
import traceback
import importlib.util
import os

def get_backend_dir():
    if getattr(sys, "frozen", False):
        return os.path.join(sys._MEIPASS, "backend")

    return os.path.dirname(os.path.dirname(__file__))

def load_user_main():
    BACKEND_DIR = get_backend_dir()
    MAIN_PATH = os.path.join(BACKEND_DIR, "main.py")

    if not os.path.exists(MAIN_PATH):
        raise FileNotFoundError(f"backend/main.py not found at {MAIN_PATH}")

    if BACKEND_DIR not in sys.path:
        sys.path.insert(0, BACKEND_DIR)

    spec = importlib.util.spec_from_file_location("user_main", MAIN_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    return module

def start_backend():
    user_main = load_user_main()
    METHODS = getattr(user_main, "METHODS", None)

    if not isinstance(METHODS, dict) or not METHODS:
        raise Exception("No METHODS dict found in backend/main.py")

    while True:
        line = sys.stdin.readline()
        if not line:
            continue

        try:
            req = json.loads(line)
            req_id = req.get("id")
            method = req.get("method")
            params = req.get("params", {})

            if method not in METHODS:
                raise Exception(f"Method '{method}' not found")

            result = METHODS[method](**params)

            response = {
                "id": req_id,
                "result": result
            }

        except Exception as e:
            response = {
                "id": req_id if "req_id" in locals() else None,
                "error": str(e),
                "trace": traceback.format_exc()
            }

        sys.stdout.write(json.dumps(response) + "\n")
        sys.stdout.flush()

if __name__ == "__main__":
    start_backend()

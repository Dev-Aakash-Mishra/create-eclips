import os
import sys,json
from pathlib import Path

# Define your app name here
APP_NAME = json.loads(open("../../package.json", "r").read())["name"]

def get_app_data_dir():
    """
    Returns the platform-specific application data directory.
    Creates the directory if it doesn't exist.
    
    Returns:
        Path: The application data directory path
    """
    if os.name == "nt":
        base = Path(os.getenv("APPDATA"))
    elif sys.platform == "darwin":
        base = Path.home() / "Library" / "Application Support"
    else:
        base = Path.home() / ".local" / "share"

    path = base / APP_NAME
    path.mkdir(parents=True, exist_ok=True)
    return path

DATA_DIR = get_app_data_dir()
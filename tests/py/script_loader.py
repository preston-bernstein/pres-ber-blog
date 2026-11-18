"""Load a script from scripts/ by file name, since the names contain hyphens."""

import importlib.util
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parents[2] / "scripts"


def load_script(file_name):
    name = file_name.replace("-", "_").removesuffix(".py")
    spec = importlib.util.spec_from_file_location(name, SCRIPTS_DIR / file_name)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

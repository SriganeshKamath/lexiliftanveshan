# ai/ai_utils.py
import os
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def save_upload_file(upload_file, dest_folder=ROOT / "uploads"):
    dest_folder.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}_{upload_file.filename}"
    out_path = dest_folder / filename
    with open(out_path, "wb") as f:
        f.write(upload_file.file.read())
    return str(out_path)

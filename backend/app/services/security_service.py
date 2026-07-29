import os
import shutil
from fastapi import UploadFile, HTTPException
from app.core.config import settings

MAGIC_SIGNATURES = {
    b"MZ": "EXE/DLL",
}

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
    "application/octet-stream", # Sometimes returned by browsers for docx/doc
}

def validate_and_scan_file(file: UploadFile) -> tuple[bool, str]:
    clean_filename = os.path.basename(file.filename)
    ext = clean_filename.split(".")[-1].lower() if "." in clean_filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        return False, f"Invalid file extension '.{ext}'. Allowed: PDF, DOC, DOCX, TXT."
    
    # Read first 1024 bytes for magic signature check
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)
    
    if size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        return False, f"File size exceeds maximum allowed limit of {settings.MAX_FILE_SIZE_MB} MB."
    
    header = file.file.read(1024)
    file.file.seek(0) # Reset stream pointer
    
    # Check for executable signatures (excluding docx zip signature)
    for sig, sig_type in MAGIC_SIGNATURES.items():
        if header.startswith(sig):
            # Quarantine malicious upload safely
            os.makedirs(settings.QUARANTINE_DIR, exist_ok=True)
            quarantine_path = os.path.join(settings.QUARANTINE_DIR, f"QUARANTINED_{clean_filename}")
            with open(quarantine_path, "wb") as qf:
                qf.write(file.file.read())
            file.file.seek(0)
            return False, f"Malicious signature detected ({sig_type}). File quarantined."

    return True, "File is safe."

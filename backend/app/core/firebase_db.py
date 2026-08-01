import json
import urllib.request
import urllib.parse
from typing import Optional, Dict, Any, List
from app.core.config import settings

FIREBASE_RTDB_URL = settings.FIREBASE_DATABASE_URL.rstrip('/')

def firebase_get(path: str) -> Optional[Dict[str, Any]]:
    """Fetch node data from Firebase Realtime Database."""
    try:
        url = f"{FIREBASE_RTDB_URL}/{path.lstrip('/')}.json"
        req = urllib.request.Request(url, headers={"User-Agent": "AI-Resume-Backend"})
        with urllib.request.urlopen(req, timeout=2.0) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return data
    except Exception as e:
        print(f"[WARNING] Firebase RTDB GET error ({path}): {e}")
        return None

def firebase_put(path: str, data: Dict[str, Any]) -> bool:
    """Save or update node data in Firebase Realtime Database."""
    try:
        url = f"{FIREBASE_RTDB_URL}/{path.lstrip('/')}.json"
        json_bytes = json.dumps(data).encode('utf-8')
        req = urllib.request.Request(url, data=json_bytes, method='PUT', headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=2.0) as resp:
            return resp.status in [200, 201]
    except Exception as e:
        print(f"[WARNING] Firebase RTDB PUT error ({path}): {e}")
        return False

def firebase_patch(path: str, data: Dict[str, Any]) -> bool:
    """Patch specific fields of node in Firebase Realtime Database."""
    try:
        url = f"{FIREBASE_RTDB_URL}/{path.lstrip('/')}.json"
        json_bytes = json.dumps(data).encode('utf-8')
        req = urllib.request.Request(url, data=json_bytes, method='PATCH', headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=2.0) as resp:
            return resp.status in [200, 201]
    except Exception as e:
        print(f"[WARNING] Firebase RTDB PATCH error ({path}): {e}")
        return False

def firebase_delete(path: str) -> bool:
    """Delete node from Firebase Realtime Database."""
    try:
        url = f"{FIREBASE_RTDB_URL}/{path.lstrip('/')}.json"
        req = urllib.request.Request(url, method='DELETE')
        with urllib.request.urlopen(req, timeout=2.0) as resp:
            return resp.status in [200, 204]
    except Exception as e:
        print(f"[WARNING] Firebase RTDB DELETE error ({path}): {e}")
        return False

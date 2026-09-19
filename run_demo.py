#!/usr/bin/env python3
import sys
import os
import time
import subprocess
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"

def main():
    port = int(os.environ.get("PORT", 8001))
    print("=" * 70)
    print(" [*] APISEC - Discover. Analyze. Correlate. Secure.")
    print(" Enterprise API Security & Attack Path Platform")
    print("=" * 70)
    print(f"\nStarting APISEC Unified Backend & Cyber HUD on http://localhost:{port} ...\n")
    
    try:
        import uvicorn
        sys.path.insert(0, str(BACKEND_DIR))
        from app.main import app
        uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
    except KeyboardInterrupt:
        print("\n[!] APISEC Server stopped.")

if __name__ == "__main__":
    main()

import uvicorn
import os
import sys

# Ensure src/ is on PYTHONPATH
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run("payshield.api.server:app", host="0.0.0.0", port=port, reload=False)



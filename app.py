import uvicorn
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run("payshield.api.server:app", host="0.0.0.0", port=port, reload=False)

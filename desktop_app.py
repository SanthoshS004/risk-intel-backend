import webview
import threading
import uvicorn
import time
import requests
import sys

from app.main import app

def start_server():
    """Run the FastAPI server."""
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="error")

def check_server():
    """Wait for the server to be responsive before opening the webview."""
    for _ in range(30):
        try:
            # We check the root endpoint which now serves index.html
            response = requests.get("http://127.0.0.1:8000/")
            if response.status_code == 200:
                return True
        except requests.ConnectionError:
            pass
        time.sleep(0.5)
    return False

if __name__ == '__main__':
    # Start FastAPI backend in a daemon thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Wait for server to start
    print("Starting AI Backend...")
    if not check_server():
        print("Failed to start backend server. Exiting.")
        sys.exit(1)

    # Start the desktop window
    print("Opening Application...")
    window = webview.create_window(
        'RiskIntel - Scam Detection', 
        'http://127.0.0.1:8000/',
        width=1200, 
        height=800,
        min_size=(800, 600)
    )
    
    webview.start()

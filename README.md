# AI-Powered Multi-Channel Scam Detection & Risk Intelligence System

This is a production-ready MVP for detecting and preventing scams across multiple channels (WhatsApp, Telegram, SMS, URLs, etc.).

## Features
- **Multi-Channel Input**: Scan messages and URLs.
- **AI Detection Engine**: Uses a lightweight DistilBERT NLP model combined with rule-based heuristics and URL analysis.
- **Real-Time Risk Scoring**: Returns a 0-100 risk score with Explainable AI reasoning.
- **Dashboard**: A premium dynamic dashboard to monitor real-time message feeds.

## Local Setup (Without Docker)

1. Create a virtual environment and install dependencies:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Run the FastAPI Server:
   ```bash
   uvicorn app.main:app --reload
   ```
3. Open `frontend/index.html` in your web browser.

## Docker Setup

1. Run Docker Compose:
   ```bash
   docker-compose up --build
   ```
2. The Dashboard is available at `http://localhost:80`
3. The API is available at `http://localhost:8000`

## API Endpoints

- `POST /scan-message`
  ```json
  {
    "text": "URGENT: Your bank account is blocked. Click here to verify your OTP: http://bit.ly/malicious",
    "channel": "sms"
  }
  ```
- `POST /scan-url`
  ```json
  {
    "url": "http://bit.ly/malicious"
  }
  ```

FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the HF model to speed up startup times
RUN python -c "from transformers import pipeline; pipeline('text-classification', model='mrm8488/bert-tiny-finetuned-sms-spam-detection')"

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

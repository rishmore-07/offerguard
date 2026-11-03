FROM python:3.11-slim

WORKDIR /app

# Prevent Python from writing pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files and ML model artifacts
COPY backend/ /app/backend/
COPY ml/ /app/ml/

EXPOSE 8000

CMD ["python", "backend/run.py"]


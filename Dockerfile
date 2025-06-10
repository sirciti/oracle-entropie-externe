# Étape 1 : Build frontend
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build
RUN ls -l /app/frontend/dist

# Étape 2 : Backend Python
FROM python:3.12-slim
RUN apt-get update && apt-get install -y \
    curl build-essential \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
ENV PATH="/root/.cargo/bin:${PATH}"
ENV PYTHONPATH="/app"
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY --from=frontend-build /app/frontend/dist/ backend/frontend/build/
COPY backend/config.json /app/backend/config.json
RUN ls -l /app/backend/config.json
COPY . .
EXPOSE 5000
CMD ["python", "-m", "backend.app"]
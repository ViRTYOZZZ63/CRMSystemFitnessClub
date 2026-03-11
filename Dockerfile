FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY src ./src
RUN npm run build

FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV PORT=4173
ENV CRM_DB_PATH=/data/crm.db

COPY server.py ./
COPY media ./media
COPY --from=frontend-build /app/dist ./dist

RUN mkdir -p /data

EXPOSE 4173

CMD ["python", "server.py"]
# PulsePoint CRM

CRM-система фитнес-клуба на React + Vite с Python API и Docker-сборкой.

## Локальная разработка

1. Установите зависимости:
   `npm install`
2. Запустите API:
   `python server.py`
3. В отдельном терминале запустите фронтенд:
   `npm run dev`

По умолчанию:

- фронтенд: `http://localhost:5173`
- API: `http://localhost:4173`

## Production-сборка

1. Соберите клиент:
   `npm run build`
2. Запустите сервер:
   `python server.py`

После сборки Python-сервер автоматически отдаёт `dist` и API с одного порта `4173`.

## Docker

Запуск через Docker Compose:

`docker compose up --build`

Приложение будет доступно на `http://localhost:4173`.

База хранится в volume `pulsepoint-crm-data`.
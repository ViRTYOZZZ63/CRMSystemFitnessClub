#!/usr/bin/env python3
import json
import sqlite3
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'crm.db'

SEED_STATE = {
    "users": [
        {"id": 1, "name": "Анна Петрова", "email": "admin@pulsepoint.club", "password": "admin123", "role": "admin", "phone": "+7 927 101-22-33"},
        {"id": 2, "name": "Алексей Волков", "email": "trainer@pulsepoint.club", "password": "trainer123", "role": "trainer", "trainerId": 1, "phone": "+7 927 102-33-44"},
        {"id": 3, "name": "Мария Исаева", "email": "hr@pulsepoint.club", "password": "hr123", "role": "hr", "phone": "+7 927 103-44-55"},
        {"id": 4, "name": "Ольга Соколова", "email": "finance@pulsepoint.club", "password": "finance123", "role": "accountant", "phone": "+7 927 104-55-66"},
    ],
    "trainers": [
        {"id": 1, "name": "Алексей Волков", "spec": "Силовой тренинг", "level": "Senior", "maxDailySlots": 4, "rate": 2200},
        {"id": 2, "name": "Марина Громова", "spec": "Функциональный тренинг", "level": "Senior", "maxDailySlots": 5, "rate": 2400},
        {"id": 3, "name": "Артем Беляев", "spec": "CrossFit", "level": "Middle", "maxDailySlots": 4, "rate": 2000},
    ],
    "classes": [
        {"id": 1, "title": "Morning Power", "trainerId": 1, "date": "2026-02-16", "time": "08:00", "duration": 60, "capacity": 12, "room": "A", "done": False},
        {"id": 2, "title": "Functional Burn", "trainerId": 2, "date": "2026-02-16", "time": "18:30", "duration": 60, "capacity": 14, "room": "B", "done": False},
        {"id": 3, "title": "CrossFit Pro", "trainerId": 3, "date": "2026-02-17", "time": "20:00", "duration": 75, "capacity": 10, "room": "A", "done": False},
    ],
    "clients": [
        {"id": 1, "name": "Екатерина Морозова", "program": "Body Rebuild", "trainerId": 1, "status": "Активен", "membership": "Premium", "visits": 16, "lastVisit": "2026-02-16"},
        {"id": 2, "name": "Игорь Назаров", "program": "Mass Gain", "trainerId": 1, "status": "Активен", "membership": "Standard", "visits": 11, "lastVisit": "2026-02-15"},
        {"id": 3, "name": "София Ларионова", "program": "Functional Fit", "trainerId": 2, "status": "Пауза", "membership": "Standard", "visits": 6, "lastVisit": "2026-02-09"},
        {"id": 4, "name": "Виктор Осипов", "program": "CrossFit Start", "trainerId": 3, "status": "Активен", "membership": "Premium", "visits": 13, "lastVisit": "2026-02-16"},
    ],
    "workLogs": [
        {"id": 1, "trainerId": 1, "date": "2026-02-16", "start": "07:30", "end": "16:30"},
        {"id": 2, "trainerId": 2, "date": "2026-02-16", "start": "12:00", "end": "21:00"},
        {"id": 3, "trainerId": 3, "date": "2026-02-17", "start": "13:00", "end": "22:00"},
    ],
    "candidates": [
        {"id": 1, "name": "Ирина Соколова", "position": "Тренер групповых программ", "stage": "Собеседование"},
        {"id": 2, "name": "Сергей Лапин", "position": "Персональный тренер", "stage": "Оффер"},
    ],
    "payments": [
        {"id": 1, "client": "Екатерина Морозова", "amount": 14500, "method": "Карта", "date": "2026-02-15"},
        {"id": 2, "client": "Игорь Назаров", "amount": 9900, "method": "Наличные", "date": "2026-02-15"},
        {"id": 3, "client": "Виктор Осипов", "amount": 18900, "method": "Онлайн", "date": "2026-02-16"},
    ],
    "notes": [],
    "workoutsArchive": [
        {
            "id": 1,
            "trainerId": 1,
            "title": "TABATA",
            "level": "Высокоинтенсивная интервальная тренировка",
            "description": "ЭТО СОВРЕМЕННОЕ НАПРАВЛЕНИЕ, ДАЮЩЕЕ ЯРКО ВЫРАЖЕННЫЙ РЕЗУЛЬТАТ. ЕСЛИ ВЫ ХОТИТЕ СНИЗИТЬ ВЕС - ВАМ СЮДА. ЕСЛИ ВЫ ХОТИТЕ УВЕЛИЧИТЬ ВЫНОСЛИВОСТЬ - BAM СЮДА. ЕСЛИ ВЫ ХОТИТЕ НЕМНОГО ПОДКАЧАТЬ МЫШЦЫ И ДОБАВИТЬ ИМ ЖЁСТКОСТИ - ВАМ ТОЖЕ СЮДА.",
            "mediaType": "video",
            "media": "/media/tabata.mp4",
            "poster": "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1200&q=80",
        },
        {
            "id": 2,
            "trainerId": 1,
            "title": "MUSCLE TONING (MT)",
            "level": "Классическая силовая тренировка",
            "description": "ЭТО КЛАССИЧЕСКАЯ СИЛОВАЯ ТРЕНИРОВКА НА ВСЕ ГРУППЫ МЫШЦ. ТРЕНИРОВКА ОБЯЗАТЕЛЬНО ВКЛЮЧАЕТ В СЕБЯ ИНТЕНСИВНУЮ АЭРОБНУЮ РАЗМИНКУ, АКТИВНУЮ СИЛОВУЮ ЧАСТЬ И МЕДЛЕННУЮ ЗАМИНКУ. ЗАНЯТИЯ ПРЕДПОЛАГАЮТ НАГРУЗКУ КАК СРЕДНЕЙ, ТАК И ВЫСОКОЙ ИНТЕНСИВНОСТИ. ПОДХОДИТ ДЛЯ ЛЮБОГО УРОВНЯ ПОДГОТОВКИ.",
            "mediaType": "video",
            "media": "/media/muscle-toning-mt.mp4",
            "poster": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
        },
        {
            "id": 3,
            "trainerId": 1,
            "title": "TRX MIX",
            "level": "Функциональный тренинг",
            "description": "ЭТО функциональная тренировка с использованием подвесных петель. Подходит для всех уровней подготовленности.МЫ ДОБАВИЛИ ИНТЕНСИВНОСТИ ПРИВЫЧНЫМ ДВИЖЕНИЯМ И СДЕЛАЛИ УРОК МАКСИМАЛЬНО ЭФФЕКТИВНЫМ.",
            "mediaType": "video",
            "media": "/media/trx-mix.mp4",
            "poster": "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=1200&q=80",
        },
        {
            "id": 4,
            "trainerId": 1,
            "title": "FIT FOR JUNIORS",
            "level": "12-16 лет",
            "description": "ЭТО ЗАНЯТИЕ В ТРЕНАЖЁРНОМ ЗАЛЕ ПОД КОНТРОЛЕМ ОПЫТНОГО ПЕРСОНАЛЬНОГО ТРЕНЕРА. ЗДЕСЬ ОЧЕНЬ ИНТЕРЕСНО, ВЕДЬ ВАШЕМУ РЕБЁНКУ ВСЕГДА ХОЧЕТСЯ ПОХОДИТЬ ПО БЕГОВОЙ ДОРОЖКЕ, ПОДНЯТЬ ШТАНГУ, ПОДЕРЖАТЬ В РУКАХ ГАНТЕЛИ. ЗДЕСЬ ЭТО МОЖНО СДЕЛАТЬ С ПОЛЬЗОЙ ДЛЯ ДЕЛА, А НЕ ПРОСТО ТАК, ПОТОМУ ЧТО «ХОЧУ». ЗДЕСЬ БУДЕТ РЕЗУЛЬТАТ",
            "mediaType": "video",
            "media": "/media/fit-for-juniors.mp4",
            "poster": "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
        },
        {
            "id": 5,
            "trainerId": 1,
            "title": "PILATES",
            "level": "Здоровая спина и суставы",
            "description": "ЭТО НАПРАВЛЕНИЕ ОЧЕНЬ ПОЛЕЗНО ДЛЯ МЫШЦ СПИНЫ И ДЛЯ «УКРЕПЛЕНИЯ» ПОЗВОНОЧНИКА. СЛУЖИТ ОТЛИЧНОЙ ПРОФИЛАКТИКОЙ ЗАБОЛЕВАНИЙ ПОЗВОНОЧНИКА И суставов",
            "mediaType": "video",
            "media": "/media/pilates.mp4",
            "poster": "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=80",
        },
        {
            "id": 6,
            "trainerId": 1,
            "title": "STRETCHING",
            "level": "Гибкость и восстановление",
            "description": "ЭТО СПОКОЙНОЕ, МЕДЛЕННОЕ, НО ОЧЕНЬ ПОЛЕЗНОЕ ДЛЯ ВАШИХ МЫШЦ НАПРАВЛЕНИЕ УЛУЧШИТ ГИБКОСТЬ, ПОДВИЖНОСТЬ, ЭЛАСТИЧНОСТЬ МЫШЦ, СВЯЗОК, СУСТАВОВ. ОБЕСПЕЧИТ СНАБЖЕНИЕ КРОВЬЮ И КИСЛОРОДОМ РАБОТАЮЩИЕ МЫШЦЫ, ТЕМ САМЫМ ОКАЖЕТ ОЧЕНЬ ПОЛЕЗНОЕ ВЛИЯНИЕ НА НИХ. УСКОРИТ ВОССТАНОВЛЕНИЕ ПОСЛЕ СИЛОВЫХ ТРЕНИРОВОК.",
            "mediaType": "video",
            "media": "/media/stretching.mp4",
            "poster": "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=1200&q=80",
        }
    ],
}




def _normalize_text(value):
    return "".join(ch.lower() if ch.isalnum() else " " for ch in str(value or "")).split()


def detect_media_path_for_title(title):
    media_dir = BASE_DIR / "media"
    if not media_dir.exists() or not media_dir.is_dir():
        return None

    supported_ext = {".mp4", ".webm", ".mov", ".m4v", ".gif"}
    title_tokens = set(_normalize_text(title))

    candidates = []
    for file in media_dir.iterdir():
        if not file.is_file():
            continue
        suffix = file.suffix.lower()
        if suffix not in supported_ext:
            continue

        file_tokens = set(_normalize_text(file.stem))
        overlap = len(title_tokens & file_tokens)
        if title_tokens and overlap == 0:
            continue

        score = overlap * 10
        if suffix == ".mp4":
            score += 3
        elif suffix == ".webm":
            score += 2
        elif suffix in {".mov", ".m4v"}:
            score += 1

        candidates.append((score, file.name))

    if not candidates:
        return None

    candidates.sort(key=lambda item: (-item[0], item[1]))
    return f"/media/{candidates[0][1]}"


def ensure_archive_defaults(state):
    archive = state.get("workoutsArchive")
    if not isinstance(archive, list):
        archive = []

    by_title = {str(item.get("title", "")).strip().upper(): item for item in archive if isinstance(item, dict)}
    for item in SEED_STATE.get("workoutsArchive", []):
        key = str(item.get("title", "")).strip().upper()
        if key not in by_title:
            by_title[key] = dict(item)

    merged = list(by_title.values())
    for item in merged:
        title = item.get("title")
        found_media = detect_media_path_for_title(title)
        if found_media:
            item["mediaType"] = "video"
            item["media"] = found_media
        elif not item.get("media"):
            item["mediaType"] = item.get("mediaType") or "video"

    state["workoutsArchive"] = merged


def db_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with db_conn() as conn:
        conn.execute("CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK (id=1), state_json TEXT NOT NULL)")
        row = conn.execute("SELECT state_json FROM app_state WHERE id=1").fetchone()
        if row is None:
            conn.execute("INSERT INTO app_state (id, state_json) VALUES (1, ?)", (json.dumps(SEED_STATE, ensure_ascii=False),))
        conn.commit()


def load_state():
    with db_conn() as conn:
        row = conn.execute("SELECT state_json FROM app_state WHERE id=1").fetchone()
        state = SEED_STATE if not row else json.loads(row["state_json"])

    ensure_archive_defaults(state)
    return state


def save_state(state):
    with db_conn() as conn:
        conn.execute("UPDATE app_state SET state_json=? WHERE id=1", (json.dumps(state, ensure_ascii=False),))
        conn.commit()


class Handler(SimpleHTTPRequestHandler):
    def _send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        data = self.rfile.read(length) if length else b"{}"
        return json.loads(data.decode("utf-8"))

    def do_GET(self):
        if self.path == "/api/bootstrap":
            self._send_json({"state": load_state()})
            return
        return super().do_GET()

    def do_POST(self):
        if self.path == "/api/login":
            payload = self._read_json()
            email = payload.get("email", "").strip().lower()
            password = payload.get("password", "")
            state = load_state()
            user = next((u for u in state.get("users", []) if u.get("email", "").strip().lower() == email and u.get("password") == password), None)
            if not user:
                self._send_json({"error": "invalid_credentials"}, 401)
                return
            self._send_json({"user": user})
            return

        if self.path == "/api/register":
            payload = self._read_json()
            state = load_state()
            users = state.get("users", [])
            email = payload.get("email", "").strip().lower()
            if not payload.get("name") or not email or not payload.get("password"):
                self._send_json({"error": "invalid_payload"}, 400)
                return
            if any(u.get("email", "").strip().lower() == email for u in users):
                self._send_json({"error": "email_exists"}, 409)
                return
            new_id = max([u.get("id", 0) for u in users] + [0]) + 1
            user = {
                "id": new_id,
                "name": payload["name"],
                "email": email,
                "phone": payload.get("phone", ""),
                "password": payload["password"],
                "role": payload.get("role", "trainer"),
                "trainerId": state.get("trainers", [{}])[0].get("id") if payload.get("role") == "trainer" and state.get("trainers") else None,
            }
            users.append(user)
            state["users"] = users
            save_state(state)
            self._send_json({"state": state})
            return

        if self.path == "/api/state":
            payload = self._read_json()
            state = payload.get("state")
            if not isinstance(state, dict):
                self._send_json({"error": "invalid_state"}, 400)
                return
            save_state(state)
            self._send_json({"ok": True})
            return

        self._send_json({"error": "not_found"}, 404)


if __name__ == "__main__":
    init_db()
    server = ThreadingHTTPServer(("0.0.0.0", 4173), partial(Handler, directory=str(BASE_DIR)))
    print("Serving on http://0.0.0.0:4173")
    server.serve_forever()

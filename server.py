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
    ],
    "clients": [],
    "workLogs": [],
    "candidates": [],
    "payments": [],
    "notes": [],
}


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
        if not row:
            return SEED_STATE
        return json.loads(row["state_json"])


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

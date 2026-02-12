const { useMemo, useState, useEffect } = React;

const USERS = {
  admin: { email: 'admin@pulsepoint.club', password: 'admin123', name: 'Администратор' },
  trainer: { email: 'trainer@pulsepoint.club', password: 'trainer123', name: 'Тренер', trainerId: 1 },
  hr: { email: 'hr@pulsepoint.club', password: 'hr123', name: 'HR' },
  accountant: { email: 'finance@pulsepoint.club', password: 'finance123', name: 'Бухгалтер' },
};

const ROLE_TABS = {
  admin: ['Обзор', 'Тренеры', 'Расписание', 'Рабочее время', 'Нагрузка'],
  trainer: ['Мой день', 'Сессии', 'Клиенты', 'Рабочее время'],
  hr: ['Команда', 'Найм', 'Время сотрудников', 'Сертификации'],
  accountant: ['Финансы', 'Платежи', 'Зарплата', 'Отчеты'],
};

const KEY = 'pulsepoint-jsx-v1';
const initialData = {
  trainers: [
    { id: 1, name: 'Алексей Волков', spec: 'Силовой тренинг', maxWeek: 18, rate: 1800 },
    { id: 2, name: 'Марина Громова', spec: 'Функциональный тренинг', maxWeek: 16, rate: 1900 },
    { id: 3, name: 'Артем Беляев', spec: 'CrossFit', maxWeek: 20, rate: 2000 },
  ],
  classes: [
    { id: 1, title: 'Morning Power', trainerId: 1, day: 'Пн', time: '08:00', cap: 12, done: false },
    { id: 2, title: 'Core Burn', trainerId: 2, day: 'Вт', time: '18:30', cap: 14, done: false },
    { id: 3, title: 'CrossFit Pro', trainerId: 3, day: 'Ср', time: '20:00', cap: 10, done: false },
  ],
  shifts: [
    { id: 1, trainerId: 1, date: '2026-02-12', start: '08:00', end: '16:00' },
    { id: 2, trainerId: 2, date: '2026-02-12', start: '12:00', end: '20:00' },
  ],
  candidates: [{ id: 1, name: 'Ирина Соколова', position: 'Тренер', stage: 'Собеседование' }],
  payments: [
    { id: 1, client: 'Екатерина Морозова', amount: 14500, method: 'Карта', date: '2026-02-11' },
    { id: 2, client: 'Иван Петров', amount: 9900, method: 'Наличные', date: '2026-02-11' },
  ],
  notes: [],
};

const byId = (arr, id) => arr.find((x) => x.id === Number(id));
const nextId = (arr) => (arr.length ? Math.max(...arr.map((i) => i.id)) + 1 : 1);
const money = (n) => `${Number(n).toLocaleString('ru-RU')} ₽`;
const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function App() {
  const [db, setDb] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...initialData, ...JSON.parse(raw) } : initialData;
    } catch {
      return initialData;
    }
  });
  const [auth, setAuth] = useState({ role: '', email: '', password: '', msg: '', type: '' });
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState('');

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(db)), [db]);

  const metrics = useMemo(() => {
    const revenue = db.payments.reduce((s, p) => s + Number(p.amount), 0);
    const avgLoad = db.trainers.length
      ? Math.round(
          db.trainers.reduce((s, t) => s + Math.round((db.classes.filter((c) => c.trainerId === t.id).length / t.maxWeek) * 100), 0) /
            db.trainers.length,
        )
      : 0;
    return { revenue, avgLoad };
  }, [db]);

  const login = (e) => {
    e.preventDefault();
    const user = USERS[auth.role];
    if (!user) return setAuth((a) => ({ ...a, msg: 'Выберите роль.', type: 'error' }));
    if (user.email !== auth.email.trim().toLowerCase() || user.password !== auth.password) {
      return setAuth((a) => ({ ...a, msg: 'Неверные данные.', type: 'error' }));
    }
    setSession({ role: auth.role, user });
    setTab(ROLE_TABS[auth.role][0]);
    setAuth((a) => ({ ...a, msg: `Добро пожаловать, ${user.name}`, type: 'success' }));
  };

  const logout = () => {
    setSession(null);
    setTab('');
    setAuth({ role: '', email: '', password: '', msg: 'Вы вышли из системы.', type: 'success' });
  };

  return (
    <div className="app">
      {!session ? (
        <section className="card auth">
          <p className="eyebrow">PulsePoint Fitness Club</p>
          <h1 className="title">JSX CRM c дашбордами и диаграммами</h1>
          <p className="muted">Единая система управления: тренеры, расписание, рабочее время, HR и финансы.</p>

          <div className="grid-2">
            <form onSubmit={login} className="card block" style={{ padding: 14 }}>
              <div className="form-grid">
                <input placeholder="Email" value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} required />
                <input type="password" placeholder="Пароль" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} required />
                <select value={auth.role} onChange={(e) => setAuth({ ...auth, role: e.target.value })} required>
                  <option value="">Роль</option>
                  <option value="admin">Администратор</option>
                  <option value="trainer">Тренер</option>
                  <option value="hr">HR</option>
                  <option value="accountant">Бухгалтер</option>
                </select>
                <button className="btn-primary">Войти</button>
              </div>
              <p className={`status ${auth.type}`}>{auth.msg}</p>
            </form>

            <div className="card block" style={{ padding: 14 }}>
              <h3>Демо-доступ</h3>
              <p className="muted">admin@pulsepoint.club / admin123</p>
              <p className="muted">trainer@pulsepoint.club / trainer123</p>
              <p className="muted">hr@pulsepoint.club / hr123</p>
              <p className="muted">finance@pulsepoint.club / finance123</p>
            </div>
          </div>
        </section>
      ) : (
        <Dashboard session={session} tab={tab} setTab={setTab} db={db} setDb={setDb} metrics={metrics} logout={logout} />
      )}
    </div>
  );
}

function Dashboard({ session, tab, setTab, db, setDb, metrics, logout }) {
  const tabs = ROLE_TABS[session.role];

  return (
    <div className="shell">
      <header className="card topbar">
        <div>
          <p className="eyebrow">Роль: {session.user.name}</p>
          <h2 style={{ margin: 0 }}>PulsePoint CRM</h2>
        </div>
        <div className="topright">
          <span className="badge">Москва · Ленинградский проспект, 31А</span>
          <button className="btn-ghost" onClick={logout}>Выйти</button>
        </div>
      </header>

      <nav className="card tabs">
        {tabs.map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </nav>

      <section className="content">
        {session.role === 'admin' && <Admin tab={tab} db={db} setDb={setDb} metrics={metrics} />}
        {session.role === 'trainer' && <Trainer tab={tab} db={db} setDb={setDb} user={session.user} />}
        {session.role === 'hr' && <Hr tab={tab} db={db} setDb={setDb} />}
        {session.role === 'accountant' && <Accountant tab={tab} db={db} setDb={setDb} metrics={metrics} />}
      </section>
    </div>
  );
}

function KpiCards({ db, metrics }) {
  return (
    <div className="metrics">
      <div className="metric"><span>Тренеров</span><b>{db.trainers.length}</b></div>
      <div className="metric"><span>Занятий в расписании</span><b>{db.classes.length}</b></div>
      <div className="metric"><span>Средняя загрузка</span><b>{metrics.avgLoad}%</b></div>
      <div className="metric"><span>Выручка</span><b>{money(metrics.revenue)}</b></div>
    </div>
  );
}

function LoadBars({ db }) {
  return (
    <div className="chart-bars">
      {db.trainers.map((t) => {
        const cls = db.classes.filter((c) => c.trainerId === t.id).length;
        const pct = Math.min(100, Math.round((cls / t.maxWeek) * 100));
        return (
          <div className="bar-row" key={t.id}>
            <span>{t.name}</span>
            <div className="bar"><span style={{ width: `${pct}%` }} /></div>
            <b>{pct}%</b>
          </div>
        );
      })}
    </div>
  );
}

function RevenuePie({ db }) {
  const map = db.payments.reduce((acc, p) => {
    acc[p.method] = (acc[p.method] || 0) + Number(p.amount);
    return acc;
  }, {});
  const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
  const parts = Object.entries(map);
  let angle = 0;
  const colors = ['#22d3ee', '#34d399', '#fbbf24', '#f87171'];
  const segs = parts.map(([k, v], i) => {
    const pct = (v / total) * 360;
    const start = angle;
    angle += pct;
    return `${colors[i % colors.length]} ${start}deg ${angle}deg`;
  });
  const bg = segs.length ? `conic-gradient(${segs.join(',')})` : '#334155';
  return (
    <div>
      <div className="pie" style={{ background: bg }} />
      {parts.map(([k, v]) => <p key={k} className="muted">{k}: {money(v)}</p>)}
    </div>
  );
}

function Admin({ tab, db, setDb, metrics }) {
  const [trainerForm, setTrainerForm] = useState({ name: '', spec: '', maxWeek: 14, rate: 1700 });
  const [classForm, setClassForm] = useState({ title: '', trainerId: 1, day: 'Пн', time: '09:00', cap: 12 });
  const [shiftForm, setShiftForm] = useState({ trainerId: 1, date: '2026-02-12', start: '09:00', end: '18:00' });

  if (tab === 'Обзор') return <>
    <section className="card block"><KpiCards db={db} metrics={metrics} /></section>
    <section className="card block"><h3>Диаграмма загрузки тренеров</h3><LoadBars db={db} /></section>
    <section className="card block"><h3>Структура выручки по способам оплаты</h3><RevenuePie db={db} /></section>
  </>;

  if (tab === 'Тренеры') return <section className="card block">
    <h3>Добавление тренеров</h3>
    <div className="form-grid">
      <input placeholder="Имя" value={trainerForm.name} onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })} />
      <input placeholder="Специализация" value={trainerForm.spec} onChange={(e) => setTrainerForm({ ...trainerForm, spec: e.target.value })} />
      <input type="number" placeholder="Лимит/нед" value={trainerForm.maxWeek} onChange={(e) => setTrainerForm({ ...trainerForm, maxWeek: Number(e.target.value) })} />
      <input type="number" placeholder="Ставка" value={trainerForm.rate} onChange={(e) => setTrainerForm({ ...trainerForm, rate: Number(e.target.value) })} />
      <button className="btn-primary" onClick={() => {
        if (!trainerForm.name || !trainerForm.spec) return;
        setDb((s) => ({ ...s, trainers: [...s.trainers, { id: nextId(s.trainers), ...trainerForm }] }));
        setTrainerForm({ name: '', spec: '', maxWeek: 14, rate: 1700 });
      }}>Добавить</button>
    </div>
    <Table headers={['Имя', 'Специализация', 'Лимит', 'Ставка']} rows={db.trainers.map(t => [t.name, t.spec, t.maxWeek, money(t.rate)])} />
  </section>;

  if (tab === 'Расписание') return <section className="card block">
    <h3>Составление расписания</h3>
    <div className="form-grid">
      <input placeholder="Название" value={classForm.title} onChange={(e) => setClassForm({ ...classForm, title: e.target.value })} />
      <select value={classForm.trainerId} onChange={(e) => setClassForm({ ...classForm, trainerId: Number(e.target.value) })}>
        {db.trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <select value={classForm.day} onChange={(e) => setClassForm({ ...classForm, day: e.target.value })}>{days.map(d => <option key={d}>{d}</option>)}</select>
      <input type="time" value={classForm.time} onChange={(e) => setClassForm({ ...classForm, time: e.target.value })} />
      <input type="number" value={classForm.cap} onChange={(e) => setClassForm({ ...classForm, cap: Number(e.target.value) })} />
      <button className="btn-primary" onClick={() => {
        if (!classForm.title) return;
        setDb((s) => ({ ...s, classes: [...s.classes, { id: nextId(s.classes), ...classForm, done: false }] }));
        setClassForm({ ...classForm, title: '' });
      }}>Добавить занятие</button>
    </div>
    <Table headers={['Занятие', 'Тренер', 'День', 'Время', 'Мест', '']} rows={db.classes.map(c => [
      c.title, byId(db.trainers, c.trainerId)?.name || '-', c.day, c.time, c.cap,
      <button className="btn-ghost" onClick={() => setDb(s => ({...s, classes: s.classes.filter(x => x.id !== c.id)}))}>Удалить</button>
    ])} />
  </section>;

  if (tab === 'Рабочее время') return <section className="card block">
    <h3>Учет рабочего времени</h3>
    <div className="form-grid">
      <select value={shiftForm.trainerId} onChange={(e) => setShiftForm({ ...shiftForm, trainerId: Number(e.target.value) })}>{db.trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
      <input type="date" value={shiftForm.date} onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })} />
      <input type="time" value={shiftForm.start} onChange={(e) => setShiftForm({ ...shiftForm, start: e.target.value })} />
      <input type="time" value={shiftForm.end} onChange={(e) => setShiftForm({ ...shiftForm, end: e.target.value })} />
      <button className="btn-primary" onClick={() => {
        setDb((s) => ({ ...s, shifts: [...s.shifts, { id: nextId(s.shifts), ...shiftForm }] }));
      }}>Добавить смену</button>
    </div>
    <Table headers={['Тренер', 'Дата', 'Начало', 'Конец', 'Часы']} rows={db.shifts.map(s => [
      byId(db.trainers, s.trainerId)?.name || '-', s.date, s.start, s.end, calcHours(s.start, s.end)
    ])} />
  </section>;

  return <section className="card block"><h3>Нагрузка</h3><LoadBars db={db} /></section>;
}

function Trainer({ tab, db, setDb, user }) {
  const trainer = byId(db.trainers, user.trainerId) || db.trainers[0];
  const sessions = db.classes.filter(c => c.trainerId === trainer.id);
  const myShifts = db.shifts.filter(s => s.trainerId === trainer.id);
  const [note, setNote] = useState({ client: '', text: '' });

  if (tab === 'Мой день') return <section className="card block">
    <h3>{trainer.name}</h3>
    <div className="metrics">
      <div className="metric"><span>Сессий</span><b>{sessions.length}</b></div>
      <div className="metric"><span>Проведено</span><b>{sessions.filter(s => s.done).length}</b></div>
      <div className="metric"><span>Мои часы</span><b>{myShifts.reduce((s, sh) => s + Number(calcHours(sh.start, sh.end)), 0)}</b></div>
    </div>
  </section>;

  if (tab === 'Сессии') return <section className="card block">
    <h3>Мои занятия</h3>
    <Table headers={['Занятие', 'День', 'Время', 'Статус', '']} rows={sessions.map(c => [
      c.title, c.day, c.time, c.done ? 'Проведено' : 'Запланировано',
      <button className="btn-ghost" onClick={() => setDb(s => ({ ...s, classes: s.classes.map(x => x.id === c.id ? { ...x, done: !x.done } : x) }))}>{c.done ? 'Откатить' : 'Закрыть'}</button>
    ])} />
  </section>;

  if (tab === 'Клиенты') return <section className="card block">
    <h3>Заметки по клиентам</h3>
    <div className="form-grid">
      <input placeholder="Клиент" value={note.client} onChange={(e) => setNote({ ...note, client: e.target.value })} />
      <textarea placeholder="Комментарий" value={note.text} onChange={(e) => setNote({ ...note, text: e.target.value })} />
      <button className="btn-primary" onClick={() => {
        if (!note.client || !note.text) return;
        setDb(s => ({ ...s, notes: [...s.notes, { id: nextId(s.notes), trainerId: trainer.id, client: note.client, text: note.text, date: new Date().toISOString().slice(0, 10) }] }));
        setNote({ client: '', text: '' });
      }}>Сохранить</button>
    </div>
    <Table headers={['Клиент', 'Комментарий', 'Дата']} rows={db.notes.filter(n => n.trainerId === trainer.id).map(n => [n.client, n.text, n.date])} />
  </section>;

  return <section className="card block">
    <h3>Мое рабочее время</h3>
    <div className="timeline">
      {myShifts.map(s => <div key={s.id} className="timeline-item">{s.date}: {s.start}–{s.end} ({calcHours(s.start, s.end)} ч)</div>)}
    </div>
  </section>;
}

function Hr({ tab, db, setDb }) {
  const [cand, setCand] = useState({ name: '', position: '' });
  if (tab === 'Команда') return <section className="card block"><h3>Тренерский состав</h3><Table headers={['Имя', 'Специализация', 'Текущая загрузка']} rows={db.trainers.map(t => [t.name, t.spec, `${Math.round((db.classes.filter(c => c.trainerId === t.id).length / t.maxWeek) * 100)}%`])} /></section>;

  if (tab === 'Найм') return <section className="card block">
    <h3>Воронка найма</h3>
    <div className="form-grid">
      <input placeholder="Имя" value={cand.name} onChange={(e) => setCand({ ...cand, name: e.target.value })} />
      <input placeholder="Позиция" value={cand.position} onChange={(e) => setCand({ ...cand, position: e.target.value })} />
      <button className="btn-primary" onClick={() => {
        if (!cand.name || !cand.position) return;
        setDb(s => ({ ...s, candidates: [...s.candidates, { id: nextId(s.candidates), ...cand, stage: 'Скрининг' }] }));
        setCand({ name: '', position: '' });
      }}>Добавить</button>
    </div>
    <Table headers={['Кандидат', 'Позиция', 'Этап']} rows={db.candidates.map(c => [
      c.name, c.position,
      <select value={c.stage} onChange={(e) => setDb(s => ({ ...s, candidates: s.candidates.map(x => x.id === c.id ? { ...x, stage: e.target.value } : x) }))}>
        {['Скрининг','Собеседование','Оффер','Нанят'].map(st => <option key={st}>{st}</option>)}
      </select>
    ])} />
  </section>;

  if (tab === 'Время сотрудников') return <section className="card block">
    <h3>Учет рабочего времени команды</h3>
    <Table headers={['Тренер','Кол-во смен','Сумма часов']} rows={db.trainers.map(t => {
      const shifts = db.shifts.filter(s => s.trainerId === t.id);
      const hours = shifts.reduce((sum, s) => sum + Number(calcHours(s.start, s.end)), 0);
      return [t.name, shifts.length, `${hours} ч`];
    })} />
  </section>;

  return <section className="card block"><h3>Сертификации</h3><Table headers={['Тренер', 'Аттестация', 'Статус']} rows={db.trainers.map((t, i) => [t.name, ['март','апрель','май'][i % 3], 'Запланировано'])} /></section>;
}

function Accountant({ tab, db, setDb, metrics }) {
  const [pay, setPay] = useState({ client: '', amount: 0, method: 'Карта' });

  if (tab === 'Финансы') return <>
    <section className="card block"><KpiCards db={db} metrics={metrics} /></section>
    <section className="card block"><h3>Структура оплат</h3><RevenuePie db={db} /></section>
  </>;

  if (tab === 'Платежи') return <section className="card block">
    <h3>Платежи клиентов</h3>
    <div className="form-grid">
      <input placeholder="Клиент" value={pay.client} onChange={(e) => setPay({ ...pay, client: e.target.value })} />
      <input type="number" placeholder="Сумма" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: Number(e.target.value) })} />
      <select value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}><option>Карта</option><option>Наличные</option><option>Онлайн</option></select>
      <button className="btn-primary" onClick={() => {
        if (!pay.client || pay.amount <= 0) return;
        setDb(s => ({ ...s, payments: [...s.payments, { id: nextId(s.payments), ...pay, date: new Date().toISOString().slice(0,10) }] }));
        setPay({ client: '', amount: 0, method: 'Карта' });
      }}>Добавить платеж</button>
    </div>
    <Table headers={['Дата','Клиент','Метод','Сумма']} rows={db.payments.map(p => [p.date, p.client, p.method, money(p.amount)])} />
  </section>;

  if (tab === 'Зарплата') return <section className="card block">
    <h3>Начисления тренерам</h3>
    <Table headers={['Тренер','Занятий','Ставка','Смена часов','Начислено']} rows={db.trainers.map(t => {
      const c = db.classes.filter(x => x.trainerId === t.id).length;
      const h = db.shifts.filter(s => s.trainerId === t.id).reduce((sum, s) => sum + Number(calcHours(s.start, s.end)), 0);
      return [t.name, c, money(t.rate), `${h} ч`, money(c * t.rate)];
    })} />
  </section>;

  return <section className="card block">
    <h3>Отчеты</h3>
    <p className="muted">Маржинальность: {Math.max(0, Math.round((metrics.revenue - db.trainers.reduce((s, t) => s + db.classes.filter(c => c.trainerId === t.id).length * t.rate, 0)) / Math.max(metrics.revenue, 1) * 100))}%</p>
    <LoadBars db={db} />
  </section>;
}

function calcHours(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  return Math.max(0, mins / 60).toFixed(1);
}

function Table({ headers, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map((row, i) => <tr key={i}>{row.map((c, j) => <td key={j}>{c}</td>)}</tr>) : <tr><td colSpan={headers.length}>Нет данных</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

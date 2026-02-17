const { useMemo, useState, useEffect } = React;

const API_BASE = '/api';

const seedData = {
  users: [
    { id: 1, name: 'Анна Петрова', email: 'admin@pulsepoint.club', password: 'admin123', role: 'admin', phone: '+7 927 101-22-33' },
    { id: 2, name: 'Алексей Волков', email: 'trainer@pulsepoint.club', password: 'trainer123', role: 'trainer', trainerId: 1, phone: '+7 927 102-33-44' },
    { id: 3, name: 'Мария Исаева', email: 'hr@pulsepoint.club', password: 'hr123', role: 'hr', phone: '+7 927 103-44-55' },
    { id: 4, name: 'Ольга Соколова', email: 'finance@pulsepoint.club', password: 'finance123', role: 'accountant', phone: '+7 927 104-55-66' },
  ],
  trainers: [
    { id: 1, name: 'Алексей Волков', spec: 'Силовой тренинг', level: 'Senior', maxDailySlots: 4, rate: 2200 },
    { id: 2, name: 'Марина Громова', spec: 'Функциональный тренинг', level: 'Senior', maxDailySlots: 5, rate: 2400 },
    { id: 3, name: 'Артем Беляев', spec: 'CrossFit', level: 'Middle', maxDailySlots: 4, rate: 2000 },
    { id: 4, name: 'Егор Титов', spec: 'Mobility', level: 'Middle', maxDailySlots: 5, rate: 1800 },
    { id: 5, name: 'Ксения Левина', spec: 'Yoga / Recovery', level: 'Senior', maxDailySlots: 6, rate: 2100 },
  ],
  classes: [
    { id: 1, title: 'Morning Power', trainerId: 1, date: '2026-02-16', time: '08:00', duration: 60, capacity: 12, room: 'A', done: false },
    { id: 2, title: 'Functional Burn', trainerId: 2, date: '2026-02-16', time: '18:30', duration: 60, capacity: 14, room: 'B', done: false },
    { id: 3, title: 'CrossFit Pro', trainerId: 3, date: '2026-02-17', time: '20:00', duration: 75, capacity: 10, room: 'A', done: false },
    { id: 4, title: 'Mobility Flow', trainerId: 4, date: '2026-02-17', time: '17:00', duration: 50, capacity: 16, room: 'C', done: false },
    { id: 5, title: 'Recovery Yoga', trainerId: 5, date: '2026-02-18', time: '19:30', duration: 60, capacity: 20, room: 'B', done: false },
  ],
  clients: [
    { id: 1, name: 'Екатерина Морозова', program: 'Body Rebuild', trainerId: 1, status: 'Активен' },
    { id: 2, name: 'Игорь Назаров', program: 'Mass Gain', trainerId: 1, status: 'Активен' },
    { id: 3, name: 'София Ларионова', program: 'Functional Fit', trainerId: 2, status: 'Пауза' },
  ],
  workLogs: [
    { id: 1, trainerId: 1, date: '2026-02-16', start: '07:30', end: '16:30' },
    { id: 2, trainerId: 2, date: '2026-02-16', start: '12:00', end: '21:00' },
    { id: 3, trainerId: 3, date: '2026-02-17', start: '13:00', end: '22:00' },
  ],
  candidates: [
    { id: 1, name: 'Ирина Соколова', position: 'Тренер групповых программ', stage: 'Собеседование' },
    { id: 2, name: 'Сергей Лапин', position: 'Персональный тренер', stage: 'Оффер' },
  ],
  payments: [
    { id: 1, client: 'Екатерина Морозова', amount: 14500, method: 'Карта', date: '2026-02-15' },
    { id: 2, client: 'Иван Петров', amount: 9900, method: 'Наличные', date: '2026-02-15' },
    { id: 3, client: 'Дарья Романова', amount: 18900, method: 'Онлайн', date: '2026-02-16' },
  ],
  notes: [],
};

const roleLabels = {
  admin: 'Администратор',
  trainer: 'Тренер',
  hr: 'HR',
  accountant: 'Бухгалтер',
};

const roleTabs = {
  admin: ['Обзор', 'Календарь нагрузки', 'Тренеры', 'Расписание', 'Учётки', 'Зарплаты'],
  trainer: ['Панель', 'Мои занятия', 'Клиенты', 'Рабочее время'],
  hr: ['Команда', 'Найм', 'Сертификации', 'Посещаемость'],
  accountant: ['Финансы', 'Платежи', 'Выплаты', 'Прогноз'],
};

const money = (v) => `${Number(v).toLocaleString('ru-RU')} ₽`;
const nextId = (arr) => (arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1);
const byId = (arr, id) => arr.find((x) => x.id === Number(id));

function App() {
  const [db, setDb] = useState(null);
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState('');
  const [sessionUserId, setSessionUserId] = useState(null);
  const [tab, setTab] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authMessage, setAuthMessage] = useState({ text: '', type: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '', role: 'trainer' });

  useEffect(() => {
    async function bootstrap() {
      try {
        const response = await fetch(`${API_BASE}/bootstrap`);
        if (!response.ok) throw new Error('bootstrap_failed');
        const payload = await response.json();
        setDb(payload.state || seedData);
        setDbReady(true);
      } catch {
        setDb(seedData);
        setDbReady(true);
        setDbError('Не удалось подключиться к БД API. Загружен временный демо-режим.');
      }
    }
    bootstrap();
  }, []);

  useEffect(() => {
    if (!dbReady || !db) return;
    fetch(`${API_BASE}/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: db }),
    }).catch(() => {});
  }, [db, dbReady]);

  const dashboardMetrics = useMemo(() => {
    if (!db) {
      return { revenue: 0, classCount: 0, avgDailyClasses: '0.0', totalPayroll: 0 };
    }

    const revenue = db.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const classCount = db.classes.length;
    const avgDailyClasses = classCount ? (classCount / 7).toFixed(1) : '0.0';
    const totalPayroll = db.trainers.reduce((sum, tr) => {
      const count = db.classes.filter((c) => c.trainerId === tr.id).length;
      return sum + count * tr.rate;
    }, 0);
    return { revenue, classCount, avgDailyClasses, totalPayroll };
  }, [db]);

  if (!dbReady || !db) {
    return (
      <div className="app-root">
        <section className="auth-layout glass">
          <div className="auth-promo">
            <h2>Загрузка CRM...</h2>
            <p>Подключаемся к базе данных и загружаем данные клуба.</p>
          </div>
        </section>
      </div>
    );
  }

  const user = db.users.find((u) => u.id === sessionUserId) || null;

  function doLogin(e) {
    e.preventDefault();
    fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('login_failed');
        return response.json();
      })
      .then((payload) => {
        const found = payload.user;
        setSessionUserId(found.id);
        setTab(roleTabs[found.role][0]);
        setAuthMessage({ text: `Добро пожаловать, ${found.name}!`, type: 'success' });
      })
      .catch(() => {
        setAuthMessage({ text: 'Неверный email или пароль.', type: 'error' });
      });
  }

  function doRegister(e) {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setAuthMessage({ text: 'Заполните обязательные поля.', type: 'error' });
      return;
    }
    const normalizedEmail = registerForm.email.trim().toLowerCase();
    const exists = db.users.some((u) => u.email.trim().toLowerCase() === normalizedEmail);
    if (exists) {
      setAuthMessage({ text: 'Пользователь с таким email уже существует.', type: 'error' });
      return;
    }

    fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: registerForm.name,
        email: normalizedEmail,
        phone: registerForm.phone,
        password: registerForm.password,
        role: registerForm.role,
      }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('register_failed');
        return response.json();
      })
      .then((payload) => {
        setDb(payload.state);
        setRegisterForm({ name: '', email: '', phone: '', password: '', role: 'trainer' });
        setAuthMode('login');
        setAuthMessage({ text: 'Учётная запись создана. Теперь войдите.', type: 'success' });
      })
      .catch(() => {
        setAuthMessage({ text: 'Не удалось создать учётную запись.', type: 'error' });
      });
  }

  function logout() {
    setSessionUserId(null);
    setMenuOpen(false);
    setLoginForm({ email: '', password: '' });
    setAuthMessage({ text: 'Вы вышли из системы.', type: 'success' });
  }

  return (
    <div className="app-root">
      <header className="site-header glass">
        <div>
          <p className="eyebrow">PulsePoint Fitness Club</p>
          <h1>CRM для фитнес-клуба</h1>
        </div>
        <div className="header-meta">
          <span className="chip">г. Самара, ТЦ ПаркХаус</span>
          {user && <button className="btn ghost" onClick={logout}>Выйти</button>}
        </div>
      </header>

      {!user ? (
        <section className="auth-layout glass">
          <div className="auth-promo">
            <p className="auth-kicker">Executive Access</p>
            <h2>Премиальная авторизация PulsePoint</h2>
            <p>
              Вход в CRM с усиленным UX: роль определяется автоматически, а все рабочие
              сценарии открываются за 1 шаг.
            </p>
            <div className="auth-highlights">
              <div><b>24/7</b><span>доступ к данным клуба</span></div>
              <div><b>1 click</b><span>переключение между модулями</span></div>
              <div><b>Secure</b><span>проверка учётной записи в API</span></div>
            </div>
            <ul>
              <li>admin@pulsepoint.club / admin123</li>
              <li>trainer@pulsepoint.club / trainer123</li>
              <li>hr@pulsepoint.club / hr123</li>
              <li>finance@pulsepoint.club / finance123</li>
            </ul>
          </div>

          <div className="auth-box">
            <p className="auth-box-title">Доступ сотрудника</p>
            <p className="auth-box-subtitle">Все элементы формы выстроены сверху вниз для быстрого ввода.</p>

            <div className="switch-row">
              <button type="button" className={`btn ${authMode === 'login' ? 'active' : 'ghost'}`} onClick={() => setAuthMode('login')}>Вход</button>
              <button type="button" className={`btn ${authMode === 'register' ? 'active' : 'ghost'}`} onClick={() => setAuthMode('register')}>Новая учётка</button>
            </div>

            {authMode === 'login' ? (
              <form className="auth-form-stack" onSubmit={doLogin}>
                <label className="field-label">
                  Email
                  <input placeholder="name@pulsepoint.club" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
                </label>
                <label className="field-label">
                  Пароль
                  <input type="password" placeholder="Введите пароль" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                </label>
                <button className="btn primary" type="submit">Войти в CRM</button>
              </form>
            ) : (
              <form className="auth-form-stack" onSubmit={doRegister}>
                <label className="field-label">
                  ФИО
                  <input placeholder="Иванов Иван Иванович" value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} />
                </label>
                <label className="field-label">
                  Email
                  <input placeholder="name@pulsepoint.club" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} />
                </label>
                <label className="field-label">
                  Телефон
                  <input placeholder="+7 900 000-00-00" value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} />
                </label>
                <label className="field-label">
                  Пароль
                  <input type="password" placeholder="Создайте пароль" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} />
                </label>
                <label className="field-label">
                  Роль сотрудника
                  <select value={registerForm.role} onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}>
                    <option value="trainer">Тренер</option>
                    <option value="hr">HR</option>
                    <option value="accountant">Бухгалтер</option>
                    <option value="admin">Администратор</option>
                  </select>
                </label>
                <button className="btn primary" type="submit">Создать учётку</button>
              </form>
            )}
            <p className={`status ${authMessage.type}`}>{authMessage.text}</p>
            {dbError ? <p className="status error">{dbError}</p> : null}
          </div>
        </section>
      ) : (
        <main className="dashboard-shell">
          <section className="dashboard-head glass">
            <button className="burger" onClick={() => setMenuOpen((v) => !v)} aria-label="Меню">
              <span></span><span></span><span></span>
            </button>
            <div>
              <p className="eyebrow">Роль: {roleLabels[user.role]}</p>
              <h2>{user.name}</h2>
            </div>
            <div className="chip">{user.email}</div>
          </section>

          <nav className={`tabs glass ${menuOpen ? 'open' : ''}`}>
            {roleTabs[user.role].map((name) => (
              <button
                key={name}
                className={`tab-btn ${tab === name ? 'active' : ''}`}
                onClick={() => {
                  setTab(name);
                  setMenuOpen(false);
                }}
              >
                {name}
              </button>
            ))}
          </nav>

          <section className="content-grid">
            <RoleDashboard
              user={user}
              tab={tab}
              db={db}
              setDb={setDb}
              metrics={dashboardMetrics}
            />
          </section>
        </main>
      )}

      <footer className="site-footer glass">
        <div>PulsePoint Fitness Club</div>
        <div>г. Самара, ТЦ ПаркХаус · +7 (495) 000-11-22 · crm@pulsepoint.club</div>
      </footer>
    </div>
  );
}

function RoleDashboard({ user, tab, db, setDb, metrics }) {
  if (user.role === 'admin') return <AdminDashboard tab={tab} db={db} setDb={setDb} metrics={metrics} />;
  if (user.role === 'trainer') return <TrainerDashboard tab={tab} db={db} setDb={setDb} user={user} />;
  if (user.role === 'hr') return <HRDashboard tab={tab} db={db} setDb={setDb} />;
  return <AccountantDashboard tab={tab} db={db} setDb={setDb} metrics={metrics} />;
}

function AdminDashboard({ tab, db, setDb, metrics }) {
  const [trainerForm, setTrainerForm] = useState({ name: '', spec: '', level: 'Middle', maxDailySlots: 4, rate: 2000 });
  const [classForm, setClassForm] = useState({ title: '', trainerId: db.trainers[0]?.id || 1, date: '2026-02-20', time: '10:00', duration: 60, capacity: 12, room: 'A' });
  const [accountForm, setAccountForm] = useState({ name: '', email: '', phone: '', password: '', role: 'trainer' });

  if (tab === 'Обзор') {
    return (
      <>
        <Card>
          <h3>Ключевые показатели клуба</h3>
          <div className="metrics">
            <Metric label="Выручка" value={money(metrics.revenue)} />
            <Metric label="Тренеров" value={db.trainers.length} />
            <Metric label="Занятий" value={metrics.classCount} />
            <Metric label="Средняя нагрузка / день" value={metrics.avgDailyClasses} />
            <Metric label="Фонд выплат" value={money(metrics.totalPayroll)} />
          </div>
        </Card>
        <Card>
          <h3>Нагрузка тренеров (диаграмма)</h3>
          <LoadBars db={db} />
        </Card>
      </>
    );
  }

  if (tab === 'Календарь нагрузки') {
    return <Card><h3>Календарь распределения нагрузок</h3><LoadCalendar db={db} /></Card>;
  }

  if (tab === 'Тренеры') {
    return (
      <Card>
        <h3>Пул тренеров</h3>
        <form className="form-grid" onSubmit={(e) => {
          e.preventDefault();
          if (!trainerForm.name || !trainerForm.spec) return;
          setDb((s) => ({ ...s, trainers: [...s.trainers, { id: nextId(s.trainers), ...trainerForm }] }));
          setTrainerForm({ name: '', spec: '', level: 'Middle', maxDailySlots: 4, rate: 2000 });
        }}>
          <input placeholder="ФИО" value={trainerForm.name} onChange={(e) => setTrainerForm({ ...trainerForm, name: e.target.value })} />
          <input placeholder="Специализация" value={trainerForm.spec} onChange={(e) => setTrainerForm({ ...trainerForm, spec: e.target.value })} />
          <select value={trainerForm.level} onChange={(e) => setTrainerForm({ ...trainerForm, level: e.target.value })}><option>Junior</option><option>Middle</option><option>Senior</option></select>
          <input type="number" placeholder="Лимит слотов в день" value={trainerForm.maxDailySlots} onChange={(e) => setTrainerForm({ ...trainerForm, maxDailySlots: Number(e.target.value) })} />
          <input type="number" placeholder="Ставка" value={trainerForm.rate} onChange={(e) => setTrainerForm({ ...trainerForm, rate: Number(e.target.value) })} />
          <button className="btn primary">Добавить тренера</button>
        </form>
        <DataTable
          headers={['Тренер', 'Специализация', 'Уровень', 'Лимит/день', 'Ставка']}
          rows={db.trainers.map((tr) => [tr.name, tr.spec, tr.level, tr.maxDailySlots, money(tr.rate)])}
        />
      </Card>
    );
  }

  if (tab === 'Расписание') {
    return (
      <Card>
        <h3>Расписание занятий</h3>
        <form className="form-grid" onSubmit={(e) => {
          e.preventDefault();
          if (!classForm.title) return;
          setDb((s) => ({ ...s, classes: [...s.classes, { id: nextId(s.classes), ...classForm, done: false }] }));
        }}>
          <input placeholder="Название" value={classForm.title} onChange={(e) => setClassForm({ ...classForm, title: e.target.value })} />
          <select value={classForm.trainerId} onChange={(e) => setClassForm({ ...classForm, trainerId: Number(e.target.value) })}>
            {db.trainers.map((tr) => <option key={tr.id} value={tr.id}>{tr.name}</option>)}
          </select>
          <input type="date" value={classForm.date} onChange={(e) => setClassForm({ ...classForm, date: e.target.value })} />
          <input type="time" value={classForm.time} onChange={(e) => setClassForm({ ...classForm, time: e.target.value })} />
          <input type="number" placeholder="Длительность" value={classForm.duration} onChange={(e) => setClassForm({ ...classForm, duration: Number(e.target.value) })} />
          <input type="number" placeholder="Мест" value={classForm.capacity} onChange={(e) => setClassForm({ ...classForm, capacity: Number(e.target.value) })} />
          <select value={classForm.room} onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}><option>A</option><option>B</option><option>C</option></select>
          <button className="btn primary">Добавить в расписание</button>
        </form>
        <DataTable
          headers={['Занятие', 'Тренер', 'Дата', 'Время', 'Зал', 'Мест', '']}
          rows={db.classes.map((c) => [
            c.title,
            byId(db.trainers, c.trainerId)?.name || '-',
            c.date,
            c.time,
            c.room,
            c.capacity,
            <button type="button" className="btn ghost" onClick={() => setDb((s) => ({ ...s, classes: s.classes.filter((x) => x.id !== c.id) }))}>Удалить</button>,
          ])}
        />
      </Card>
    );
  }

  if (tab === 'Учётки') {
    return (
      <Card>
        <h3>Управление учётными записями</h3>
        <form className="form-grid" onSubmit={(e) => {
          e.preventDefault();
          if (!accountForm.name || !accountForm.email || !accountForm.password) return;
          if (db.users.some((u) => u.email.trim().toLowerCase() === accountForm.email.trim().toLowerCase())) return;
          setDb((s) => ({ ...s, users: [...s.users, { id: nextId(s.users), ...accountForm, email: accountForm.email.trim().toLowerCase(), trainerId: accountForm.role === 'trainer' ? s.trainers[0]?.id : undefined }] }));
          setAccountForm({ name: '', email: '', phone: '', password: '', role: 'trainer' });
        }}>
          <input placeholder="ФИО" value={accountForm.name} onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} />
          <input placeholder="Email" value={accountForm.email} onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value.toLowerCase() })} />
          <input placeholder="Телефон" value={accountForm.phone} onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })} />
          <input placeholder="Пароль" value={accountForm.password} onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })} />
          <select value={accountForm.role} onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value })}><option value="trainer">Тренер</option><option value="hr">HR</option><option value="accountant">Бухгалтер</option><option value="admin">Админ</option></select>
          <button className="btn primary">Добавить учётку</button>
        </form>
        <DataTable
          headers={['Сотрудник', 'Роль', 'Email', 'Телефон']}
          rows={db.users.map((u) => [u.name, roleLabels[u.role], u.email, u.phone || '-'])}
        />
      </Card>
    );
  }

  return (
    <Card>
      <h3>Зарплатная ведомость</h3>
      <DataTable
        headers={['Тренер', 'Занятий', 'Ставка', 'К выплате']}
        rows={db.trainers.map((tr) => {
          const classes = db.classes.filter((c) => c.trainerId === tr.id).length;
          return [tr.name, classes, money(tr.rate), money(classes * tr.rate)];
        })}
      />
    </Card>
  );
}

function TrainerDashboard({ tab, db, setDb, user }) {
  const myTrainer = byId(db.trainers, user.trainerId) || db.trainers[0];
  const myClasses = db.classes.filter((c) => c.trainerId === myTrainer.id);
  const myClients = db.clients.filter((c) => c.trainerId === myTrainer.id);
  const myWork = db.workLogs.filter((w) => w.trainerId === myTrainer.id);
  const [note, setNote] = useState({ client: '', text: '' });

  if (tab === 'Панель') {
    return (
      <>
        <Card>
          <h3>{myTrainer.name} · {myTrainer.spec}</h3>
          <div className="metrics">
            <Metric label="Мои занятия" value={myClasses.length} />
            <Metric label="Проведено" value={myClasses.filter((c) => c.done).length} />
            <Metric label="Клиенты" value={myClients.length} />
            <Metric label="Ставка" value={money(myTrainer.rate)} />
          </div>
        </Card>
        <Card>
          <h3>Ближайшие тренировки</h3>
          <DataTable
            headers={['Дата', 'Время', 'Занятие', 'Зал', 'Статус']}
            rows={myClasses.slice(0, 8).map((c) => [c.date, c.time, c.title, c.room, c.done ? 'Проведено' : 'Запланировано'])}
          />
        </Card>
      </>
    );
  }

  if (tab === 'Мои занятия') {
    return (
      <Card>
        <h3>Управление занятиями</h3>
        <DataTable
          headers={['Дата', 'Время', 'Занятие', 'Статус', '']}
          rows={myClasses.map((c) => [
            c.date,
            c.time,
            c.title,
            c.done ? 'Проведено' : 'Запланировано',
            <button type="button" className="btn ghost" onClick={() => setDb((s) => ({ ...s, classes: s.classes.map((x) => x.id === c.id ? { ...x, done: !x.done } : x) }))}>{c.done ? 'Откатить' : 'Закрыть'}</button>,
          ])}
        />
      </Card>
    );
  }

  if (tab === 'Клиенты') {
    return (
      <Card>
        <h3>Мои клиенты и заметки</h3>
        <form className="form-grid" onSubmit={(e) => {
          e.preventDefault();
          if (!note.client || !note.text) return;
          setDb((s) => ({ ...s, notes: [...s.notes, { id: nextId(s.notes), trainerId: myTrainer.id, client: note.client, text: note.text, date: new Date().toISOString().slice(0, 10) }] }));
          setNote({ client: '', text: '' });
        }}>
          <input placeholder="Клиент" value={note.client} onChange={(e) => setNote({ ...note, client: e.target.value })} />
          <textarea placeholder="Комментарий" value={note.text} onChange={(e) => setNote({ ...note, text: e.target.value })} />
          <button className="btn primary">Сохранить заметку</button>
        </form>
        <DataTable
          headers={['Клиент', 'Комментарий', 'Дата']}
          rows={db.notes.filter((n) => n.trainerId === myTrainer.id).map((n) => [n.client, n.text, n.date])}
        />
      </Card>
    );
  }

  return (
    <Card>
      <h3>Рабочее время</h3>
      <DataTable
        headers={['Дата', 'Начало', 'Конец', 'Часы']}
        rows={myWork.map((w) => [w.date, w.start, w.end, calcHours(w.start, w.end)])}
      />
    </Card>
  );
}

function HRDashboard({ tab, db, setDb }) {
  const [cand, setCand] = useState({ name: '', position: '' });

  if (tab === 'Команда') {
    return (
      <Card>
        <h3>Тренерский состав</h3>
        <DataTable
          headers={['Тренер', 'Специализация', 'Уровень', 'Текущие занятия']}
          rows={db.trainers.map((t) => [t.name, t.spec, t.level, db.classes.filter((c) => c.trainerId === t.id).length])}
        />
      </Card>
    );
  }

  if (tab === 'Найм') {
    return (
      <Card>
        <h3>Воронка найма</h3>
        <form className="form-grid" onSubmit={(e) => {
          e.preventDefault();
          if (!cand.name || !cand.position) return;
          setDb((s) => ({ ...s, candidates: [...s.candidates, { id: nextId(s.candidates), ...cand, stage: 'Скрининг' }] }));
          setCand({ name: '', position: '' });
        }}>
          <input placeholder="Имя" value={cand.name} onChange={(e) => setCand({ ...cand, name: e.target.value })} />
          <input placeholder="Позиция" value={cand.position} onChange={(e) => setCand({ ...cand, position: e.target.value })} />
          <button className="btn primary">Добавить кандидата</button>
        </form>
        <DataTable
          headers={['Кандидат', 'Позиция', 'Этап']}
          rows={db.candidates.map((c) => [
            c.name,
            c.position,
            <select value={c.stage} onChange={(e) => setDb((s) => ({ ...s, candidates: s.candidates.map((x) => x.id === c.id ? { ...x, stage: e.target.value } : x) }))}>
              <option>Скрининг</option><option>Собеседование</option><option>Оффер</option><option>Нанят</option>
            </select>,
          ])}
        />
      </Card>
    );
  }

  if (tab === 'Сертификации') {
    return (
      <Card>
        <h3>Сертификации и сроки</h3>
        <DataTable
          headers={['Тренер', 'Сертификация', 'Дата проверки', 'Статус']}
          rows={db.trainers.map((t, i) => [t.name, 'Fitness Pro', `2026-0${(i % 5) + 4}-15`, i % 2 ? 'Подтверждено' : 'Требуется обновление'])}
        />
      </Card>
    );
  }

  return (
    <Card>
      <h3>Посещаемость сотрудников</h3>
      <DataTable
        headers={['Тренер', 'Количество смен', 'Часы']}
        rows={db.trainers.map((t) => {
          const logs = db.workLogs.filter((w) => w.trainerId === t.id);
          const hours = logs.reduce((sum, w) => sum + Number(calcHours(w.start, w.end)), 0);
          return [t.name, logs.length, `${hours} ч`];
        })}
      />
    </Card>
  );
}

function AccountantDashboard({ tab, db, setDb, metrics }) {
  const [pay, setPay] = useState({ client: '', amount: '', method: 'Карта' });

  if (tab === 'Финансы') {
    return (
      <>
        <Card>
          <h3>Финансовые показатели</h3>
          <div className="metrics">
            <Metric label="Выручка" value={money(metrics.revenue)} />
            <Metric label="Фонд выплат" value={money(metrics.totalPayroll)} />
            <Metric label="Маржинальность" value={`${Math.max(0, Math.round(((metrics.revenue - metrics.totalPayroll) / Math.max(metrics.revenue, 1)) * 100))}%`} />
          </div>
        </Card>
        <Card>
          <h3>Диаграмма оплат</h3>
          <PaymentPie payments={db.payments} />
        </Card>
      </>
    );
  }

  if (tab === 'Платежи') {
    return (
      <Card>
        <h3>Платежи клиентов</h3>
        <form className="form-grid" onSubmit={(e) => {
          e.preventDefault();
          if (!pay.client || !pay.amount) return;
          setDb((s) => ({ ...s, payments: [...s.payments, { id: nextId(s.payments), client: pay.client, amount: Number(pay.amount), method: pay.method, date: new Date().toISOString().slice(0, 10) }] }));
          setPay({ client: '', amount: '', method: 'Карта' });
        }}>
          <input placeholder="Клиент" value={pay.client} onChange={(e) => setPay({ ...pay, client: e.target.value })} />
          <input type="number" placeholder="Сумма" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
          <select value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}><option>Карта</option><option>Наличные</option><option>Онлайн</option></select>
          <button className="btn primary">Добавить платеж</button>
        </form>
        <DataTable headers={['Дата', 'Клиент', 'Метод', 'Сумма']} rows={db.payments.map((p) => [p.date, p.client, p.method, money(p.amount)])} />
      </Card>
    );
  }

  if (tab === 'Выплаты') {
    return (
      <Card>
        <h3>Расчет выплат тренерам</h3>
        <DataTable
          headers={['Тренер', 'Занятий', 'Ставка', 'Сумма к выплате']}
          rows={db.trainers.map((t) => {
            const count = db.classes.filter((c) => c.trainerId === t.id).length;
            return [t.name, count, money(t.rate), money(count * t.rate)];
          })}
        />
      </Card>
    );
  }

  return (
    <Card>
      <h3>Прогноз дохода на 30 дней</h3>
      <ForecastBars payments={db.payments} />
    </Card>
  );
}

function Card({ children }) {
  return <article className="card glass">{children}</article>;
}

function Metric({ label, value }) {
  return <div className="metric"><span>{label}</span><b>{value}</b></div>;
}

function DataTable({ headers, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map((row, i) => <tr key={i}>{row.map((cell, idx) => <td key={idx}>{cell}</td>)}</tr>) : <tr><td colSpan={headers.length}>Нет данных</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function LoadBars({ db }) {
  return (
    <div className="bars">
      {db.trainers.map((t) => {
        const classes = db.classes.filter((c) => c.trainerId === t.id).length;
        const pct = Math.min(100, Math.round((classes / (t.maxDailySlots * 5)) * 100));
        return (
          <div className="bar-row" key={t.id}>
            <span>{t.name}</span>
            <div className="bar"><i style={{ width: `${pct}%` }}></i></div>
            <b>{pct}%</b>
          </div>
        );
      })}
    </div>
  );
}

function PaymentPie({ payments }) {
  const grouped = payments.reduce((acc, p) => {
    acc[p.method] = (acc[p.method] || 0) + Number(p.amount);
    return acc;
  }, {});

  const total = Object.values(grouped).reduce((a, b) => a + b, 0) || 1;
  const colors = ['#22d3ee', '#34d399', '#fbbf24', '#f87171'];
  let prev = 0;
  const parts = Object.entries(grouped).map(([k, val], i) => {
    const deg = (val / total) * 360;
    const start = prev;
    prev += deg;
    return `${colors[i % colors.length]} ${start}deg ${prev}deg`;
  });

  return (
    <div>
      <div className="pie" style={{ background: `conic-gradient(${parts.join(',') || '#334155 0deg 360deg'})` }}></div>
      {Object.entries(grouped).map(([k, v]) => <p key={k} className="muted-row">{k}: {money(v)}</p>)}
    </div>
  );
}

function ForecastBars({ payments }) {
  const base = payments.reduce((sum, p) => sum + Number(p.amount), 0) / Math.max(payments.length, 1);
  const forecast = Array.from({ length: 6 }).map((_, i) => ({
    week: `Неделя ${i + 1}`,
    value: Math.round(base * (4.3 + i * 0.35)),
  }));
  const max = Math.max(...forecast.map((f) => f.value), 1);

  return (
    <div className="bars">
      {forecast.map((f) => (
        <div className="bar-row" key={f.week}>
          <span>{f.week}</span>
          <div className="bar"><i style={{ width: `${Math.round((f.value / max) * 100)}%` }}></i></div>
          <b>{money(f.value)}</b>
        </div>
      ))}
    </div>
  );
}

function LoadCalendar({ db }) {
  const month = 2;
  const year = 2026;
  const daysInMonth = new Date(year, month, 0).getDate();
  const startDay = new Date(year, month - 1, 1).getDay() || 7;
  const cells = [];
  for (let i = 1; i < startDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);

  return (
    <div>
      <div className="calendar-head">Февраль 2026 · распределение по дням</div>
      <div className="calendar-grid">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => <div key={d} className="weekday">{d}</div>)}
        {cells.map((day, idx) => {
          if (!day) return <div key={`e${idx}`} className="day empty"></div>;
          const date = `2026-02-${String(day).padStart(2, '0')}`;
          const classes = db.classes.filter((c) => c.date === date);
          const load = classes.length;
          const tone = load >= 5 ? 'high' : load >= 3 ? 'mid' : 'low';
          return (
            <div key={day} className={`day ${tone}`}>
              <strong>{day}</strong>
              <span>{classes.length} занятий</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function calcHours(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  return `${Math.max(0, mins / 60).toFixed(1)} ч`;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

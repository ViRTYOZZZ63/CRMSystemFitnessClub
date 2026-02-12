const USERS = {
  admin: { email: 'admin@pulsepoint.club', password: 'admin123', name: 'Администратор', trainerName: null },
  trainer: { email: 'trainer@pulsepoint.club', password: 'trainer123', name: 'Тренер', trainerName: 'Алексей Волков' },
  hr: { email: 'hr@pulsepoint.club', password: 'hr123', name: 'HR', trainerName: null },
  accountant: { email: 'finance@pulsepoint.club', password: 'finance123', name: 'Бухгалтер', trainerName: null },
};

const ROLE_MODULES = {
  admin: [
    { key: 'overview', label: 'Обзор' },
    { key: 'trainers', label: 'Тренеры' },
    { key: 'schedule', label: 'Расписание' },
    { key: 'workload', label: 'Нагрузка' },
  ],
  trainer: [
    { key: 'overview', label: 'Мой день' },
    { key: 'sessions', label: 'Сессии' },
    { key: 'notes', label: 'Заметки' },
  ],
  hr: [
    { key: 'overview', label: 'Команда' },
    { key: 'hiring', label: 'Найм' },
    { key: 'certs', label: 'Сертификации' },
  ],
  accountant: [
    { key: 'overview', label: 'Финансы' },
    { key: 'payments', label: 'Платежи' },
    { key: 'payroll', label: 'Зарплаты' },
  ],
};

const STORAGE_KEY = 'pulsepoint-crm-data-v2';

const defaultData = {
  trainers: [
    { id: 1, name: 'Алексей Волков', specialization: 'Силовой тренинг', maxClassesPerWeek: 18, rate: 1800 },
    { id: 2, name: 'Марина Громова', specialization: 'Функциональный тренинг', maxClassesPerWeek: 16, rate: 1900 },
    { id: 3, name: 'Артем Беляев', specialization: 'CrossFit', maxClassesPerWeek: 20, rate: 2000 },
  ],
  classes: [
    { id: 1, title: 'Morning Power', trainerId: 1, day: 'Пн', time: '08:00', capacity: 12, done: false },
    { id: 2, title: 'Functional Core', trainerId: 2, day: 'Вт', time: '18:30', capacity: 14, done: false },
    { id: 3, title: 'CrossFit Pro', trainerId: 3, day: 'Ср', time: '20:00', capacity: 10, done: false },
    { id: 4, title: 'Strength Basics', trainerId: 1, day: 'Чт', time: '19:00', capacity: 15, done: false },
  ],
  candidates: [
    { id: 1, name: 'Ирина Соколова', position: 'Тренер групповых программ', stage: 'Собеседование' },
  ],
  payments: [
    { id: 1, client: 'Екатерина Морозова', amount: 14500, method: 'Карта', date: '2026-02-11' },
    { id: 2, client: 'Иван Петров', amount: 9900, method: 'Наличные', date: '2026-02-11' },
  ],
  notes: [],
};

let appData = loadData();
let currentRole = null;
let currentUser = null;
let currentModule = null;

const loginForm = document.getElementById('login-form');
const authPanel = document.getElementById('auth-panel');
const appShell = document.getElementById('app-shell');
const authMessage = document.getElementById('auth-message');
const roleBadge = document.getElementById('role-badge');
const dashboardTitle = document.getElementById('dashboard-title');
const roleNav = document.getElementById('role-nav');
const dashboardContent = document.getElementById('dashboard-content');
const logoutButton = document.getElementById('logout');

function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return structuredClone(defaultData);
  try {
    return { ...structuredClone(defaultData), ...JSON.parse(stored) };
  } catch {
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function nextId(items) {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

function setStatus(text, type = '') {
  authMessage.textContent = text;
  authMessage.className = `status-message ${type}`;
}

function getTrainerById(id) {
  return appData.trainers.find((trainer) => trainer.id === Number(id));
}

function trainerClasses(trainerId) {
  return appData.classes.filter((item) => item.trainerId === Number(trainerId));
}

function calculateLoad(trainerId) {
  const trainer = getTrainerById(trainerId);
  if (!trainer) return { load: 0, percent: 0 };
  const load = trainerClasses(trainerId).length;
  return {
    load,
    percent: trainer.maxClassesPerWeek ? Math.round((load / trainer.maxClassesPerWeek) * 100) : 0,
  };
}

function renderTable(headers, rowsHtml) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr></thead>
        <tbody>${rowsHtml || '<tr><td colspan="20">Нет данных</td></tr>'}</tbody>
      </table>
    </div>
  `;
}

function renderMetrics() {
  const trainerCount = appData.trainers.length;
  const classCount = appData.classes.length;
  const avgLoad = appData.trainers.length
    ? Math.round(
        appData.trainers.reduce((sum, trainer) => sum + calculateLoad(trainer.id).percent, 0) /
          appData.trainers.length,
      )
    : 0;
  return `
    <div class="metrics">
      <article class="metric"><span>Тренеров в системе</span><b>${trainerCount}</b></article>
      <article class="metric"><span>Занятий в расписании</span><b>${classCount}</b></article>
      <article class="metric"><span>Средняя загрузка</span><b>${avgLoad}%</b></article>
      <article class="metric"><span>Выручка за день</span><b>${formatCurrency(dayRevenue())}</b></article>
    </div>
  `;
}

function dayRevenue() {
  return appData.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
}

function formatCurrency(value) {
  return `${Number(value).toLocaleString('ru-RU')} ₽`;
}

function setupRoleNav() {
  const modules = ROLE_MODULES[currentRole];
  roleNav.innerHTML = modules
    .map(
      (module) =>
        `<button data-module="${module.key}" class="${module.key === currentModule ? 'active' : ''}">${module.label}</button>`,
    )
    .join('');

  roleNav.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      currentModule = button.dataset.module;
      setupRoleNav();
      renderDashboard();
    });
  });
}

function bootRole(roleKey) {
  currentRole = roleKey;
  currentUser = USERS[roleKey];
  currentModule = ROLE_MODULES[roleKey][0].key;

  authPanel.classList.add('hidden');
  appShell.classList.remove('hidden');

  roleBadge.textContent = `Роль: ${currentUser.name}`;
  dashboardTitle.textContent = titleByRole(roleKey);

  setupRoleNav();
  renderDashboard();
}

function titleByRole(roleKey) {
  if (roleKey === 'admin') return 'Операционный дашборд клуба';
  if (roleKey === 'trainer') return 'Кабинет тренера';
  if (roleKey === 'hr') return 'HR-панель и команда';
  return 'Финансовый дашборд';
}

function renderDashboard() {
  if (currentRole === 'admin') renderAdmin();
  if (currentRole === 'trainer') renderTrainer();
  if (currentRole === 'hr') renderHr();
  if (currentRole === 'accountant') renderAccountant();
}

function renderAdmin() {
  if (currentModule === 'overview') {
    dashboardContent.innerHTML = `<section class="card">${renderMetrics()}</section>${adminLoadCard()}`;
    return;
  }

  if (currentModule === 'trainers') {
    const rows = appData.trainers
      .map((trainer) => {
        const load = calculateLoad(trainer.id);
        return `<tr><td>${trainer.name}</td><td>${trainer.specialization}</td><td>${trainer.maxClassesPerWeek}</td><td>${load.load} (${load.percent}%)</td></tr>`;
      })
      .join('');

    dashboardContent.innerHTML = `
      <section class="card">
        <h3>Добавление тренера</h3>
        <form id="add-trainer-form" class="form-grid">
          <input name="name" placeholder="Имя тренера" required />
          <input name="specialization" placeholder="Специализация" required />
          <input name="maxClassesPerWeek" type="number" min="1" placeholder="Лимит занятий/нед" required />
          <input name="rate" type="number" min="500" placeholder="Ставка за занятие" required />
          <button class="btn-primary" type="submit">Добавить</button>
        </form>
        ${renderTable(['Имя', 'Специализация', 'Лимит', 'Нагрузка'], rows)}
      </section>
    `;

    document.getElementById('add-trainer-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.target);
      appData.trainers.push({
        id: nextId(appData.trainers),
        name: form.get('name').toString(),
        specialization: form.get('specialization').toString(),
        maxClassesPerWeek: Number(form.get('maxClassesPerWeek')),
        rate: Number(form.get('rate')),
      });
      saveData();
      renderDashboard();
    });

    return;
  }

  if (currentModule === 'schedule') {
    const trainerOptions = appData.trainers
      .map((trainer) => `<option value="${trainer.id}">${trainer.name}</option>`)
      .join('');

    const rows = appData.classes
      .map((item) => {
        const trainer = getTrainerById(item.trainerId);
        return `<tr>
          <td>${item.title}</td><td>${trainer ? trainer.name : '-'}</td><td>${item.day}</td><td>${item.time}</td><td>${item.capacity}</td>
          <td><button class="btn-ghost" data-delete-class="${item.id}">Удалить</button></td>
        </tr>`;
      })
      .join('');

    dashboardContent.innerHTML = `
      <section class="card">
        <h3>Составление расписания</h3>
        <form id="add-class-form" class="form-grid">
          <input name="title" placeholder="Название занятия" required />
          <select name="trainerId" required>${trainerOptions}</select>
          <select name="day" required>
            <option>Пн</option><option>Вт</option><option>Ср</option><option>Чт</option><option>Пт</option><option>Сб</option><option>Вс</option>
          </select>
          <input name="time" type="time" required />
          <input name="capacity" type="number" min="1" max="40" placeholder="Вместимость" required />
          <button class="btn-primary" type="submit">Добавить занятие</button>
        </form>
        ${renderTable(['Занятие', 'Тренер', 'День', 'Время', 'Мест', ''], rows)}
      </section>
    `;

    document.getElementById('add-class-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.target);
      appData.classes.push({
        id: nextId(appData.classes),
        title: form.get('title').toString(),
        trainerId: Number(form.get('trainerId')),
        day: form.get('day').toString(),
        time: form.get('time').toString(),
        capacity: Number(form.get('capacity')),
        done: false,
      });
      saveData();
      renderDashboard();
    });

    dashboardContent.querySelectorAll('[data-delete-class]').forEach((button) => {
      button.addEventListener('click', () => {
        appData.classes = appData.classes.filter((item) => item.id !== Number(button.dataset.deleteClass));
        saveData();
        renderDashboard();
      });
    });

    return;
  }

  dashboardContent.innerHTML = adminLoadCard(true);
}

function adminLoadCard(fullWidth = false) {
  const rows = appData.trainers
    .map((trainer) => {
      const load = calculateLoad(trainer.id);
      const status = load.percent > 95 ? 'Перегрузка' : load.percent > 75 ? 'Высокая' : 'Нормальная';
      return `<tr><td>${trainer.name}</td><td>${load.load}/${trainer.maxClassesPerWeek}</td><td>${load.percent}%</td><td><span class="badge">${status}</span></td></tr>`;
    })
    .join('');

  return `
    <section class="card ${fullWidth ? '' : ''}">
      <h3>Распределение нагрузки</h3>
      <p class="muted">Система показывает, каких тренеров можно дозагрузить, а где уже нужна ротация.</p>
      ${renderTable(['Тренер', 'Занятий', 'Загрузка', 'Статус'], rows)}
    </section>
  `;
}

function renderTrainer() {
  const trainer = appData.trainers.find((item) => item.name === currentUser.trainerName) || appData.trainers[0];
  const sessions = trainerClasses(trainer.id);

  if (currentModule === 'overview') {
    dashboardContent.innerHTML = `
      <section class="card">
        <h3>${trainer.name}</h3>
        <p class="muted">${trainer.specialization}. Ставка: ${formatCurrency(trainer.rate)} за занятие.</p>
        <div class="metrics">
          <article class="metric"><span>Мои занятия</span><b>${sessions.length}</b></article>
          <article class="metric"><span>Закрыто</span><b>${sessions.filter((s) => s.done).length}</b></article>
          <article class="metric"><span>Загрузка</span><b>${calculateLoad(trainer.id).percent}%</b></article>
        </div>
      </section>
    `;
    return;
  }

  if (currentModule === 'sessions') {
    const rows = sessions
      .map(
        (session) => `<tr>
          <td>${session.title}</td><td>${session.day}</td><td>${session.time}</td><td>${session.capacity}</td>
          <td><span class="badge">${session.done ? 'Проведено' : 'Запланировано'}</span></td>
          <td><button class="btn-ghost" data-toggle-session="${session.id}">${session.done ? 'Вернуть' : 'Закрыть'}</button></td>
        </tr>`,
      )
      .join('');

    dashboardContent.innerHTML = `
      <section class="card">
        <h3>Мои тренировки</h3>
        ${renderTable(['Занятие', 'День', 'Время', 'Мест', 'Статус', ''], rows)}
      </section>
    `;

    dashboardContent.querySelectorAll('[data-toggle-session]').forEach((button) => {
      button.addEventListener('click', () => {
        const target = appData.classes.find((item) => item.id === Number(button.dataset.toggleSession));
        if (target) target.done = !target.done;
        saveData();
        renderDashboard();
      });
    });

    return;
  }

  const trainerNotes = appData.notes.filter((note) => note.trainerId === trainer.id);
  const rows = trainerNotes
    .map((note) => `<tr><td>${note.client}</td><td>${note.text}</td><td>${note.date}</td></tr>`)
    .join('');

  dashboardContent.innerHTML = `
    <section class="card">
      <h3>Заметки по клиентам</h3>
      <form id="note-form" class="form-grid">
        <input name="client" placeholder="Имя клиента" required />
        <input name="text" placeholder="Комментарий после тренировки" required />
        <button class="btn-primary" type="submit">Сохранить заметку</button>
      </form>
      ${renderTable(['Клиент', 'Комментарий', 'Дата'], rows)}
    </section>
  `;

  document.getElementById('note-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    appData.notes.push({
      id: nextId(appData.notes),
      trainerId: trainer.id,
      client: form.get('client').toString(),
      text: form.get('text').toString(),
      date: new Date().toISOString().slice(0, 10),
    });
    saveData();
    renderDashboard();
  });
}

function renderHr() {
  if (currentModule === 'overview') {
    const rows = appData.trainers
      .map((trainer) => `<tr><td>${trainer.name}</td><td>${trainer.specialization}</td><td>${calculateLoad(trainer.id).percent}%</td></tr>`)
      .join('');

    dashboardContent.innerHTML = `
      <section class="card">
        <h3>Тренерский состав</h3>
        ${renderTable(['Тренер', 'Специализация', 'Текущая загрузка'], rows)}
      </section>
    `;
    return;
  }

  if (currentModule === 'hiring') {
    const rows = appData.candidates
      .map(
        (candidate) => `<tr>
          <td>${candidate.name}</td><td>${candidate.position}</td>
          <td>
            <select data-stage-id="${candidate.id}">
              ${['Скрининг', 'Собеседование', 'Оффер', 'Нанят'].map((stage) => `<option ${stage === candidate.stage ? 'selected' : ''}>${stage}</option>`).join('')}
            </select>
          </td>
        </tr>`,
      )
      .join('');

    dashboardContent.innerHTML = `
      <section class="card">
        <h3>Воронка найма</h3>
        <form id="candidate-form" class="form-grid">
          <input name="name" placeholder="Имя кандидата" required />
          <input name="position" placeholder="Позиция" required />
          <button class="btn-primary" type="submit">Добавить кандидата</button>
        </form>
        ${renderTable(['Кандидат', 'Позиция', 'Этап'], rows)}
      </section>
    `;

    document.getElementById('candidate-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.target);
      appData.candidates.push({
        id: nextId(appData.candidates),
        name: form.get('name').toString(),
        position: form.get('position').toString(),
        stage: 'Скрининг',
      });
      saveData();
      renderDashboard();
    });

    dashboardContent.querySelectorAll('[data-stage-id]').forEach((select) => {
      select.addEventListener('change', () => {
        const candidate = appData.candidates.find((item) => item.id === Number(select.dataset.stageId));
        if (candidate) candidate.stage = select.value;
        saveData();
      });
    });

    return;
  }

  const rows = appData.trainers
    .map((trainer, idx) => {
      const month = ['март', 'апрель', 'май'][idx % 3];
      return `<tr><td>${trainer.name}</td><td>${month}</td><td><span class="badge">Запланировано</span></td></tr>`;
    })
    .join('');

  dashboardContent.innerHTML = `
    <section class="card">
      <h3>Сертификации и документы</h3>
      ${renderTable(['Тренер', 'Ближайшая аттестация', 'Статус'], rows)}
    </section>
  `;
}

function renderAccountant() {
  if (currentModule === 'overview') {
    dashboardContent.innerHTML = `
      <section class="card">${renderMetrics()}</section>
      <section class="card">
        <h3>Ключевые показатели</h3>
        <p class="muted">Контроль поступлений, выплат тренерам и рентабельности групповых программ.</p>
      </section>
    `;
    return;
  }

  if (currentModule === 'payments') {
    const rows = appData.payments
      .map((payment) => `<tr><td>${payment.date}</td><td>${payment.client}</td><td>${payment.method}</td><td>${formatCurrency(payment.amount)}</td></tr>`)
      .join('');

    dashboardContent.innerHTML = `
      <section class="card">
        <h3>Платежи клиентов</h3>
        <form id="payment-form" class="form-grid">
          <input name="client" placeholder="Клиент" required />
          <input name="amount" type="number" min="100" placeholder="Сумма" required />
          <select name="method"><option>Карта</option><option>Наличные</option><option>Онлайн</option></select>
          <button class="btn-primary" type="submit">Добавить платеж</button>
        </form>
        ${renderTable(['Дата', 'Клиент', 'Метод', 'Сумма'], rows)}
      </section>
    `;

    document.getElementById('payment-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.target);
      appData.payments.push({
        id: nextId(appData.payments),
        client: form.get('client').toString(),
        amount: Number(form.get('amount')),
        method: form.get('method').toString(),
        date: new Date().toISOString().slice(0, 10),
      });
      saveData();
      renderDashboard();
    });

    return;
  }

  const rows = appData.trainers
    .map((trainer) => {
      const sessions = trainerClasses(trainer.id).length;
      const salary = sessions * trainer.rate;
      return `<tr><td>${trainer.name}</td><td>${sessions}</td><td>${formatCurrency(trainer.rate)}</td><td>${formatCurrency(salary)}</td></tr>`;
    })
    .join('');

  dashboardContent.innerHTML = `
    <section class="card">
      <h3>Начисление зарплат тренерам</h3>
      ${renderTable(['Тренер', 'Занятий', 'Ставка', 'Начислено'], rows)}
    </section>
  `;
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  if (!USERS[role]) {
    setStatus('Выберите роль.', 'error');
    return;
  }

  const user = USERS[role];
  const isValid = user.email === email && user.password === password;

  if (!isValid) {
    setStatus('Неверный email или пароль для выбранной роли.', 'error');
    return;
  }

  setStatus(`Успешный вход. Добро пожаловать, ${user.name}.`, 'success');
  bootRole(role);
});

logoutButton.addEventListener('click', () => {
  currentRole = null;
  currentUser = null;
  currentModule = null;
  appShell.classList.add('hidden');
  authPanel.classList.remove('hidden');
  loginForm.reset();
  setStatus('Вы вышли из системы.', 'success');
});

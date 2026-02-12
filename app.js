const USERS = {
  admin: { email: 'admin@pulsepoint.club', password: 'admin123', name: 'Администратор' },
  trainer: { email: 'trainer@pulsepoint.club', password: 'trainer123', name: 'Тренер' },
  hr: { email: 'hr@pulsepoint.club', password: 'hr123', name: 'HR' },
  accountant: { email: 'finance@pulsepoint.club', password: 'finance123', name: 'Бухгалтер' },
};

const ACCESS_MAP = {
  admin: {
    title: 'Панель администратора',
    description: 'Полный доступ к клубу, расписанию, выручке, KPI и управлению учетными записями.',
    cards: [
      ['Управление доступами', 'Создание и блокировка пользователей, настройка ролей.'],
      ['Операционный дашборд', 'Загрузка залов, продления абонементов, churn-риск.'],
      ['Управление расписанием', 'Слоты тренеров, бронирования, лист ожидания.'],
    ],
  },
  trainer: {
    title: 'Панель тренера',
    description: 'Доступ только к своим клиентам, прогрессу тренировок и персональному расписанию.',
    cards: [
      ['Мои клиенты', 'Карточки клиентов, история тренировок, цели и рекомендации.'],
      ['Сегодняшние сессии', 'Запланированные тренировки и отметка посещений.'],
      ['Мои KPI', 'Проведенные занятия, продления и обратная связь клиентов.'],
    ],
  },
  hr: {
    title: 'Панель HR',
    description: 'Просмотр тренерского состава, графиков, документов и этапов найма.',
    cards: [
      ['Тренерский состав', 'Профили, занятость, квалификации и сертификации.'],
      ['Найм и адаптация', 'Вакансии, воронка кандидатов, onboarding-план.'],
      ['Документы', 'Сроки аттестаций, договоры и напоминания о продлении.'],
    ],
  },
  accountant: {
    title: 'Панель бухгалтера',
    description: 'Финансовые операции клуба, начисления тренерам и контроль оплат.',
    cards: [
      ['Финансовые операции', 'Платежи, возвраты, задолженности и кассовые отчеты.'],
      ['Начисления тренерам', 'Авторасчет зарплат по фактическим тренировкам.'],
      ['Абонементы', 'Контроль продлений, скидок и оплат по тарифам.'],
    ],
  },
};

const form = document.getElementById('login-form');
const message = document.getElementById('auth-message');
const dashboard = document.getElementById('dashboard');
const roleBadge = document.getElementById('role-badge');
const dashboardTitle = document.getElementById('dashboard-title');
const dashboardDescription = document.getElementById('dashboard-description');
const permissionsGrid = document.getElementById('permissions-grid');
const logoutButton = document.getElementById('logout');

function setMessage(text, state) {
  message.textContent = text;
  message.className = `auth-message ${state}`;
}

function renderDashboard(roleKey) {
  const roleConfig = ACCESS_MAP[roleKey];
  const roleName = USERS[roleKey].name;

  roleBadge.textContent = `Роль: ${roleName}`;
  dashboardTitle.textContent = roleConfig.title;
  dashboardDescription.textContent = roleConfig.description;

  permissionsGrid.innerHTML = '';
  roleConfig.cards.forEach(([title, content]) => {
    const card = document.createElement('article');
    card.innerHTML = `<h3>${title}</h3><p>${content}</p>`;
    permissionsGrid.appendChild(card);
  });

  dashboard.classList.remove('hidden');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  if (!role || !USERS[role]) {
    setMessage('Выберите роль для входа.', 'error');
    return;
  }

  const user = USERS[role];
  const isValidUser = user.email === email && user.password === password;

  if (!isValidUser) {
    setMessage('Неверный email или пароль для выбранной роли.', 'error');
    dashboard.classList.add('hidden');
    return;
  }

  setMessage(`Вход выполнен. Добро пожаловать, ${user.name}.`, 'success');
  renderDashboard(role);
});

logoutButton.addEventListener('click', () => {
  form.reset();
  dashboard.classList.add('hidden');
  setMessage('Вы вышли из системы.', 'success');
});

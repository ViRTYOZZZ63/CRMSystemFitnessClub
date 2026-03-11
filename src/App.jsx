import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const ARCHIVE_MEDIA_FALLBACKS = {
  TABATA: ['/media/tabata.mp4'],
  'MUSCLE TONING (MT)': ['/media/Muscle_Toning.MP4', '/media/muscle-toning-mt.mp4'],
  'TRX MIX': ['/media/TRX_Mix.MP4', '/media/trx-mix.mp4'],
  'FIT FOR JUNIORS': ['/media/Fit_For_Juniors.MP4', '/media/fit-for-juniors.mp4'],
  PILATES: ['/media/Pilates.MOV', '/media/pilates.mp4'],
  STRETCHING: ['/media/Stretching.MOV', '/media/stretching.mp4'],
};

const seedData = {
  users: [
    { id: 1, name: 'Анна Петрова', email: 'admin@pulsepoint.club', password: 'admin123', role: 'admin', phone: '+7 927 101-22-33' },
    { id: 2, name: 'Алексей Волков', email: 'trainer@pulsepoint.club', password: 'trainer123', role: 'trainer', trainerId: 1, phone: '+7 927 102-33-44' },
    { id: 3, name: 'Мария Исаева', email: 'hr@pulsepoint.club', password: 'hr123', role: 'hr', phone: '+7 927 103-44-55' },
    { id: 4, name: 'Ольга Соколова', email: 'finance@pulsepoint.club', password: 'finance123', role: 'accountant', phone: '+7 927 104-55-66' },
    { id: 5, name: 'Марина Громова', email: 'marina.trainer@pulsepoint.club', password: 'trainer123', role: 'trainer', trainerId: 2, phone: '+7 927 105-11-22' },
    { id: 6, name: 'Артем Беляев', email: 'artem.trainer@pulsepoint.club', password: 'trainer123', role: 'trainer', trainerId: 3, phone: '+7 927 106-22-33' },
    { id: 7, name: 'Егор Титов', email: 'egor.trainer@pulsepoint.club', password: 'trainer123', role: 'trainer', trainerId: 4, phone: '+7 927 107-33-44' },
    { id: 8, name: 'Ксения Левина', email: 'ksenia.trainer@pulsepoint.club', password: 'trainer123', role: 'trainer', trainerId: 5, phone: '+7 927 108-44-55' },
    { id: 9, name: 'Супер Пользователь', email: 'super@pulsepoint.club', password: 'super123', role: 'superuser', phone: '+7 927 109-55-66' },
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
    { id: 6, title: 'TRX MIX', trainerId: 2, date: '2026-02-18', time: '12:30', duration: 55, capacity: 16, room: 'A', done: true },
    { id: 7, title: 'TABATA Express', trainerId: 1, date: '2026-02-19', time: '09:15', duration: 45, capacity: 14, room: 'B', done: true },
    { id: 8, title: 'Pilates Core', trainerId: 5, date: '2026-02-19', time: '18:00', duration: 60, capacity: 18, room: 'C', done: false },
    { id: 9, title: 'Mobility Reset', trainerId: 4, date: '2026-02-20', time: '17:30', duration: 50, capacity: 18, room: 'C', done: false },
    { id: 10, title: 'Strength Base', trainerId: 3, date: '2026-02-20', time: '20:15', duration: 70, capacity: 12, room: 'A', done: false },
    { id: 11, title: 'Fit For Juniors', trainerId: 1, date: '2026-02-21', time: '11:00', duration: 60, capacity: 10, room: 'B', done: false },
    { id: 12, title: 'Stretch & Recover', trainerId: 5, date: '2026-02-21', time: '19:15', duration: 55, capacity: 20, room: 'C', done: false },
  ],
  clients: [
    { id: 1, name: 'Екатерина Морозова', program: 'Body Rebuild', trainerId: 1, status: 'Активен', membership: 'Premium', visits: 16, lastVisit: '2026-02-16' },
    { id: 2, name: 'Игорь Назаров', program: 'Mass Gain', trainerId: 1, status: 'Активен', membership: 'Standard', visits: 11, lastVisit: '2026-02-15' },
    { id: 3, name: 'София Ларионова', program: 'Functional Fit', trainerId: 2, status: 'Пауза', membership: 'Standard', visits: 6, lastVisit: '2026-02-09' },
    { id: 4, name: 'Виктор Осипов', program: 'CrossFit Start', trainerId: 3, status: 'Активен', membership: 'Premium', visits: 13, lastVisit: '2026-02-16' },
    { id: 5, name: 'Алена Журавлева', program: 'Recovery Mobility', trainerId: 4, status: 'Активен', membership: 'Lite', visits: 8, lastVisit: '2026-02-14' },
    { id: 6, name: 'Михаил Лисин', program: 'Yoga Balance', trainerId: 5, status: 'Активен', membership: 'Premium', visits: 19, lastVisit: '2026-02-16' },
    { id: 7, name: 'Дмитрий Мезенцев', program: 'TRX Start', trainerId: 2, status: 'Активен', membership: 'Standard', visits: 14, lastVisit: '2026-02-17' },
    { id: 8, name: 'Тимур Низамов', program: 'CrossFit Engine', trainerId: 3, status: 'Активен', membership: 'Premium', visits: 22, lastVisit: '2026-02-18' },
    { id: 9, name: 'Ангелина Тарасова', program: 'Pilates Mobility', trainerId: 5, status: 'Активен', membership: 'Standard', visits: 10, lastVisit: '2026-02-17' },
    { id: 10, name: 'Савелий Виноградов', program: 'Junior Athletic', trainerId: 1, status: 'Активен', membership: 'Lite', visits: 9, lastVisit: '2026-02-16' },
    { id: 11, name: 'Ника Орлова', program: 'Stretch & Balance', trainerId: 4, status: 'Пауза', membership: 'Standard', visits: 7, lastVisit: '2026-02-11' },
    { id: 12, name: 'Полина Дьякова', program: 'Mass Gain Pro', trainerId: 1, status: 'Активен', membership: 'Premium', visits: 25, lastVisit: '2026-02-18' },
    { id: 13, name: 'Станислав Гринько', program: 'Functional Reload', trainerId: 2, status: 'Активен', membership: 'Lite', visits: 8, lastVisit: '2026-02-15' },
    { id: 14, name: 'Лев Смирнов', program: 'Mobility Office', trainerId: 4, status: 'Активен', membership: 'Standard', visits: 12, lastVisit: '2026-02-18' },
    { id: 15, name: 'Роман Кудрин', program: 'CrossFit Start', trainerId: 3, status: 'Активен', membership: 'Standard', visits: 15, lastVisit: '2026-02-18' },
    { id: 16, name: 'Яна Белова', program: 'Yoga Recovery', trainerId: 5, status: 'Активен', membership: 'Premium', visits: 18, lastVisit: '2026-02-18' },
  ],
  workLogs: [
    { id: 1, trainerId: 1, date: '2026-02-16', start: '07:30', end: '16:30' },
    { id: 2, trainerId: 2, date: '2026-02-16', start: '12:00', end: '21:00' },
    { id: 3, trainerId: 3, date: '2026-02-17', start: '13:00', end: '22:00' },
    { id: 4, trainerId: 4, date: '2026-02-17', start: '09:00', end: '18:00' },
    { id: 5, trainerId: 5, date: '2026-02-18', start: '11:00', end: '20:00' },
    { id: 6, trainerId: 1, date: '2026-02-19', start: '08:00', end: '16:00' },
    { id: 7, trainerId: 2, date: '2026-02-19', start: '11:30', end: '20:30' },
    { id: 8, trainerId: 3, date: '2026-02-19', start: '12:00', end: '21:00' },
    { id: 9, trainerId: 4, date: '2026-02-20', start: '09:30', end: '18:00' },
    { id: 10, trainerId: 5, date: '2026-02-20', start: '10:30', end: '19:30' },
  ],
  candidates: [
    { id: 1, name: 'Ирина Соколова', position: 'Тренер групповых программ', stage: 'Собеседование' },
    { id: 2, name: 'Сергей Лапин', position: 'Персональный тренер', stage: 'Оффер' },
    { id: 3, name: 'Полина Самсонова', position: 'Администратор ресепшн', stage: 'Скрининг' },
  ],
  payments: [
    { id: 1, client: 'Екатерина Морозова', amount: 14500, method: 'Карта', date: '2026-02-15' },
    { id: 2, client: 'Игорь Назаров', amount: 9900, method: 'Наличные', date: '2026-02-15' },
    { id: 3, client: 'Виктор Осипов', amount: 18900, method: 'Онлайн', date: '2026-02-16' },
    { id: 4, client: 'Михаил Лисин', amount: 12500, method: 'Карта', date: '2026-02-16' },
    { id: 5, client: 'Алена Журавлева', amount: 7900, method: 'Онлайн', date: '2026-02-17' },
    { id: 6, client: 'Дмитрий Мезенцев', amount: 10900, method: 'Карта', date: '2026-02-17' },
    { id: 7, client: 'Тимур Низамов', amount: 19900, method: 'Онлайн', date: '2026-02-18' },
    { id: 8, client: 'Полина Дьякова', amount: 21900, method: 'Карта', date: '2026-02-18' },
    { id: 9, client: 'Лев Смирнов', amount: 9900, method: 'Наличные', date: '2026-02-18' },
    { id: 10, client: 'Яна Белова', amount: 15900, method: 'Онлайн', date: '2026-02-19' },
    { id: 11, client: 'Роман Кудрин', amount: 13900, method: 'Карта', date: '2026-02-19' },
    { id: 12, client: 'Станислав Гринько', amount: 8900, method: 'Онлайн', date: '2026-02-19' },
    { id: 13, client: 'Ника Орлова', amount: 6900, method: 'Карта', date: '2026-02-20' },
    { id: 14, client: 'Ангелина Тарасова', amount: 11900, method: 'Наличные', date: '2026-02-20' },
    { id: 15, client: 'Савелий Виноградов', amount: 7200, method: 'Карта', date: '2026-02-20' },
  ],
  notes: [],
  pendingAccessRequests: [],
  superUserNotifications: [],
  workoutsArchive: [
  {
    id: 1,
    trainerId: 1,
    title: 'TABATA',
    level: 'Высокоинтенсивный интервальный формат',
    description: 'Интенсивная интервальная тренировка, которая быстро разгоняет пульс, помогает сжигать калории и развивать выносливость. Подходит тем, кто любит энергичный темп и хочет получить заметный эффект за короткое время.',
    mediaType: 'video',
    media: '/media/tabata.mp4',
    poster: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    trainerId: 1,
    title: 'MUSCLE TONING (MT)',
    level: 'Силовая тренировка на всё тело',
    description: 'Классическая силовая программа на все основные группы мышц. Занятие сочетает грамотную разминку, основную нагрузку и мягкое восстановление, поэтому помогает укрепить тело и улучшить рельеф без перегруза.',
    mediaType: 'video',
    media: '/media/muscle-toning-mt.mp4',
    poster: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    trainerId: 1,
    title: 'TRX MIX',
    level: 'Функциональный тренинг',
    description: 'Функциональная тренировка с использованием подвесных петель TRX. Она развивает силу, баланс и контроль корпуса, а упражнения легко адаптируются под разный уровень подготовки.',
    mediaType: 'video',
    media: '/media/trx-mix.mp4',
    poster: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 4,
    trainerId: 1,
    title: 'FIT FOR JUNIORS',
    level: 'Группа 12-16 лет',
    description: 'Тренировка для подростков 12-16 лет, где внимание уделяется технике, координации и безопасному знакомству с тренажерным залом. Формат помогает укрепить тело, развить дисциплину и сохранить интерес к спорту.',
    mediaType: 'video',
    media: '/media/fit-for-juniors.mp4',
    poster: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 5,
    trainerId: 1,
    title: 'PILATES',
    level: 'Осанка, кор и подвижность',
    description: 'Спокойная и точная программа для укрепления мышц кора, осанки и подвижности суставов. Pilates помогает снять напряжение со спины, улучшить контроль над телом и почувствовать легкость в движении.',
    mediaType: 'video',
    media: '/media/pilates.mp4',
    poster: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 6,
    trainerId: 1,
    title: 'STRETCHING',
    level: 'Гибкость и восстановление',
    description: 'Мягкая восстановительная тренировка, направленная на гибкость, подвижность и комфорт в теле. Занятие помогает снять мышечное напряжение, улучшить амплитуду движений и ускорить восстановление после силовых нагрузок.',
    mediaType: 'video',
    media: '/media/stretching.mp4',
    poster: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=1200&q=80',
  },
],
};
const roleLabels = {
  admin: 'Администратор',
  trainer: 'Тренер',
  hr: 'HR',
  accountant: 'Бухгалтер',
  superuser: 'Супер пользователь',
};

const roleTabs = {
  admin: ['Рабочий стол', 'Календарь нагрузки', 'Тренеры', 'Расписание', 'Аккаунты', 'Зарплаты'],
  trainer: ['Панель', 'Мои занятия', 'Клиенты', 'Рабочее время'],
  hr: ['Команда', 'Найм', 'Сертификации', 'Посещаемость'],
  accountant: ['Финансы', 'Платежи', 'Выплаты', 'Прогноз'],
  superuser: ['Доступы и роли'],
};

const LOADING_SCENES = [
  {
    kicker: 'Private Club Console',
    title: 'Пусть этот день начнётся спокойно и уверенно',
    message: 'Подготавливаем интерфейс клуба, актуальные роли команды и персональные рабочие контуры без лишнего шума.',
    note: 'PulsePoint собирает премиальное пространство для красивого старта смены.',
  },
  {
    kicker: 'Black Signature Launch',
    title: 'Хорошего рабочего дня и точных решений',
    message: 'Синхронизируем расписание, тренерские программы и финансовую картину, чтобы всё открывалось в одном ритме.',
    note: 'Загрузка идёт на чёрной сцене с мягкой подачей и живой динамикой.',
  },
  {
    kicker: 'Executive Warmup',
    title: 'Пусть сегодня всё складывается легко',
    message: 'Готовим авторизацию, ключевые модули и данные клуба так, будто открывается приватный фитнес-лаунж.',
    note: 'Ещё несколько мгновений и система перейдёт в рабочий режим.',
  },
  {
    kicker: 'Concierge Mode',
    title: 'Спокойной смены и сильной энергии команде',
    message: 'Приводим в порядок доступы, аналитику и архив программ, чтобы продукт ощущался дорогим с первого экрана.',
    note: 'Интерфейс раскрывается постепенно, без резких скачков и пустых состояний.',
  },
  {
    kicker: 'Premium Access Layer',
    title: 'Пусть день будет продуктивным и красивым',
    message: 'Собираем статус клуба в один аккуратный поток: сотрудники, тренировки, деньги и сервис для клиентов.',
    note: 'Заставка меняется при каждом новом открытии, сохраняя эффект живого продукта.',
  },
  {
    kicker: 'Signature Opening',
    title: 'Пусть сегодня будет меньше суеты и больше результата',
    message: 'Финализируем визуальные детали и рабочие панели, чтобы CRM выглядела как полноценный show-ready продукт.',
    note: 'Чёрный фон, мягкие ореолы и плавная инерция создают дорогую подачу.',
  },
];

const pickRandomItem = (items) => items[Math.floor(Math.random() * items.length)] || items[0] || {};
const archiveDefaultsByTitle = new Map(seedData.workoutsArchive.map((item) => [String(item.title || '').trim().toUpperCase(), item]));
const money = (v) => `${Number(v).toLocaleString('ru-RU')} ₽`;
const nextId = (arr) => (arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1);
const byId = (arr, id) => arr.find((x) => x.id === Number(id));
const calcHoursValue = (start, end) => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  return Math.max(0, mins / 60);
};
const calcHours = (start, end) => `${calcHoursValue(start, end).toFixed(1)} ч`;

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
const isValidPhone = (value) => !value || /^[+\d\s()-]{10,20}$/.test(String(value || '').trim());
const isStrongPassword = (value) => String(value || '').trim().length >= 6;


function normalizeState(rawState) {
  const base = rawState && typeof rawState === 'object' ? rawState : {};
  const merged = {
    ...seedData,
    ...base,
    users: Array.isArray(base.users) ? base.users : seedData.users,
    trainers: Array.isArray(base.trainers) ? base.trainers : seedData.trainers,
    classes: Array.isArray(base.classes) ? base.classes : seedData.classes,
    clients: Array.isArray(base.clients) && base.clients.length ? base.clients : seedData.clients,
    workLogs: Array.isArray(base.workLogs) && base.workLogs.length ? base.workLogs : seedData.workLogs,
    candidates: Array.isArray(base.candidates) && base.candidates.length ? base.candidates : seedData.candidates,
    payments: Array.isArray(base.payments) && base.payments.length ? base.payments : seedData.payments,
    notes: Array.isArray(base.notes) ? base.notes : seedData.notes,
    pendingAccessRequests: Array.isArray(base.pendingAccessRequests) ? base.pendingAccessRequests : seedData.pendingAccessRequests,
    superUserNotifications: Array.isArray(base.superUserNotifications) ? base.superUserNotifications : seedData.superUserNotifications,
    workoutsArchive: Array.isArray(base.workoutsArchive) ? base.workoutsArchive : seedData.workoutsArchive,
  };

  const mergeById = (current, defaults) => {
    const map = new Map((Array.isArray(current) ? current : []).map((item) => [Number(item.id), item]));
    (Array.isArray(defaults) ? defaults : []).forEach((item) => {
      if (!map.has(Number(item.id))) map.set(Number(item.id), item);
    });
    return [...map.values()];
  };

  merged.users = mergeById(merged.users, seedData.users);
  merged.trainers = mergeById(merged.trainers, seedData.trainers);
  merged.classes = mergeById(merged.classes, seedData.classes);
  merged.clients = mergeById(merged.clients, seedData.clients);
  merged.workLogs = mergeById(merged.workLogs, seedData.workLogs);
  merged.payments = mergeById(merged.payments, seedData.payments);
  merged.pendingAccessRequests = mergeById(merged.pendingAccessRequests, seedData.pendingAccessRequests);

  merged.users = Array.isArray(merged.users) ? [...merged.users] : [];
  merged.trainers.forEach((trainer) => {
    const linked = merged.users.find((u) => u.role === 'trainer' && Number(u.trainerId) === Number(trainer.id));
    if (linked) return;
    const slug = String(trainer.name || '').toLowerCase().replace(/[^a-zа-я0-9]+/gi, '.').replace(/^\.|\.$/g, '');
    merged.users.push({
      id: nextId(merged.users),
      name: trainer.name,
      email: `${slug || `trainer.${trainer.id}`}@pulsepoint.club`,
      password: 'trainer123',
      role: 'trainer',
      trainerId: trainer.id,
      phone: '',
    });
  });

  merged.clients = merged.clients.map((client, index) => ({
    ...client,
    membership: client.membership || ['Premium', 'Standard', 'Lite'][index % 3],
    visits: Number.isFinite(Number(client.visits)) ? Number(client.visits) : 0,
    lastVisit: client.lastVisit || '2026-02-16',
  }));

  const archiveByTitle = new Map((Array.isArray(merged.workoutsArchive) ? merged.workoutsArchive : []).map((item) => [String(item.title || '').trim().toUpperCase(), item]));
  archiveDefaultsByTitle.forEach((item, key) => {
    if (!archiveByTitle.has(key)) archiveByTitle.set(key, item);
  });

  merged.workoutsArchive = [...archiveByTitle.entries()].map(([key, item]) => {
    const defaults = archiveDefaultsByTitle.get(key) || {};
    const media = String(item.media || item.image || defaults.media || defaults.image || '').trim();
    const title = item.title || defaults.title || '';
    const fallbackSources = getArchiveFallbackSources(title);
    const mediaType = item.mediaType || defaults.mediaType || (fallbackSources.length || media ? 'video' : 'image');
    return {
      ...defaults,
      ...item,
      title,
      level: defaults.level || item.level || '',
      description: defaults.description || item.description || '',
      mediaType,
      media: media || fallbackSources[0] || '',
      poster: item.poster || item.image || defaults.poster || defaults.image || '',
    };
  });
  return merged;
}

function getMediaTypeFromUrl(url) {
  if (/\.webm(\?|$)/i.test(url)) return 'video/webm';
  if (/\.mp4(\?|$)/i.test(url)) return 'video/mp4';
  return undefined;
}

function getArchiveFallbackSources(title) {
  return ARCHIVE_MEDIA_FALLBACKS[String(title || '').trim().toUpperCase()] || [];
}

function getArchiveVideoSources(item) {
  const base = [item.media];
  const sources = [...base, ...getArchiveFallbackSources(item.title)];
  return [...new Set(sources.filter(Boolean).map((src) => String(src).trim()).filter(Boolean))];
}

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
  const [loadingScene] = useState(() => pickRandomItem(LOADING_SCENES));
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [minimumSplashPassed, setMinimumSplashPassed] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      try {
        const response = await fetch(`${API_BASE}/bootstrap`);
        if (!response.ok) throw new Error('bootstrap_failed');
        const payload = await response.json();
        setDb(normalizeState(payload.state || seedData));
        setDbReady(true);
      } catch {
        setDb(normalizeState(seedData));
        setDbReady(true);
        setDbError('Не удалось подключиться к БД API. Загружен временный демо-режим.');
      }
    }
    bootstrap();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setMinimumSplashPassed(true), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLoadingProgress((prev) => {
        const ceiling = dbReady && db ? 100 : 88;
        if (prev >= ceiling) return prev;
        const delta = ceiling === 100
          ? Math.max(4, Math.ceil((100 - prev) / 4))
          : Math.max(1, Math.ceil((88 - prev) / 12));
        return Math.min(ceiling, prev + delta);
      });
    }, 90);

    return () => window.clearInterval(interval);
  }, [db, dbReady]);

  useEffect(() => {
    if (!dbReady || !db) return;
    fetch(API_BASE + '/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: db }),
    }).catch(() => {});
  }, [db, dbReady]);

  const dashboardMetrics = useMemo(() => {
    if (!db) {
      return {
        revenue: 0,
        classCount: 0,
        avgDailyClasses: '0.0',
        totalPayroll: 0,
        clientsCount: 0,
        activeClients: 0,
        monthlyVisits: 0,
        avgVisitRate: 0,
        avgCheck: 0,
      };
    }

    const revenue = db.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const classCount = db.classes.length;
    const clientsCount = db.clients.length;
    const activeClients = db.clients.filter((c) => c.status === 'Активен').length;
    const monthlyVisits = db.clients.reduce((sum, c) => sum + Number(c.visits || 0), 0);
    const avgVisitRate = clientsCount ? (monthlyVisits / clientsCount).toFixed(1) : '0.0';
    const avgDailyClasses = classCount ? (classCount / 7).toFixed(1) : '0.0';
    const avgCheck = db.payments.length ? Math.round(revenue / db.payments.length) : 0;
    const totalPayroll = db.trainers.reduce((sum, tr) => {
      const count = db.classes.filter((c) => c.trainerId === tr.id).length;
      return sum + count * tr.rate;
    }, 0);

    return { revenue, classCount, avgDailyClasses, totalPayroll, clientsCount, activeClients, monthlyVisits, avgVisitRate, avgCheck };
  }, [db]);

  const showLoadingScreen = !db || !dbReady || !minimumSplashPassed || loadingProgress < 100;

  if (showLoadingScreen) {
    return <LuxuryLoadingScreen scene={loadingScene} progress={loadingProgress} />;
  }
  const user = db.users.find((u) => u.id === sessionUserId) || null;

  function doLogin(e) {
    e.preventDefault();
    const normalizedEmail = String(loginForm.email || '').trim().toLowerCase();
    const password = String(loginForm.password || '');
    if (!isValidEmail(normalizedEmail)) {
      setAuthMessage({ text: 'Введите корректный email для входа.', type: 'error' });
      return;
    }
    if (!password) {
      setAuthMessage({ text: 'Введите пароль.', type: 'error' });
      return;
    }

    fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password }),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw payload;
        return payload;
      })
      .then((payload) => {
        const found = payload.user;
        setSessionUserId(found.id);
        setTab(roleTabs[found.role][0]);
        setAuthMessage({ text: `Добро пожаловать, ${found.name}!`, type: 'success' });
      })
      .catch((error) => {
        if (error?.error === 'access_denied') {
          setAuthMessage({ text: 'Администрация клуба не предоставила доступ к системе, обратитесь к кадровику.', type: 'error' });
          return;
        }
        if (error?.error === 'access_pending') {
          setAuthMessage({ text: 'Заявка на доступ ещё на согласовании у супер пользователя.', type: 'error' });
          return;
        }
        if (error?.error === 'account_blocked') {
          setAuthMessage({ text: 'Учётная запись заблокирована. Обратитесь к супер пользователю для смены пароля.', type: 'error' });
          return;
        }
        setAuthMessage({ text: 'Неверный email или пароль.', type: 'error' });
      });
  }

  function doRegister(e) {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setAuthMessage({ text: 'Заполните обязательные поля.', type: 'error' });
      return;
    }
    if (String(registerForm.name).trim().length < 3) {
      setAuthMessage({ text: 'ФИО должно быть не короче 3 символов.', type: 'error' });
      return;
    }
    if (!isValidEmail(registerForm.email)) {
      setAuthMessage({ text: 'Введите корректный email.', type: 'error' });
      return;
    }
    if (!isValidPhone(registerForm.phone)) {
      setAuthMessage({ text: 'Введите корректный телефон.', type: 'error' });
      return;
    }
    if (!isStrongPassword(registerForm.password)) {
      setAuthMessage({ text: 'Пароль должен быть не короче 6 символов.', type: 'error' });
      return;
    }
    const normalizedEmail = registerForm.email.trim().toLowerCase();
    const exists = db.users.some((u) => u.email.trim().toLowerCase() === normalizedEmail)
      || db.pendingAccessRequests.some((r) => r.email.trim().toLowerCase() === normalizedEmail);
    if (exists) {
      setAuthMessage({ text: 'Пользователь или заявка с таким email уже существует.', type: 'error' });
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
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw payload;
        return payload;
      })
      .then((payload) => {
        setDb(normalizeState(payload.state));
        setRegisterForm({ name: '', email: '', phone: '', password: '', role: 'trainer' });
        setAuthMode('login');
        setAuthMessage({ text: 'Заявка отправлена. Доступ откроется после одобрения супер пользователем.', type: 'success' });
      })
      .catch(() => {
        setAuthMessage({ text: 'Не удалось отправить заявку на доступ.', type: 'error' });
      });
  }

  function doForgotPassword() {
    const email = String(loginForm.email || '').trim().toLowerCase();
    if (!isValidEmail(email)) {
      setAuthMessage({ text: 'Укажите корректный email для восстановления.', type: 'error' });
      return;
    }
    fetch(`${API_BASE}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw payload;
        return payload;
      })
      .then(() => {
        setAuthMessage({ text: 'Если учётная запись найдена, она заблокирована и отправлена супер пользователю на смену пароля.', type: 'success' });
      })
      .catch(() => {
        setAuthMessage({ text: 'Не удалось отправить запрос на восстановление.', type: 'error' });
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
          <div className="location-chip" title="Адрес клуба">
            <span className="location-value">Самара · ТЦ ПаркХаус</span>
          </div>
          {user && <button className="btn ghost" onClick={logout}>Выйти</button>}
        </div>
      </header>

      {!user ? (
        <section className="auth-layout glass">
          <div className="auth-promo">
            <h2>PulsePoint Executive Access</h2>
            <ul className="auth-credentials-list">
              <li>admin@pulsepoint.club / admin123</li>
              <li>trainer@pulsepoint.club / trainer123</li>
              <li>hr@pulsepoint.club / hr123</li>
              <li>finance@pulsepoint.club / finance123</li>
              <li>super@pulsepoint.club / super123</li>
            </ul>
          </div>
          <div className="auth-box">
            <p className="auth-box-title">Доступ сотрудника</p>

            <div className="switch-row">
              <button type="button" className={`btn ${authMode === 'login' ? 'active' : 'ghost'}`} onClick={() => setAuthMode('login')}>Вход</button>
              <button type="button" className={`btn ${authMode === 'register' ? 'active' : 'ghost'}`} onClick={() => setAuthMode('register')}>Новый аккаунт</button>
            </div>

            {authMode === 'login' ? (
              <form className="auth-form-stack" onSubmit={doLogin}>
                <label className="field-label">
                  Email
                  <input placeholder="name@pulsepoint.club" type="email" autoComplete="username" required value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
                </label>
                <label className="field-label">
                  Пароль
                  <input type="password" placeholder="Введите пароль" autoComplete="current-password" required minLength={6} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                </label>
                <button className="btn primary" type="submit">Войти в CRM</button>
                <button type="button" className="btn ghost" onClick={doForgotPassword}>Забыл пароль</button>
              </form>
            ) : (
              <form className="auth-form-stack" onSubmit={doRegister}>
                <label className="field-label">
                  ФИО
                  <input placeholder="Иванов Иван Иванович" required minLength={3} maxLength={80} value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} />
                </label>
                <label className="field-label">
                  Email
                  <input placeholder="name@pulsepoint.club" type="email" autoComplete="email" required value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} />
                </label>
                <label className="field-label">
                  Телефон
                  <input placeholder="+7 900 000-00-00" autoComplete="tel" pattern="[+\d\s()-]{10,20}" value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} />
                </label>
                <label className="field-label">
                  Пароль
                  <input type="password" placeholder="Создайте пароль" autoComplete="new-password" required minLength={6} value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} />
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
                <button className="btn primary" type="submit">Создать аккаунт</button>
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
        <div>г. Самара, ТЦ ПаркХаус · +7 (846) 000-11-22 · crm@pulsepoint.club</div>
      </footer>
    </div>
  );
}

function LuxuryLoadingScreen({ scene, progress }) {
  return (
    <div className="lux-loading-screen">
      <div className="lux-loading-grid" aria-hidden="true"></div>
      <div className="lux-loading-orb lux-loading-orb--one" aria-hidden="true"></div>
      <div className="lux-loading-orb lux-loading-orb--two" aria-hidden="true"></div>
      <div className="lux-loading-shell">
        <h1 className="lux-loading-message">{scene.title || 'Подготавливаем премиальное пространство'}</h1>
        <div className="lux-loading-progress" aria-hidden="true">
          <i style={{ width: String(Math.round(progress)) + '%' }}></i>
        </div>
        <div className="lux-loading-meta">
          <strong>{Math.round(progress)}%</strong>
        </div>
      </div>
    </div>
  );
}
function RoleDashboard({ user, tab, db, setDb, metrics }) {
  if (user.role === 'admin') return <AdminDashboard tab={tab} db={db} setDb={setDb} metrics={metrics} />;
  if (user.role === 'trainer') return <TrainerDashboard tab={tab} db={db} setDb={setDb} user={user} />;
  if (user.role === 'hr') return <HRDashboard tab={tab} db={db} setDb={setDb} />;
  if (user.role === 'superuser') return <SuperUserDashboard tab={tab} db={db} setDb={setDb} />;
  return <AccountantDashboard tab={tab} db={db} setDb={setDb} metrics={metrics} />;
}


function SuperUserDashboard({ tab, db, setDb }) {
  const pending = db.pendingAccessRequests.filter((r) => r.status === 'pending');
  const resetRequests = db.pendingAccessRequests.filter((r) => r.status === 'password_reset');
  const [passwordDrafts, setPasswordDrafts] = useState({});

  function approveRequest(request) {
    setDb((state) => {
      if (request.status === 'password_reset') {
        const newPassword = String(passwordDrafts[request.id] || '').trim();
        if (!isStrongPassword(newPassword)) return state;
        return {
          ...state,
          users: state.users.map((u) => Number(u.id) === Number(request.userId) ? { ...u, password: newPassword, isBlocked: false } : u),
          pendingAccessRequests: state.pendingAccessRequests.map((r) => r.id === request.id ? { ...r, status: 'approved', reviewedAt: new Date().toISOString() } : r),
          superUserNotifications: state.superUserNotifications.filter((n) => n.requestId !== request.id),
        };
      }

      if (state.users.some((u) => u.email.trim().toLowerCase() === request.email.trim().toLowerCase())) {
        return {
          ...state,
          pendingAccessRequests: state.pendingAccessRequests.map((r) => r.id === request.id ? { ...r, status: 'approved', reviewedAt: new Date().toISOString() } : r),
          superUserNotifications: state.superUserNotifications.filter((n) => n.requestId !== request.id),
        };
      }
      const freeTrainer = state.trainers.find((t) => !state.users.some((u) => u.role === 'trainer' && Number(u.trainerId) === Number(t.id)));
      const user = {
        id: nextId(state.users),
        name: request.name,
        email: request.email,
        phone: request.phone || '',
        password: request.password,
        role: request.role,
        isBlocked: false,
        trainerId: request.role === 'trainer' ? (freeTrainer?.id || state.trainers[0]?.id) : undefined,
      };
      return {
        ...state,
        users: [...state.users, user],
        pendingAccessRequests: state.pendingAccessRequests.map((r) => r.id === request.id ? { ...r, status: 'approved', reviewedAt: new Date().toISOString() } : r),
        superUserNotifications: state.superUserNotifications.filter((n) => n.requestId !== request.id),
      };
    });
  }

  function rejectRequest(request) {
    setDb((state) => ({
      ...state,
      pendingAccessRequests: state.pendingAccessRequests.map((r) => r.id === request.id ? { ...r, status: 'rejected', reviewedAt: new Date().toISOString() } : r),
      superUserNotifications: state.superUserNotifications.filter((n) => n.requestId !== request.id),
    }));
  }

  function updateRole(userId, role) {
    setDb((state) => ({
      ...state,
      users: state.users.map((u) => {
        if (u.id !== userId) return u;
        if (role !== 'trainer') return { ...u, role, trainerId: undefined };
        const freeTrainer = state.trainers.find((t) => !state.users.some((x) => x.id !== u.id && x.role === 'trainer' && Number(x.trainerId) === Number(t.id)));
        return { ...u, role, trainerId: u.trainerId || freeTrainer?.id || state.trainers[0]?.id };
      }),
    }));
  }

  function toggleBlock(userId) {
    setDb((state) => ({
      ...state,
      users: state.users.map((u) => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u),
    }));
  }

  function savePassword(userId) {
    const newPassword = String(passwordDrafts[userId] || '').trim();
    if (!isStrongPassword(newPassword)) return;
    setDb((state) => ({
      ...state,
      users: state.users.map((u) => u.id === userId ? { ...u, password: newPassword, isBlocked: false } : u),
    }));
    setPasswordDrafts((prev) => ({ ...prev, [userId]: '' }));
  }

  if (tab !== 'Доступы и роли') return null;

  return (
    <>
      <Card>
        <h3>Уведомления супер пользователя</h3>
        <p className="muted-row">Новых заявок: {pending.length}. Запросы на сброс пароля: {resetRequests.length}.</p>
        <DataTable
          headers={['Сотрудник', 'Email', 'Роль', 'Статус', 'Действия']}
          rows={db.pendingAccessRequests.map((r) => [
            r.name,
            r.email,
            roleLabels[r.role] || r.role,
            r.status === 'pending' ? 'Ожидает решения' : r.status === 'approved' ? 'Одобрен' : r.status === 'password_reset' ? 'Сброс пароля' : 'Отказано',
            r.status === 'pending'
              ? <div className="row"><button type="button" className="btn primary" onClick={() => approveRequest(r)}>Разрешить</button><button type="button" className="btn ghost" onClick={() => rejectRequest(r)}>Отказать</button></div>
              : r.status === 'password_reset'
                ? <div className="form-grid"><input placeholder="Новый пароль" value={passwordDrafts[r.id] || ''} onChange={(e) => setPasswordDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))} /><button type="button" className="btn primary" onClick={() => approveRequest(r)}>Сменить и активировать</button></div>
                : '—',
          ])}
        />
      </Card>

      <Card>
        <h3>Учётные данные и роли</h3>
        <DataTable
          headers={['Пользователь', 'Email', 'Текущая роль', 'Назначить роль', 'Пароль', 'Статус', 'Управление']}
          rows={db.users.map((u) => [
            u.name,
            u.email,
            roleLabels[u.role] || u.role,
            <select value={u.role} onChange={(e) => updateRole(u.id, e.target.value)}>
              <option value="trainer">Тренер</option>
              <option value="hr">HR</option>
              <option value="accountant">Бухгалтер</option>
              <option value="admin">Админ</option>
              <option value="superuser">Супер пользователь</option>
            </select>,
            <div className="form-grid"><input placeholder="Новый пароль" value={passwordDrafts[u.id] || ''} onChange={(e) => setPasswordDrafts((prev) => ({ ...prev, [u.id]: e.target.value }))} /><button type="button" className="btn ghost" onClick={() => savePassword(u.id)}>Сохранить</button></div>,
            u.isBlocked ? 'Заблокирован' : 'Активен',
            <button type="button" className="btn ghost" onClick={() => toggleBlock(u.id)}>{u.isBlocked ? 'Активировать' : 'Блокировать'}</button>,
          ])}
        />
      </Card>
    </>
  );
}


function AdminDashboard({ tab, db, setDb, metrics }) {
  const [trainerForm, setTrainerForm] = useState({ name: '', spec: '', level: 'Middle', maxDailySlots: 4, rate: 2000 });
  const [classForm, setClassForm] = useState({ title: '', trainerId: db.trainers[0]?.id || 1, date: '2026-02-20', time: '10:00', duration: 60, capacity: 12, room: 'A' });
  const [accountForm, setAccountForm] = useState({ name: '', email: '', phone: '', password: '', role: 'trainer' });
  const analyticsWidgets = [
    { id: 'users', label: 'Учётные записи', value: db.users.length, note: `Тренерских: ${db.users.filter((u) => u.role === 'trainer').length}` },
    { id: 'trainers', label: 'Тренеры', value: db.trainers.length, note: `Связанных аккаунтов: ${db.trainers.filter((t) => db.users.some((u) => u.role === 'trainer' && Number(u.trainerId) === Number(t.id))).length}` },
    { id: 'clients', label: 'Клиенты', value: db.clients.length, note: `Активные: ${db.clients.filter((c) => c.status === 'Активен').length}` },
    { id: 'classes', label: 'Занятия', value: db.classes.length, note: `Проведено: ${db.classes.filter((c) => c.done).length}` },
    { id: 'payments', label: 'Платежи', value: db.payments.length, note: `Выручка: ${money(metrics.revenue)}` },
    { id: 'archive', label: 'Архив тренировок', value: db.workoutsArchive.length, note: `Видео-карточки: ${db.workoutsArchive.filter((x) => x.mediaType === 'video').length}` },
  ];
  const [widgetToAdd, setWidgetToAdd] = useState('payments');
  const [activeWidgetIds, setActiveWidgetIds] = useState(['users', 'trainers', 'clients', 'classes']);
  const availableWidgets = analyticsWidgets.filter((widget) => !activeWidgetIds.includes(widget.id));
  const selectedWidgetId = availableWidgets.some((widget) => widget.id === widgetToAdd) ? widgetToAdd : (availableWidgets[0]?.id || '');
  const payrollRows = db.trainers.map((trainer) => {
    const trainerClasses = db.classes.filter((item) => item.trainerId === trainer.id);
    const completed = trainerClasses.filter((item) => item.done).length;
    const bonus = completed >= 2 ? Math.round(trainer.rate * 0.15) : 0;
    const payout = trainerClasses.length * trainer.rate + bonus;
    const utilization = Math.min(100, Math.round((trainerClasses.length / Math.max(trainer.maxDailySlots * 5, 1)) * 100));
    return { id: trainer.id, name: trainer.name, classes: trainerClasses.length, completed, rate: trainer.rate, bonus, payout, utilization };
  });
  const totalBonus = payrollRows.reduce((sum, row) => sum + row.bonus, 0);
  const averagePayout = payrollRows.length ? Math.round(payrollRows.reduce((sum, row) => sum + row.payout, 0) / payrollRows.length) : 0;
  const topPayout = [...payrollRows].sort((a, b) => b.payout - a.payout)[0];
  const activeAccounts = db.users.filter((user) => !user.isBlocked).length;
  const linkedTrainerAccounts = db.users.filter((user) => user.role === 'trainer' && byId(db.trainers, user.trainerId)).length;
  const blockedAccounts = db.users.filter((user) => user.isBlocked).length;
  const incompleteContacts = db.users.filter((user) => !String(user.phone || '').trim()).length;
  const accessMatrix = [
    { role: 'admin', access: 'Полный операционный контроль', focus: 'Рабочий стол, расписание, тренеры, доступы' },
    { role: 'trainer', access: 'Персональный рабочий контур', focus: 'Свои занятия, клиенты, архив программ' },
    { role: 'hr', access: 'Команда и найм', focus: 'Подбор, сертификации, посещаемость персонала' },
    { role: 'accountant', access: 'Финансовый контур', focus: 'Платежи, выплаты, прогноз по выручке' },
    { role: 'superuser', access: 'Критические доступы', focus: 'Заявки, сброс паролей, блокировки и роли' },
  ];
  const upcomingClasses = [...db.classes]
    .sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.time).localeCompare(String(b.time)))
    .slice(0, 6);

  if (tab === 'Рабочий стол') {
    return (
      <>
        <Card>
          <div className="section-heading">
            <div>
              <h3>Операционная картина дня</h3>
            </div>
          </div>
          <div className="metrics metrics-rich">
            <Metric label="Выручка" value={money(metrics.revenue)} />
            <Metric label="Средний чек" value={money(metrics.avgCheck)} />
            <Metric label="Активные клиенты" value={String(metrics.activeClients) + '/' + String(metrics.clientsCount)} />
            <Metric label="Посещений / месяц" value={metrics.monthlyVisits} />
            <Metric label="Средняя посещаемость" value={String(metrics.avgVisitRate) + ' на клиента'} />
            <Metric label="Тренеров" value={db.trainers.length} />
            <Metric label="Занятий" value={metrics.classCount} />
            <Metric label="Средняя нагрузка / день" value={metrics.avgDailyClasses} />
            <Metric label="Фонд выплат" value={money(metrics.totalPayroll)} />
          </div>
        </Card>
        <Card>
          <div className="section-heading">
            <div>
              <h3>Гибкая панель виджетов</h3>
            </div>
          </div>
          <div className="admin-inline-controls">
            <select value={selectedWidgetId} onChange={(event) => setWidgetToAdd(event.target.value)} disabled={!availableWidgets.length}>
              {availableWidgets.length ? availableWidgets.map((widget) => <option key={widget.id} value={widget.id}>{widget.label}</option>) : <option value="">Все виджеты уже выведены</option>}
            </select>
            <button type="button" className="btn ghost" onClick={() => setActiveWidgetIds((prev) => (selectedWidgetId && !prev.includes(selectedWidgetId) ? [...prev, selectedWidgetId] : prev))} disabled={!availableWidgets.length}>Добавить виджет</button>
          </div>
          <div className="metrics metrics-rich">
            {analyticsWidgets.filter((widget) => activeWidgetIds.includes(widget.id)).map((widget) => (
              <div key={widget.id} className="metric">
                <div className="metric-label">{widget.label}</div>
                <div className="metric-value">{widget.value}</div>
                <small>{widget.note}</small>
                <div>
                  <button type="button" className="btn ghost" onClick={() => setActiveWidgetIds((prev) => prev.filter((id) => id !== widget.id))}>Скрыть</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="section-heading">
            <div>
              <h3>Расписание под рукой</h3>
            </div>
          </div>
          <DataTable
            headers={['Дата', 'Время', 'Занятие', 'Тренер', 'Статус']}
            rows={upcomingClasses.map((item) => [item.date, item.time, item.title, byId(db.trainers, item.trainerId)?.name || '—', item.done ? 'Проведено' : 'Запланировано'])}
          />
        </Card>
        <Card>
          <div className="section-heading">
            <div>
              <h3>Нагрузка тренеров</h3>
            </div>
          </div>
          <LoadBars db={db} />
        </Card>
        <Card>
          <div className="section-heading">
            <div>
              <h3>Топ клиентов по посещениям</h3>
            </div>
          </div>
          <DataTable
            headers={['Клиент', 'Абонемент', 'Посещения', 'Последний визит', 'Статус']}
            rows={[...db.clients].sort((a, b) => Number(b.visits || 0) - Number(a.visits || 0)).slice(0, 6).map((client) => [client.name, client.membership || '—', Number(client.visits || 0), client.lastVisit || '—', client.status])}
          />
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
          if (!trainerForm.name || !trainerForm.spec || Number(trainerForm.maxDailySlots) <= 0 || Number(trainerForm.rate) <= 0) return;
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
          if (!classForm.title || !classForm.date || !classForm.time || Number(classForm.duration) <= 0 || Number(classForm.capacity) <= 0) return;
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

  if (tab === 'Аккаунты') {
    return (
      <>
        <Card>
          <div className="section-heading">
            <div>
              <h3>Аккаунты и права</h3>
            </div>
          </div>
          <div className="metrics metrics-rich">
            <Metric label="Активные аккаунты" value={activeAccounts} />
            <Metric label="Связаны с тренерами" value={linkedTrainerAccounts} />
            <Metric label="Заблокированы" value={blockedAccounts} />
            <Metric label="Профили без телефона" value={incompleteContacts} />
          </div>
          <form className="form-grid" onSubmit={(event) => {
            event.preventDefault();
            if (!accountForm.name || !isValidEmail(accountForm.email) || !isStrongPassword(accountForm.password) || !isValidPhone(accountForm.phone)) return;
            if (db.users.some((user) => user.email.trim().toLowerCase() === accountForm.email.trim().toLowerCase())) return;
            setDb((state) => {
              const freeTrainer = state.trainers.find((trainer) => !state.users.some((user) => user.role === 'trainer' && Number(user.trainerId) === Number(trainer.id)));
              return {
                ...state,
                users: [...state.users, { id: nextId(state.users), ...accountForm, email: accountForm.email.trim().toLowerCase(), trainerId: accountForm.role === 'trainer' ? (freeTrainer?.id || state.trainers[0]?.id) : undefined }],
              };
            });
            setAccountForm({ name: '', email: '', phone: '', password: '', role: 'trainer' });
          }}>
            <input placeholder="ФИО" required minLength={3} value={accountForm.name} onChange={(event) => setAccountForm({ ...accountForm, name: event.target.value })} />
            <input placeholder="Email" type="email" required value={accountForm.email} onChange={(event) => setAccountForm({ ...accountForm, email: event.target.value.toLowerCase() })} />
            <input placeholder="Телефон" pattern="[+\d\s()-]{10,20}" value={accountForm.phone} onChange={(event) => setAccountForm({ ...accountForm, phone: event.target.value })} />
            <input placeholder="Пароль" type="password" required minLength={6} value={accountForm.password} onChange={(event) => setAccountForm({ ...accountForm, password: event.target.value })} />
            <select value={accountForm.role} onChange={(event) => setAccountForm({ ...accountForm, role: event.target.value })}><option value="trainer">Тренер</option><option value="hr">HR</option><option value="accountant">Бухгалтер</option><option value="admin">Админ</option></select>
            <button className="btn primary">Добавить аккаунт</button>
          </form>
          <DataTable
            headers={['Сотрудник', 'Роль', 'Доступ', 'Связь с тренером', 'Email', 'Телефон']}
            rows={db.users.map((user) => [user.name, roleLabels[user.role], user.isBlocked ? 'Заблокирован' : 'Активен', user.role === 'trainer' ? (byId(db.trainers, user.trainerId)?.name || 'Связь не настроена') : '—', user.email, user.phone || '—'])}
          />
        </Card>
        <Card>
          <div className="section-heading">
            <div>
              <h3>Распределение прав и зон ответственности</h3>
            </div>
          </div>
          <DataTable
            headers={['Роль', 'Аккаунтов', 'Доступ', 'Ключевая зона ответственности']}
            rows={accessMatrix.map((item) => [roleLabels[item.role] || item.role, db.users.filter((user) => user.role === item.role).length, item.access, item.focus])}
          />
        </Card>
      </>
    );
  }
  return (
    <>
      <Card>
        <div className="section-heading">
          <div>
            <h3>Зарплаты и готовность к начислению</h3>
          </div>
        </div>
        <div className="metrics metrics-rich">
          <Metric label="Всего к выплате" value={money(metrics.totalPayroll + totalBonus)} />
          <Metric label="Бонусный фонд" value={money(totalBonus)} />
          <Metric label="Средняя выплата" value={money(averagePayout)} />
          <Metric label="Топ начисление" value={topPayout ? topPayout.name : '—'} />
        </div>
        <PayrollBars rows={payrollRows} />
      </Card>
      <Card>
        <div className="section-heading">
          <div>
            <h3>Ведомость по тренерам</h3>
          </div>
        </div>
        <DataTable
          headers={['Тренер', 'Занятий', 'Проведено', 'Ставка', 'Бонус', 'К выплате']}
          rows={payrollRows.map((row) => [row.name, row.classes, row.completed, money(row.rate), money(row.bonus), money(row.payout)])}
        />
      </Card>
    </>
  );
}

function TrainerDashboard({ tab, db, setDb, user }) {
  const myTrainer = byId(db.trainers, user.trainerId) || db.trainers[0];
  const myClasses = db.classes.filter((c) => c.trainerId === myTrainer.id);
  const myClients = db.clients.filter((c) => c.trainerId === myTrainer.id);
  const myWork = db.workLogs.filter((w) => w.trainerId === myTrainer.id);
  const myArchive = db.workoutsArchive.filter((item) => item.trainerId === myTrainer.id);
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
      <>
        <Card>
          <div className="section-heading">
            <div>
              <h3>Мои занятия</h3>
            </div>
          </div>
          <DataTable
            headers={['Дата', 'Время', 'Занятие', 'Статус', '']}
            rows={myClasses.map((item) => [
              item.date,
              item.time,
              item.title,
              item.done ? 'Проведено' : 'Запланировано',
              <button type="button" className="btn ghost" onClick={() => setDb((state) => ({ ...state, classes: state.classes.map((current) => current.id === item.id ? { ...current, done: !current.done } : current) }))}>{item.done ? 'Откатить' : 'Закрыть'}</button>,
            ])}
          />
        </Card>
        <Card>
          <div className="section-heading">
            <div>
              <h3>Библиотека программ</h3>
            </div>
          </div>
          <div className="workout-archive-grid">
            {myArchive.map((item) => {
              const shouldShowVideo = item.mediaType === 'video';
              return (
                <article key={item.id} className="workout-archive-item">
                  {shouldShowVideo ? (
                    <video
                      poster={item.poster}
                      className="workout-archive-image"
                      controls
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    >
                      {getArchiveVideoSources(item).map((source) => (
                        <source key={source} src={source} type={getMediaTypeFromUrl(source)} />
                      ))}
                    </video>
                  ) : (
                    <img src={item.media} alt={item.title} className="workout-archive-image" loading="lazy" />
                  )}
                  <div className="workout-archive-content">
                    <div className="workout-archive-head">
                      <h4>{item.title}</h4>
                      <span className="premium-pill premium-pill--soft">{item.level}</span>
                    </div>
                    <p className="workout-description">{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </Card>
      </>
    );
  }
  if (tab === 'Клиенты') {
    return (
      <Card>
        <h3>Мои клиенты и заметки</h3>
        <DataTable
          headers={['Клиент', 'Программа', 'Посещения', 'Последний визит', 'Статус']}
          rows={myClients.map((c) => [c.name, c.program, Number(c.visits || 0), c.lastVisit || '—', c.status])}
        />
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
          const hours = logs.reduce((sum, w) => sum + calcHoursValue(w.start, w.end), 0);
          return [t.name, logs.length, `${hours.toFixed(1)} ч`];
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

function PayrollBars({ rows }) {
  const max = Math.max(...rows.map((row) => row.payout), 1);

  return (
    <div className="bars payroll-bars">
      {rows.map((row) => (
        <div className="payroll-bar-row" key={row.id}>
          <div className="bar-label">
            <strong>{row.name}</strong>
            <small>{row.completed} проведено · загрузка {row.utilization}%</small>
          </div>
          <div className="bar"><i style={{ width: String(Math.round((row.payout / max) * 100)) + '%' }}></i></div>
          <b>{money(row.payout)}</b>
        </div>
      ))}
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

export default App;





















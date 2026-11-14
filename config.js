// Все настройки. Меняйте здесь.
window.CONFIG = {
  // Telegram ID администратора(ов). Узнать свой ID можно у бота @userinfobot.
  // Внутри Telegram админ-панель откроется только для этих ID.
  // Важно: проверка выполняется в браузере и не защищает от подделки. Для настоящей защиты нужен backend.
  ADMIN_TG_IDS: [6167331943],
  ADMIN_DEMO: true, // вне Telegram (в обычном браузере) вход по любому коду из 4 символов, для проверки. Перед запуском поставьте false
  AVATARS: ['🐻', '🐷', '🐱', '🦊', '🐼', '🐸'], // аватарки для ордеров
  // Адреса пополнения (сейчас заглушки). Баланс в приложении виртуальный, входящие переводы не зачисляются.
  ADDR: {
    TON: 'UQBsW_eG-cFgLArPCYFIak8rvrv_E2ck4f-t07vaKDyQV2h0',
    USDT: 'TQcMMDwBrxsimfkcJAodRcD72CBCwym9cb',
    BTC: '1NLZ5TmAokq2egnZrgEkB5XVSAb3ae742K',
    ETH: '0xb5a916b5e8be368d9e1bb3bc83dc4553445f2002'
  },
  NETS: { TON: 'TON', USDT: 'USDT TRC-20', BTC: 'Bitcoin', ETH: 'ERC-20' },
  START_BALANCES: { TON: 100, USDT: 250, BTC: 0.005, ETH: 0.1 },
  PRICES: { TON: 5.2, USDT: 1, BTC: 65000, ETH: 3200 }, // USD, запасные значения на случай, если курсы не удалось загрузить
  PRICES_LIVE: true, // true = курсы подтягиваются автоматически из CoinGecko (можно отключить, задав курс вручную в админке)
  MIN_DEPOSIT_USD: 10, // минимальная сумма пополнения в долларах (можно поменять в админ-панели)
  NAMES: { TON: 'Toncoin', USDT: 'Tether', BTC: 'Bitcoin', ETH: 'Ethereum' },
  ICONS: { TON: 'gem', USDT: 'circle-dollar-sign', BTC: 'bitcoin', ETH: 'hexagon' },
  COLORS: {
    TON: ['linear-gradient(135deg,#248BFA,#54B8FF)', '#248BFA'],
    USDT: ['linear-gradient(135deg,#0FA678,#51D6A6)', '#12B886'],
    BTC: ['linear-gradient(135deg,#F7931A,#FFC46B)', '#F7931A'],
    ETH: ['linear-gradient(135deg,#5B4BDB,#A29BFE)', '#6C5CE7']
  },
  FEE: 0.005, SWAP_FEE: 0.003,
  ROULETTE: { // шансы можно менять в админ-панели; здесь значения по умолчанию
    currencies: ['TON', 'USDT'], minBetUsd: 5, maxBetUsd: 1000,
    segments: [
      { m: 0, w: 10 }, { m: 1.5, w: 12 }, { m: 0, w: 10 }, { m: 2, w: 8 },
      { m: 0, w: 10 }, { m: 0.5, w: 14 }, { m: 0, w: 10 }, { m: 3, w: 5 },
      { m: 0, w: 10 }, { m: 1, w: 12 }, { m: 0, w: 10 }, { m: 5, w: 2 }
    ]
  },
  // Нужно только для функции «начислить баланс по ID» в админ-панели.
  // Без этого всё остальное (включая саму админку) работает как раньше, на localStorage.
  // Без SQL и таблиц, 2 минуты:
  // 1) jsonbin.io → зарегистрируйтесь (бесплатно).
  // 2) Create Bin → в поле содержимого вставьте просто {} → Create.
  // 3) Скопируйте Bin ID (виден в адресной строке/в списке бинов) и X-Master-Key
  //    (Account → API Keys) сюда:
  // ВАЖНО: ключ X-Master-Key будет виден в коде сайта всем желающим (это клиентское
  // приложение без сервера) — он даёт полный доступ к этому бину. Не используйте
  // этот бин ни для чего, кроме демо-баланса, и не переиспользуйте этот ключ больше нигде.
  JSONBIN: { binId: '6af8a904ac6210605a87d5ba', apiKey: '$2a$10$tuLN0FSj6aOLXZW79RFaDeA4ag0Lr8ywHymIoZrZFSazK2Z3D5V3' }
};

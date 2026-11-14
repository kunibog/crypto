// Все настройки. Меняйте здесь.
window.CONFIG = {
  // Telegram ID администратора(ов). Узнать свой ID можно у бота @userinfobot.
  // Внутри Telegram админ-панель откроется только для этих ID.
  // Важно: проверка выполняется в браузере и не защищает от подделки. Для настоящей защиты нужен backend.
  ADMIN_TG_IDS: [],
  ADMIN_DEMO: true, // вне Telegram (в обычном браузере) вход по любому коду из 4 символов, для проверки. Перед запуском поставьте false
  AVATARS: ['🐻', '🐷', '🐱', '🦊', '🐼', '🐸'], // аватарки для ордеров
  // Адреса пополнения (сейчас заглушки). Баланс в приложении виртуальный, входящие переводы не зачисляются.
  ADDR: {
    TON: 'UQ_replace_with_ton_address',
    USDT: 'T_replace_with_trc20_address',
    BTC: '1_replace_with_btc_address',
    ETH: '0x_replace_with_erc20_address'
  },
  NETS: { TON: 'TON', USDT: 'USDT TRC-20', BTC: 'Bitcoin', ETH: 'ERC-20' },
  START_BALANCES: { TON: 100, USDT: 250, BTC: 0.005, ETH: 0.1 },
  PRICES: { TON: 5.2, USDT: 1, BTC: 65000, ETH: 3200 }, // USD
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
  SUPABASE: { url: '', anonKey: '' }
};

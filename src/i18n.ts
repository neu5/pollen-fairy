// Languages. Default follows the browser; a picked language is saved on this computer.

export type Lang = 'en' | 'pl';
export const LANGS: Lang[] = ['en', 'pl'];

const en = {
  'title.a': 'Pollen', 'title.b': 'Fairy', 'doc.title': 'Pollen Fairy',
  'tag': 'Wake up the sleepy flowers!',
  'keys.walk': 'walk', 'keys.space': 'Space', 'keys.fly': 'hold to fly', 'key.space': 'SPACE',
  'who': 'Who is playing?', 'ask.name': "What is the fairy's name?",
  'new': 'New', 'yes': 'Yes', 'no': 'No',
  'remove.ask': 'Remove {name}?', 'hooray': 'Hooray, {name}!', 'win.default': 'You did it!',
  'a.sound': 'Sound on or off', 'a.play': 'Play', 'a.home': 'Back to map', 'a.back': 'Back', 'a.ok': 'OK',
  'a.yourName': 'Fairy name', 'a.random': 'Surprise me', 'a.done': 'Done', 'a.changePlayer': 'Change player',
  'a.dress': 'Dress up', 'a.map': 'Map', 'a.replay': 'Play again', 'a.next': 'Next level',
  'a.left': 'Walk left', 'a.right': 'Walk right', 'a.fly': 'Fly', 'a.lang': 'Language',
  'a.playAs': 'Play as {name}', 'a.remove': 'Remove {name}', 'a.dressKid': 'Dress up {name}',
  'a.newPlayer': 'New player', 'a.locked': '(locked)',
  'tab.hair': 'Hair', 'tab.dress': 'Dress', 'tab.shoes': 'Shoes', 'tab.wings': 'Wings',
  'c.hair': 'Hair colour', 'c.skin': 'Skin', 'c.dress': 'Dress colour', 'c.shoes': 'Shoe colour',
  'l1': 'Sleepy Meadow', 'l2': "Snail's Slow Trip", 'l3': 'Night Garden', 'l4': 'Rainy Day', 'l5': 'Windy Hill',
  'l6': 'Frog Pond', 'l7': 'Grey Garden', 'l8': 'Autumn Woods', 'l9': 'Crystal Cave', 'l10': 'Rainbow Festival',
  'w1': 'The Great Flower is blooming!', 'w2': 'Snail is home, safe and happy!', 'w3': 'Good morning, Beetle!',
  'w4': 'Everyone is dry. Look, a rainbow!', 'w5': 'Baby bird is home with Mama!', 'w6': 'What a lovely frog song!',
  'w7': 'All the colours are back!', 'w8': 'Squirrel has all the acorns!', 'w9': 'The moles found the sunshine!',
  'w10': 'Welcome to the Sky Castle!',
};

export type Key = keyof typeof en;

const pl: Record<Key, string> = {
  'title.a': 'Pyłkowa', 'title.b': 'Wróżka', 'doc.title': 'Pyłkowa Wróżka',
  'tag': 'Obudź śpiące kwiatki!',
  'keys.walk': 'chodź', 'keys.space': 'Spacja', 'keys.fly': 'przytrzymaj, by latać', 'key.space': 'SPACJA',
  'who': 'Kto gra?', 'ask.name': 'Jak wróżka ma na imię?',
  'new': 'Nowa', 'yes': 'Tak', 'no': 'Nie',
  'remove.ask': 'Usunąć {name}?', 'hooray': 'Hurra, {name}!', 'win.default': 'Udało się!',
  'a.sound': 'Dźwięk włącz lub wyłącz', 'a.play': 'Graj', 'a.home': 'Wróć do mapy', 'a.back': 'Wstecz', 'a.ok': 'OK',
  'a.yourName': 'Imię wróżki', 'a.random': 'Niespodzianka', 'a.done': 'Gotowe', 'a.changePlayer': 'Zmień gracza',
  'a.dress': 'Przebierz', 'a.map': 'Mapa', 'a.replay': 'Zagraj jeszcze raz', 'a.next': 'Następny poziom',
  'a.left': 'Idź w lewo', 'a.right': 'Idź w prawo', 'a.fly': 'Leć', 'a.lang': 'Język',
  'a.playAs': 'Graj jako {name}', 'a.remove': 'Usuń {name}', 'a.dressKid': 'Przebierz {name}',
  'a.newPlayer': 'Nowy gracz', 'a.locked': '(zamknięte)',
  'tab.hair': 'Włosy', 'tab.dress': 'Sukienka', 'tab.shoes': 'Buty', 'tab.wings': 'Skrzydła',
  'c.hair': 'Kolor włosów', 'c.skin': 'Skóra', 'c.dress': 'Kolor sukienki', 'c.shoes': 'Kolor butów',
  'l1': 'Senna Łąka', 'l2': 'Powolna podróż ślimaka', 'l3': 'Nocny ogród', 'l4': 'Deszczowy dzień', 'l5': 'Wietrzne wzgórze',
  'l6': 'Żabi staw', 'l7': 'Szary ogród', 'l8': 'Jesienny las', 'l9': 'Kryształowa jaskinia', 'l10': 'Tęczowy festyn',
  'w1': 'Wielki Kwiat zakwitł!', 'w2': 'Ślimak jest w domu, cały i szczęśliwy!', 'w3': 'Dzień dobry, Żuczku!',
  'w4': 'Wszyscy są już suchi. Patrz, tęcza!', 'w5': 'Ptaszek jest w domu z mamą!', 'w6': 'Jaka piękna żabia piosenka!',
  'w7': 'Wszystkie kolory wróciły!', 'w8': 'Wiewiórka ma wszystkie żołędzie!', 'w9': 'Krety znalazły słońce!',
  'w10': 'Witaj w Podniebnym Zamku!',
};

const DICT: Record<Lang, Record<Key, string>> = { en, pl };
const KEY = 'pf-lang';

function detect(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'en' || saved === 'pl') return saved;
  } catch { /* storage blocked */ }
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
  return prefs.some(l => l?.toLowerCase().startsWith('pl')) ? 'pl' : 'en';
}

let lang: Lang = detect();
const listeners: (() => void)[] = [];

export const getLang = (): Lang => lang;

export function t(key: Key, vars: Record<string, string | number> = {}): string {
  return DICT[lang][key].replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

export function setLang(l: Lang): void {
  if (l === lang) return;
  lang = l;
  try { localStorage.setItem(KEY, l); } catch { /* storage blocked: only for this visit */ }
  applyDom();
  listeners.forEach(f => f());
}

export function onLangChange(f: () => void): void { listeners.push(f); }

// Fill in every element marked with data-i18n (text) or data-i18n-aria (aria-label).
export function applyDom(): void {
  document.documentElement.lang = lang;
  document.title = t('doc.title');
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n as Key); });
  document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach(e => e.setAttribute('aria-label', t(e.dataset.i18nAria as Key)));
  document.querySelectorAll<HTMLElement>('[data-lang]').forEach(e => {
    const on = e.dataset.lang === lang;
    e.classList.toggle('on', on);
    e.setAttribute('aria-pressed', String(on));
  });
}

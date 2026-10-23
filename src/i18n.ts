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
  'a.left': 'Walk left', 'a.right': 'Walk right', 'a.fly': 'Fly', 'a.lang': 'Language', 'again': 'Oh! Again?', 'a.close': 'Close', 'a.minBack': 'Long hand back', 'a.minFwd': 'Long hand forward', 'a.hourBack': 'Short hand back', 'a.hourFwd': 'Short hand forward', 'paused': 'Paused', 'a.pause': 'Pause', 'a.resume': 'Keep playing', 'a.restart': 'Start again',
  'a.playAs': 'Play as {name}', 'a.remove': 'Remove {name}', 'a.dressKid': 'Dress up {name}',
  'a.newPlayer': 'New player', 'a.locked': '(locked)',
  'tab.hair': 'Hair', 'tab.dress': 'Dress', 'tab.shoes': 'Shoes', 'tab.wings': 'Wings',
  'c.hair': 'Hair colour', 'c.skin': 'Skin', 'c.dress': 'Dress colour', 'c.shoes': 'Shoe colour',
  'l1-1': 'Sleepy Meadow', 'l1-2': "Snail's Slow Trip", 'l1-3': 'Night Garden', 'l1-4': 'Rainy Day', 'l1-5': 'Windy Hill',
  'l1-6': 'Frog Pond', 'l1-7': 'Grey Garden', 'l1-8': 'Autumn Woods', 'l1-9': 'Crystal Cave', 'l1-10': 'Rainbow Festival',
  'w1-1': 'The Great Flower is blooming!', 'w1-2': 'Snail is home, safe and happy!', 'w1-3': 'Good morning, Beetle!',
  'w1-4': 'Everyone is dry. Look, a rainbow!', 'w1-5': 'Baby bird is home with Mama!', 'w1-6': 'What a lovely frog song!',
  'w1-7': 'All the colours are back!', 'w1-8': 'Squirrel has all the acorns!', 'w1-9': 'The moles found the sunshine!',
  'w1-10': 'Welcome to the Sky Castle!',
  'ch1': 'Meadow Friends', 'ch2': 'Night Friends', 'ch3': 'Garden Seasons', 'ch4': 'River & Sea',
  'ch5': 'Mountains & Sky', 'chapters': 'Choose an adventure', 'a.chapter': 'Chapter {n}',
  'a.chapters': 'Adventures', 'l2-1': "Owl's Glasses", 'l2-2': "Badger's Den", 'l2-3': 'Clock Tower',
  'l2-4': "Hedgehog's Apples", 'l2-5': 'Glow-worm Path', 'l2-6': 'Star Picture', 'l2-7': 'Owl School',
  'l2-8': 'Fox Cubs', 'l2-9': 'Moth Lanterns', 'l2-10': 'Moon Festival', 'l3-1': 'Little Seed', 'l3-2': 'Busy Bees',
  'l3-3': 'Colour Mix', 'l3-4': "Rabbit's Garden", 'l3-5': 'Worm Tunnels', 'l3-6': 'Season Tree',
  'l3-7': 'Thirsty Field', 'l3-8': 'Apple Sorting', 'l3-9': 'Snowy Feeders', 'l3-10': 'Spring Festival',
  'l4-1': 'Duckling Line', 'l4-2': 'River Clean-up', 'l4-3': 'Beaver Dam', 'l4-4': 'Sink or Float',
  'l4-5': 'Water Circle', 'l4-6': 'Fish School', 'l4-7': 'Lighthouse', 'l4-8': 'Hermit Crabs',
  'l4-9': 'Baby Turtles', 'l4-10': 'Coral Party', 'l5-1': 'Goat Path', 'l5-2': 'Cold Fox', 'l5-3': 'Balance Bridge',
  'l5-4': 'Cloud Shapes', 'l5-5': 'Snowflake Race', 'l5-6': 'Moon Phases', 'l5-7': 'Balloon Ride',
  'l5-8': 'Mountain Clock', 'l5-9': 'Star Count', 'l5-10': 'Festival of Friends',
  'w2-1': 'Owl can see again!', 'w2-2': 'Sleep well, Badger!', 'w2-3': "It's 8 o'clock. The lamps are on!",
  'w2-4': 'Hedgehog has a yummy supper!', 'w2-5': 'Mouse found the way home!', 'w2-6': 'Look, an owl made of stars!',
  'w2-7': 'Owl school can begin!', 'w2-8': 'All the fox cubs are home!',
  'w2-9': 'The moths are dancing in the light!', 'w2-10': 'Happy Moon Festival!',
  'w3-1': 'The little seed became a flower!', 'w3-2': 'All the bees are home!',
  'w3-3': 'The butterflies love their new colours!', 'w3-4': "Rabbit's garden is ready!",
  'w3-5': 'The roots have water now!', 'w3-6': 'The Season Tree is happy again!',
  'w3-7': 'The field had a good drink!', 'w3-8': 'All the apples are sorted!',
  'w3-9': 'The birds are warm and full!', 'w3-10': 'Spring is here!', 'w4-1': 'The ducklings are with Mama!',
  'w4-2': 'The river is clean again!', 'w4-3': 'The dam is finished!', 'w4-4': 'The raft floats!',
  'w4-5': 'Round and round goes the water!', 'w4-6': 'The fish reached the reef!',
  'w4-7': 'The lighthouse shines for the boats!', 'w4-8': 'Every crab has a cosy shell!',
  'w4-9': 'The baby turtles reached the sea!', 'w4-10': 'What a sparkly coral party!', 'w5-1': 'Goat is at the top!',
  'w5-2': 'Fox is nice and warm!', 'w5-3': 'The bridge is level!', 'w5-4': 'Beautiful cloud shapes!',
  'w5-5': 'Ten snowflakes caught!', 'w5-6': 'The moon is in the right order!',
  'w5-7': 'The balloon floats just right!', 'w5-8': 'You are a clock expert!', 'w5-9': 'Great counting!',
  'w5-10': 'Thank you for helping everyone!',
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
  'a.left': 'Idź w lewo', 'a.right': 'Idź w prawo', 'a.fly': 'Leć', 'a.lang': 'Język', 'again': 'Ojej! Jeszcze raz?', 'a.close': 'Zamknij', 'a.minBack': 'Duża wskazówka do tyłu', 'a.minFwd': 'Duża wskazówka do przodu', 'a.hourBack': 'Mała wskazówka do tyłu', 'a.hourFwd': 'Mała wskazówka do przodu', 'paused': 'Pauza', 'a.pause': 'Pauza', 'a.resume': 'Graj dalej', 'a.restart': 'Zacznij od nowa',
  'a.playAs': 'Graj jako {name}', 'a.remove': 'Usuń {name}', 'a.dressKid': 'Przebierz {name}',
  'a.newPlayer': 'Nowy gracz', 'a.locked': '(zamknięte)',
  'tab.hair': 'Włosy', 'tab.dress': 'Sukienka', 'tab.shoes': 'Buty', 'tab.wings': 'Skrzydła',
  'c.hair': 'Kolor włosów', 'c.skin': 'Skóra', 'c.dress': 'Kolor sukienki', 'c.shoes': 'Kolor butów',
  'l1-1': 'Senna Łąka', 'l1-2': 'Powolna podróż ślimaka', 'l1-3': 'Nocny ogród', 'l1-4': 'Deszczowy dzień', 'l1-5': 'Wietrzne wzgórze',
  'l1-6': 'Żabi staw', 'l1-7': 'Szary ogród', 'l1-8': 'Jesienny las', 'l1-9': 'Kryształowa jaskinia', 'l1-10': 'Tęczowy festyn',
  'w1-1': 'Wielki Kwiat zakwitł!', 'w1-2': 'Ślimak jest w domu, cały i szczęśliwy!', 'w1-3': 'Dzień dobry, Żuczku!',
  'w1-4': 'Wszyscy są już suchi. Patrz, tęcza!', 'w1-5': 'Ptaszek jest w domu z mamą!', 'w1-6': 'Jaka piękna żabia piosenka!',
  'w1-7': 'Wszystkie kolory wróciły!', 'w1-8': 'Wiewiórka ma wszystkie żołędzie!', 'w1-9': 'Krety znalazły słońce!',
  'w1-10': 'Witaj w Podniebnym Zamku!',
  'ch1': 'Przyjaciele z łąki', 'ch2': 'Nocni przyjaciele', 'ch3': 'Pory roku w ogrodzie', 'ch4': 'Rzeka i morze',
  'ch5': 'Góry i niebo', 'chapters': 'Wybierz przygodę', 'a.chapter': 'Rozdział {n}', 'a.chapters': 'Przygody',
  'l2-1': 'Okulary Sowy', 'l2-2': 'Nora Borsuka', 'l2-3': 'Zegar na wieży', 'l2-4': 'Jabłka Jeża',
  'l2-5': 'Ścieżka robaczków', 'l2-6': 'Gwiezdny obrazek', 'l2-7': 'Szkoła Sowy', 'l2-8': 'Małe liski',
  'l2-9': 'Lampiony ciem', 'l2-10': 'Święto Księżyca', 'l3-1': 'Małe nasionko', 'l3-2': 'Pracowite pszczoły',
  'l3-3': 'Mieszanie kolorów', 'l3-4': 'Ogródek Królika', 'l3-5': 'Tunele dżdżownicy', 'l3-6': 'Drzewo pór roku',
  'l3-7': 'Spragnione pole', 'l3-8': 'Sortowanie jabłek', 'l3-9': 'Zimowe karmniki', 'l3-10': 'Święto Wiosny',
  'l4-1': 'Kaczuszki', 'l4-2': 'Sprzątanie rzeki', 'l4-3': 'Tama Bobra', 'l4-4': 'Pływa czy tonie',
  'l4-5': 'Krąg wody', 'l4-6': 'Ławica rybek', 'l4-7': 'Latarnia morska', 'l4-8': 'Pustelniki',
  'l4-9': 'Małe żółwie', 'l4-10': 'Koralowa zabawa', 'l5-1': 'Ścieżka Kozy', 'l5-2': 'Zmarznięty Lis',
  'l5-3': 'Mostek z wagą', 'l5-4': 'Chmurkowe kształty', 'l5-5': 'Wyścig śnieżynek', 'l5-6': 'Fazy Księżyca',
  'l5-7': 'Lot balonem', 'l5-8': 'Zegar w górach', 'l5-9': 'Liczenie gwiazd', 'l5-10': 'Święto Przyjaciół',
  'w2-1': 'Sowa znowu widzi!', 'w2-2': 'Śpij dobrze, Borsuku!', 'w2-3': 'Jest ósma. Lampy świecą!',
  'w2-4': 'Jeż ma pyszną kolację!', 'w2-5': 'Myszka znalazła drogę do domu!', 'w2-6': 'Patrz, sowa z gwiazd!',
  'w2-7': 'Szkoła Sowy może się zacząć!', 'w2-8': 'Wszystkie liski są w domu!', 'w2-9': 'Ćmy tańczą w świetle!',
  'w2-10': 'Wesołego Święta Księżyca!', 'w3-1': 'Małe nasionko stało się kwiatkiem!',
  'w3-2': 'Wszystkie pszczoły są w domu!', 'w3-3': 'Motyle kochają nowe kolory!', 'w3-4': 'Ogródek Królika gotowy!',
  'w3-5': 'Korzenie mają już wodę!', 'w3-6': 'Drzewo pór roku znów jest szczęśliwe!', 'w3-7': 'Pole się napiło!',
  'w3-8': 'Wszystkie jabłka posortowane!', 'w3-9': 'Ptaszki są najedzone i im ciepło!', 'w3-10': 'Wiosna przyszła!',
  'w4-1': 'Kaczuszki są z mamą!', 'w4-2': 'Rzeka znowu jest czysta!', 'w4-3': 'Tama gotowa!',
  'w4-4': 'Tratwa pływa!', 'w4-5': 'Woda krąży w kółko!', 'w4-6': 'Rybki dopłynęły do rafy!',
  'w4-7': 'Latarnia świeci dla łódek!', 'w4-8': 'Każdy krab ma przytulną muszlę!',
  'w4-9': 'Małe żółwie dotarły do morza!', 'w4-10': 'Ale błyszcząca koralowa zabawa!',
  'w5-1': 'Koza jest na szczycie!', 'w5-2': 'Lisowi jest ciepło!', 'w5-3': 'Mostek jest równy!',
  'w5-4': 'Piękne chmurkowe kształty!', 'w5-5': 'Złapano dziesięć śnieżynek!',
  'w5-6': 'Księżyc jest w dobrej kolejności!', 'w5-7': 'Balon leci w sam raz!', 'w5-8': 'Jesteś mistrzem zegara!',
  'w5-9': 'Świetnie liczysz!', 'w5-10': 'Dziękujemy, że wszystkim pomagasz!',
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
  return (DICT[lang][key] ?? DICT.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
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

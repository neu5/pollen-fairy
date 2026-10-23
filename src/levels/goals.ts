import { getLang } from '../i18n';

// What to do in each level: picture steps (shown with arrows between them) and one short sentence.

interface Goal { steps: string[]; en: string; pl: string }

const G: Record<string, Goal> = {
  // ---------------------------------------------------------- chapter 1
  '1-1': { steps: ['🧚', '🌼', '🌸'], en: 'Touch the sleepy flowers to wake them up. Then fly to the big flower at the end.', pl: 'Dotknij śpiące kwiatki, żeby je obudzić. Potem leć do wielkiego kwiatu na końcu.' },
  '1-2': { steps: ['🌾', '🪨', '🍃', '🐌', '🏠'], en: 'Snail is slow. Touch the glowing grass, rock and leaf so Snail can get home.', pl: 'Ślimak jest powolny. Dotknij świecącą trawę, kamień i liść, żeby ślimak doszedł do domu.' },
  '1-3': { steps: ['⏳', '🌅', '🪲'], en: 'It is night. Find the hourglass up high. Morning comes and Beetle moves the big stone.', pl: 'Jest noc. Znajdź klepsydrę wysoko. Przyjdzie ranek i żuczek przesunie duży kamień.' },
  '1-4': { steps: ['🍄', '☂️', '🐞'], en: 'Touch the little mushrooms. They grow into umbrellas for the wet ladybugs.', pl: 'Dotknij małe grzybki. Urosną w parasole dla mokrych biedronek.' },
  '1-5': { steps: ['🐣', '🧚', '💨', '🪺'], en: 'Touch the baby bird so it follows you. Fly up in the wind and take it to its nest.', pl: 'Dotknij ptaszka, żeby leciał za tobą. Wzleć z wiatrem i zanieś go do gniazda.' },
  '1-6': { steps: ['👂', '🐸', '🐸', '🐸'], en: 'Listen to the frogs sing, then touch them in the same order.', pl: 'Posłuchaj, jak żabki śpiewają, potem dotknij je w tej samej kolejności.' },
  '1-7': { steps: ['🔴', '🧚', '🌷'], en: 'Take a paint and bring it to the grey flower that wants that colour.', pl: 'Weź farbę i zanieś ją do szarego kwiatka, który chce ten kolor.' },
  '1-8': { steps: ['🍂', '🌰', '🐿️'], en: 'Touch the leaf piles. Find 5 acorns for Squirrel.', pl: 'Dotykaj kupki liści. Znajdź 5 żołędzi dla wiewiórki.' },
  '1-9': { steps: ['💎', '✨', '🐭', '☀️'], en: 'Light the crystals. The mole family can only walk where it is bright.', pl: 'Zapal kryształy. Rodzina kretów idzie tylko tam, gdzie jest jasno.' },
  '1-10': { steps: ['⭐', '🌈', '🏰'], en: 'Find the 6 colour stars. They make a rainbow. Ride it to the castle!', pl: 'Znajdź 6 kolorowych gwiazdek. Zrobią tęczę. Pojedź nią do zamku!' },
  // ---------------------------------------------------------- chapter 2
  '2-1': { steps: ['🪶', '👓', '🦉'], en: 'Owl lost her glasses. Follow the feathers, find the glasses and bring them to Owl.', pl: 'Sowa zgubiła okulary. Idź za piórkami, znajdź okulary i zanieś je Sowie.' },
  '2-2': { steps: ['🍂', '➡️', '🌿', '🛏️', '🦡'], en: 'Take the old leaves out to the heap. Bring soft moss to the bed. Then Badger can sleep.', pl: 'Wynieś stare liście na kupkę. Przynieś miękki mech do łóżka. Wtedy borsuk zaśnie.' },
  '2-3': { steps: ['🕔', '➡️', '🕗', '🏮'], en: 'Fly to the clock. Turn the hands to 8 o\'clock and the lamps light up.', pl: 'Leć do zegara. Ustaw wskazówki na ósmą, a lampy się zapalą.' },
  '2-4': { steps: ['🌳', '🍎', '🦔'], en: 'Touch the trees to shake them. Find 5 apples for Hedgehog.', pl: 'Dotykaj drzewa, żeby nimi potrząsnąć. Znajdź 5 jabłek dla jeża.' },
  '2-5': { steps: ['1️⃣', '2️⃣', '3️⃣', '…', '🔟', '🐭'], en: 'Light the glow-worms in order: 1, 2, 3 … up to 10. Then Mouse can go home.', pl: 'Zapal robaczki po kolei: 1, 2, 3 … aż do 10. Wtedy myszka pójdzie do domu.' },
  '2-6': { steps: ['⭐1', '⭐2', '⭐3', '…', '🦉'], en: 'Touch the stars from 1 to 8. The lines make a picture in the sky.', pl: 'Dotykaj gwiazdki od 1 do 8. Linie zrobią obrazek na niebie.' },
  '2-7': { steps: ['🦉', '🦉', '🦉', '🏫', '🕢'], en: 'Bring the 3 baby owls to school. Then set the clock to half past 7.', pl: 'Zaprowadź 3 sówki do szkoły. Potem ustaw zegar na wpół do ósmej.' },
  '2-8': { steps: ['🌳', '🦊', '🏠', '⏳'], en: 'Find the 4 fox cubs hiding in the bushes before the time runs out.', pl: 'Znajdź 4 liski schowane w krzakach, zanim skończy się czas.' },
  '2-9': { steps: ['👀', '🏮', '🏮', '🏮'], en: 'Watch which lamps the moths light up. Then touch them in the same order.', pl: 'Patrz, które lampiony zapalają ćmy. Potem dotknij je w tej samej kolejności.' },
  '2-10': { steps: ['🕖', '➡️', '🕖¼', '🎉'], en: 'Set the gate clock to quarter past 7. Then go to the stage and dance!', pl: 'Ustaw zegar przy bramie na kwadrans po siódmej. Potem idź na scenę i tańcz!' },
  // ---------------------------------------------------------- chapter 3
  '3-1': { steps: ['🌰', '🌧️', '☀️', '🌸'], en: 'Plant the seed, bring rain, then bring the sun. Watch the flower grow!', pl: 'Posadź nasionko, przynieś deszcz, potem słońce. Zobacz, jak rośnie kwiatek!' },
  '3-2': { steps: ['🐝', '🧚', '🍯'], en: 'Touch the lost bees so they follow you. Take all 6 home to the hive.', pl: 'Dotknij zagubione pszczoły, żeby leciały za tobą. Zaprowadź wszystkie 6 do ula.' },
  '3-3': { steps: ['🔴', '➕', '🟡', '=', '🟠', '🦋'], en: 'Touch two paints to mix a new colour. Give each butterfly the colour it wants.', pl: 'Dotknij dwie farby, żeby zrobić nowy kolor. Daj każdemu motylowi kolor, który chce.' },
  '3-4': { steps: ['🥕', '➡️', '🟫', '🐰'], en: 'Put each vegetable in the bed that shows its picture.', pl: 'Włóż każde warzywo do grządki z jego obrazkiem.' },
  '3-5': { steps: ['🟤', '🪱', '🌼'], en: 'Break the hard dry soil so Worm can reach the thirsty flower.', pl: 'Rozbij twardą, suchą ziemię, żeby dżdżownica dotarła do spragnionego kwiatka.' },
  '3-6': { steps: ['🌸', '☀️', '🍂', '❄️'], en: 'Touch the seasons in order: spring, summer, autumn, winter.', pl: 'Dotknij pory roku po kolei: wiosna, lato, jesień, zima.' },
  '3-7': { steps: ['☁️', '🧚', '🌱', '⏳'], en: 'Carry a rain cloud over each dry patch before the time runs out.', pl: 'Zanieś deszczową chmurkę nad każdą suchą grządkę, zanim skończy się czas.' },
  '3-8': { steps: ['🍎', '🧺', '🍏', '🧺'], en: 'Sort the apples: big and small, then red and green. Look at the picture on each basket.', pl: 'Posortuj jabłka: duże i małe, potem czerwone i zielone. Patrz na obrazek na koszyku.' },
  '3-9': { steps: ['🌾', '🐦', '⚪', '⛄'], en: 'Fill the 3 bird feeders. Then build a snowman: big ball, middle ball, small ball.', pl: 'Napełnij 3 karmniki. Potem ulep bałwana: duża kula, średnia kula, mała kula.' },
  '3-10': { steps: ['🌸', '🧚', '🌳'], en: 'Bring 5 blossoms to the big tree for the spring party.', pl: 'Przynieś 5 kwiatków do wielkiego drzewa na wiosenne święto.' },
  // ---------------------------------------------------------- chapter 4
  '4-1': { steps: ['🐥', '🐥', '🧚', '🦆'], en: 'Touch the ducklings so they follow you. Take all 4 to Mama Duck.', pl: 'Dotknij kaczuszki, żeby szły za tobą. Zaprowadź wszystkie 4 do mamy kaczki.' },
  '4-2': { steps: ['📄', '🔵', '🧴', '🟡', '🫙', '🟢'], en: 'Pick up the rubbish. Paper goes in blue, plastic in yellow, glass in green.', pl: 'Pozbieraj śmieci. Papier do niebieskiego, plastik do żółtego, szkło do zielonego.' },
  '4-3': { steps: ['🪵', '🪵', '🪵', '🦫'], en: 'Bring the logs to Beaver\'s dam: the biggest first, the smallest last.', pl: 'Zanieś kłody na tamę bobra: najpierw największą, na końcu najmniejszą.' },
  '4-4': { steps: ['🍃', '🛶', '🪨', '💧'], en: 'Put only things that float on Otter\'s raft. Things that sink go in the pond.', pl: 'Na tratwę wydry kładź tylko to, co pływa. To, co tonie, wrzuć do stawu.' },
  '4-5': { steps: ['☀️', '♨️', '☁️', '🌧️'], en: 'Touch them in order: sun, rising water, cloud, rain. Water goes round and round!', pl: 'Dotknij po kolei: słońce, parująca woda, chmura, deszcz. Woda krąży w kółko!' },
  '4-6': { steps: ['⭕', '🐟', '⭕', '⏳'], en: 'Swim through the 8 rings in order before the time runs out. The fish follow you.', pl: 'Przepłyń przez 8 obręczy po kolei, zanim skończy się czas. Rybki płyną za tobą.' },
  '4-7': { steps: ['🕖', '➡️', '🕘¾', '💡'], en: 'Set the lighthouse clock to quarter to 9 so the lamp shines for the boats.', pl: 'Ustaw zegar latarni na za kwadrans dziewiąta, żeby lampa świeciła dla łódek.' },
  '4-8': { steps: ['🐚', '➡️', '🦀'], en: 'Give each crab a shell that fits: small, middle and big.', pl: 'Daj każdemu krabowi pasującą muszlę: małą, średnią i dużą.' },
  '4-9': { steps: ['🪣', '🏰', '🐢', '🌊', '⏳'], en: 'Clear the beach so the baby turtles reach the sea before the time runs out.', pl: 'Posprzątaj plażę, żeby małe żółwie doszły do morza, zanim skończy się czas.' },
  '4-10': { steps: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'], en: 'Light the coral in rainbow order: red, orange, yellow, green, blue, purple.', pl: 'Zapal koralowce w kolejności tęczy: czerwony, pomarańczowy, żółty, zielony, niebieski, fioletowy.' },
  // ---------------------------------------------------------- chapter 5
  '5-1': { steps: ['🪧', '⬅️', '⬆️', '➡️', '🐐'], en: 'Touch each sign to turn its arrow. Make it point where Goat wants to go.', pl: 'Dotykaj znaki, żeby obrócić strzałkę. Niech pokazuje tam, gdzie chce iść koza.' },
  '5-2': { steps: ['🪵', '🔥', '3+2', '🦊'], en: 'Bring 5 logs to Fox\'s fire. Then count them: 3 + 2 = ?', pl: 'Przynieś 5 kłód do ogniska lisa. Potem policz: 3 + 2 = ?' },
  '5-3': { steps: ['🪨', '⚖️', '🪨'], en: 'Put stones on the right side until both sides weigh the same.', pl: 'Kładź kamienie po prawej stronie, aż obie strony będą tak samo ciężkie.' },
  '5-4': { steps: ['🦅', '❤️', '☁️'], en: 'Eagle shows a shape. Fly to the cloud with the same shape.', pl: 'Orzeł pokazuje kształt. Leć do chmurki z takim samym kształtem.' },
  '5-5': { steps: ['❄️', '🔟', '⏳'], en: 'Catch 10 snowflakes before the time runs out.', pl: 'Złap 10 śnieżynek, zanim skończy się czas.' },
  '5-6': { steps: ['🌑', '🌒', '🌓', '🌔', '🌕'], en: 'Touch the moons in order: from the dark new moon to the full moon.', pl: 'Dotknij księżyce po kolei: od ciemnego nowiu do pełni.' },
  '5-7': { steps: ['💰', '4+3', '🎈'], en: 'Count the sand bags: 4 + 3 = ? Then the balloon flies up.', pl: 'Policz worki z piaskiem: 4 + 3 = ? Wtedy balon poleci.' },
  '5-8': { steps: ['🕒', '🕡', '🕤'], en: 'Set three clocks: 3 o\'clock, half past 6 and quarter to 10.', pl: 'Ustaw trzy zegary: trzecia, wpół do siódmej i za kwadrans dziesiąta.' },
  '5-9': { steps: ['✨', '🔢'], en: 'Count the stars in each picture and touch the right number.', pl: 'Policz gwiazdki na każdym obrazku i dotknij dobrą liczbę.' },
  '5-10': { steps: ['🦉', '🦊', '🐰', '🌈', '🏰'], en: 'Say hello to all your friends. Then ride the rainbow to the Sky Castle!', pl: 'Przywitaj się ze wszystkimi przyjaciółmi. Potem pojedź tęczą do Podniebnego Zamku!' },
};

export function goalFor(key: string): { steps: string[]; text: string } | null {
  const g = G[key];
  return g ? { steps: g.steps, text: getLang() === 'pl' ? g.pl : g.en } : null;
}

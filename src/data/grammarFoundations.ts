import writingEn from "../content/grammar/foundations/reading-writing-systems.en.md?raw";
import writingEs from "../content/grammar/foundations/reading-writing-systems.es.md?raw";
import hiraganaEn from "../content/grammar/foundations/reading-hiragana.en.md?raw";
import hiraganaEs from "../content/grammar/foundations/reading-hiragana.es.md?raw";
import soundsEn from "../content/grammar/foundations/sound-rhythm.en.md?raw";
import soundsEs from "../content/grammar/foundations/sound-rhythm.es.md?raw";
import katakanaEn from "../content/grammar/foundations/reading-katakana.en.md?raw";
import katakanaEs from "../content/grammar/foundations/reading-katakana.es.md?raw";
import kanjiEn from "../content/grammar/foundations/reading-kanji.en.md?raw";
import kanjiEs from "../content/grammar/foundations/reading-kanji.es.md?raw";
import greetingsEn from "../content/grammar/foundations/everyday-greetings.en.md?raw";
import greetingsEs from "../content/grammar/foundations/everyday-greetings.es.md?raw";
import numbersEn from "../content/grammar/foundations/everyday-numbers.en.md?raw";
import numbersEs from "../content/grammar/foundations/everyday-numbers.es.md?raw";
import type { GrammarExercise, GrammarExerciseSet, GrammarExerciseSetId, GrammarLesson, LocalizedText } from "./grammar";

type Row = [question: string, options: string[], answer: string, supportEn: string, supportEs: string];
const text = (en: string, es: string): LocalizedText => ({ en, es });

const sets = (...items: Array<[GrammarExerciseSetId, string, string, string, string]>): GrammarExerciseSet[] =>
  items.map(([id, en, es, descriptionEn, descriptionEs]) => ({ id, label: text(en, es), description: text(descriptionEn, descriptionEs) }));

const makeExercises = (partId: string, setIds: GrammarExerciseSetId[], rows: Row[]): GrammarExercise[] => {
  if (rows.length !== 12) throw new Error(`Foundations part ${partId} must contain exactly 12 exercises.`);
  return rows.map(([sentence, options, answer, supportEn, supportEs], index) => {
    if (!options.includes(answer) || new Set(options).size !== options.length) throw new Error(`Invalid options in ${partId} exercise ${index + 1}.`);
    return {
      id: `genki:introduction:${partId}:exercise-${String(index + 1).padStart(2, "0")}`,
      setId: setIds[index % setIds.length],
      difficulty: index < 4 ? "introductory" : index < 8 ? "intermediate" : "challenge",
      promptKind: "choice",
      instruction: text("Choose the best answer", "Elige la mejor respuesta"),
      sentence,
      options,
      answer,
      translation: text(supportEn, supportEs),
      explanation: text(`The answer is ${answer}. ${supportEn}`, `La respuesta es ${answer}. ${supportEs}`),
    };
  });
};

const writingSets = sets([
  "intro-scripts", "Scripts in context", "Escrituras en contexto", "Recognize what each writing system does.", "Reconoce la función de cada sistema de escritura.",
]);
const writingExercises = makeExercises("writing-systems", writingSets.map(({ id }) => id), [
  ["Which script is normally learned first for native Japanese words?", ["Hiragana", "Katakana", "Rōmaji"], "Hiragana", "Hiragana is the foundation for native words and endings.", "El hiragana es la base para palabras nativas y terminaciones."],
  ["Which script is most likely in the loanword コーヒー?", ["Katakana", "Kanji", "Hiragana"], "Katakana", "Katakana commonly marks borrowed vocabulary.", "El katakana suele marcar vocabulario prestado."],
  ["Which writing uses meaning-bearing characters such as 山?", ["Kanji", "Rōmaji", "Katakana"], "Kanji", "Kanji characters carry lexical meaning and readings.", "Los kanji aportan significado léxico y lecturas."],
  ["What does rōmaji use?", ["Latin letters", "Meaning characters", "Only numbers"], "Latin letters", "Rōmaji represents Japanese with the Latin alphabet.", "El rōmaji representa el japonés con el alfabeto latino."],
  ["In 私はパンをたべます, which item is katakana?", ["パン", "私", "たべます"], "パン", "パン is a borrowed word written in katakana.", "パン es un préstamo escrito en katakana."],
  ["In 私はパンをたべます, which item is kanji?", ["私", "パン", "ます"], "私", "私 is a meaning-bearing character read here as わたし.", "私 es un carácter con significado que aquí se lee わたし."],
  ["Which script often writes grammatical endings?", ["Hiragana", "Katakana", "Rōmaji"], "Hiragana", "Inflectional endings are normally written in hiragana.", "Las terminaciones flexivas suelen escribirse en hiragana."],
  ["A shop writes セール to make an English loanword visible. Which script is it?", ["Katakana", "Kanji", "Rōmaji"], "Katakana", "Katakana visually distinguishes many foreign loanwords.", "El katakana distingue visualmente muchos préstamos extranjeros."],
  ["Why can one Japanese sentence contain several scripts?", ["Each script can serve a different role", "Writers choose randomly", "Every word needs four spellings"], "Each script can serve a different role", "Mixed script makes word roles and boundaries easier to see.", "La mezcla de escrituras ayuda a ver funciones y límites de palabras."],
  ["Which spelling is least likely in ordinary Japanese prose?", ["Writing every native word in rōmaji", "Mixing kanji and hiragana", "Using katakana for a loanword"], "Writing every native word in rōmaji", "Rōmaji is useful support but is not the usual main script.", "El rōmaji sirve de apoyo, pero no suele ser la escritura principal."],
  ["駅でメールをかきます contains 駅, メール, and かきます. What sequence is this?", ["Kanji, katakana, hiragana", "Hiragana, kanji, rōmaji", "Katakana, hiragana, kanji"], "Kanji, katakana, hiragana", "The sentence combines three scripts according to function.", "La oración combina tres escrituras según su función."],
  ["For long-term reading, what should replace dependence on rōmaji?", ["Direct recognition of kana and kanji", "More Latin spelling", "Ignoring pronunciation"], "Direct recognition of kana and kanji", "Direct recognition connects written forms to Japanese sounds and meanings.", "El reconocimiento directo conecta las formas escritas con sonidos y significados japoneses."],
]);

const hiraganaSets = sets(
  ["intro-hiragana-basic", "Basic hiragana", "Hiragana básico", "Read core symbols and irregular romanizations.", "Lee símbolos básicos y romanizaciones irregulares."],
  ["intro-hiragana-marks", "Marked and contracted", "Marcado y contraído", "Practice dakuten, handakuten, and small kana.", "Practica dakuten, handakuten y kana pequeños."],
);
const hiraganaExercises = makeExercises("hiragana", hiraganaSets.map(({ id }) => id), [
  ["Choose the reading of し.", ["shi", "si", "chi"], "shi", "Standard beginner romanization writes し as shi.", "La romanización inicial estándar escribe し como shi."],
  ["Choose the hiragana for tsu.", ["つ", "ち", "す"], "つ", "つ represents the mora tsu.", "つ representa la mora tsu."],
  ["What changes か into が?", ["Dakuten ゛", "Handakuten ゜", "Small ょ"], "Dakuten ゛", "Dakuten voices the initial consonant.", "El dakuten sonoriza la consonante inicial."],
  ["Choose the reading of ぱ.", ["pa", "ba", "ha"], "pa", "The small circle changes the h-row sound to p.", "El pequeño círculo cambia el sonido de la fila h a p."],
  ["Choose the reading of きょ.", ["kyo", "kiyo", "koyu"], "kyo", "Small ょ combines with き into one contracted sound.", "La ょ pequeña se combina con き en un sonido contraído."],
  ["Which spelling represents ryu?", ["りゅ", "るゆ", "りゆ"], "りゅ", "り plus small ゅ forms ryu.", "り más ゅ pequeña forma ryu."],
  ["Which pair differs only by dakuten?", ["さ / ざ", "は / ぱ", "き / きゃ"], "さ / ざ", "Dakuten changes s to z in this row.", "El dakuten cambia s por z en esta fila."],
  ["Choose the reading of ぢ.", ["ji", "di", "chi"], "ji", "In common modern pronunciation ぢ is usually heard as ji.", "En la pronunciación moderna común, ぢ suele oírse como ji."],
  ["Which uses a correctly small kana?", ["しゃ", "しや", "しゅや"], "しゃ", "Sha is し followed by small ゃ.", "Sha se escribe con し seguida de ゃ pequeña."],
  ["Which sequence reads byō?", ["びょう", "ひよう", "びよ"], "びょう", "びょ supplies byo and う lengthens the vowel.", "びょ aporta byo y う alarga la vocal."],
  ["Which symbol is the handakuten form of ほ?", ["ぽ", "ぼ", "ご"], "ぽ", "Handakuten changes ho to po.", "El handakuten cambia ho por po."],
  ["How many morae are in きゃく?", ["2", "3", "4"], "2", "きゃ is one mora and く is another.", "きゃ es una mora y く es otra."],
]);

const soundSets = sets(
  ["intro-double-consonants", "Double consonants", "Consonantes dobles", "Read the pause created by small っ.", "Lee la pausa creada por っ pequeña."],
  ["intro-long-vowels", "Long vowels", "Vocales largas", "Notice vowel length and spelling patterns.", "Reconoce la duración vocálica y sus patrones."],
  ["intro-pronunciation", "Pronunciation", "Pronunciación", "Practice moraic ん, devoicing, and pitch awareness.", "Practica ん moraica, ensordecimiento y altura tonal."],
);
const soundExercises = makeExercises("sound-changes", soundSets.map(({ id }) => id), [
  ["What does small っ signal in きって?", ["A consonant hold", "A long vowel", "A nasal ending"], "A consonant hold", "Small っ adds a timed pause before the next consonant.", "La っ pequeña añade una pausa medida antes de la consonante siguiente."],
  ["Which spelling represents kitte?", ["きって", "きて", "きいて"], "きって", "The doubled t is shown with small っ.", "La t doble se indica con っ pequeña."],
  ["Which word has a long vowel?", ["おばあさん", "おばさん", "おばん"], "おばあさん", "The extra あ lengthens the preceding a sound.", "La あ adicional alarga el sonido a anterior."],
  ["What is special about ん?", ["It forms its own mora", "It always starts a word", "It is silent"], "It forms its own mora", "ん receives one rhythmic beat of its own.", "ん recibe una unidad rítmica propia."],
  ["How many morae are in がっこう?", ["4", "3", "5"], "4", "が・っ・こ・う each occupies one beat.", "が・っ・こ・う ocupa una unidad cada uno."],
  ["Which spelling is usually read kō?", ["こう", "こ", "かう"], "こう", "After an o sound, う often extends that vowel.", "Después de un sonido o, う suele alargar esa vocal."],
  ["In fast speech, the final う of です may sound…", ["Very light or devoiced", "Like a strong a", "Twice as long"], "Very light or devoiced", "High vowels can become faint between voiceless sounds or at an ending.", "Las vocales altas pueden debilitarse entre sonidos sordos o al final."],
  ["Before b or p, ん may sound closest to…", ["m", "r", "y"], "m", "The nasal adapts to the place of the following consonant.", "La nasal se adapta al punto de articulación de la consonante siguiente."],
  ["Which contrast can change meaning in Japanese?", ["Short versus long vowel", "Uppercase versus lowercase", "Font family alone"], "Short versus long vowel", "Vowel duration is part of a word's sound shape.", "La duración vocálica forma parte del patrón sonoro de una palabra."],
  ["In ざっし, where is the hold?", ["Before し", "After し", "Before ざ"], "Before し", "Small っ delays the following consonant.", "La っ pequeña retrasa la consonante siguiente."],
  ["What does pitch accent mainly describe?", ["Relative high and low morae", "How loudly every word is spoken", "How kana are drawn"], "Relative high and low morae", "Japanese words have patterns of relative pitch, not English-style stress.", "Las palabras japonesas tienen patrones de altura relativa, no acento de intensidad inglés."],
  ["Which careful reading preserves every mora in しんぶん?", ["shi-n-bu-n", "shin-bun as two beats", "shi-bu"], "shi-n-bu-n", "Both instances of ん count rhythmically.", "Ambas apariciones de ん cuentan rítmicamente."],
]);

const katakanaSets = sets(
  ["intro-katakana-basic", "Basic katakana", "Katakana básico", "Read core and voiced katakana.", "Lee katakana básico y sonoro."],
  ["intro-katakana-extended", "Extended katakana", "Katakana extendido", "Read long vowels and foreign-sound combinations.", "Lee vocales largas y combinaciones para sonidos extranjeros."],
);
const katakanaExercises = makeExercises("katakana", katakanaSets.map(({ id }) => id), [
  ["Choose the reading of シ.", ["shi", "tsu", "so"], "shi", "シ represents shi.", "シ representa shi."],
  ["Choose the katakana for me.", ["メ", "ナ", "ヌ"], "メ", "メ represents me.", "メ representa me."],
  ["Which symbol reads ga?", ["ガ", "カ", "パ"], "ガ", "Dakuten changes カ into ガ.", "El dakuten cambia カ en ガ."],
  ["Which script is ケーキ written in?", ["Katakana", "Hiragana", "Kanji"], "Katakana", "Loanwords are commonly written in katakana.", "Los préstamos suelen escribirse en katakana."],
  ["What does ー do in コート?", ["Lengthens the preceding vowel", "Doubles the next consonant", "Marks a question"], "Lengthens the preceding vowel", "The long-vowel mark extends コ's o sound.", "La marca de vocal larga prolonga la o de コ."],
  ["Choose the reading of チェ.", ["che", "chie", "se"], "che", "Small エ helps represent the foreign sound che.", "La エ pequeña ayuda a representar el sonido extranjero che."],
  ["Which spelling represents fa?", ["ファ", "ハ", "フヤ"], "ファ", "フ plus small ア forms fa.", "フ más ア pequeña forma fa."],
  ["Choose the reading of ジュ.", ["ju", "jiyu", "zu"], "ju", "ジ combines with small ュ.", "ジ se combina con ュ pequeña."],
  ["Which is the usual katakana form of 'team' (chīmu)?", ["チーム", "チイム", "チム"], "チーム", "The bar marks the long ī sound.", "La raya marca el sonido ī largo."],
  ["Which combination represents ti in many modern loanwords?", ["ティ", "チ", "テイ"], "ティ", "テ plus small ィ gives a closer ti sound.", "テ más ィ pequeña produce un sonido ti más cercano."],
  ["Which pair is easy to confuse and deserves stroke-direction practice?", ["シ / ツ", "ア / モ", "カ / ロ"], "シ / ツ", "Their short strokes have different orientation and placement.", "Sus trazos cortos tienen distinta orientación y posición."],
  ["How many morae are in スーパー?", ["4", "3", "5"], "4", "ス・ー・パ・ー each occupies a beat.", "ス・ー・パ・ー ocupa una unidad cada uno."],
]);

const kanjiSets = sets(
  ["intro-kanji-readings", "Meaning and readings", "Significado y lecturas", "Connect characters with meanings and contextual readings.", "Relaciona caracteres con significados y lecturas contextuales."],
  ["intro-kanji-formation", "Character formation", "Formación de caracteres", "Notice components, compounds, and visual clues.", "Reconoce componentes, compuestos y pistas visuales."],
);
const kanjiExercises = makeExercises("kanji", kanjiSets.map(({ id }) => id), [
  ["What does a kanji usually contribute?", ["Meaning plus one or more readings", "Only punctuation", "A fixed Latin spelling"], "Meaning plus one or more readings", "Kanji links a visual form to meaning and contextual pronunciations.", "El kanji vincula una forma visual con significado y pronunciaciones contextuales."],
  ["Which character commonly represents 'mountain'?", ["山", "川", "口"], "山", "山 carries the core meaning mountain.", "山 lleva el significado básico de montaña."],
  ["What is an on reading historically associated with?", ["Chinese-derived pronunciation", "Latin spelling", "Gesture language"], "Chinese-derived pronunciation", "On readings entered Japanese through historical contact with Chinese.", "Las lecturas on llegaron al japonés por contacto histórico con el chino."],
  ["What is a kun reading generally based on?", ["A native Japanese word", "An English loanword", "A number symbol"], "A native Japanese word", "Kun readings connect kanji meanings to native vocabulary.", "Las lecturas kun conectan significados kanji con vocabulario nativo."],
  ["Why can 生 have several readings?", ["The surrounding word selects the reading", "It changes every day", "It has no sound"], "The surrounding word selects the reading", "Whole-word context determines the appropriate reading.", "El contexto de la palabra completa determina la lectura adecuada."],
  ["In 火山, why are two characters combined?", ["Their meanings build a compound", "One is decorative", "They cancel each other"], "Their meanings build a compound", "Fire plus mountain forms the concept volcano.", "Fuego más montaña forma el concepto volcán."],
  ["Which is the safest way to learn a new reading?", ["Learn it inside a real word", "Memorize one sound for every context", "Ignore its meaning"], "Learn it inside a real word", "Vocabulary gives both meaning and reading context.", "El vocabulario aporta contexto de significado y lectura."],
  ["What can a recurring component sometimes suggest?", ["Meaning family or sound clue", "Exact sentence order", "Politeness level only"], "Meaning family or sound clue", "Components can offer clues without guaranteeing an answer.", "Los componentes pueden dar pistas sin garantizar una respuesta."],
  ["休 combines a person-like component with a tree. What idea does it evoke?", ["Rest", "Rain", "Counting"], "Rest", "The visual relationship can support the meaning rest.", "La relación visual puede ayudar a recordar el significado descanso."],
  ["Why should stroke order be practiced?", ["It supports balance and recognition", "It changes the translation", "It replaces vocabulary"], "It supports balance and recognition", "Consistent movement helps characters remain legible.", "El movimiento constante ayuda a que los caracteres sean legibles."],
  ["If 日 reads differently in 日本 and 日, what should guide you?", ["The complete word", "The font color", "The writer's age"], "The complete word", "Kanji readings belong to vocabulary and context.", "Las lecturas kanji pertenecen al vocabulario y al contexto."],
  ["What is a useful first goal with kanji?", ["Recognize common characters in words", "Master every historical form", "Avoid kana"], "Recognize common characters in words", "Frequent words build practical reading ability gradually.", "Las palabras frecuentes desarrollan la lectura práctica de forma gradual."],
]);

const greetingSets = sets(
  ["intro-greetings-phrases", "Greeting recognition", "Reconocer saludos", "Match common expressions with their purpose.", "Relaciona expresiones comunes con su función."],
  ["intro-greetings-situations", "Everyday situations", "Situaciones cotidianas", "Choose a suitable expression for the moment.", "Elige una expresión adecuada para cada momento."],
);
const greetingExercises = makeExercises("greetings", greetingSets.map(({ id }) => id), [
  ["Which expression is a common morning greeting?", ["おはようございます", "こんばんは", "おやすみなさい"], "おはようございます", "It is the polite morning greeting.", "Es el saludo formal de la mañana."],
  ["Which expression means good evening?", ["こんばんは", "こんにちは", "いってきます"], "こんばんは", "Use it when greeting someone in the evening.", "Se usa al saludar por la tarde-noche."],
  ["What do you say before going to sleep?", ["おやすみなさい", "ただいま", "どういたしまして"], "おやすみなさい", "It is a polite good-night expression.", "Es una expresión formal de buenas noches."],
  ["Which expression thanks someone?", ["ありがとうございます", "すみません", "はじめまして"], "ありがとうございます", "It expresses polite gratitude.", "Expresa agradecimiento formal."],
  ["You meet a new club member for the first time. Choose an opener.", ["はじめまして", "おかえりなさい", "ごちそうさまでした"], "はじめまして", "It opens a first meeting.", "Abre un primer encuentro."],
  ["You need to get a station employee's attention politely.", ["すみません", "さようなら", "おやすみ"], "すみません", "It can mean excuse me before a request.", "Puede significar disculpe antes de una petición."],
  ["You leave home and expect to return. What do you say?", ["いってきます", "ただいま", "いただきます"], "いってきます", "The person leaving announces that they will go and return.", "Quien sale anuncia que se va y volverá."],
  ["Someone returns home and says ただいま. A natural reply is…", ["おかえりなさい", "いってらっしゃい", "はじめまして"], "おかえりなさい", "It welcomes the returning person home.", "Da la bienvenida a quien regresa a casa."],
  ["A classmate lends you an umbrella. Which response best fits?", ["ありがとうございます", "こんばんは", "いってきます"], "ありがとうございます", "Gratitude fits the helpful action.", "El agradecimiento encaja con la ayuda recibida."],
  ["You accidentally bump into someone on a train.", ["すみません", "おめでとうございます", "こんにちは"], "すみません", "The expression can serve as a brief apology.", "La expresión puede servir como disculpa breve."],
  ["Before eating a meal someone prepared, say…", ["いただきます", "ごちそうさまでした", "おかえりなさい"], "いただきます", "It is said as one begins the meal.", "Se dice al comenzar la comida."],
  ["After finishing that meal, say…", ["ごちそうさまでした", "いただきます", "いってらっしゃい"], "ごちそうさまでした", "It expresses appreciation after eating.", "Expresa agradecimiento después de comer."],
]);

const numberSets = sets(
  ["intro-numbers-reading", "Number readings", "Lecturas numéricas", "Match written numbers with Japanese readings.", "Relaciona números escritos con lecturas japonesas."],
  ["intro-numbers-value", "Numeric values", "Valores numéricos", "Build and recognize values from 0 to 100.", "Forma y reconoce valores del 0 al 100."],
);
const numberExercises = makeExercises("numbers", numberSets.map(({ id }) => id), [
  ["Choose the usual reading of 4 in a simple count.", ["よん", "よ", "しち"], "よん", "よん is a common standalone reading for four.", "よん es una lectura independiente común para cuatro."],
  ["Which number is なな?", ["7", "4", "9"], "7", "なな is a common reading of seven.", "なな es una lectura común de siete."],
  ["Choose the reading of 10.", ["じゅう", "きゅう", "ひゃく"], "じゅう", "Ten is じゅう.", "Diez es じゅう."],
  ["Which value is れい?", ["0", "6", "8"], "0", "れい is one common reading for zero.", "れい es una lectura común para cero."],
  ["Choose the reading of 24.", ["にじゅうよん", "よんじゅうに", "にじゅうしち"], "にじゅうよん", "Two tens plus four builds twenty-four.", "Dos decenas más cuatro forman veinticuatro."],
  ["Which number is さんじゅうはち?", ["38", "83", "30"], "38", "さんじゅう is thirty and はち adds eight.", "さんじゅう es treinta y はち añade ocho."],
  ["Choose the reading of 70.", ["ななじゅう", "しち", "じゅうなな"], "ななじゅう", "Seven tens form seventy.", "Siete decenas forman setenta."],
  ["Which value is きゅうじゅういち?", ["91", "19", "99"], "91", "Nine tens plus one is ninety-one.", "Nueve decenas más uno son noventa y uno."],
  ["Choose the most natural beginner reading of 47.", ["よんじゅうなな", "しじゅうしち", "ななじゅうよん"], "よんじゅうなな", "よん and なな avoid less predictable alternate readings.", "よん y なな evitan lecturas alternativas menos previsibles."],
  ["Which expression equals 65?", ["ろくじゅうご", "ごじゅうろく", "ろくじゅう"], "ろくじゅうご", "Six tens plus five is sixty-five.", "Seis decenas más cinco son sesenta y cinco."],
  ["How is 100 commonly read?", ["ひゃく", "じゅうじゅう", "いちじゅう"], "ひゃく", "One hundred has the dedicated reading ひゃく.", "Cien tiene la lectura específica ひゃく."],
  ["A locker shows はちじゅうきゅう. Which label matches?", ["89", "98", "809"], "89", "Eight tens plus nine is eighty-nine.", "Ocho decenas más nueve son ochenta y nueve."],
]);

const readingParts: GrammarLesson["parts"] = [
  { id: "writing-systems", title: text("Japanese writing systems", "Sistemas de escritura japoneses"), description: text("How hiragana, katakana, kanji, and rōmaji share the page.", "Cómo conviven hiragana, katakana, kanji y rōmaji."), content: { en: writingEn, es: writingEs }, exerciseSets: writingSets, exercises: writingExercises },
  { id: "hiragana", title: text("Hiragana", "Hiragana"), description: text("Core sounds, voiced marks, and contracted combinations.", "Sonidos básicos, marcas sonoras y combinaciones contraídas."), content: { en: hiraganaEn, es: hiraganaEs }, exerciseSets: hiraganaSets, exercises: hiraganaExercises, reference: "hiragana", relatedPractice: { to: "/practice", label: text("Open Kana practice", "Abrir práctica de kana"), description: text("Train Hiragana recognition and recall with the full catalog.", "Entrena reconocimiento y memoria de hiragana con el catálogo completo.") } },
  { id: "katakana", title: text("Katakana", "Katakana"), description: text("Core symbols, long vowels, and extended loanword sounds.", "Símbolos básicos, vocales largas y sonidos extendidos de préstamos."), content: { en: katakanaEn, es: katakanaEs }, exerciseSets: katakanaSets, exercises: katakanaExercises, reference: "katakana", relatedPractice: { to: "/practice", label: text("Open Kana practice", "Abrir práctica de kana"), description: text("Switch to Katakana and build recognition with the full catalog.", "Cambia a katakana y mejora el reconocimiento con el catálogo completo.") } },
  { id: "kanji", title: text("Kanji foundations", "Fundamentos de kanji"), description: text("Meaning, contextual readings, compounds, and components.", "Significado, lecturas contextuales, compuestos y componentes."), content: { en: kanjiEn, es: kanjiEs }, exerciseSets: kanjiSets, exercises: kanjiExercises },
];
const soundParts: GrammarLesson["parts"] = [
  { id: "sound-changes", title: text("Morae and sound movement", "Moras y movimiento del sonido"), description: text("Small っ, long vowels, ん, devoicing, and pitch awareness.", "っ pequeña, vocales largas, ん, ensordecimiento y altura tonal."), content: { en: soundsEn, es: soundsEs }, exerciseSets: soundSets, exercises: soundExercises },
];
const everydayParts: GrammarLesson["parts"] = [
  { id: "greetings", title: text("Greetings", "Saludos"), description: text("Polite expressions chosen for real everyday moments.", "Expresiones corteses elegidas para momentos cotidianos."), content: { en: greetingsEn, es: greetingsEs }, exerciseSets: greetingSets, exercises: greetingExercises },
  { id: "numbers", title: text("Numbers", "Números"), description: text("Read and build values from zero through one hundred.", "Lee y forma valores desde cero hasta cien."), content: { en: numbersEn, es: numbersEs }, exerciseSets: numberSets, exercises: numberExercises, relatedPractice: { to: "/numbers", label: text("Open Numbers practice", "Abrir práctica de números"), description: text("Continue with larger values and typed-answer modes.", "Continúa con valores mayores y modos de respuesta escrita.") } },
];

const allParts = [...readingParts, ...soundParts, ...everydayParts];
const allExercises = allParts.flatMap(({ exercises }) => exercises);
if (allExercises.length !== 84 || new Set(allExercises.map(({ id }) => id)).size !== 84) throw new Error("The Foundations lessons must contain 84 unique exercises.");
for (const part of allParts) {
  const distribution = ["introductory", "intermediate", "challenge"].map((difficulty) => part.exercises.filter((exercise) => exercise.difficulty === difficulty).length);
  if (distribution.some((count) => count !== 4)) throw new Error(`Introduction part ${part.id} needs four exercises at each difficulty.`);
}

export const foundationsReadingLesson: GrammarLesson = {
  id: "reading-japanese", track: "foundations", kind: "numbered", lessonNumber: 1,
  title: text("Reading Japanese", "Leer japonés"),
  summary: text("Learn how Japanese scripts cooperate, then build direct recognition of kana and common kanji patterns.", "Aprende cómo cooperan las escrituras japonesas y desarrolla el reconocimiento directo de kana y patrones frecuentes de kanji."),
  parts: readingParts,
};

export const foundationsSoundLesson: GrammarLesson = {
  id: "sound-and-rhythm", track: "foundations", kind: "numbered", lessonNumber: 2,
  title: text("Sound and Rhythm", "Sonido y ritmo"),
  summary: text("Hear Japanese as a sequence of morae and notice the small written cues that reshape timing.", "Escucha el japonés como una secuencia de moras y reconoce las pequeñas señales escritas que modifican el ritmo."),
  parts: soundParts,
};

export const foundationsEverydayLesson: GrammarLesson = {
  id: "everyday-essentials", track: "foundations", kind: "numbered", lessonNumber: 3,
  title: text("Everyday Essentials", "Recursos cotidianos"),
  summary: text("Choose expressions for everyday social moments and make number patterns automatic.", "Elige expresiones para momentos sociales cotidianos y automatiza los patrones numéricos."),
  parts: everydayParts,
};

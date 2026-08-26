import firstSentencesEnglish from "../content/grammar/foundations/first-sentences.en.md?raw";
import firstSentencesSpanish from "../content/grammar/foundations/first-sentences.es.md?raw";
import { foundationsEverydayLesson, foundationsReadingLesson, foundationsSoundLesson } from "./grammarFoundations";

export type GrammarTrackId = "foundations" | "connected";
export type GrammarExerciseSetId =
  | "wa" | "ka" | "no" | "ga" | "desu" | "mixed"
  | "intro-scripts"
  | "intro-hiragana-basic" | "intro-hiragana-marks"
  | "intro-double-consonants" | "intro-long-vowels" | "intro-pronunciation"
  | "intro-katakana-basic" | "intro-katakana-extended"
  | "intro-kanji-readings" | "intro-kanji-formation"
  | "intro-greetings-phrases" | "intro-greetings-situations"
  | "intro-numbers-reading" | "intro-numbers-value";
export type GrammarExerciseDifficulty = "introductory" | "intermediate" | "challenge";
export type GrammarExercisePromptKind = "fill-blank" | "choice";
export type GrammarLocale = "en" | "es";

export interface LocalizedText {
  en: string;
  es: string;
}

export interface GrammarExercise {
  id: string;
  setId: GrammarExerciseSetId;
  difficulty: GrammarExerciseDifficulty;
  promptKind?: GrammarExercisePromptKind;
  instruction?: LocalizedText;
  sentence: string;
  options: string[];
  answer: string;
  translation: LocalizedText;
  explanation: LocalizedText;
}

export interface GrammarExerciseSet {
  id: GrammarExerciseSetId;
  label: LocalizedText;
  description: LocalizedText;
}

export interface GrammarLessonPart {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  content: Record<GrammarLocale, string>;
  exerciseSets: GrammarExerciseSet[];
  exercises: GrammarExercise[];
  reference?: "hiragana" | "katakana";
  relatedPractice?: { to: string; label: LocalizedText; description: LocalizedText };
}

export interface GrammarLesson {
  id: string;
  track: GrammarTrackId;
  kind: "introduction" | "numbered";
  lessonNumber?: number;
  title: LocalizedText;
  summary: LocalizedText;
  parts: GrammarLessonPart[];
}

export interface GrammarTrack {
  id: GrammarTrackId;
  title: LocalizedText;
  description: LocalizedText;
  compatibilityNote?: LocalizedText;
  lessons: GrammarLesson[];
}

const lesson1ExerciseSets: GrammarExerciseSet[] = [
  {
    id: "wa",
    label: { en: "は · Topic", es: "は · Tema" },
    description: { en: "Set the topic and frame what follows.", es: "Marca el tema y encuadra lo que sigue." },
  },
  {
    id: "ka",
    label: { en: "か · Question", es: "か · Pregunta" },
    description: { en: "Turn a statement into a polite question.", es: "Convierte una afirmación en una pregunta formal." },
  },
  {
    id: "no",
    label: { en: "の · Relationship", es: "の · Relación" },
    description: { en: "Connect owners, categories, and related nouns.", es: "Conecta dueños, categorías y sustantivos relacionados." },
  },
  {
    id: "ga",
    label: { en: "が · Subject", es: "が · Sujeto" },
    description: { en: "Identify the subject or highlight new information.", es: "Identifica el sujeto o destaca información nueva." },
  },
  {
    id: "desu",
    label: { en: "です · Polite ending", es: "です · Terminación formal" },
    description: { en: "Close noun and description sentences politely.", es: "Cierra frases nominales y descriptivas con cortesía." },
  },
  {
    id: "mixed",
    label: { en: "Mixed review", es: "Repaso mixto" },
    description: { en: "Choose among all five patterns in context.", es: "Elige entre los cinco patrones según el contexto." },
  },
];

const difficultyFor = (number: number, setId: GrammarExerciseSetId): GrammarExerciseDifficulty => {
  const intermediateIds: Partial<Record<GrammarExerciseSetId, number[]>> = {
    wa: [5, 6, 7, 31],
    ka: [15, 16, 17, 18],
    no: [23, 24, 25, 26],
    ga: [57, 58, 59, 60],
    desu: [37, 38, 39, 40],
    mixed: [65, 66, 67, 68],
  };
  const introductoryIds: Partial<Record<GrammarExerciseSetId, number[]>> = {
    wa: [1, 2, 3, 4],
    ka: [11, 12, 13, 14],
    no: [19, 20, 21, 22],
    ga: [53, 54, 55, 56],
    desu: [8, 9, 10, 36],
    mixed: [27, 28, 29, 30],
  };
  if (introductoryIds[setId]?.includes(number)) return "introductory";
  if (intermediateIds[setId]?.includes(number)) return "intermediate";
  return "challenge";
};

const exercise = (
  number: number,
  setId: GrammarExerciseSetId,
  sentence: string,
  options: string[],
  answer: string,
  translation: LocalizedText,
  explanation: LocalizedText,
): GrammarExercise => ({
  id: `genki:lesson-1:exercise-${String(number).padStart(2, "0")}`,
  setId,
  difficulty: difficultyFor(number, setId),
  sentence,
  options: (() => {
    if (!options.includes(answer)) {
      throw new Error(`Grammar exercise ${number} is missing its correct answer in the options.`);
    }
    if (new Set(options).size !== options.length) {
      throw new Error(`Grammar exercise ${number} has duplicate answer options.`);
    }
    return options;
  })(),
  answer,
  translation,
  explanation,
});

export const firstSentenceExercises: GrammarExercise[] = [
  exercise(1, "wa", "はじめまして。わたし ___ アナです。", ["は", "が", "の"], "は", { en: "Nice to meet you. I am Ana.", es: "Encantada. Soy Ana." }, { en: "は marks わたし as the topic of the introduction.", es: "は marca わたし como el tema de la presentación." }),
  exercise(2, "wa", "たなかさん ___ せんせいです。", ["の", "は", "か"], "は", { en: "Tanaka is a teacher.", es: "Tanaka es profesor/a." }, { en: "Use は to make Tanaka the person being discussed.", es: "Usa は para convertir a Tanaka en la persona de la que se habla." }),
  exercise(3, "wa", "これ ___ ほんです。", ["か", "は", "の"], "は", { en: "This is a book.", es: "Esto es un libro." }, { en: "これ is the topic; ほんです identifies it.", es: "これ es el tema; ほんです lo identifica." }),
  exercise(4, "wa", "マリアさん ___ がくせいです。", ["は", "の", "か"], "は", { en: "Maria is a student.", es: "María es estudiante." }, { en: "A person's name can be introduced as the topic with は.", es: "El nombre de una persona puede presentarse como tema con は." }),
  exercise(5, "wa", "にほんご ___ おもしろいです。", ["の", "か", "は"], "は", { en: "As for Japanese, it is interesting.", es: "En cuanto al japonés, es interesante." }, { en: "は frames にほんご as the subject under discussion.", es: "は presenta にほんご como el asunto del que se habla." }),
  exercise(6, "wa", "あのひと ___ いしゃです。", ["か", "は", "の"], "は", { en: "That person is a doctor.", es: "Esa persona es médico/a." }, { en: "The known person is the topic, so は is natural here.", es: "La persona conocida es el tema, por eso は es natural aquí." }),
  exercise(7, "wa", "がくせい ___ たいへんです。", ["は", "か", "の"], "は", { en: "As for student life, it is demanding.", es: "En cuanto a ser estudiante, es exigente." }, { en: "A general category can be presented as the topic with は.", es: "Una categoría general puede presentarse como tema con は." }),
  exercise(8, "desu", "これは えんぴつ ___。", ["です", "か", "の"], "です", { en: "This is a pencil.", es: "Esto es un lápiz." }, { en: "です correctly completes this noun sentence.", es: "です completa correctamente esta frase nominal." }),
  exercise(9, "desu", "わたしは だいがくせい ___。", ["です", "は", "の"], "です", { en: "I am a university student.", es: "Soy estudiante universitario/a." }, { en: "です politely closes a noun sentence.", es: "です cierra formalmente una frase nominal." }),
  exercise(10, "desu", "せんせいは にほんじん ___。", ["の", "です", "か"], "です", { en: "The teacher is Japanese.", es: "El profesor o la profesora es japonés/a." }, { en: "Use です after the identity or category.", es: "Usa です después de la identidad o categoría." }),
  exercise(11, "ka", "たなかさんは せんせいです ___ 。", ["は", "の", "か"], "か", { en: "Is Tanaka a teacher?", es: "¿Tanaka es profesor/a?" }, { en: "か turns the polite statement into a question.", es: "か convierte la afirmación formal en una pregunta." }),
  exercise(12, "ka", "これは じしょです ___ 。", ["か", "の", "は"], "か", { en: "Is this a dictionary?", es: "¿Esto es un diccionario?" }, { en: "Place か at the end of the polite question.", es: "Coloca か al final de la pregunta formal." }),
  exercise(13, "ka", "マリアさんは がくせいです ___ 。", ["の", "か", "は"], "か", { en: "Is Maria a student?", es: "¿María es estudiante?" }, { en: "The question marker follows です.", es: "La partícula interrogativa va después de です." }),
  exercise(14, "ka", "にほんごは むずかしいです ___ 。", ["は", "か", "の"], "か", { en: "Is Japanese difficult?", es: "¿El japonés es difícil?" }, { en: "か can question an adjective description too.", es: "か también puede preguntar por una descripción con adjetivo." }),
  exercise(15, "ka", "あのひとは いしゃです ___ 。", ["か", "は", "の"], "か", { en: "Is that person a doctor?", es: "¿Esa persona es médico/a?" }, { en: "Keep か at the end of the complete sentence.", es: "Mantén か al final de la frase completa." }),
  exercise(16, "ka", "これは ほんです ___ 。", ["の", "か", "は"], "か", { en: "Is this a book?", es: "¿Esto es un libro?" }, { en: "The topic and noun stay in place; add か after です.", es: "El tema y el sustantivo permanecen; añade か después de です." }),
  exercise(17, "ka", "せんせいは がくせいです ___ 。", ["は", "の", "か"], "か", { en: "Is the teacher a student?", es: "¿El profesor/la profesora es estudiante?" }, { en: "This is a complete yes/no question with か.", es: "Es una pregunta completa de sí/no con か." }),
  exercise(18, "ka", "アナさんは アメリカじんです ___ 。", ["か", "の", "は"], "か", { en: "Is Ana American?", es: "¿Ana es estadounidense?" }, { en: "Use か after the polite nationality statement.", es: "Usa か después de la afirmación formal de nacionalidad." }),
  exercise(19, "no", "これは わたし ___ ほんです。", ["は", "か", "の"], "の", { en: "This is my book.", es: "Este es mi libro." }, { en: "の connects the owner わたし with the owned noun ほん.", es: "の conecta al dueño わたし con el sustantivo poseído ほん." }),
  exercise(20, "no", "あれは たなかさん ___ かばんです。", ["の", "は", "か"], "の", { en: "That is Tanaka’s bag.", es: "Ese es el bolso de Tanaka." }, { en: "The owner comes before の.", es: "El dueño aparece antes de の." }),
  exercise(21, "no", "これは にほんご ___ ほんです。", ["か", "の", "は"], "の", { en: "This is a Japanese-language book.", es: "Este es un libro de japonés." }, { en: "の can connect a category or subject to a noun.", es: "の puede conectar una categoría o materia con un sustantivo." }),
  exercise(22, "no", "マリアさんは がくせい ___ ともだちです。", ["は", "の", "か"], "の", { en: "Maria is a student’s friend.", es: "María es amiga de un estudiante." }, { en: "The first noun describes the relationship to ともだち.", es: "El primer sustantivo describe la relación con ともだち." }),
  exercise(23, "no", "これは せんせい ___ つくえです。", ["の", "か", "は"], "の", { en: "This is the teacher’s desk.", es: "Este es el escritorio del profesor." }, { en: "Use の for possession between two nouns.", es: "Usa の para expresar posesión entre dos sustantivos." }),
  exercise(24, "no", "あれは にほん ___ くるまです。", ["は", "の", "か"], "の", { en: "That is a Japanese car.", es: "Ese es un coche japonés." }, { en: "にほんの modifies くるま.", es: "にほんの modifica a くるま." }),
  exercise(25, "no", "わたしは だいがく ___ がくせいです。", ["か", "は", "の"], "の", { en: "I am a university student.", es: "Soy estudiante universitario/a." }, { en: "だいがくの describes the kind of student.", es: "だいがくの describe el tipo de estudiante." }),
  exercise(26, "no", "これは アナさん ___ じしょです。", ["の", "は", "か"], "の", { en: "This is Ana’s dictionary.", es: "Este es el diccionario de Ana." }, { en: "Put の between the owner and the owned item.", es: "Pon の entre el dueño y el objeto poseído." }),
  exercise(27, "mixed", "わたし ___ ともだちは たなかさんです。", ["の", "は", "か"], "の", { en: "My friend is Tanaka.", es: "Mi amigo/a es Tanaka." }, { en: "わたしの means “my”; the full topic is わたしのともだち.", es: "わたしの significa «mi»; el tema completo es わたしのともだち." }),
  exercise(28, "mixed", "これは わたしの ほんです ___ 。", ["の", "か", "は"], "か", { en: "Is this my book?", es: "¿Este es mi libro?" }, { en: "The possession phrase comes before です, and か closes the question.", es: "La frase posesiva va antes de です y か cierra la pregunta." }),
  exercise(29, "mixed", "たなかさん ___ がくせいです。", ["か", "の", "は"], "は", { en: "Tanaka is a student.", es: "Tanaka es estudiante." }, { en: "Use は to mark the named person as the topic.", es: "Usa は para marcar a la persona nombrada como tema." }),
  exercise(30, "mixed", "これは にほんごの ほんです ___ 。", ["は", "の", "か"], "か", { en: "Is this a Japanese-language book?", es: "¿Este es un libro de japonés?" }, { en: "の links にほんご to ほん, and か makes the whole sentence a question.", es: "の conecta にほんご con ほん y か convierte toda la frase en pregunta." }),
  exercise(31, "wa", "きょう ___ げつようびです。", ["が", "は", "の"], "は", { en: "As for today, it is Monday.", es: "Hoy es lunes." }, { en: "A time expression can be framed as the topic with は.", es: "Una expresión temporal puede presentarse como tema con は." }),
  exercise(32, "wa", "わたしは がくせいです。あね ___ せんせいです。", ["は", "か", "の"], "は", { en: "I am a student. As for my older sister, she is a teacher.", es: "Soy estudiante. Mi hermana mayor es profesora." }, { en: "は shifts the conversation from one established topic to another.", es: "は cambia la conversación de un tema establecido a otro." }),
  exercise(33, "wa", "わたし ___ コーヒーを のみます。", ["の", "は", "か"], "は", { en: "As for me, I drink coffee.", es: "Yo bebo café." }, { en: "は can mark the topic even when the predicate is a normal verb.", es: "は también puede marcar el tema cuando el predicado es un verbo normal." }),
  exercise(34, "wa", "このまちは しずかです。とうきょう ___ にぎやかです。", ["が", "は", "の"], "は", { en: "This town is quiet. Tokyo, by contrast, is lively.", es: "Esta ciudad es tranquila. Tokio, en cambio, es animado." }, { en: "は makes a clear contrast between the two places.", es: "は crea un contraste claro entre los dos lugares." }),
  exercise(35, "wa", "にほんご ___ むずかしいですが、おもしろいです。", ["は", "の", "か"], "は", { en: "Japanese is difficult, but it is interesting.", es: "El japonés es difícil, pero interesante." }, { en: "One topic marked by は can carry across two linked descriptions.", es: "Un tema marcado por は puede mantenerse en dos descripciones enlazadas." }),
  exercise(36, "desu", "これは かさ ___。", ["です", "が", "の"], "です", { en: "This is an umbrella.", es: "Esto es un paraguas." }, { en: "A noun identifying the topic is politely followed by です.", es: "El sustantivo que identifica el tema va seguido cortésmente de です." }),
  exercise(37, "desu", "これは なん ___ か。", ["です", "の", "は"], "です", { en: "What is this?", es: "¿Qué es esto?" }, { en: "です comes before the question marker か.", es: "です aparece antes de la partícula interrogativa か." }),
  exercise(38, "desu", "きょうは げつようび ___。", ["か", "です", "の"], "です", { en: "Today is Monday.", es: "Hoy es lunes." }, { en: "です politely identifies today's day.", es: "です identifica formalmente el día de hoy." }),
  exercise(39, "desu", "たなかさんは げんき ___。", ["です", "は", "が"], "です", { en: "Tanaka is well.", es: "Tanaka está bien." }, { en: "The na-adjective げんき uses です in this polite sentence.", es: "El adjetivo な げんき usa です en esta frase formal." }),
  exercise(40, "desu", "このほんは おもしろい ___。", ["の", "です", "は"], "です", { en: "This book is interesting.", es: "Este libro es interesante." }, { en: "After an i-adjective, です adds politeness rather than meaning 'is' by itself.", es: "Después de un adjetivo い, です añade cortesía y no significa «ser» por sí solo." }),
  exercise(41, "desu", "わたしの せんこうは れきし ___。", ["です", "か", "が"], "です", { en: "My major is history.", es: "Mi especialidad es historia." }, { en: "です closes the longer noun predicate れきし politely.", es: "です cierra cortésmente el predicado nominal れきし." }),
  exercise(42, "desu", "あのかたは どなた ___ か。", ["の", "です", "は"], "です", { en: "Who is that person?", es: "¿Quién es esa persona?" }, { en: "The polite question pattern is どなたですか.", es: "El patrón formal de pregunta es どなたですか." }),
  exercise(43, "desu", "このへやは しずか ___ が、ちいさいです。", ["です", "の", "か"], "です", { en: "This room is quiet, but small.", es: "Esta habitación es tranquila, pero pequeña." }, { en: "しずか is a na-adjective; です completes its polite form before the connector が.", es: "しずか es un adjetivo な; です completa su forma cortés antes del conector が." }),
  exercise(44, "desu", "わたしは がくせいです。あにも がくせい ___。", ["です", "の", "は"], "です", { en: "I am a student. My older brother is also a student.", es: "Soy estudiante. Mi hermano mayor también es estudiante." }, { en: "です closes the second noun sentence; the topic is already understood.", es: "です cierra la segunda frase nominal; el tema ya se entiende." }),
  exercise(45, "ka", "どなたが やまださんです ___。", ["か", "の", "が"], "か", { en: "Which person is Yamada?", es: "¿Qué persona es Yamada?" }, { en: "Even with a question word, formal style closes the question with か.", es: "Incluso con una palabra interrogativa, el estilo formal cierra la pregunta con か." }),
  exercise(46, "ka", "このかさは だれのです ___。", ["は", "か", "の"], "か", { en: "Whose umbrella is this?", es: "¿De quién es este paraguas?" }, { en: "だれの asks whose, and final か marks the full polite question.", es: "だれの pregunta de quién y el か final marca toda la pregunta formal." }),
  exercise(47, "ka", "でんしゃは なんじです ___。", ["の", "が", "か"], "か", { en: "What time is the train?", es: "¿A qué hora es el tren?" }, { en: "か closes this information question after です.", es: "か cierra esta pregunta informativa después de です." }),
  exercise(48, "ka", "アナさんは きょう きます ___。", ["か", "です", "の"], "か", { en: "Will Ana come today?", es: "¿Vendrá Ana hoy?" }, { en: "A polite verb already ends in ます, so add か directly; do not add です.", es: "Un verbo formal ya termina en ます, así que añade か directamente; no añadas です." }),
  exercise(49, "no", "これは ちち ___ かいしゃの しゃしんです。", ["は", "が", "の"], "の", { en: "This is a photograph of my father's company.", es: "Esta es una foto de la empresa de mi padre." }, { en: "The first の links ちち to かいしゃ inside a longer noun chain.", es: "El primer の conecta ちち con かいしゃ dentro de una cadena nominal más larga." }),
  exercise(50, "no", "さとうさんは だいがく ___ にほんごの せんせいです。", ["か", "の", "は"], "の", { en: "Sato is a university Japanese teacher.", es: "Sato es profesor o profesora de japonés en una universidad." }, { en: "だいがくの identifies the institution related to the teacher.", es: "だいがくの identifica la institución relacionada con el profesor o profesora." }),
  exercise(51, "no", "ともだち ___ おかあさんは いしゃです。", ["の", "が", "か"], "の", { en: "My friend's mother is a doctor.", es: "La madre de mi amigo o amiga es médica." }, { en: "の links ともだち to おかあさん; the whole phrase becomes the topic.", es: "の conecta ともだち con おかあさん; toda la expresión se convierte en tema." }),
  exercise(52, "no", "これは だれ ___ かさですか。", ["は", "の", "が"], "の", { en: "Whose umbrella is this?", es: "¿De quién es este paraguas?" }, { en: "だれの means 'whose' before the noun being identified.", es: "だれの significa «de quién» antes del sustantivo que se identifica." }),
  exercise(53, "ga", "だれ ___ せんせいですか。", ["は", "が", "の"], "が", { en: "Who is the teacher?", es: "¿Quién es el profesor o la profesora?" }, { en: "A question word used as the subject is marked by が.", es: "Una palabra interrogativa usada como sujeto se marca con が." }),
  exercise(54, "ga", "ねこ ___ います。", ["の", "が", "は"], "が", { en: "There is a cat.", es: "Hay un gato." }, { en: "が introduces the thing whose existence is being reported.", es: "が introduce la cosa cuya existencia se comunica." }),
  exercise(55, "ga", "あめ ___ ふっています。", ["が", "は", "か"], "が", { en: "It is raining.", es: "Está lloviendo." }, { en: "が marks あめ as the subject of the event.", es: "が marca あめ como sujeto del evento." }),
  exercise(56, "ga", "どのひと ___ アナさんですか。", ["の", "が", "は"], "が", { en: "Which person is Ana?", es: "¿Qué persona es Ana?" }, { en: "The unknown subject selected by どのひと takes が.", es: "El sujeto desconocido indicado por どのひと lleva が." }),
  exercise(57, "ga", "たなかさん ___ きました。", ["は", "の", "が"], "が", { en: "Tanaka has arrived.", es: "Ha llegado Tanaka." }, { en: "が presents Tanaka as new information in the event.", es: "が presenta a Tanaka como información nueva en el evento." }),
  exercise(58, "ga", "このりょうり ___ おいしいです。", ["が", "の", "か"], "が", { en: "This dish is the one that tastes good.", es: "Este plato es el que está rico." }, { en: "が focuses the subject that has the described quality.", es: "が enfoca el sujeto que posee la cualidad descrita." }),
  exercise(59, "ga", "なに ___ ありますか。", ["は", "が", "の"], "が", { en: "What is there?", es: "¿Qué hay?" }, { en: "The unknown thing that exists is marked with が.", es: "La cosa desconocida que existe se marca con が." }),
  exercise(60, "ga", "へやに つくえ ___ あります。", ["の", "は", "が"], "が", { en: "There is a desk in the room.", es: "Hay un escritorio en la habitación." }, { en: "が marks the new item whose existence is stated.", es: "が marca el objeto nuevo cuya existencia se afirma." }),
  exercise(61, "ga", "だれが がくせいですか。マリアさん ___ がくせいです。", ["は", "が", "の"], "が", { en: "Who is the student? Maria is the student.", es: "¿Quién es estudiante? María es la estudiante." }, { en: "The answer keeps が because Maria supplies the specifically requested subject.", es: "La respuesta mantiene が porque María aporta el sujeto específico solicitado." }),
  exercise(62, "ga", "このクラスでは だれ ___ にほんごが じょうずですか。", ["が", "は", "の"], "が", { en: "Who in this class is good at Japanese?", es: "¿Quién de esta clase es bueno con el japonés?" }, { en: "だれ is the unknown subject and therefore takes が.", es: "だれ es el sujeto desconocido y por eso lleva が." }),
  exercise(63, "ga", "バスと でんしゃと、どちら ___ はやいですか。", ["は", "の", "が"], "が", { en: "Which is faster, the bus or the train?", es: "¿Qué es más rápido, el autobús o el tren?" }, { en: "In this comparison, どちら is the subject being selected and takes が.", es: "En esta comparación, どちら es el sujeto que se elige y lleva が." }),
  exercise(64, "ga", "ドア ___ あいています。", ["の", "が", "か"], "が", { en: "The door is open.", es: "La puerta está abierta." }, { en: "が marks the subject whose current state is being reported.", es: "が marca el sujeto cuyo estado actual se comunica." }),
  exercise(65, "mixed", "これは せんせい ___ ほんですか。", ["が", "の", "は"], "の", { en: "Is this the teacher's book?", es: "¿Este es el libro del profesor o la profesora?" }, { en: "の links the owner to the book; か is already present at the end.", es: "の conecta al dueño con el libro; か ya aparece al final." }),
  exercise(66, "mixed", "あのひと ___ だれですか。", ["は", "の", "が"], "は", { en: "Who is that person?", es: "¿Quién es esa persona?" }, { en: "The visible, known person is the topic, so は introduces the question about them.", es: "La persona visible y conocida es el tema, así que は introduce la pregunta sobre ella." }),
  exercise(67, "mixed", "どのかばん ___ マリアさんのですか。", ["の", "は", "が"], "が", { en: "Which bag is Maria's?", es: "¿Qué bolso es de María?" }, { en: "どのかばん asks which item is the subject, so it takes が.", es: "どのかばん pregunta qué objeto es el sujeto, por eso lleva が." }),
  exercise(68, "mixed", "わたしの ちちは いしゃ ___。", ["です", "か", "の"], "です", { en: "My father is a doctor.", es: "Mi padre es médico." }, { en: "The possession phrase forms the topic, and です closes its noun predicate.", es: "La expresión posesiva forma el tema y です cierra su predicado nominal." }),
  exercise(69, "mixed", "だれ ___ にほんごの せんせいですか。", ["は", "が", "の"], "が", { en: "Who is the Japanese teacher?", es: "¿Quién es el profesor o la profesora de japonés?" }, { en: "The requested identity is new information, so the question word takes が.", es: "La identidad solicitada es información nueva, por eso la palabra interrogativa lleva が." }),
  exercise(70, "mixed", "あの あおい かさは たなかさん ___ ですか。", ["の", "が", "は"], "の", { en: "Is that blue umbrella Tanaka's?", es: "¿Ese paraguas azul es de Tanaka?" }, { en: "の can stand for an understood noun: たなかさんの means 'Tanaka's one'.", es: "の puede sustituir un sustantivo entendido: たなかさんの significa «el de Tanaka»." }),
  exercise(71, "mixed", "せんせいは きょう きます ___。", ["です", "か", "の"], "か", { en: "Will the teacher come today?", es: "¿Vendrá hoy el profesor o la profesora?" }, { en: "The polite verb きます takes final か directly, without です.", es: "El verbo formal きます lleva か directamente al final, sin です." }),
  exercise(72, "mixed", "だれが アナさんですか。— このひと ___ アナさんです。", ["は", "の", "が"], "が", { en: "Who is Ana? This person is Ana.", es: "¿Quién es Ana? Esta persona es Ana." }, { en: "The answer identifies the specifically requested subject, so it uses が.", es: "La respuesta identifica el sujeto solicitado específicamente, por eso usa が." }),
];

const validateExerciseBank = (exercises: GrammarExercise[]) => {
  const ids = new Set<string>();
  for (const item of exercises) {
    if (ids.has(item.id)) throw new Error(`Duplicate grammar exercise ID: ${item.id}`);
    ids.add(item.id);
  }
  for (const set of lesson1ExerciseSets) {
    const setExercises = exercises.filter((item) => item.setId === set.id);
    if (setExercises.length !== 12) throw new Error(`Grammar set ${set.id} must contain exactly 12 exercises.`);
    for (const difficulty of ["introductory", "intermediate", "challenge"] as const) {
      if (setExercises.filter((item) => item.difficulty === difficulty).length !== 4) {
        throw new Error(`Grammar set ${set.id} must contain exactly four ${difficulty} exercises.`);
      }
    }
  }
};

validateExerciseBank(firstSentenceExercises);

export const foundationsFirstSentences: GrammarLesson = {
  id: "first-sentences",
  track: "foundations",
  kind: "numbered",
  lessonNumber: 4,
  title: { en: "Building First Sentences", es: "Construir las primeras frases" },
  summary: { en: "Build accurate first sentences with は, か, の, が, and the polite ending です.", es: "Construye primeras frases precisas con は, か, の, が y la terminación formal です." },
  parts: [{
    id: "first-sentences",
    title: { en: "Information roles", es: "Funciones de la información" },
    description: { en: "Frame topics, identify subjects, connect nouns, and close polite statements.", es: "Presenta temas, identifica sujetos, conecta sustantivos y cierra afirmaciones formales." },
    content: { en: firstSentencesEnglish, es: firstSentencesSpanish },
    exerciseSets: lesson1ExerciseSets,
    exercises: firstSentenceExercises,
  }],
};

export const grammarTracks: GrammarTrack[] = [
  {
    id: "foundations",
    title: { en: "Japanese Foundations", es: "Fundamentos de japonés" },
    description: { en: "An independent route through reading, sound, everyday language, and sentence building.", es: "Una ruta independiente por la lectura, el sonido, el lenguaje cotidiano y la construcción de frases." },
    compatibilityNote: {
      en: "Independent study material designed to complement common beginner Japanese curricula, including Genki I. Not affiliated with or endorsed by any textbook author or publisher.",
      es: "Material de estudio independiente diseñado para complementar programas habituales de japonés inicial, incluido Genki I. No está afiliado ni respaldado por autores o editoriales de libros de texto.",
    },
    lessons: [foundationsReadingLesson, foundationsSoundLesson, foundationsEverydayLesson, foundationsFirstSentences],
  },
  {
    id: "connected",
    title: { en: "Connected Japanese", es: "Japonés conectado" },
    description: { en: "A future path toward connected reading, nuanced expression, and longer conversations.", es: "Una futura ruta hacia la lectura conectada, la expresión matizada y conversaciones más largas." },
    lessons: [],
  },
];

export const getGrammarTrack = (trackId: string) => grammarTracks.find((track) => track.id === trackId);

export const getGrammarLesson = (trackId: string, lessonId: string) =>
  getGrammarTrack(trackId)?.lessons.find((lesson) => lesson.id === lessonId);

const legacyIntroductionTargets: Record<string, { lessonId: string; partId: string }> = {
  "writing-systems": { lessonId: "reading-japanese", partId: "writing-systems" },
  hiragana: { lessonId: "reading-japanese", partId: "hiragana" },
  katakana: { lessonId: "reading-japanese", partId: "katakana" },
  kanji: { lessonId: "reading-japanese", partId: "kanji" },
  "sound-changes": { lessonId: "sound-and-rhythm", partId: "sound-changes" },
  greetings: { lessonId: "everyday-essentials", partId: "greetings" },
  numbers: { lessonId: "everyday-essentials", partId: "numbers" },
};

export const getLegacyGrammarRedirect = (lessonId: string, search: string, practice = false) => {
  const params = new URLSearchParams(search);
  let targetLessonId: string;
  let targetPartId: string;

  if (lessonId === "lesson-1") {
    targetLessonId = "first-sentences";
    targetPartId = "first-sentences";
  } else if (lessonId === "introduction") {
    const target = legacyIntroductionTargets[params.get("part") ?? ""] ?? legacyIntroductionTargets["writing-systems"];
    targetLessonId = target.lessonId;
    targetPartId = target.partId;
  } else {
    return undefined;
  }

  params.set("part", targetPartId);
  const suffix = practice ? "/practice" : "";
  return `/grammar/foundations/${targetLessonId}${suffix}?${params.toString()}`;
};

export const getGrammarLessonExerciseCount = (lesson: GrammarLesson) =>
  lesson.parts.reduce((total, part) => total + part.exercises.length, 0);

export const getGrammarCatalogExerciseCount = () =>
  grammarTracks.reduce((trackTotal, track) => trackTotal + track.lessons.reduce(
    (lessonTotal, lesson) => lessonTotal + getGrammarLessonExerciseCount(lesson),
    0,
  ), 0);

import type { GrammarLesson, GrammarLocale, GrammarTrackId, LocalizedText } from "./grammar";

export interface GrammarPartDescriptor { id: string; title: LocalizedText; description: LocalizedText; exerciseCount: number; }
export interface GrammarLessonDescriptor {
  id: string;
  track: GrammarTrackId;
  kind: "introduction" | "numbered";
  lessonNumber?: number;
  title: LocalizedText;
  summary: LocalizedText;
  exerciseCount: number;
  parts: GrammarPartDescriptor[];
}
export interface GrammarTrackDescriptor { id: GrammarTrackId; title: LocalizedText; description: LocalizedText; compatibilityNote?: LocalizedText; lessons: GrammarLessonDescriptor[]; }

const text = (en: string, es: string): LocalizedText => ({ en, es });
const part = (id: string, en: string, es: string, descriptionEn: string, descriptionEs: string, exerciseCount: number): GrammarPartDescriptor => ({ id, title: text(en, es), description: text(descriptionEn, descriptionEs), exerciseCount });

const foundationsLessons: GrammarLessonDescriptor[] = [
  { id: "reading-japanese", track: "foundations", kind: "numbered", lessonNumber: 1, title: text("Reading Japanese", "Leer japonés"), summary: text("Learn how Japanese scripts cooperate, then build direct recognition of kana and common kanji patterns.", "Aprende cómo cooperan las escrituras japonesas y desarrolla el reconocimiento directo de kana y patrones frecuentes de kanji."), exerciseCount: 48, parts: [
    part("writing-systems", "Japanese writing systems", "Sistemas de escritura japoneses", "How hiragana, katakana, kanji, and rōmaji share the page.", "Cómo conviven hiragana, katakana, kanji y rōmaji.", 12),
    part("hiragana", "Hiragana", "Hiragana", "Core sounds, voiced marks, and contracted combinations.", "Sonidos básicos, marcas sonoras y combinaciones contraídas.", 12),
    part("katakana", "Katakana", "Katakana", "Core symbols, long vowels, and extended loanword sounds.", "Símbolos básicos, vocales largas y sonidos extendidos de préstamos.", 12),
    part("kanji", "Kanji foundations", "Fundamentos de kanji", "Meaning, contextual readings, compounds, and components.", "Significado, lecturas contextuales, compuestos y componentes.", 12),
  ] },
  { id: "sound-and-rhythm", track: "foundations", kind: "numbered", lessonNumber: 2, title: text("Sound and Rhythm", "Sonido y ritmo"), summary: text("Hear Japanese as a sequence of morae and notice the small written cues that reshape timing.", "Escucha el japonés como una secuencia de moras y reconoce las pequeñas señales escritas que modifican el ritmo."), exerciseCount: 12, parts: [
    part("sound-changes", "Morae and sound movement", "Moras y movimiento del sonido", "Small っ, long vowels, ん, devoicing, and pitch awareness.", "っ pequeña, vocales largas, ん, ensordecimiento y altura tonal.", 12),
  ] },
  { id: "everyday-essentials", track: "foundations", kind: "numbered", lessonNumber: 3, title: text("Everyday Essentials", "Recursos cotidianos"), summary: text("Choose expressions for everyday social moments and make number patterns automatic.", "Elige expresiones para momentos sociales cotidianos y automatiza los patrones numéricos."), exerciseCount: 24, parts: [
    part("greetings", "Greetings", "Saludos", "Polite expressions chosen for real everyday moments.", "Expresiones corteses elegidas para momentos cotidianos.", 12),
    part("numbers", "Numbers", "Números", "Read and build values from zero through one hundred.", "Lee y forma valores desde cero hasta cien.", 12),
  ] },
  { id: "first-sentences", track: "foundations", kind: "numbered", lessonNumber: 4, title: text("Building First Sentences", "Construir las primeras frases"), summary: text("Build accurate first sentences with は, か, の, が, and the polite ending です.", "Construye primeras frases precisas con は, か, の, が y la terminación formal です."), exerciseCount: 72, parts: [
    part("first-sentences", "Information roles", "Funciones de la información", "Frame topics, identify subjects, connect nouns, and close polite statements.", "Presenta temas, identifica sujetos, conecta sustantivos y cierra afirmaciones formales.", 72),
  ] },
];

export const grammarTrackDescriptors: GrammarTrackDescriptor[] = [
  { id: "foundations", title: text("Japanese Foundations", "Fundamentos de japonés"), description: text("An independent route through reading, sound, everyday language, and sentence building.", "Una ruta independiente por la lectura, el sonido, el lenguaje cotidiano y la construcción de frases."), compatibilityNote: text("Independent study material designed to complement common beginner Japanese curricula, including Genki I. Not affiliated with or endorsed by any textbook author or publisher.", "Material de estudio independiente diseñado para complementar programas habituales de japonés inicial, incluido Genki I. No está afiliado ni respaldado por autores o editoriales de libros de texto."), lessons: foundationsLessons },
  { id: "connected", title: text("Connected Japanese", "Japonés conectado"), description: text("A future path toward connected reading, nuanced expression, and longer conversations.", "Una futura ruta hacia la lectura conectada, la expresión matizada y conversaciones más largas."), lessons: [] },
];

export const getGrammarTrackDescriptor = (trackId: string) => grammarTrackDescriptors.find((track) => track.id === trackId);
export const getGrammarLessonDescriptor = (trackId: string, lessonId: string) => getGrammarTrackDescriptor(trackId)?.lessons.find((lesson) => lesson.id === lessonId);
export const getGrammarCatalogExerciseCount = () => grammarTrackDescriptors.reduce((total, track) => total + track.lessons.reduce((lessonTotal, lesson) => lessonTotal + lesson.exerciseCount, 0), 0);
const lessonPromises = new Map<string, Promise<GrammarLesson | undefined>>();
export const loadGrammarLesson = (trackId: string, lessonId: string): Promise<GrammarLesson | undefined> => {
  const key = `${trackId}:${lessonId}`;
  const cached = lessonPromises.get(key);
  if (cached) return cached;
  const promise = import("./grammar").then(({ getGrammarLesson }) => getGrammarLesson(trackId, lessonId));
  lessonPromises.set(key, promise);
  return promise;
};
export const localizedDescriptor = (value: Record<GrammarLocale, string>, locale: GrammarLocale) => value[locale];

const legacyIntroductionTargets: Record<string, { lessonId: string; partId: string }> = {
  "writing-systems": { lessonId: "reading-japanese", partId: "writing-systems" }, hiragana: { lessonId: "reading-japanese", partId: "hiragana" }, katakana: { lessonId: "reading-japanese", partId: "katakana" }, kanji: { lessonId: "reading-japanese", partId: "kanji" }, "sound-changes": { lessonId: "sound-and-rhythm", partId: "sound-changes" }, greetings: { lessonId: "everyday-essentials", partId: "greetings" }, numbers: { lessonId: "everyday-essentials", partId: "numbers" },
};

export const getLegacyGrammarRedirect = (lessonId: string, search: string, practice = false) => {
  const params = new URLSearchParams(search);
  let targetLessonId: string;
  let targetPartId: string;
  if (lessonId === "lesson-1") { targetLessonId = "first-sentences"; targetPartId = "first-sentences"; }
  else if (lessonId === "introduction") { const target = legacyIntroductionTargets[params.get("part") ?? ""] ?? legacyIntroductionTargets["writing-systems"]; targetLessonId = target.lessonId; targetPartId = target.partId; }
  else return undefined;
  params.set("part", targetPartId);
  return `/grammar/foundations/${targetLessonId}${practice ? "/practice" : ""}?${params.toString()}`;
};

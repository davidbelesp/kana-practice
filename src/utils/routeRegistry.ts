export type RoutePageKey =
  | "quiz" | "stats" | "canvas" | "kanji" | "kanjiQuiz"
  | "vocabulary" | "vocabularyQuiz" | "numbers" | "grammar"
  | "grammarQuiz" | "login" | "createAccount";

export type RouteSkeletonVariant = "standard" | "library" | "lesson" | "workspace" | "dashboard" | "canvas" | "form";

export interface RouteDefinition {
  page: RoutePageKey;
  match: (pathname: string) => boolean;
  titleKey: string;
  skeleton: RouteSkeletonVariant;
  backTo?: string;
  preloadData?: () => Promise<unknown>;
}

type PageModule = Record<string, unknown>;
type ConnectionInformation = { saveData?: boolean; effectiveType?: string };
type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const rawPageLoaders: Record<RoutePageKey, () => Promise<PageModule>> = {
  quiz: () => import("../pages/Quiz"),
  stats: () => import("../pages/Stats"),
  canvas: () => import("../pages/FreeCanvas"),
  kanji: () => import("../pages/KanjiPage"),
  kanjiQuiz: () => import("../pages/KanjiQuiz"),
  vocabulary: () => import("../pages/Vocabulary"),
  vocabularyQuiz: () => import("../pages/VocabularyQuiz"),
  numbers: () => import("../pages/Numbers"),
  grammar: () => import("../pages/Grammar"),
  grammarQuiz: () => import("../pages/GrammarQuiz"),
  login: () => import("../pages/Login"),
  createAccount: () => import("../pages/CreateAccount"),
};

const pagePromises = new Map<RoutePageKey, Promise<PageModule>>();
const dataPromises = new Map<RoutePageKey, Promise<unknown>>();

export const loadRoutePage = (page: RoutePageKey) => {
  const cached = pagePromises.get(page);
  if (cached) return cached;
  const promise = rawPageLoaders[page]();
  pagePromises.set(page, promise);
  return promise;
};

const routes: RouteDefinition[] = [
  { page: "grammarQuiz", match: (path) => /^\/grammar\/[^/]+\/[^/]+\/practice\/?$/.test(path), titleKey: "grammar.title", skeleton: "workspace", backTo: "/grammar", preloadData: () => import("../data/grammar") },
  { page: "grammar", match: (path) => /^\/grammar\/[^/]+\/[^/]+\/?$/.test(path), titleKey: "grammar.title", skeleton: "lesson", preloadData: () => Promise.all([import("../data/grammar"), import("../pages/GrammarLessonRoute")]) },
  { page: "grammar", match: (path) => path === "/grammar", titleKey: "grammar.title", skeleton: "lesson" },
  { page: "vocabularyQuiz", match: (path) => path === "/vocabulary-quiz", titleKey: "vocabulary.quiz.title", skeleton: "workspace", backTo: "/vocabulary", preloadData: () => import("../services/vocabularySearchClient").then(({ prefetchVocabularySearch }) => prefetchVocabularySearch()) },
  { page: "kanjiQuiz", match: (path) => path === "/kanji-quiz", titleKey: "kanji.title", skeleton: "workspace", backTo: "/kanji", preloadData: () => Promise.all([import("../utils/kanjiQuestionGenerator"), import("../data/kanji-levels/n5")]) },
  { page: "quiz", match: (path) => path === "/quiz", titleKey: "quiz.title", skeleton: "workspace", backTo: "/practice", preloadData: () => import("../utils/questionGenerator") },
  { page: "vocabulary", match: (path) => path === "/vocabulary", titleKey: "vocabulary.title", skeleton: "library", preloadData: () => import("../services/vocabularySearchClient").then(({ prefetchVocabularySearch }) => prefetchVocabularySearch()) },
  { page: "kanji", match: (path) => path === "/kanji", titleKey: "kanji.title", skeleton: "library", preloadData: () => import("../data/kanji-levels/n5") },
  { page: "numbers", match: (path) => path === "/numbers", titleKey: "numbers.title", skeleton: "workspace" },
  { page: "stats", match: (path) => path === "/stats", titleKey: "stats.title", skeleton: "dashboard" },
  { page: "canvas", match: (path) => path === "/canvas", titleKey: "canvas.title", skeleton: "canvas" },
  { page: "login", match: (path) => path === "/login", titleKey: "auth.loginTitle", skeleton: "form" },
  { page: "createAccount", match: (path) => path === "/create-account", titleKey: "auth.createTitle", skeleton: "form" },
];

const normalizePath = (path: string) => {
  try {
    const pathname = path.startsWith("http") ? new URL(path).pathname : path.split(/[?#]/, 1)[0];
    return pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  } catch {
    return path.split(/[?#]/, 1)[0];
  }
};

export const getRouteDefinition = (path: string) => {
  const pathname = normalizePath(path);
  return routes.find((definition) => definition.match(pathname));
};

export const prefetchRoute = (path: string, includeData = true) => {
  const definition = getRouteDefinition(path);
  if (!definition) return Promise.resolve();
  const pagePromise = loadRoutePage(definition.page).catch(() => undefined);
  if (!includeData || !definition.preloadData) return pagePromise.then(() => undefined);

  let dataPromise = dataPromises.get(definition.page);
  if (!dataPromise) {
    dataPromise = definition.preloadData().catch(() => undefined);
    dataPromises.set(definition.page, dataPromise);
  }
  return Promise.all([pagePromise, dataPromise]).then(() => undefined);
};

export const clearRouteLoad = (path: string) => {
  const definition = getRouteDefinition(path);
  if (!definition) return;
  pagePromises.delete(definition.page);
  dataPromises.delete(definition.page);
};

const PRIMARY_IDLE_ROUTES = ["/vocabulary", "/kanji", "/numbers", "/grammar", "/stats", "/canvas"];

export const schedulePrimaryRoutePrefetch = () => {
  if (typeof window === "undefined") return () => undefined;
  const connection = (navigator as Navigator & { connection?: ConnectionInformation }).connection;
  if (connection?.saveData || connection?.effectiveType?.includes("2g")) return () => undefined;

  const idleWindow = window as IdleWindow;
  let cancelled = false;
  let handle = 0;
  let index = 0;
  const scheduleNext = () => {
    if (cancelled || index >= PRIMARY_IDLE_ROUTES.length) return;
    const run = () => {
      if (cancelled) return;
      const path = PRIMARY_IDLE_ROUTES[index++];
      void prefetchRoute(path, false).finally(scheduleNext);
    };
    handle = idleWindow.requestIdleCallback
      ? idleWindow.requestIdleCallback(run, { timeout: 1800 })
      : window.setTimeout(run, 350);
  };

  scheduleNext();
  return () => {
    cancelled = true;
    if (idleWindow.cancelIdleCallback) idleWindow.cancelIdleCallback(handle);
    else window.clearTimeout(handle);
  };
};

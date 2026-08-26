const prefetchedRoutes = new Map<string, Promise<unknown>>();

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
};

const scheduleIdle = (callback: () => void) => {
  const idleWindow = window as IdleWindow;
  if (idleWindow.requestIdleCallback) {
    idleWindow.requestIdleCallback(callback, { timeout: 1200 });
  } else {
    window.setTimeout(callback, 120);
  }
};

const routeLoaders: Record<string, () => Promise<unknown>> = {
  "/vocabulary": () => Promise.all([
    import("../pages/Vocabulary"),
    import("../services/vocabularySearchClient").then(({ prefetchVocabularySearch }) => prefetchVocabularySearch()),
  ]),
  "/kanji": () => Promise.all([
    import("../pages/KanjiPage"),
    import("../data/kanji-levels/n5"),
  ]),
  "/quiz": () => Promise.all([
    import("../pages/Quiz"),
    import("../utils/questionGenerator"),
  ]),
  "/kanji-quiz": () => Promise.all([
    import("../pages/KanjiQuiz"),
    import("../utils/kanjiQuestionGenerator"),
  ]),
  "/vocabulary-quiz": () => Promise.all([
    import("../pages/VocabularyQuiz"),
    import("../services/vocabularySearchClient").then(({ prefetchVocabularySearch }) => prefetchVocabularySearch()),
  ]),
  "/grammar": () => Promise.all([
    import("../pages/Grammar"),
    import("../data/grammar"),
  ]),
  "/login": () => import("../pages/Login"),
  "/create-account": () => import("../pages/CreateAccount"),
};

export const prefetchRoute = (path: string) => {
  if (prefetchedRoutes.has(path) || !routeLoaders[path]) return;
  const promise = new Promise<unknown>((resolve) => {
    scheduleIdle(() => {
      routeLoaders[path]().catch(() => undefined).then(resolve);
    });
  });
  prefetchedRoutes.set(path, promise);
};

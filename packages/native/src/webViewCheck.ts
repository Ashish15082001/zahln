/**
 * The oldest Chrome the apps' CSS works in. Tailwind v4 draws every colour
 * with oklch() and mixes them with color-mix(), both new in Chrome 111. An
 * older Android System WebView drops those rules, so text and backgrounds
 * come out wrong or invisible.
 */
export const MIN_CHROME_VERSION = 111;

/** Set on <html> by the check, for main.tsx to read. */
export const TOO_OLD_ATTRIBUTE = "data-webview-too-old";

// The parts of a page the check reads and writes. A real page has them all,
// and so do the tests' fakes.
interface CheckedElement {
  lang: string;
  style: { cssText: string };
  textContent: string | null;
  // A method, as in the DOM's own types, so an element of any kind can be a
  // child, the tests' fakes too.
  appendChild(child: CheckedElement): unknown;
  setAttribute: (name: string, value: string) => void;
}

interface CheckedDocument {
  body: CheckedElement;
  documentElement: CheckedElement;
  createElement: (tagName: string) => CheckedElement;
  getElementById: (id: string) => CheckedElement | null;
}

interface CheckedNavigator {
  language?: string;
  languages?: readonly string[];
  userAgent?: string;
}

interface CheckedCss {
  supports?: (property: string, value: string) => boolean;
}

/** What checkWebView is given: the page, and what it checks for. */
export interface WebViewCheckInput {
  browser: CheckedNavigator;
  css: CheckedCss | undefined;
  minChromeVersion: number;
  page: CheckedDocument;
  tooOldAttribute: string;
}

/** One line of the update page: its tag, its words and its plain style. */
interface PageLine {
  style: string;
  tagName: string;
  text: string;
}

/**
 * Checks the WebView before the app starts. On one without what Tailwind v4
 * needs, it marks <html>, so the app doesn't start, and shows in #root which
 * version it found and what to update, in German or English after the
 * phone's language. Its words are set as text, never as HTML.
 *
 * It runs as a plain script in index.html (webViewCheckPlugin below), from
 * this function's own source, so it must stand alone: no imports, no names
 * from around it, and nothing newer than Chrome 51, Android 7's first
 * WebView, the oldest the apps install on. One input object, not five
 * parameters, so its source has no comma after a last parameter, which
 * Chrome reads only from version 58. Its plain styles don't need the app's
 * CSS, which is what doesn't work there.
 */
export const checkWebView = (input: WebViewCheckInput): void => {
  const { browser, css, minChromeVersion, page, tooOldAttribute } = input;
  const isSupported =
    css !== undefined &&
    typeof css.supports === "function" &&
    css.supports("color", "oklch(50% 0.1 120)") &&
    css.supports("color", "color-mix(in srgb, red, blue)");
  if (isSupported) return;
  page.documentElement.setAttribute(tooOldAttribute, "");

  const language = (
    (browser.languages && browser.languages[0]) ||
    browser.language ||
    ""
  ).toLowerCase();
  const isGerman = language.indexOf("de") === 0;
  const chromeVersion = /Chrome\/(\d+)/.exec(browser.userAgent || "");
  const found = chromeVersion ? chromeVersion[1] : "?";
  const words = isGerman
    ? {
        title: "Update nötig",
        body: "Diese App braucht eine neuere Android System WebView. Aktualisieren Sie im Play Store „Android System WebView“ und „Google Chrome“ und öffnen Sie die App dann erneut.",
        version: `Gefunden: Chrome ${found}. Nötig: Chrome ${minChromeVersion} oder neuer.`,
      }
    : {
        title: "Update needed",
        body: "This app needs a newer Android System WebView. Update “Android System WebView” and “Google Chrome” in the Play Store, then open the app again.",
        version: `Found: Chrome ${found}. Needed: Chrome ${minChromeVersion} or later.`,
      };
  page.documentElement.lang = isGerman ? "de" : "en";

  const addLine = (parent: CheckedElement, line: PageLine): void => {
    const element = page.createElement(line.tagName);
    element.textContent = line.text;
    element.style.cssText = line.style;
    parent.appendChild(element);
  };
  page.body.style.cssText = "margin:0;background:#fff;color:#111;";
  const updatePage = page.createElement("main");
  updatePage.style.cssText =
    "padding:24px;font-family:sans-serif;font-size:18px;line-height:1.5;";
  addLine(updatePage, {
    style: "font-size:24px;margin:0 0 16px;",
    tagName: "h1",
    text: words.title,
  });
  addLine(updatePage, {
    style: "margin:0 0 16px;",
    tagName: "p",
    text: words.body,
  });
  addLine(updatePage, {
    style: "margin:0;color:#444;",
    tagName: "p",
    text: words.version,
  });
  const root = page.getElementById("root");
  if (root) root.appendChild(updatePage);
};

/**
 * True when index.html's check found the WebView too old and shows its page
 * in #root. main.tsx then doesn't start the app, which would draw over that
 * page with styles the WebView can't read. The page is passed in rather than
 * read from `document`: the apps' vite.config.ts loads this file too, where
 * there is no page.
 */
export const isWebViewTooOld = (page: {
  documentElement: { hasAttribute: (name: string) => boolean };
}): boolean => page.documentElement.hasAttribute(TOO_OLD_ATTRIBUTE);

/**
 * The source without a comma before a closing parenthesis, which Chrome
 * reads only from version 58. A formatter or a compiler can put one back
 * after a last parameter or argument; nothing in the check's words has one.
 */
export const withoutTrailingCommas = (source: string): string =>
  source.replace(/,(\s*)\)/g, "$1)");

/**
 * The check as index.html runs it: checkWebView's own source, called with
 * the page's CSS, document and navigator. Made when Vite reads its config,
 * where the function is still as written, not minified. This file imports
 * nothing: Node loads it for vite.config.ts as it is, and couldn't follow a
 * relative import without its extension.
 */
export const WEBVIEW_CHECK_SCRIPT = withoutTrailingCommas(
  `(${checkWebView.toString()})({ browser: navigator, css: window.CSS, minChromeVersion: ${MIN_CHROME_VERSION}, page: document, tooOldAttribute: ${JSON.stringify(TOO_OLD_ATTRIBUTE)} });`,
);

/** What Vite needs of the plugin below, without this package depending on Vite. */
interface IndexHtmlScriptPlugin {
  name: string;
  transformIndexHtml: () => {
    tag: "script";
    children: string;
    injectTo: "body";
  }[];
}

/**
 * A Vite plugin that adds the check to index.html, for both Android apps.
 * At the end of <body>, after #root: a plain script there runs while the
 * page is read, before the app's module script, which waits for the end.
 * It is a plain script so it runs even where the app's bundle can't.
 */
export const webViewCheckPlugin = (): IndexHtmlScriptPlugin => ({
  name: "zahln-webview-check",
  transformIndexHtml: () => [
    { tag: "script", children: WEBVIEW_CHECK_SCRIPT, injectTo: "body" },
  ],
});

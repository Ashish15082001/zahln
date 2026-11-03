import { describe, expect, it } from "vitest";
import {
  checkWebView,
  isWebViewTooOld,
  MIN_CHROME_VERSION,
  TOO_OLD_ATTRIBUTE,
  WEBVIEW_CHECK_SCRIPT,
  webViewCheckPlugin,
  withoutTrailingCommas,
} from "./webViewCheck";

/** The few parts of an element the check touches. */
interface FakeElement {
  attributes: Map<string, string>;
  children: FakeElement[];
  lang: string;
  style: { cssText: string };
  tagName: string;
  textContent: string | null;
  appendChild: (child: FakeElement) => void;
  setAttribute: (name: string, value: string) => void;
}

const createFakeElement = (tagName: string): FakeElement => {
  const element: FakeElement = {
    attributes: new Map(),
    children: [],
    lang: "",
    style: { cssText: "" },
    tagName,
    textContent: "",
    appendChild: (child) => element.children.push(child),
    setAttribute: (name, value) => element.attributes.set(name, value),
  };
  return element;
};

/**
 * Runs the check on a page with an empty #root, in a WebView that does or
 * doesn't support what Tailwind v4 needs.
 */
const runCheck = ({
  isCssSupported,
  languages,
  userAgent,
}: {
  isCssSupported: boolean;
  languages: string[];
  userAgent: string;
}) => {
  const html = createFakeElement("html");
  const root = createFakeElement("div");
  checkWebView({
    browser: { languages, language: languages[0], userAgent },
    css: { supports: () => isCssSupported },
    minChromeVersion: MIN_CHROME_VERSION,
    page: {
      body: createFakeElement("body"),
      documentElement: html,
      createElement: createFakeElement,
      getElementById: (id) => (id === "root" ? root : null),
    },
    tooOldAttribute: TOO_OLD_ATTRIBUTE,
  });
  return { html, root };
};

const oldWebView =
  "Mozilla/5.0 (Linux; Android 9; SM-A105F) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/95.0.4638.74 Mobile Safari/537.36";

describe("checkWebView", () => {
  it("does nothing on a WebView with what Tailwind v4 needs", () => {
    const { html, root } = runCheck({
      isCssSupported: true,
      languages: ["en-GB"],
      userAgent: oldWebView,
    });

    expect(html.attributes.size).toBe(0);
    expect(root.children).toHaveLength(0);
  });

  it("marks the page and says what to update on an older one", () => {
    const { html, root } = runCheck({
      isCssSupported: false,
      languages: ["en-GB"],
      userAgent: oldWebView,
    });
    const [updatePage] = root.children;

    expect(html.attributes.has("data-webview-too-old")).toBe(true);
    expect(html.lang).toBe("en");
    expect(updatePage?.tagName).toBe("main");
    expect(updatePage?.children.map((child) => child.textContent)).toEqual([
      "Update needed",
      "This app needs a newer Android System WebView. Update “Android System WebView” and “Google Chrome” in the Play Store, then open the app again.",
      "Found: Chrome 95. Needed: Chrome 111 or later.",
    ]);
  });

  it("speaks German to a German phone", () => {
    const { html, root } = runCheck({
      isCssSupported: false,
      languages: ["de-AT", "en"],
      userAgent: oldWebView,
    });

    expect(html.lang).toBe("de");
    expect(root.children[0]?.children[0]?.textContent).toBe("Update nötig");
    expect(root.children[0]?.children[2]?.textContent).toBe(
      "Gefunden: Chrome 95. Nötig: Chrome 111 oder neuer.",
    );
  });

  it("still shows the page when it can't tell the version", () => {
    const { root } = runCheck({
      isCssSupported: false,
      languages: [],
      userAgent: "",
    });

    expect(root.children[0]?.children[2]?.textContent).toBe(
      "Found: Chrome ?. Needed: Chrome 111 or later.",
    );
  });
});

describe("withoutTrailingCommas", () => {
  it("drops a comma after a last parameter or argument, on its line or the next", () => {
    expect(withoutTrailingCommas("(a, b,) => f(a,\n  b,\n)")).toBe(
      "(a, b) => f(a,\n  b\n)",
    );
  });

  it("keeps every other comma", () => {
    expect(withoutTrailingCommas('f(a, "x", { b: 1, })')).toBe(
      'f(a, "x", { b: 1, })',
    );
  });
});

describe("isWebViewTooOld", () => {
  it("reads the mark the check leaves on <html>", () => {
    const { html } = runCheck({
      isCssSupported: false,
      languages: ["en"],
      userAgent: oldWebView,
    });
    const checkedPage = {
      documentElement: {
        hasAttribute: (name: string) => html.attributes.has(name),
      },
    };

    expect(isWebViewTooOld(checkedPage)).toBe(true);
    expect(
      isWebViewTooOld({ documentElement: { hasAttribute: () => false } }),
    ).toBe(false);
  });
});

describe("webViewCheckPlugin", () => {
  it("runs the check with the page's own CSS, document and navigator", () => {
    expect(WEBVIEW_CHECK_SCRIPT.startsWith("((input")).toBe(true);
    expect(
      WEBVIEW_CHECK_SCRIPT.endsWith(
        '({ browser: navigator, css: window.CSS, minChromeVersion: 111, page: document, tooOldAttribute: "data-webview-too-old" });',
      ),
    ).toBe(true);
  });

  it("has no comma before a closing parenthesis, for Chrome before 58", () => {
    expect(WEBVIEW_CHECK_SCRIPT).not.toMatch(/,\s*\)/);
  });

  it("adds the script at the end of index.html's body", () => {
    expect(webViewCheckPlugin().transformIndexHtml()).toEqual([
      { tag: "script", children: WEBVIEW_CHECK_SCRIPT, injectTo: "body" },
    ]);
  });
});

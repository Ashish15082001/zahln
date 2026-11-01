import { cn } from "@zahln/ui/lib/utils";
import type { FC, ReactElement, ReactNode } from "react";

/** How wide the column is: md for a phone, 5xl for a tablet in landscape. */
export type ScreenColumnWidth = "md" | "5xl";

// Whole class names, not built from the width, so Tailwind finds them.
const columnWidthClassNames = {
  md: "max-w-md",
  "5xl": "max-w-5xl",
} satisfies Record<ScreenColumnWidth, string>;

export interface ScreenLayoutJSXProps {
  children: ReactNode;
  columnWidth: ScreenColumnWidth;
  contentClassName?: string;
  footer?: ReactElement;
  header?: ReactElement;
}

/**
 * A screen: a header that stays at the top, the content, and a footer that
 * stays at the bottom. Leave out header or footer for a screen without one.
 *
 * The page is at least as tall as the screen, so the footer sits at the
 * bottom under short content too. The window scrolls, not the content on its
 * own: React Router's ScrollRestoration knows only the window, and back from
 * a payment has to land where the payer was in the list.
 *
 * The page runs under the status bar and the nav bar (viewport-fit=cover).
 * The header pads by the status bar and the footer by the nav bar, so their
 * background covers the content scrolling under the bars; padding on body
 * would leave a strip it shows through. With no header or footer, the content
 * pads by the bar instead. The apps' body pads only the sides.
 *
 * Header and footer lay what they are given in a column; the screen keeps
 * its own rows. Both sit outside <main>, so they are the page's banner and
 * footer landmarks.
 */
const ScreenLayoutJSX: FC<ScreenLayoutJSXProps> = ({
  children,
  columnWidth,
  contentClassName,
  footer,
  header,
}) => {
  const columnClassName = cn(
    "mx-auto w-full",
    columnWidthClassNames[columnWidth],
  );
  // contentClassName last, so a screen can change the gap or centre the
  // content without losing the bar padding.
  const mainClassName = cn(
    columnClassName,
    "flex flex-1 flex-col gap-6 p-6",
    header === undefined && "pt-[calc(env(safe-area-inset-top)+1.5rem)]",
    footer === undefined && "pb-[calc(env(safe-area-inset-bottom)+1.5rem)]",
    contentClassName,
  );
  const barColumnClassName = cn(
    columnClassName,
    "flex flex-col gap-3 px-6 py-3",
  );

  return (
    <div className="flex min-h-svh flex-col">
      {header !== undefined && (
        <header className="sticky top-0 z-10 border-b bg-background pt-[env(safe-area-inset-top)]">
          <div className={barColumnClassName}>{header}</div>
        </header>
      )}
      <main className={mainClassName}>{children}</main>
      {footer !== undefined && (
        <footer className="sticky bottom-0 z-10 border-t bg-background pb-[env(safe-area-inset-bottom)]">
          <div className={barColumnClassName}>{footer}</div>
        </footer>
      )}
    </div>
  );
};

export default ScreenLayoutJSX;

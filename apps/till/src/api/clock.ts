/**
 * The server's time, worked out from the Date header of each response.
 *
 * Token expiry and order deadlines are server times. A tablet whose clock is a
 * few minutes off would otherwise renew too late, or show a countdown that
 * ends before the order does.
 */
export interface ServerClock {
  /** Server time now, in milliseconds since the epoch. */
  now: () => number;
  /** Takes a response's Date header. A missing or unreadable one is ignored. */
  observe: (dateHeader: string | null) => void;
}

/**
 * Makes the app's one server clock. It keeps the gap between the server's
 * clock and the device's, and never changes the device's clock itself.
 *
 * `deviceNow` is the device clock. Tests pass a fake one to give the tablet a
 * wrong time.
 */
export const createServerClock = (
  deviceNow: () => number = Date.now,
): ServerClock => {
  // Until the first response, device time is the best guess there is.
  let offsetMs = 0;

  return {
    now: () => deviceNow() + offsetMs,
    observe: (dateHeader) => {
      if (!dateHeader) return;
      const serverMs = Date.parse(dateHeader);
      if (Number.isNaN(serverMs)) return;
      // The header has whole seconds and arrives after the network trip, so
      // this runs up to about a second behind. The 30 s renewal margin and a
      // 5 minute countdown both absorb that. The latest reading wins, so a
      // device clock that is changed mid-shift is followed.
      offsetMs = serverMs - deviceNow();
    },
  };
};

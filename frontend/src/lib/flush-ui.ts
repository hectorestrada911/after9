import { flushSync } from "react-dom";

/** Commit pending React state before async work so loading/disabled UI paints immediately on click. */
export function flushUi(update: () => void) {
  flushSync(update);
}

/**
 * A short piece of code in the case prose that must not break across lines, such as a query
 * parameter (`?v=`), which a browser may otherwise split at its punctuation. Longer code stays a
 * plain `<code>`, free to wrap on a narrow screen.
 */
export function CodeToken({ children }: { children: string }) {
  return <code className="whitespace-nowrap">{children}</code>;
}

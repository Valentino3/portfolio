/**
 * A heading inside a section's prose that is not a decision: set like a decision's title, with
 * room above it, since what it follows is usually a figure.
 */
export function Subhead({ children }: { children: string }) {
  return <h3 className="mt-10 mb-1.5 text-card font-medium">{children}</h3>;
}

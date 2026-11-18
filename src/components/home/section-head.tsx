/** A home section's heading: a real one, in the display face, over the hairline that opens the section's list. */
export function SectionHead({ id, title }: { id?: string; title: string }) {
  return (
    <h2 id={id} className="border-b border-rule pb-3 text-section">
      {title}
    </h2>
  );
}

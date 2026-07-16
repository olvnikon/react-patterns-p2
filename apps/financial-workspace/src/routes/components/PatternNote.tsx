import type { ReactNode } from 'react';

type PatternNoteProps = {
  tags: string[];
  children: ReactNode;
  ariaLabel?: string;
};

export function PatternNote({
  tags,
  children,
  ariaLabel,
}: PatternNoteProps) {
  return (
    <section className="route-note" aria-label={ariaLabel}>
      <div className="pattern-tags">
        {tags.map((tag) => (
          <span className="pattern-tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <p>{children}</p>
    </section>
  );
}

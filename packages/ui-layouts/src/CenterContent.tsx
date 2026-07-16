import type { ReactNode } from 'react';

export function CenterContent({ children }: { children: ReactNode }) {
  return <div className="center-content">{children}</div>;
}

import type { ReactNode } from 'react';

export function RightContent({ children }: { children: ReactNode }) {
  return <div className="right-content">{children}</div>;
}

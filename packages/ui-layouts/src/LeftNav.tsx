import type { ReactNode } from 'react';

export function LeftNav({ children }: { children: ReactNode }) {
  return <div className="left-nav">{children}</div>;
}

import type { ReactNode } from 'react';

type AppShellProps = {
  title: string;
  subtitle?: string;
  navigation: ReactNode;
  children: ReactNode;
};

export function AppShell({
  title,
  subtitle,
  navigation,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="app-shell__brand">
          <p className="app-shell__title">{title}</p>
          {subtitle ? <p className="app-shell__subtitle">{subtitle}</p> : null}
        </div>
        {navigation}
      </header>
      <main className="app-shell__main">{children}</main>
    </div>
  );
}

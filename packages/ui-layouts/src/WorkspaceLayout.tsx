import type { ReactNode } from 'react';

type WorkspaceLayoutProps = {
  leftNav: ReactNode;
  centerContent: ReactNode;
  rightContent?: ReactNode;
};

export function WorkspaceLayout({
  leftNav,
  centerContent,
  rightContent,
}: WorkspaceLayoutProps) {
  return (
    <div className="workspace-layout">
      <aside className="workspace-left">{leftNav}</aside>
      <main className="workspace-center">{centerContent}</main>
      {rightContent ? (
        <aside className="workspace-right">{rightContent}</aside>
      ) : null}
    </div>
  );
}

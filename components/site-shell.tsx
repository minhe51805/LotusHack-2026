import type { ReactNode } from "react";

import { SiteHeader } from "../components/header";
import { SiteFooter } from "../components/footer";
import type { SiteChrome } from "../lib/source-site";

type SiteShellProps = {
  chrome: SiteChrome; 
  children: ReactNode;
};

export function SiteShell({ chrome, children }: SiteShellProps) {
  return (
    <div className="etest-shell">
      <SiteHeader chrome={chrome} />
      <main className="etest-main">{children}</main>
      <SiteFooter chrome={chrome} />
    </div>
  );
}

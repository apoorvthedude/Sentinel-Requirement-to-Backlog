import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import StepTimeline, { type Step } from "../StepTimeline";
import ThemeToggle from "../ThemeToggle";
import UserMenu from "../UserMenu";
import "./Layout.css";

interface LayoutProps {
  steps: Step[];
  children: ReactNode;
}

export default function Layout({ steps, children }: LayoutProps) {
  return (
    <div className="layout">
      <header className="layout__header">
        <Link to="/" className="layout__brand">
          <span className="layout__brand-mark" aria-hidden="true" />
          <span className="layout__brand-name">Sentinel</span>
        </Link>
        <div className="layout__timeline">
          <StepTimeline steps={steps} />
        </div>
        <div className="layout__actions">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>
      <main className="layout__content">{children}</main>
    </div>
  );
}

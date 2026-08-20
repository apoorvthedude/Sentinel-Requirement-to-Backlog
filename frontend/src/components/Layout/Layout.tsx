import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import WizardStepper, { type Step } from "../WizardStepper";
import TopNav, { type TopNavActive } from "../TopNav";
import "./Layout.css";

interface LayoutProps {
  steps?: Step[];
  children: ReactNode;
}

function deriveActiveTab(pathname: string): TopNavActive {
  if (pathname === "/dashboard") return "dashboard";
  if (pathname === "/history") return "history";
  if (pathname === "/settings") return "settings";
  return "wizard";
}

export default function Layout({ steps, children }: LayoutProps) {
  const location = useLocation();
  const active = deriveActiveTab(location.pathname);

  return (
    <div className="layout">
      <TopNav active={active} />
      {steps && (
        <div className="layout__stepper">
          <WizardStepper steps={steps} />
        </div>
      )}
      <main className="layout__content">{children}</main>
    </div>
  );
}

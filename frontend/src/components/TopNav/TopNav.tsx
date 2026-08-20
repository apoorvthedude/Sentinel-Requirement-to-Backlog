import { Link } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";
import UserMenu from "../UserMenu";
import "./TopNav.css";

export type TopNavActive = "dashboard" | "wizard" | "history" | "settings";

interface TopNavProps {
  active: TopNavActive;
}

interface NavItem {
  key: TopNavActive;
  label: string;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", to: "/dashboard" },
  { key: "wizard", label: "New Requirement", to: "/" },
  { key: "history", label: "History", to: "/history" },
  { key: "settings", label: "Settings", to: "/settings" },
];

export default function TopNav({ active }: TopNavProps) {
  return (
    <div className="top-nav">
      <Link to="/" className="top-nav__brand">
        <span className="top-nav__brand-mark" aria-hidden="true" />
        <span className="top-nav__brand-name">Sentinel</span>
      </Link>

      <nav className="top-nav__pills" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className={`top-nav__pill ${active === item.key ? "top-nav__pill--active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="top-nav__spacer" />

      <ThemeToggle />
      <UserMenu />
    </div>
  );
}

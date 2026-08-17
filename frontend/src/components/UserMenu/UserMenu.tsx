import { useEffect, useRef, useState } from "react";
import { LogOut, Settings, User } from "lucide-react";
import "./UserMenu.css";

interface UserMenuProps {
  name?: string;
  email?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("") || "U";
}

export default function UserMenu({ name = "Apoorv Gupta", email = "apoorv@sentinel.dev" }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="user-menu" ref={containerRef}>
      <button
        type="button"
        className="user-menu__trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        {getInitials(name)}
      </button>

      {open && (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__header">
            <div className="user-menu__avatar">{getInitials(name)}</div>
            <div>
              <div className="user-menu__name">{name}</div>
              <div className="user-menu__email">{email}</div>
            </div>
          </div>
          <div className="user-menu__divider" />
          <button type="button" className="user-menu__item" role="menuitem">
            <User size={15} />
            Profile
          </button>
          <button type="button" className="user-menu__item" role="menuitem">
            <Settings size={15} />
            Settings
          </button>
          <div className="user-menu__divider" />
          <button type="button" className="user-menu__item user-menu__item--danger" role="menuitem">
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

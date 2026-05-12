"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  label: string;
  path: string;
}

interface HorizontalMenuProps {
  items: MenuItem[];
}

const HorizontalMenu: React.FC<HorizontalMenuProps> = ({ items }) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname?.startsWith(path);
  };

  return (
    <nav className="flex items-center">
      {items.map((item, index) => {
        const active = isActive(item.path);

        return (
          <div key={item.path} className="flex items-center">
            <Link
              href={item.path}
              className={`
                relative px-5 py-2 text-sm font-medium tracking-wide
                transition-all duration-200
                ${
                  active
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"
                    : "text-base-content/70 hover:text-base-content"
                }
              `}
            >
              {item.label}

              {active && (
                <span
                  className="
                    absolute bottom-0 left-1/2 h-[2px] w-8
                    -translate-x-1/2 rounded-full
                    bg-gradient-to-r from-primary to-secondary
                  "
                />
              )}
            </Link>

            {index < items.length - 1 && (
              <span className="h-4 w-px bg-base-300/80" />
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default HorizontalMenu;

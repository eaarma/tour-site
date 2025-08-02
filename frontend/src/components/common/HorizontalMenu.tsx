"use client";

import Link from "next/link";

interface MenuItem {
  label: string;
  path: string;
}

interface HorizontalMenuProps {
  items: MenuItem[];
}

const HorizontalMenu: React.FC<HorizontalMenuProps> = ({ items }) => {
  return (
    <div className="flex flex-row justify-center gap-4 p-1 border bg-base-200 rounded">
      {items.map((item, index) => (
        <Link
          key={index}
          href={item.path}
          className="btn btn-sm btn-outline min-w-[100px] text-center"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
};

export default HorizontalMenu;

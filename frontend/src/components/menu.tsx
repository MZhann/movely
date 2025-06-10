"use client";
import { useState } from "react";
import { Menu as MenuIcon, Navigation, X } from "lucide-react";

const menuItems = [
  { label: "Главная", href: "/main" },
  { label: "Мои заказы", href: "/history" },
  { label: "Профиль", href: "/profile" },
  { label: "Авиабилеты", href: "/tickets" },
  { label: "ЖД билеты", href: "/trains" },
  { label: "Мои билеты", href: "/my-tickets" },
  // Add more items as needed
];

export default function Menu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop menu */}
      <nav className="hidden lg:flex items-center justify-between bg-zinc-900 px-8 py-4 z-50">
        <div className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
          <p>Movely</p> <Navigation className="text-yellow-500" />
        </div>
        <ul className="flex gap-8">
          {menuItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-white hover:text-yellow-400 font-medium transition"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile burger */}
      <div className="flex lg:hidden items-center bg-zinc-900 px-4 py-4 z-50">
        <button
          className="text-white"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <MenuIcon size={32} />
        </button>
        <div className="ml-4 text-xl font-bold text-yellow-400 flex items-center gap-2">
          <p>Movely</p> <Navigation className="text-yellow-500" />
        </div>
      </div>

      {/* Mobile menu drawer and overlay */}
      <>
        {/* Overlay */}
        {open && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setOpen(false)}
          />
        )}
        {/* Drawer with animation */}
        <div
          className={`
            fixed top-0 left-0 h-full bg-zinc-900 w-[80vw] max-w-xs shadow-lg flex flex-col z-50
            transition-transform duration-300
            ${open ? "translate-x-0" : "-translate-x-full"}
          `}
          style={{ willChange: "transform" }}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
            <span className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
              <p>Movely</p> <Navigation className="text-yellow-500" />
            </span>
            <button
              className="text-white"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X size={28} />
            </button>
          </div>
          <ul className="flex flex-col gap-4 p-6">
            {menuItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-white text-lg font-medium block py-2 px-2 rounded hover:bg-zinc-800 transition"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </>
    </>
  );
}

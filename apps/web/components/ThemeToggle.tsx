"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  // Avoid Hydration Mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const closeDropdown = () => setIsOpen(false);

  // Close dropdown on click outside
  React.useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      // Very naive click outside by ensuring the target doesn't walk up to a 'relative' with ID 'theme-dropdown'
      const target = event.target as HTMLElement;
      if (!target.closest("#theme-dropdown")) {
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden="true" />; // Placeholder to prevent layout shift
  }

  return (
    <div id="theme-dropdown" className="relative z-50 inline-block text-left">
      <button
        onClick={toggleDropdown}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-500 transition-colors hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-slate-950"
        aria-label="Toggle theme"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="sr-only">Toggle theme</span>
        {/* Render active icon based on resolvedTheme/theme */}
        {theme === "system" ? (
          <Monitor size={18} />
        ) : resolvedTheme === "dark" ? (
          <Moon size={18} />
        ) : (
          <Sun size={18} />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-900 dark:ring-white dark:ring-opacity-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex={-1}
        >
          <div className="py-1" role="none">
            <button
              onClick={() => {
                setTheme("light");
                closeDropdown();
              }}
              className={`flex w-full items-center px-4 py-2 text-sm ${theme === "light"
                ? "bg-gray-100 text-primary dark:bg-slate-800"
                : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800"
                }`}
              role="menuitem"
            >
              <Sun size={16} className="mr-2" />
              Light
            </button>
            <button
              onClick={() => {
                setTheme("dark");
                closeDropdown();
              }}
              className={`flex w-full items-center px-4 py-2 text-sm ${theme === "dark"
                ? "bg-gray-100 text-primary dark:bg-slate-800"
                : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800"
                }`}
              role="menuitem"
            >
              <Moon size={16} className="mr-2" />
              Dark
            </button>
            <button
              onClick={() => {
                setTheme("system");
                closeDropdown();
              }}
              className={`flex w-full items-center px-4 py-2 text-sm ${theme === "system"
                ? "bg-gray-100 text-primary dark:bg-slate-800"
                : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800"
                }`}
              role="menuitem"
            >
              <Monitor size={16} className="mr-2" />
              System
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

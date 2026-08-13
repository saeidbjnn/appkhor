"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  isDark: boolean;
  mounted: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  // باید روی Server و اولین Render کلاینت دقیقاً یکسان باشد.
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  const isDark = theme === "dark";

  useEffect(() => {
    const htmlTheme = document.documentElement.dataset.theme;

    const savedTheme = localStorage.getItem("appkhor-theme");

    let initialTheme: Theme;

    if (htmlTheme === "dark" || htmlTheme === "light") {
      initialTheme = htmlTheme;
    } else if (savedTheme === "dark" || savedTheme === "light") {
      initialTheme = savedTheme;
    } else {
      initialTheme = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches
        ? "dark"
        : "light";
    }

    setTheme(initialTheme);

    document.documentElement.dataset.theme = initialTheme;
    document.documentElement.style.colorScheme = initialTheme;

    setMounted(true);
  }, []);

  function toggleTheme() {
    setTheme((currentTheme) => {
      const nextTheme: Theme =
        currentTheme === "dark" ? "light" : "dark";

      localStorage.setItem("appkhor-theme", nextTheme);

      document.documentElement.dataset.theme = nextTheme;
      document.documentElement.style.colorScheme = nextTheme;

      return nextTheme;
    });
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        mounted,
        toggleTheme,
      }}
    >
      <div
        style={{
          visibility: mounted ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useAppTheme باید داخل AppThemeProvider استفاده شود.",
    );
  }

  return context;
}
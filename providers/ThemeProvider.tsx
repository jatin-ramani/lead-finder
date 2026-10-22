"use client";

import { App as AntdApp, ConfigProvider } from "antd";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

import { THEME_STORAGE_KEY } from "@/lib/theme-script";
import { getAntdTheme, type ThemeMode } from "@/lib/theme";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeMode(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used inside <ThemeProvider>.");
  }
  return context;
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const mode: ThemeMode = "light";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
    try {
      localStorage.setItem(THEME_STORAGE_KEY, "light");
    } catch {}
  }, []);

  const setMode = useCallback(() => {}, []);
  const toggleMode = useCallback(() => {}, []);

  const value = useMemo(
    () => ({ mode, setMode, toggleMode }),
    [mode, setMode, toggleMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={getAntdTheme(mode)}>
        <AntdApp
          notification={{ placement: "bottomRight", duration: 3 }}
          message={{ maxCount: 3 }}
        >
          {children}
        </AntdApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

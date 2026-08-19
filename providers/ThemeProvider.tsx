"use client";

import { App as AntdApp, ConfigProvider } from "antd";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { usePersistentValue } from "@/hooks/usePersistentState";
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

/** Light is the product default; an explicit stored choice may switch it. */
function decodeMode(raw: string | null): ThemeMode {
  return raw === "dark" ? "dark" : "light";
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, persistMode] = usePersistentValue<ThemeMode>(
    THEME_STORAGE_KEY,
    "light",
    decodeMode,
  );

  const setMode = useCallback(
    (next: ThemeMode) => {
      document.documentElement.setAttribute("data-theme", next);
      document.documentElement.style.colorScheme = next;
      persistMode(next);
    },
    [persistMode],
  );

  const toggleMode = useCallback(
    () => setMode(mode === "dark" ? "light" : "dark"),
    [mode, setMode],
  );

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

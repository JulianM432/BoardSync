import { createContext } from "react"

export const THEMES = ["dark", "light", "system"] as const
export type Theme = (typeof THEMES)[number]

export type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

export const ThemeProviderContext =
  createContext<ThemeProviderState>(initialState)

export function isTheme(value: string | null): value is Theme {
  return THEMES.some((theme) => theme === value)
}

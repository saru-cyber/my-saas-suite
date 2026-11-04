import type { CSSProperties } from "react";

export type ThemeMode = "system" | "light" | "dark";

export interface AppearanceSettings {
  primaryColor: string;
  logoUrl: string;
  defaultTheme: ThemeMode;
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(value: string): boolean {
  return HEX_COLOR.test(value);
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

export function foregroundForHex(hex: string): string {
  const red = Number.parseInt(hex.slice(1, 3), 16);
  const green = Number.parseInt(hex.slice(3, 5), 16);
  const blue = Number.parseInt(hex.slice(5, 7), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luminance > 0.62 ? "oklch(0.21 0.006 286)" : "oklch(0.985 0 0)";
}

export function appearanceDocumentProps(settings: AppearanceSettings): {
  className?: string;
  style?: CSSProperties;
} {
  const style: CSSProperties & Record<`--${string}`, string> = {};
  if (isHexColor(settings.primaryColor)) {
    style["--primary"] = settings.primaryColor;
    style["--ring"] = settings.primaryColor;
    style["--primary-foreground"] = foregroundForHex(settings.primaryColor);
  }

  return {
    className: settings.defaultTheme === "system" ? undefined : settings.defaultTheme,
    style: Object.keys(style).length > 0 ? style : undefined,
  };
}

export function applyAppearance(settings: AppearanceSettings): void {
  const root = document.documentElement;
  const props = appearanceDocumentProps(settings);
  root.classList.remove("light", "dark");
  if (props.className) {
    root.classList.add(props.className);
  }

  if (props.style) {
    for (const [name, value] of Object.entries(props.style)) {
      root.style.setProperty(name, value);
    }
    return;
  }

  root.style.removeProperty("--primary");
  root.style.removeProperty("--ring");
  root.style.removeProperty("--primary-foreground");
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        secondary: "#111111",
        elevated: "#1A1A1A",
        accent: "#00FF88", // Neon Green
        "accent-pink": "#FF2D55", // Neon Pink
        "text-primary": "#FFFFFF",
        "text-secondary": "#D4D4D4",
        "text-muted": "#A3A3A3",
        success: "#00FF88",
        error: "#FF3B30",
        warning: "#FF9500",
        border: "#1F1F1F",
        // Keep old tokens mapping to new ones to prevent immediate crashes during refactor if used
        foreground: "#FFFFFF",
        muted: "#1A1A1A",
        "muted-foreground": "#A3A3A3",
        "accent-foreground": "#000000",
      },
      fontFamily: {
        space: ["SpaceGrotesk", "sans-serif"], // Keep for legacy, but prioritize SpaceMono in new components if needed, though prompt said SpaceMono.
        mono: ["SpaceMono", "monospace"], // Add SpaceMono
        inter: ["Inter", "sans-serif"],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "40px",
      },
      fontSize: {
        "title-lg": ["28px", { lineHeight: "34px", fontWeight: "700" }],
        "title-md": ["22px", { lineHeight: "28px", fontWeight: "700" }],
        "title-sm": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "400" }],
        caption: ["13px", { lineHeight: "18px", fontWeight: "400" }],
        tiny: ["11px", { lineHeight: "14px", fontWeight: "400" }],
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        DEFAULT: "12px", // Button radius
        md: "12px",
        lg: "16px", // Card radius
        full: "9999px",
      },
    },
  },
  plugins: [],
};

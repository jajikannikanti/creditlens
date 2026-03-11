module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["'DM Serif Display'", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["'Outfit'", "sans-serif"],
      },
      colors: {
        ink:    "#0a0c10",
        ink2:   "#12151c",
        ink3:   "#1c2030",
        border: "#252a38",
        muted:  "#4a5168",
        gold:   "#e8b84b",
        gold2:  "#f5d07a",
        teal:   "#38c9b0",
        danger: "#f05a5a",
        amber:  "#f5a623",
        blue:   "#5b8af5",
      },
      animation: {
        "fade-up": "fadeUp .5s ease both",
        "pulse-slow": "pulse 2s ease infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: "translateY(18px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};


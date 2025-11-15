/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#8B5CF6",
        secondary: "#1E1E2E",
        accent: "#00FFFF",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      backgroundImage: {
        "gradient-glow":
          "radial-gradient(circle at top left, rgba(139,92,246,0.4), transparent), radial-gradient(circle at bottom right, rgba(0,255,255,0.2), transparent)",
      },
    },
  },
  plugins: [],
};

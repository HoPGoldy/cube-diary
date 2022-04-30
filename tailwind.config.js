module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mainColor: "var(--rv-diary-main-color)",
        cardBackground: "var(--rv-card-background-color)"
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}

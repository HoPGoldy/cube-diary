module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mainColor: "var(--rv-black)",
        cardBackground: "var(--rv-white)",
        background: "var(--rv-gray-1)"
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}

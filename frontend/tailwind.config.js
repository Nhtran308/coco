/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
      },
      colors: {
        navy: "#2F4155",
        teal: "#567C8D",
        beige: "#F5EFEB",
        skyblue: "#C8D9E6",
        white: "#FFFFFF",
        rred: "#830000",
        aquamarine: "#105D5E",
        scandi: "#EBFADB",
        pine: "#293E33",
      },
    },
  },
  plugins: [],
};

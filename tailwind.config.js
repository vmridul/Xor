/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./dashboard.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1d9bf0",
        danger: "#ef4444",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

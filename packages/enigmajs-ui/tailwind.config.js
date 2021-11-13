module.exports = {
  purge: ["./src/**/*.{vue,ts,js}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      animation: {
        "inflate-y": "inflate-y 1.2s infinite ease-in-out",
      },
      keyframes: {
        "inflate-y": {
          "0%, 40%, 100%": { transform: "scaleY(0.4);" },
          "20%": { transform: "scaleY(1);" },
        },
      },
    },
  },
  plugins: [],
};

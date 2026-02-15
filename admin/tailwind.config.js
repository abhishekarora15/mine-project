/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#fde047', // Yellow-300
                    DEFAULT: '#fbbf24', // Amber-400
                    dark: '#d97706', // Amber-600
                },
                surface: '#111827', // Gray-900
                background: '#030712', // Gray-950
            }
        },
    },
    plugins: [],
}

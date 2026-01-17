import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // MAS Developers Navy Blue Theme
                navy: {
                    50: '#e6edf5',
                    100: '#ccdaeb',
                    200: '#99b5d7',
                    300: '#6690c3',
                    400: '#336baf',
                    500: '#00469b', // Primary Navy
                    600: '#003878',
                    700: '#002a5a',
                    800: '#001c3c',
                    900: '#000e1e',
                    950: '#00070f',
                },
                accent: {
                    gold: '#D4AF37',
                    silver: '#C0C0C0',
                },
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'Inter', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'navy-gradient': 'linear-gradient(135deg, #00469b 0%, #001c3c 100%)',
            },
            boxShadow: {
                'elegant': '0 4px 6px -1px rgba(0, 70, 155, 0.1), 0 2px 4px -1px rgba(0, 70, 155, 0.06)',
                'elegant-lg': '0 10px 15px -3px rgba(0, 70, 155, 0.1), 0 4px 6px -2px rgba(0, 70, 155, 0.05)',
            },
        },
    },
    plugins: [],
} satisfies Config;

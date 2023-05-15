/* eslint-disable no-undef */
// eslint-disable-next-line no-undef
module.exports = {
    darkMode: ['class', '[data-theme="dark"]'],
    content: [
        './src/**/*.{js,ts,jsx,tsx,html}'
    ],
    corePlugins: {
        preflight: false,
    },
    theme: {
        extend: {
            colors: {
                'antd-dark': '#141414',
            },
            height: {
                'bottombar': 'var(--cube-diary-bottombar-height)',
                'page-content': 'calc(100% - var(--cube-diary-bottombar-height) - 1rem)'
            },
            transitionProperty: {
                'w': 'width',
                'h': 'height',
                'spacing': 'margin, padding',
            }
        }
    },
    plugins: [
        require('@tailwindcss/typography')
    ],
}

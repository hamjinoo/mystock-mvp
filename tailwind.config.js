/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        invert: {
          css: {
            '--tw-prose-body': theme('colors.gray[300]'),
            '--tw-prose-headings': theme('colors.white'),
            '--tw-prose-links': theme('colors.blue[400]'),
            '--tw-prose-links-hover': theme('colors.blue[300]'),
            '--tw-prose-underline': theme('colors.blue[400]'),
            '--tw-prose-underline-hover': theme('colors.blue[300]'),
            '--tw-prose-bold': theme('colors.white'),
            '--tw-prose-counters': theme('colors.gray[400]'),
            '--tw-prose-bullets': theme('colors.gray[400]'),
            '--tw-prose-hr': theme('colors.gray[700]'),
            '--tw-prose-quote-borders': theme('colors.gray[500]'),
            '--tw-prose-quotes': theme('colors.gray[300]'),
            '--tw-prose-code': theme('colors.white'),
            '--tw-prose-pre-code': theme('colors.gray[300]'),
            '--tw-prose-pre-bg': theme('colors.gray[700]'),
            '--tw-prose-pre-border': 'transparent',
            '--tw-prose-th-borders': theme('colors.gray[600]'),
            '--tw-prose-td-borders': theme('colors.gray[700]'),
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}; 
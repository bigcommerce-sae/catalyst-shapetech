// @ts-check

/** @type {import("prettier").Config} */
const config = {
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'all',
  plugins: ['prettier-plugin-tailwindcss'],
};

module.exports = config;

// @ts-check

// eslint-disable-next-line import/no-extraneous-dependencies
require('@bigcommerce/eslint-config/patch');

/** @type {import('eslint').Linter.LegacyConfig} */
const config = {
  root: true,
  extends: [
    '@bigcommerce/catalyst/base',
    '@bigcommerce/catalyst/react',
    '@bigcommerce/catalyst/next',
    '@bigcommerce/catalyst/prettier',
  ],
  rules: {
    '@typescript-eslint/naming-convention': 'off',
  },
};

module.exports = config;

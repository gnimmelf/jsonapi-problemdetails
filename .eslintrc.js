/**
 * Trows an errror if one of the the passed entries is not installed, and hence not importable
 * @param {array} configsList - List of "shortname" eslint configs
 * @returns configsList
 */
const ensureConfigurations = (configsList) => {
  // eslint-disable-next-line
  configsList.forEach((config) => require(`eslint-config-${config}`));
  return configsList;
};

module.exports = {
  root: true,
  extends: [
    ...ensureConfigurations(['airbnb-typescript-prettier']),
    'eslint:recommended',
  ],
  globals: {
    document: true,
    window: true,
  },
  rules: {
    'import/prefer-default-export': 0,
    'react/require-default-props': 0,
    'react/function-component-definition': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'react/no-array-index-key': 0,
    'react/no-danger': 0,
    radix: 0,
  },
};

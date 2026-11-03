/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*.{js,ts,vue,jsx,tsx}': ['eslint --fix --cache'],
}

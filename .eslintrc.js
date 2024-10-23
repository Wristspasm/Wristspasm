module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true
  },
  extends: ["eslint:recommended", "plugin:import/recommended"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest"
  },
  globals: {
    bot: true,
    client: true,
    bridgeChat: true,
    guild: true
  },
  rules: {
    curly: ["warn", "multi-line", "consistent"],
    "no-unused-vars": ["error", { args: "none" }],
    "prefer-const": ["warn", { destructuring: "all" }],
    "no-constant-condition": ["error", { checkLoops: false }],
    "import/extensions": ["warn", "always", { ts: "never" }],
    "no-throw-literal": "error"
  }
};

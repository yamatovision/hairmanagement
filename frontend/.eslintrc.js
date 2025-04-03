module.exports = {
  extends: ["react-app", "react-app/jest"],
  ignorePatterns: ["**/archive/**/*", "build/**", "node_modules/**"],
  rules: {
    // 特定のルールをここでカスタマイズできます
    "@typescript-eslint/no-unused-vars": ["warn", { 
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_", 
    }]
  }
};
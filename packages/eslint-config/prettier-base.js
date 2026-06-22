const config = {
  singleQuote: false,
  semi: true,
  trailingComma: "all",
  printWidth: 140,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  endOfLine: "lf",
  proseWrap: "preserve",
  embeddedLanguageFormatting: "auto",
  singleAttributePerLine: false,

  overrides: [
    {
      files: "*.md",
      options: { printWidth: 80 },
    },
    {
      files: "*.json",
      options: { printWidth: 80 },
    },
  ],
};

export default config;

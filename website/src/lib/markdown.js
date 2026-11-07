import lightTheme from '../light.theme.json';
import darkTheme from '../dark.theme.json';

// The site ships its own Shiki themes (allsum-light / allsum-dark: Allsum's
// code palette, which TextView's built-in highlighting colors the same scopes
// with); `global.css` maps their colours onto `--code-*` tokens, so
// fenced blocks, demo sources and the home page's code all share one palette.
export const themes = { light: lightTheme, dark: darkTheme };

export const langs = [
  'tsx',
  'ts',
  'js',
  'json',
  'sh',
  'bash',
  'swift',
  'java',
  'kotlin',
  'rust',
  'toml',
  'diff',
  'xml',
  'html',
  'yaml',
  'css',
];

export const shikiConfig = {
  themes,
  defaultColor: 'light',
  langs,
};

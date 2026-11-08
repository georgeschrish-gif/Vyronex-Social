/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#F5F3EE',
    tint: '#268BFF',
    background: '#05070B',
    foreground: '#F5F3EE',
    card: '#0B1018',
    cardForeground: '#F5F3EE',
    primary: '#268BFF',
    primaryForeground: '#04101F',
    secondary: '#111923',
    secondaryForeground: '#E9EEF7',
    muted: '#111923',
    mutedForeground: '#8998AC',
    accent: '#D9AD58',
    accentForeground: '#100D07',
    destructive: '#F26A6A',
    destructiveForeground: '#160707',
    border: '#1D2A39',
    input: '#141C27',
  },
  dark: {
    text: '#F5F3EE',
    tint: '#268BFF',
    background: '#05070B',
    foreground: '#F5F3EE',
    card: '#0B1018',
    cardForeground: '#F5F3EE',
    primary: '#268BFF',
    primaryForeground: '#04101F',
    secondary: '#111923',
    secondaryForeground: '#E9EEF7',
    muted: '#111923',
    mutedForeground: '#8998AC',
    accent: '#D9AD58',
    accentForeground: '#100D07',
    destructive: '#F26A6A',
    destructiveForeground: '#160707',
    border: '#1D2A39',
    input: '#141C27',
  },

  radius: 18,
};

export default colors;

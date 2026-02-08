const tintColorLight = '#ffbb39';

export const MonsterColors = {
  primary: '#ffbb39', // Yellow/Orange (Buttons/Accents)
  secondary: '#083c5d', // Deep Blue (Headers/Secondary Actions)
  tertiary: '#1d2731', // Dark Grey (Text)
  background: '#ffffff', // White
  card: '#ffffff', // White
  text: '#1d2731', // Dark Grey/Blue
  textSecondary: '#083c5d', // Navy Blue for secondary text
  border: '#e0e0e0', // Light Grey border
  tint: tintColorLight,
  tabIconDefault: '#ccc',
  tabIconSelected: tintColorLight,
  success: '#083c5d',
  warning: '#ffbb39',
  error: '#d32f2f',
  info: '#2f95dc',
};

export default {
  light: {
    ...MonsterColors,
    tabIconDefault: '#ccc',
    tabIconSelected: MonsterColors.secondary, // Navy for selected tab might be better contrast on white? Or Yellow? Let's try Yellow.
  },
  dark: {
    ...MonsterColors,
    tabIconDefault: '#ccc',
    tabIconSelected: MonsterColors.primary,
  },
};

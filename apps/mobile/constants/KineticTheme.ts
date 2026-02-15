import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Calculate responsive massive sizes
const megaSize = width > 768 ? 120 : 64; // Web descriptive vs Mobile
const posterSize = width > 768 ? 200 : 80;

export const KineticTheme = {
    colors: {
        background: '#000000', // True Black
        text: '#ffffff', // True White
        accent: '#FFD700', // Electric Gold/Yellow
        surface: '#111111',
        border: '#333333',
        danger: '#FF0000',
    },
    typography: {
        mega: {
            fontSize: megaSize,
            fontWeight: '900' as '900',
            textTransform: 'uppercase' as 'uppercase',
            letterSpacing: -2,
            lineHeight: megaSize * 0.9,
        },
        poster: {
            fontSize: posterSize,
            fontWeight: '900' as '900', // Heavy
            textTransform: 'uppercase' as 'uppercase',
            letterSpacing: -4,
            lineHeight: posterSize * 0.85,
        },
        display: {
            fontSize: 48,
            fontWeight: '900' as '900',
            textTransform: 'uppercase' as 'uppercase',
            letterSpacing: -1,
            lineHeight: 48,
        },
        heading: {
            fontSize: 24,
            fontWeight: '700' as '700',
            textTransform: 'uppercase' as 'uppercase',
            letterSpacing: 1,
        },
        label: {
            fontSize: 14,
            fontWeight: '900' as '900',
            textTransform: 'uppercase' as 'uppercase',
            letterSpacing: 2,
        },
        body: {
            fontSize: 16,
            fontWeight: '400' as '400',
            lineHeight: 24,
            color: '#aaaaaa',
        },
    },
    layout: {
        borderWidth: 2,
        gap: 0, // Brutalist grids have no gaps, just borders
    },
    animation: {
        duration: {
            fast: 300,
            medium: 600,
            slow: 1000,
        },
        stagger: 50,
    },
};

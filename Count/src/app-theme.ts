import { useColorScheme } from 'react-native'

export function useTheme() {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  return {
    isDark,
    bg: { backgroundColor: isDark ? '#0b0b0f' : '#ffffff' },
    card: { backgroundColor: isDark ? '#111318' : '#f7f7f9' },
    text: { color: isDark ? '#ffffff' : '#0b0b0f' },
    sub: { color: isDark ? '#a0a3aa' : '#4a4d57' },
    border: { borderColor: isDark ? '#23252d' : '#e3e5ea' },
    tint: '#22c55e',
  }
}

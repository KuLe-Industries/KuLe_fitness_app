import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function ThemeToggle() {
  const { user, updateUser } = useAuthStore();

  // Apply theme when user preference changes
  useEffect(() => {
    if (!user) return;
    const theme = user.preferences.theme;
    const root = document.documentElement;

    const applyTheme = () => {
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
      } else {
        root.classList.toggle('dark', theme === 'dark');
      }
    };

    applyTheme();

    // Listen for system theme changes if using system theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [user?.preferences.theme]);

  const toggleTheme = () => {
    if (!user) return;
    const themes: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];
    const currentIndex = themes.indexOf(user.preferences.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    updateUser({
      preferences: { ...user.preferences, theme: nextTheme },
    });
  };

  if (!user) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      title={`Theme: ${user.preferences.theme}`}
    >
      {user.preferences.theme === 'dark' ? '🌙' : user.preferences.theme === 'light' ? '☀️' : '💻'}
    </button>
  );
}


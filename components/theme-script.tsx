/**
 * Inline script that applies the stored theme before React hydration
 * to prevent flash of wrong theme.
 */
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var appearance = localStorage.getItem('appearance') || 'system';
              var isDark = appearance === 'dark' ||
                (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
              document.documentElement.classList.toggle('dark', isDark);
              document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
            } catch (e) {}
          })();
        `,
      }}
    />
  );
}
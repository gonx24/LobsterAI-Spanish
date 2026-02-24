import { configService } from './config';

type ThemeType = 'light' | 'dark' | 'system' | 'blue';

// Cold modern color palette with blue theme
const COLORS = {
  light: {
    bg: '#F8F9FB',
    text: '#1A1D23',
  },
  dark: {
    bg: '#0F1117',
    text: '#E4E5E9',
  },
  blue: {
    bg: '#0A4B73',
    text: '#FFFFFF',
  },
};

class ThemeService {
  private mediaQuery: MediaQueryList | null = null;
  private currentTheme: ThemeType = 'system';
  private appliedTheme: 'light' | 'dark' | 'blue' | null = null;
  private initialized = false;
  private mediaQueryListener: ((event: MediaQueryListEvent) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    }
  }

  // 初始化主题
  initialize(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    try {
      const config = configService.getConfig();
      this.setTheme(config.theme);

      // 监听系统主题变化
      if (this.mediaQuery) {
        this.mediaQueryListener = (e) => {
          if (this.currentTheme === 'system') {
            this.applyTheme(e.matches ? 'dark' : 'light');
          }
        };
        this.mediaQuery.addEventListener('change', this.mediaQueryListener);
      }
    } catch (error) {
      console.error('Failed to initialize theme:', error);
      // 默认使用系统主题
      this.setTheme('system');
    }
  }

  // 设置主题
  setTheme(theme: ThemeType): void {
    let effectiveTheme: 'light' | 'dark' | 'blue';

    if (theme === 'system') {
      effectiveTheme = this.mediaQuery?.matches ? 'dark' : 'light';
    } else {
      effectiveTheme = theme;
    }

    if (this.currentTheme === theme && this.appliedTheme === effectiveTheme) {
      return;
    }

    console.log(`Setting theme to: ${theme}`);
    this.currentTheme = theme;

    if (theme === 'system') {
      console.log(`System theme detected, using: ${effectiveTheme}`);
    }

    // 直接应用指定主题
    this.applyTheme(effectiveTheme);
  }

  // 获取当前主题
  getTheme(): ThemeType {
    return this.currentTheme;
  }

  // 获取当前有效主题（实际应用的明/暗/蓝主题）
  getEffectiveTheme(): 'light' | 'dark' | 'blue' {
    if (this.currentTheme === 'system') {
      return this.mediaQuery?.matches ? 'dark' : 'light';
    }
    return this.currentTheme;
  }

  // 应用主题到DOM
  private applyTheme(theme: 'light' | 'dark' | 'blue'): void {
    // 避免重复应用相同主题
    if (this.appliedTheme === theme) {
      return;
    }

    console.log(`Applying theme: ${theme}`);
    this.appliedTheme = theme;
    const root = document.documentElement;
    const colors = COLORS[theme];

    // 移除所有主题类
    root.classList.remove('dark', 'light', 'blue');
    document.body.classList.remove('dark', 'light', 'blue');

    // 添加当前主题类
    root.classList.add(theme);
    document.body.classList.add(theme);

    // 设置背景和文字颜色
    root.style.backgroundColor = colors.bg;
    document.body.style.backgroundColor = colors.bg;
    document.body.style.color = colors.text;

    // Update CSS variables for color transition animations
    root.style.setProperty('--theme-transition', 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease');
    document.body.style.transition = 'var(--theme-transition)';

    // Ensure #root element also gets the theme
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.classList.remove('dark', 'light', 'blue');
      rootElement.classList.add(theme);
      rootElement.style.backgroundColor = colors.bg;
    }
  }
}

export const themeService = new ThemeService();